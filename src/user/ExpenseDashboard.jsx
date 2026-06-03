import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Trash2,
  Wallet,
  PiggyBank,
  CheckCircle,
  Percent,
  ChevronRight,
  PlusCircle,
  FileText,
  Sun,
  Moon
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const ExpenseDashboard = () => {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme Management (Default is Dark theme)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  const themeClasses = useMemo(() => ({
    bg: isDarkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900",
    card: isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
    textWhite: isDarkMode ? "text-white" : "text-slate-900",
    border: isDarkMode ? "border-slate-850" : "border-slate-150",
    borderSub: isDarkMode ? "border-slate-800/80" : "border-slate-200",
    subCard: isDarkMode ? "bg-slate-950/40 border-slate-850 text-white" : "bg-white border-slate-250 border-slate-200 text-slate-900",
    chartGrid: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.05)",
    chartText: isDarkMode ? "#94a3b8" : "#64748b",
  }), [isDarkMode]);

  // Fetch all dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [expRes, incRes, budgetRes, profileRes] = await Promise.all([
        axiosInstance.get("/exp/expbyuserid?type=expense"),
        axiosInstance.get("/exp/expbyuserid?type=income"),
        axiosInstance.get("/budget"),
        axiosInstance.get("/user/profile").catch(() => null)
      ]);

      setExpenses(expRes.data?.data || []);
      setIncomes(incRes.data?.data || []);
      setBudgets(budgetRes.data?.data || []);
      if (profileRes?.data?.data) {
        setUser(profileRes.data.data);
      }
    } catch (err) {
      console.error("Dashboard loading error:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        toast.error("Failed to load dashboard statistics");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Time based greeting
  const greetingText = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning";
    if (hours < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // Compute Statistics & Chart Datasets
  const stats = useMemo(() => {
    const totalIncome = incomes.reduce((sum, item) => sum + (item.income || 0), 0);
    const totalExpense = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    // Active Budgets Analysis
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const processedBudgets = budgets.map((b) => {
      const start = new Date(b.createdDate);
      start.setHours(0, 0, 0, 0);
      const end = b.endDate ? new Date(b.endDate) : null;
      if (end) end.setHours(23, 59, 59, 999);

      const spent = expenses
        .filter((ex) => {
          const exDate = new Date(ex.expenseDate);
          return exDate >= start && (end ? exDate <= end : true);
        })
        .reduce((sum, ex) => sum + (ex.amount || 0), 0);

      const limit = b.maxAmount || 0;
      const percent = limit > 0 ? (spent / limit) * 100 : 0;
      const isExceeded = spent > limit;

      const bEndDate = b.endDate ? new Date(b.endDate) : null;
      if (bEndDate) bEndDate.setHours(23, 59, 59, 999);
      const isExpired = bEndDate && today > bEndDate;
      const isRealActive = b.budgetStatus === "active" && !isExpired;

      return {
        ...b,
        spent,
        percent,
        isExceeded,
        isRealActive
      };
    });

    const activeBudgets = processedBudgets.filter((b) => b.isRealActive);
    const exceededBudgetsCount = activeBudgets.filter((b) => b.isExceeded).length;

    // Combine recent transactions
    const combined = [
      ...expenses.map((e) => ({
        _id: e._id,
        title: e.title,
        description: e.description,
        amount: e.amount,
        type: "expense",
        date: new Date(e.expenseDate),
        category: e.expCat?.catName || "Uncategorized",
        paymentMode: e.paymentMode
      })),
      ...incomes.map((i) => ({
        _id: i._id,
        title: i.title,
        description: i.description,
        amount: i.income,
        type: "income",
        date: new Date(i.expenseDate),
        category: i.incomeCategory?.catName || "Income",
        paymentMode: i.paymentMode
      }))
    ];
    combined.sort((a, b) => b.date - a.date);
    const recentTransactions = combined.slice(0, 5);

    // Group expenses by category
    const catMap = {};
    expenses.forEach((ex) => {
      const catName = ex.expCat?.catName || "Uncategorized";
      catMap[catName] = (catMap[catName] || 0) + (ex.amount || 0);
    });

    const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    let doughnutLabels = [];
    let doughnutData = [];
    if (sortedCats.length > 5) {
      const top5 = sortedCats.slice(0, 5);
      const otherSum = sortedCats.slice(5).reduce((sum, [, val]) => sum + val, 0);
      doughnutLabels = [...top5.map(([name]) => name), "Other"];
      doughnutData = [...top5.map(([, val]) => val), otherSum];
    } else {
      doughnutLabels = sortedCats.map(([name]) => name);
      doughnutData = sortedCats.map(([, val]) => val);
    }

    // 6-Month Income vs Expense
    const barLabels = [];
    const barIncomeData = [];
    const barExpenseData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString("default", { month: "short" });
      const year = d.getFullYear().toString().slice(-2);
      barLabels.push(`${monthName} '${year}`);

      const targetMonth = d.getMonth();
      const targetYear = d.getFullYear();

      const incSum = incomes
        .filter((item) => {
          const itemDate = new Date(item.expenseDate);
          return itemDate.getMonth() === targetMonth && itemDate.getFullYear() === targetYear;
        })
        .reduce((sum, item) => sum + (item.income || 0), 0);

      const expSum = expenses
        .filter((item) => {
          const itemDate = new Date(item.expenseDate);
          return itemDate.getMonth() === targetMonth && itemDate.getFullYear() === targetYear;
        })
        .reduce((sum, item) => sum + (item.amount || 0), 0);

      barIncomeData.push(incSum);
      barExpenseData.push(expSum);
    }

    // Group expenses by payment mode
    const modeMap = {};
    expenses.forEach((ex) => {
      const mode = ex.paymentMode || "OTHER";
      modeMap[mode] = (modeMap[mode] || 0) + (ex.amount || 0);
    });

    const totalExpForModes = Object.values(modeMap).reduce((sum, val) => sum + val, 0);

    const paymentModesBreakdown = Object.entries(modeMap).map(([mode, amt]) => {
      const percent = totalExpForModes > 0 ? (amt / totalExpForModes) * 100 : 0;
      return { mode, amt, percent };
    });
    paymentModesBreakdown.sort((a, b) => b.amt - a.amt);

    return {
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,
      activeBudgets,
      exceededBudgetsCount,
      recentTransactions,
      doughnutLabels,
      doughnutData,
      barLabels,
      barIncomeData,
      barExpenseData,
      paymentModesBreakdown
    };
  }, [expenses, incomes, budgets]);

  // Transaction delete handler
  const handleDeleteTransaction = async (id, type) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete this ${type}?`);
    if (!isConfirmed) return;

    try {
      await axiosInstance.delete(`/exp/${id}`);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
      loadDashboardData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete transaction");
    }
  };

  // Chart configs
  const doughnutChartData = {
    labels: stats.doughnutLabels,
    datasets: [
      {
        data: stats.doughnutData,
        backgroundColor: [
          "#6366f1", // Indigo
          "#10b981", // Emerald
          "#f59e0b", // Amber
          "#ef4444", // Red
          "#8b5cf6", // Violet
          "#06b6d4"  // Cyan
        ],
        borderWidth: 1,
        borderColor: isDarkMode ? "#0f172a" : "#ffffff"
      }
    ]
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: themeClasses.chartText,
          font: { family: "Inter", size: 11 },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ₹${context.raw.toLocaleString()}`
        }
      }
    }
  };

  const barChartData = {
    labels: stats.barLabels,
    datasets: [
      {
        label: "Income",
        data: stats.barIncomeData,
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderRadius: 8,
        borderWidth: 0
      },
      {
        label: "Expense",
        data: stats.barExpenseData,
        backgroundColor: "rgba(239, 44, 68, 0.8)",
        borderRadius: 8,
        borderWidth: 0
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: themeClasses.chartText,
          font: { family: "Inter", size: 11 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ₹${context.raw.toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: themeClasses.chartText, font: { family: "Inter", size: 11 } }
      },
      y: {
        grid: { color: themeClasses.chartGrid },
        ticks: { color: themeClasses.chartText, font: { family: "Inter", size: 11 } }
      }
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center ${isDarkMode ? "bg-slate-950" : "bg-slate-50"}`}>
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-305 p-4 sm:p-6 lg:p-8 ${themeClasses.bg}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER AREA */}
        <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 rounded-[30px] p-6 sm:p-8 shadow-xl relative overflow-hidden transition-all duration-300 border ${themeClasses.card} ${isDarkMode ? "" : "shadow-slate-100"}`}>
          {/* Background decoration */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-5">
            <div className="relative">
              {user?.profilePic ? (
                <img
                  src={user.profilePic}
                  alt="profile"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-500 shadow-xl"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-xl">
                  {user?.firstName ? user.firstName[0].toUpperCase() : "U"}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-slate-900"></div>
            </div>
            <div>
              <span className="text-indigo-500 font-bold text-xs uppercase tracking-widest">{greetingText}</span>
              <h1 className="text-2xl sm:text-3xl font-black mt-1">
                Welcome back, {user?.firstName || "Guest"}!
              </h1>
              <p className={`text-xs sm:text-sm mt-1 flex items-center gap-1.5 ${themeClasses.textMuted}`}>
                <Calendar size={14} className="text-indigo-500" />
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </p>
            </div>
          </div>

          {/* Quick Action Navigation & Theme Toggle */}
          <div className="flex flex-col sm:items-end gap-4 shrink-0 w-full lg:w-auto">
            <div className="flex flex-wrap gap-3">
              <Link
                to="add-expense"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-2xl transition-all shadow-lg hover:scale-102 text-sm"
              >
                <Plus size={16} />
                Add Expense
              </Link>
              <Link
                to="budget"
                className={`flex items-center gap-2 font-bold px-5 py-3 rounded-2xl transition-all border hover:scale-102 text-sm ${
                  isDarkMode
                    ? "bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700 hover:text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-250 hover:text-slate-900"
                }`}
              >
                <PiggyBank size={16} className="text-indigo-500" />
                Set Budget
              </Link>
            </div>

            {/* Theme Toggle Button Widget */}
            <div className={`flex border rounded-2xl p-1 self-start sm:self-end transition-all ${
              isDarkMode ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"
            }`}>
              <button
                onClick={() => {
                  setIsDarkMode(false);
                  localStorage.setItem("theme", "light");
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  !isDarkMode
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sun size={13} />
                Light Mode
              </button>
              <button
                onClick={() => {
                  setIsDarkMode(true);
                  localStorage.setItem("theme", "dark");
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  isDarkMode
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-900"
                }`}
              >
                <Moon size={13} />
                Dark Mode
              </button>
            </div>
          </div>
        </div>

        {/* OVERVIEW PANEL / METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Balance */}
          <div className={`rounded-[24px] p-6 shadow-md transition-all border flex items-center justify-between relative overflow-hidden group ${themeClasses.card} hover:border-indigo-500/50 ${isDarkMode ? "hover:bg-slate-850" : "hover:bg-slate-50"}`}>
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 group-hover:scale-110 transition-transform duration-300">
              <Wallet size={120} />
            </div>
            <div>
              <span className={`text-xs font-semibold uppercase tracking-wider block ${themeClasses.textMuted}`}>Net Balance</span>
              <span className={`text-2xl sm:text-3xl font-black block mt-2 ${stats.netBalance >= 0 ? themeClasses.textWhite : "text-rose-500"}`}>
                {stats.netBalance < 0 && "-"}₹{Math.abs(stats.netBalance).toLocaleString()}
              </span>
              <span className={`text-[11px] block mt-1.5 ${themeClasses.textMuted}`}>Available disposable income</span>
            </div>
            <div className="bg-indigo-500/10 p-3.5 rounded-2xl text-indigo-500">
              <Wallet size={24} />
            </div>
          </div>

          {/* Card 2: Income */}
          <div className={`rounded-[24px] p-6 shadow-md transition-all border flex items-center justify-between relative overflow-hidden group ${themeClasses.card} hover:border-indigo-500/50 ${isDarkMode ? "hover:bg-slate-850" : "hover:bg-slate-50"}`}>
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp size={120} />
            </div>
            <div>
              <span className={`text-xs font-semibold uppercase tracking-wider block ${themeClasses.textMuted}`}>Total Income</span>
              <span className="text-2xl sm:text-3xl font-black block mt-2 text-emerald-500">
                ₹{stats.totalIncome.toLocaleString()}
              </span>
              <span className="text-emerald-600 text-[11px] font-bold block mt-1.5 flex items-center gap-1">
                <CheckCircle size={10} /> Recurrent earnings active
              </span>
            </div>
            <div className="bg-emerald-500/10 p-3.5 rounded-2xl text-emerald-500">
              <TrendingUp size={24} />
            </div>
          </div>

          {/* Card 3: Expense */}
          <div className={`rounded-[24px] p-6 shadow-md transition-all border flex items-center justify-between relative overflow-hidden group ${themeClasses.card} hover:border-indigo-500/50 ${isDarkMode ? "hover:bg-slate-850" : "hover:bg-slate-50"}`}>
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 group-hover:scale-110 transition-transform duration-300">
              <TrendingDown size={120} />
            </div>
            <div>
              <span className={`text-xs font-semibold uppercase tracking-wider block ${themeClasses.textMuted}`}>Total Expense</span>
              <span className="text-2xl sm:text-3xl font-black block mt-2 text-rose-500">
                ₹{stats.totalExpense.toLocaleString()}
              </span>
              <span className={`text-[11px] font-semibold block mt-1.5 ${themeClasses.textMuted}`}>
                Across all categories
              </span>
            </div>
            <div className="bg-rose-500/10 p-3.5 rounded-2xl text-rose-500">
              <TrendingDown size={24} />
            </div>
          </div>

          {/* Card 4: Savings Rate */}
          <div className={`rounded-[24px] p-6 shadow-md transition-all border flex items-center justify-between relative overflow-hidden group ${themeClasses.card} hover:border-indigo-500/50 ${isDarkMode ? "hover:bg-slate-850" : "hover:bg-slate-50"}`}>
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 group-hover:scale-110 transition-transform duration-300">
              <Percent size={120} />
            </div>
            <div>
              <span className={`text-xs font-semibold uppercase tracking-wider block ${themeClasses.textMuted}`}>Savings Rate</span>
              <span className="text-2xl sm:text-3xl font-black block mt-2 text-indigo-500">
                {stats.savingsRate.toFixed(1)}%
              </span>
              <span className={`text-[11px] block mt-1.5 ${themeClasses.textMuted}`}>
                {stats.savingsRate > 20 ? "Good savings margin" : "Reduce optional spendings"}
              </span>
            </div>
            <div className="bg-indigo-500/10 p-3.5 rounded-2xl text-indigo-500">
              <Percent size={24} />
            </div>
          </div>

        </div>


        {/* CHARTS PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Bar Chart - 6 Month Trend (2 columns wide) */}
          <div className={`rounded-[28px] p-6 shadow-md border flex flex-col justify-between transition-all duration-300 lg:col-span-2 ${themeClasses.card} ${isDarkMode ? "" : "shadow-slate-100/50"}`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Income vs Expense</h2>
                <p className={`text-xs mt-0.5 ${themeClasses.textMuted}`}>Aggregated tracking comparison for the last 6 months</p>
              </div>
              <span className={`border rounded-xl px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${
                isDarkMode ? "bg-slate-850 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-205 text-slate-500"
              }`}>
                Monthly Breakdown
              </span>
            </div>
            <div className="h-72 relative">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>

          {/* Doughnut Chart - Categories breakdown (1 column wide) */}
          <div className={`rounded-[28px] p-6 shadow-md border flex flex-col justify-between transition-all duration-300 ${themeClasses.card} ${isDarkMode ? "" : "shadow-slate-100/50"}`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Expense Categories</h2>
                <p className={`text-xs mt-0.5 ${themeClasses.textMuted}`}>Top spent categories breakdown</p>
              </div>
              <span className={`border rounded-xl px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${
                isDarkMode ? "bg-slate-850 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-205 text-slate-500"
              }`}>
                Share
              </span>
            </div>
            {stats.doughnutData.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center py-10 text-center">
                <FileText size={36} className={`${isDarkMode ? "text-slate-700" : "text-slate-300"} mb-2`} />
                <span className="text-slate-400 text-xs font-semibold">No category records found.</span>
              </div>
            ) : (
              <div className="h-72 relative flex items-center justify-center">
                <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
              </div>
            )}
          </div>

        </div>

        {/* BOTTOM ROWS: RECENT TRANSACTIONS AND ACTIVE BUDGET PROGRESS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Column Left: Recent Transactions */}
          <div className={`rounded-[28px] p-6 shadow-md border flex flex-col justify-between transition-all duration-300 ${themeClasses.card}`}>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Recent Transactions</h2>
                <p className={`text-xs mt-0.5 ${themeClasses.textMuted}`}>Review your latest entries</p>
              </div>
              <Link
                to="my-expenses"
                className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 font-bold transition-colors"
              >
                View All <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-4">
              {stats.recentTransactions.length === 0 ? (
                <div className={`text-center py-16 italic border border-dashed rounded-2xl text-xs ${
                  isDarkMode ? "text-slate-500 bg-slate-950/25 border-slate-800" : "text-slate-400 bg-slate-50 border-slate-200"
                }`}>
                  No recent activities recorded. Start by adding a transaction.
                </div>
              ) : (
                stats.recentTransactions.map((tx) => (
                  <div
                    key={tx._id}
                    className={`flex justify-between items-center border rounded-2xl p-4 transition-all group ${themeClasses.subCard} ${
                      isDarkMode ? "hover:bg-slate-950/80 hover:border-slate-700" : "hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl border ${
                          tx.type === "income"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                            : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                        }`}
                      >
                        {tx.type === "income" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      </div>
                      <div>
                        <h4 className={`font-semibold text-sm transition-colors ${
                          isDarkMode ? "text-white group-hover:text-indigo-300" : "text-slate-900 group-hover:text-indigo-600"
                        }`}>
                          {tx.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                            isDarkMode ? "text-slate-400 bg-slate-800" : "text-slate-600 bg-slate-100 border border-slate-200"
                          }`}>
                            {tx.category}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {tx.date.toLocaleDateString(undefined, { dateStyle: "medium" })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`font-black text-sm whitespace-nowrap ${
                          tx.type === "income" ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"} ₹{tx.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeleteTransaction(tx._id, tx.type)}
                        className="opacity-0 group-hover:opacity-100 bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white p-2 rounded-xl transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column Right: Budgets & Payment Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 h-full">
            
            {/* Active Budgets Tracker (Condensed) */}
            <div className={`rounded-[28px] p-5 shadow-md border flex-1 flex flex-col justify-between transition-all duration-300 ${themeClasses.card}`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-base font-black tracking-tight">Active Budgets</h2>
                  <p className={`text-[10px] mt-0.5 ${themeClasses.textMuted}`}>Parameters threshold utilization</p>
                </div>
                <Link
                  to="budget"
                  className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-650 font-bold transition-colors"
                >
                  Manage <ChevronRight size={14} />
                </Link>
              </div>

              <div className="space-y-4">
                {stats.activeBudgets.length === 0 ? (
                  <div className={`text-center py-8 italic border border-dashed rounded-2xl text-xs ${
                    isDarkMode ? "text-slate-500 bg-slate-950/25 border-slate-800" : "text-slate-400 bg-slate-50 border-slate-200"
                  }`}>
                    No active budget limits set.
                  </div>
                ) : (
                  stats.activeBudgets.slice(0, 2).map((b) => {
                    const barWidth = Math.min(b.percent, 100);
                    const remaining = (b.maxAmount || 0) - b.spent;

                    let barColor = "bg-emerald-500";
                    let textColor = "text-emerald-500";
                    if (b.percent > 95) {
                      barColor = "bg-rose-500";
                      textColor = "text-rose-500";
                    } else if (b.percent > 80) {
                      barColor = "bg-amber-500";
                      textColor = "text-amber-500";
                    }

                    return (
                      <div key={b._id} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className={`${themeClasses.textWhite} font-semibold`}>Limit: ₹{b.maxAmount?.toLocaleString()}</span>
                          <span className={textColor}>{b.percent.toFixed(0)}% Used</span>
                        </div>
                        <div className={`w-full rounded-full h-1.5 overflow-hidden ${isDarkMode ? "bg-slate-850" : "bg-slate-200"}`}>
                          <div
                            style={{ width: `${barWidth}%` }}
                            className={`h-full rounded-full ${barColor} transition-all duration-500`}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                          <span>Spent: ₹{b.spent.toLocaleString()}</span>
                          {b.isExceeded ? (
                            <span className="text-rose-500 flex items-center gap-0.5">
                              <AlertTriangle size={10} /> Over by ₹{Math.abs(remaining).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-emerald-500 font-bold">₹{remaining.toLocaleString()} left</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Payment Mode Breakdown Widget */}
            <div className={`rounded-[28px] p-5 shadow-md border flex-1 flex flex-col justify-between transition-all duration-300 ${themeClasses.card}`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-base font-black tracking-tight">Payment Channels</h2>
                  <p className={`text-[10px] mt-0.5 ${themeClasses.textMuted}`}>Distribution of total spends</p>
                </div>
                <div className="bg-indigo-500/10 text-indigo-500 p-1.5 rounded-xl">
                  <Wallet size={16} />
                </div>
              </div>

              <div className="space-y-3.5 my-2">
                {stats.paymentModesBreakdown.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 italic text-xs">
                    No payment channel records found.
                  </div>
                ) : (
                  stats.paymentModesBreakdown.slice(0, 3).map((pm) => {
                    let barColor = "bg-slate-500";
                    let textColor = "text-slate-500";
                    let bgColor = "bg-slate-500/10";
                    
                    if (pm.mode === "UPI") {
                      barColor = "bg-purple-500";
                      textColor = "text-purple-500";
                      bgColor = "bg-purple-500/10";
                    } else if (pm.mode === "CARD") {
                      barColor = "bg-blue-500";
                      textColor = "text-blue-500";
                      bgColor = "bg-blue-500/10";
                    } else if (pm.mode === "CASH") {
                      barColor = "bg-amber-500";
                      textColor = "text-amber-500";
                      bgColor = "bg-amber-500/10";
                    }

                    return (
                      <div key={pm.mode} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${textColor} ${bgColor}`}>
                            {pm.mode}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`${themeClasses.textWhite} font-semibold`}>₹{pm.amt.toLocaleString()}</span>
                            <span className="text-slate-500 text-[10px]">({pm.percent.toFixed(0)}%)</span>
                          </div>
                        </div>
                        <div className={`w-full rounded-full h-1.5 overflow-hidden ${isDarkMode ? "bg-slate-850" : "bg-slate-200"}`}>
                          <div
                            style={{ width: `${pm.percent}%` }}
                            className={`h-full rounded-full ${barColor}`}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className={`mt-3 border-t pt-2.5 flex justify-between items-center text-[10px] text-slate-500 font-bold ${themeClasses.borderSub}`}>
                <span>Total Expenditure:</span>
                <span className="text-rose-500">₹{stats.totalExpense.toLocaleString()}</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
export default ExpenseDashboard;