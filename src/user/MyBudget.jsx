import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  X,
  Clock,
  TrendingUp,
  DollarSign
} from "lucide-react";

export const MyBudget = () => {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all"); // "all" | "active" | "inactive"

  // Modal control states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  // Form inputs state
  const [formData, setFormData] = useState({
    maxAmount: "",
    createdDate: new Date().toISOString().split("T")[0],
    endDate: "",
    budgetStatus: "active",
    exceedDate: ""
  });

  // Fetch all budgets and user expenses
  const loadData = async () => {
    try {
      setLoading(true);
      const [budgetRes, expenseRes] = await Promise.all([
        axiosInstance.get("/budget"),
        axiosInstance.get("/exp/expbyuserid?type=expense")
      ]);
      setBudgets(budgetRes.data.data || []);
      setExpenses(expenseRes.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load budget tracking data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format date helper for input type="date"
  const formatDateForForm = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

  // Helper to calculate total spent on a specific budget range
  const getSpentAmount = (budget) => {
    const start = new Date(budget.createdDate);
    start.setHours(0, 0, 0, 0);

    const end = budget.endDate ? new Date(budget.endDate) : null;
    if (end) {
      end.setHours(23, 59, 59, 999);
    }

    return expenses
      .filter((ex) => {
        const exDate = new Date(ex.expenseDate);
        const isAfterStart = exDate >= start;
        const isBeforeEnd = end ? exDate <= end : true;
        return isAfterStart && isBeforeEnd;
      })
      .reduce((sum, ex) => sum + (ex.amount || 0), 0);
  };

  // Input change handler
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Create Budget
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.maxAmount || Number(formData.maxAmount) <= 0) {
      toast.error("Please enter a valid max amount");
      return;
    }

    try {
      const payload = {
        maxAmount: Number(formData.maxAmount),
        createdDate: formData.createdDate ? new Date(formData.createdDate) : new Date(),
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        budgetStatus: formData.budgetStatus,
        exceedDate: formData.exceedDate ? new Date(formData.exceedDate) : null
      };

      await axiosInstance.post("/budget", payload);
      toast.success("Budget tracking setup successfully");
      setShowAddModal(false);
      
      // Reset inputs
      setFormData({
        maxAmount: "",
        createdDate: new Date().toISOString().split("T")[0],
        endDate: "",
        budgetStatus: "active",
        exceedDate: ""
      });
      loadData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create budget");
    }
  };

  // Open Edit Modal
  const openEdit = (budget) => {
    setSelectedBudget(budget);
    setFormData({
      maxAmount: budget.maxAmount || "",
      createdDate: formatDateForForm(budget.createdDate),
      endDate: formatDateForForm(budget.endDate),
      budgetStatus: budget.budgetStatus || "active",
      exceedDate: formatDateForForm(budget.exceedDate)
    });
    setShowEditModal(true);
  };

  // Edit/Update Budget
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.maxAmount || Number(formData.maxAmount) <= 0) {
      toast.error("Please enter a valid max amount");
      return;
    }

    try {
      const payload = {
        maxAmount: Number(formData.maxAmount),
        createdDate: formData.createdDate ? new Date(formData.createdDate) : new Date(),
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        budgetStatus: formData.budgetStatus,
        exceedDate: formData.exceedDate ? new Date(formData.exceedDate) : null
      };

      await axiosInstance.put(`/budget/update/${selectedBudget._id}`, payload);
      toast.success("Budget parameters updated");
      setShowEditModal(false);
      setSelectedBudget(null);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update budget");
    }
  };

  // Delete Budget
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this budget limit?");
    if (!isConfirmed) return;

    try {
      await axiosInstance.delete(`/budget/delete/${id}`);
      toast.success("Budget tracker deleted successfully");
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete budget limit");
    }
  };

  // Process and compute stats for listing
  const getProcessedBudgets = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return budgets.map((b) => {
      const spent = getSpentAmount(b);
      const limit = b.maxAmount || 0;
      const percent = limit > 0 ? (spent / limit) * 100 : 0;
      const isExceeded = spent > limit;

      const bEndDate = b.endDate ? new Date(b.endDate) : null;
      if (bEndDate) {
        bEndDate.setHours(23, 59, 59, 999);
      }
      
      const isExpired = bEndDate && today > bEndDate;
      const isRealActive = b.budgetStatus === "active" && !isExpired;

      return {
        ...b,
        spent,
        percent,
        isExceeded,
        isRealActive,
        isExpired
      };
    });
  };

  const processedBudgets = getProcessedBudgets();

  // Active lists for filters
  const activeList = processedBudgets.filter((b) => b.isRealActive);
  const totalLimit = activeList.reduce((sum, b) => sum + (b.maxAmount || 0), 0);
  const totalSpent = activeList.reduce((sum, b) => sum + b.spent, 0);
  const netRemaining = totalLimit - totalSpent;

  const displayBudgets = processedBudgets.filter((b) => {
    if (filterType === "active") return b.isRealActive;
    if (filterType === "inactive") return !b.isRealActive;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-5">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Budget limits
            </h1>
            <p className="text-slate-400 mt-2 text-sm sm:text-base">
              Set spending limits, track utilization progress, and manage budgets dynamically.
            </p>
          </div>

          <button
            onClick={() => {
              setFormData({
                maxAmount: "",
                createdDate: new Date().toISOString().split("T")[0],
                endDate: "",
                budgetStatus: "active",
                exceedDate: ""
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-2xl transition-all shadow-lg hover:scale-105"
          >
            <Plus size={20} />
            Add Budget Limit
          </button>
        </div>

        {/* OVERVIEW PANEL */}
        {activeList.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-8 shadow-xl">
            <h2 className="text-lg font-bold text-slate-300 mb-5 flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-400" />
              Active Budgets Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Active Budget Limit</span>
                <span className="text-3xl font-black block mt-2 text-white">₹{totalLimit.toLocaleString()}</span>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Spent in Period</span>
                <span className={`text-3xl font-black block mt-2 ${totalSpent > totalLimit ? "text-rose-500" : "text-amber-400"}`}>
                  ₹{totalSpent.toLocaleString()}
                </span>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Remaining Net Balance</span>
                <span className={`text-3xl font-black block mt-2 ${netRemaining < 0 ? "text-rose-500" : "text-emerald-400"}`}>
                  {netRemaining < 0 ? "- " : ""}₹{Math.abs(netRemaining).toLocaleString()}
                </span>
              </div>

            </div>
          </div>
        )}

        {/* FILTER CATEGORIES */}
        <div className="flex border-b border-slate-800 mb-8 gap-6">
          <button
            onClick={() => setFilterType("all")}
            className={`pb-3 font-bold text-sm border-b-2 px-1 transition-all ${
              filterType === "all"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            All Budgets ({processedBudgets.length})
          </button>
          <button
            onClick={() => setFilterType("active")}
            className={`pb-3 font-bold text-sm border-b-2 px-1 transition-all ${
              filterType === "active"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Active ({processedBudgets.filter((b) => b.isRealActive).length})
          </button>
          <button
            onClick={() => setFilterType("inactive")}
            className={`pb-3 font-bold text-sm border-b-2 px-1 transition-all ${
              filterType === "inactive"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Inactive & Expired ({processedBudgets.filter((b) => !b.isRealActive).length})
          </button>
        </div>

        {/* GRID LISTING */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : displayBudgets.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl">
            <Calendar size={48} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-300">No budgets found</h3>
            <p className="text-slate-500 mt-1 max-w-sm mx-auto text-xs">
              No budget matches the selected tab. Create a new budget limit to begin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayBudgets.map((b) => {
              const remaining = (b.maxAmount || 0) - b.spent;
              const barWidth = Math.min(b.percent, 100);

              let barColor = "bg-emerald-500";
              let textColor = "text-emerald-400";
              let exceedBg = "bg-emerald-500/10 border-emerald-500/25";

              if (b.percent > 90) {
                barColor = "bg-rose-500";
                textColor = "text-rose-400";
                exceedBg = "bg-rose-500/10 border-rose-500/25";
              } else if (b.percent > 70) {
                barColor = "bg-amber-500";
                textColor = "text-amber-400";
                exceedBg = "bg-amber-500/10 border-amber-500/25";
              }

              return (
                <div
                  key={b._id}
                  className={`bg-slate-900 border ${
                    b.isExceeded ? "border-rose-500/40" : "border-slate-800"
                  } rounded-3xl p-6 shadow-xl flex flex-col justify-between relative hover:border-slate-700 transition-all`}
                >
                  <div>
                    {/* Badge */}
                    <div className="flex justify-between items-center mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                          b.isRealActive
                            ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-400"
                            : b.isExpired
                            ? "bg-slate-800 border-slate-700 text-slate-400"
                            : "bg-slate-800/40 border-slate-700/20 text-slate-400"
                        }`}
                      >
                        {b.isRealActive ? "Active" : b.isExpired ? "Expired" : "Inactive"}
                      </span>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(b)}
                          className="bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl text-slate-300 hover:text-white transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(b._id)}
                          className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white p-2.5 rounded-xl transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Limit */}
                    <div className="mb-4">
                      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Limit</span>
                      <h3 className="text-3xl font-black text-white mt-1">₹{b.maxAmount?.toLocaleString()}</h3>
                    </div>

                    {/* Dates block */}
                    <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3.5 space-y-2 mb-5">
                      <div className="flex justify-between text-xs text-slate-400 font-semibold">
                        <span className="flex items-center gap-1.5"><Calendar size={13} className="text-indigo-400" /> Starts:</span>
                        <span className="text-slate-300">{new Date(b.createdDate).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                      </div>
                      {b.endDate && (
                        <div className="flex justify-between text-xs text-slate-400 font-semibold">
                          <span className="flex items-center gap-1.5"><Calendar size={13} className="text-indigo-400" /> Ends:</span>
                          <span className="text-slate-300">{new Date(b.endDate).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    {/* Progress Bar */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400">Spent: ₹{b.spent.toLocaleString()}</span>
                        <span className={textColor}>{b.percent.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-850 rounded-full h-2 overflow-hidden">
                        <div style={{ width: `${barWidth}%` }} className={`h-full rounded-full ${barColor} transition-all`}></div>
                      </div>
                    </div>

                    {/* Warning message */}
                    <div className="border-t border-slate-800/80 pt-3">
                      {b.isExceeded ? (
                        <div className={`p-3 rounded-xl border flex flex-col gap-1.5 ${exceedBg} ${textColor} text-xs font-bold`}>
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle size={14} />
                            <span>EXCEEDED BY ₹{Math.abs(remaining).toLocaleString()}</span>
                          </div>
                          {b.exceedDate && (
                            <span className="text-[10px] opacity-75 font-semibold pl-5 block">
                              Exceeded on: {new Date(b.exceedDate).toLocaleDateString(undefined, { dateStyle: "medium" })}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-400">Remaining Balance:</span>
                          <span className="text-emerald-400">₹{remaining.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* CREATE MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 p-2 rounded-xl transition-all"
              >
                <X size={18} />
              </button>

              <h2 className="text-2xl font-black mb-1">Create Budget</h2>
              <p className="text-slate-400 text-xs mb-6">Specify parameters. System aggregates user transactions dynamically matching the timeframe.</p>

              <form onSubmit={handleCreate} className="space-y-5">
                <div className="flex flex-col space-y-1">
                  <label htmlFor="maxAmount" className="text-sm font-semibold text-slate-300">
                    Max Amount Limit (₹) *
                  </label>
                  <input
                    type="number"
                    id="maxAmount"
                    name="maxAmount"
                    required
                    min="1"
                    placeholder="e.g. 10000"
                    value={formData.maxAmount}
                    onChange={handleFormChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 text-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="createdDate" className="text-sm font-semibold text-slate-300">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="createdDate"
                      name="createdDate"
                      value={formData.createdDate}
                      onChange={handleFormChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 text-white font-medium"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label htmlFor="endDate" className="text-sm font-semibold text-slate-300">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleFormChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 text-white font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="budgetStatus" className="text-sm font-semibold text-slate-300">
                      Status
                    </label>
                    <select
                      id="budgetStatus"
                      name="budgetStatus"
                      value={formData.budgetStatus}
                      onChange={handleFormChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 text-white font-medium"
                    >
                      <option value="active">Active</option>
                      <option value="not active">Inactive</option>
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label htmlFor="exceedDate" className="text-sm font-semibold text-slate-300">
                      Exceed Date (Optional)
                    </label>
                    <input
                      type="date"
                      id="exceedDate"
                      name="exceedDate"
                      value={formData.exceedDate}
                      onChange={handleFormChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 text-white font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-300 transition-all font-bold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all font-bold text-sm shadow-md"
                  >
                    Create Budget
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedBudget(null);
                }}
                className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 p-2 rounded-xl transition-all"
              >
                <X size={18} />
              </button>

              <h2 className="text-2xl font-black mb-1">Edit Budget</h2>
              <p className="text-slate-400 text-xs mb-6">Modify tracking parameters for this budget threshold.</p>

              <form onSubmit={handleUpdate} className="space-y-5">
                <div className="flex flex-col space-y-1">
                  <label htmlFor="edit_maxAmount" className="text-sm font-semibold text-slate-300">
                    Max Amount Limit (₹) *
                  </label>
                  <input
                    type="number"
                    id="edit_maxAmount"
                    name="maxAmount"
                    required
                    min="1"
                    placeholder="e.g. 10000"
                    value={formData.maxAmount}
                    onChange={handleFormChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 text-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="edit_createdDate" className="text-sm font-semibold text-slate-300">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="edit_createdDate"
                      name="createdDate"
                      value={formData.createdDate}
                      onChange={handleFormChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 text-white font-medium"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label htmlFor="edit_endDate" className="text-sm font-semibold text-slate-300">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      id="edit_endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleFormChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 text-white font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="edit_budgetStatus" className="text-sm font-semibold text-slate-300">
                      Status
                    </label>
                    <select
                      id="edit_budgetStatus"
                      name="budgetStatus"
                      value={formData.budgetStatus}
                      onChange={handleFormChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 text-white font-medium"
                    >
                      <option value="active">Active</option>
                      <option value="not active">Inactive</option>
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label htmlFor="edit_exceedDate" className="text-sm font-semibold text-slate-300">
                      Exceed Date (Optional)
                    </label>
                    <input
                      type="date"
                      id="edit_exceedDate"
                      name="exceedDate"
                      value={formData.exceedDate}
                      onChange={handleFormChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 text-white font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedBudget(null);
                    }}
                    className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-300 transition-all font-bold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all font-bold text-sm shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
export default MyBudget;
