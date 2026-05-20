// import React, { useEffect, useState } from 'react'
// import axiosInstance from '../api/axiosInstance'
// import { ArrowBigUp, ArrowDown, ArrowUp } from 'lucide-react'

// export const MyExpenses = () => {
//     const [expenses, setExpenses] = useState([])
//     const [loading, setLoading] = useState(true)
//     const [sort, setsort] = useState(1)
//     const [dateSort, setdateSort] = useState(1)
//     const [type, settype] = useState("expense")

//     const getMyExpenses = async () => {
//         try {
//             //const res = await axiosInstance.get("/exp/expbyuserid?sort="+sort)
//             const res = await axiosInstance.get(`/exp/expbyuserid?sort=${sort}&date=${dateSort}&type=${type}`)
//             if (res.data && Array.isArray(res.data.data)) {
//                 setExpenses(res.data.data)
//             } else {
//                 setExpenses([])
//             }
//             console.log(res.data.data)
//         } catch (err) {
//             console.error("Error fetching expenses", err)
//         } finally {
//             setLoading(false)
//         }
//     }
//     const searchHanlder=async(e)=>{
//         console.log(e.target.value)
//         const res = await axiosInstance.get("/exp/search?expName="+e.target.value)
//         console.log(res.data.data) //sa -->[]
//         if (res.data && Array.isArray(res.data.data)) {
//             setExpenses(res.data.data)
//         } else {
//             setExpenses([])
//         }
 
        
//     }

   
//     useEffect(() => {
        
//         getMyExpenses()
//     }, [sort,dateSort,type])

    
//     return (
//         <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 text-slate-200">
//             <div className="max-w-7xl mx-auto">
//                 <div className="flex justify-between items-center mb-8">
//                     <h1 className="text-3xl font-extrabold text-white tracking-tight">My Expenses</h1>
//                     <span className="px-4 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-sm font-medium border border-indigo-500/20">
//                         Total Records: {expenses?.length || 0}
//                     </span>
//                 </div>
//                 <div>
//                     <label>Search</label>
//                     <input type="text" onChange={(e)=>{searchHanlder(e)}}></input>
//                     </div>
//                     <div>
//                         <label>TYPE</label>
//                         <select onChange={(e)=>settype(e.target.value)}>
//                             <option value="expense">EXPENSE</option>
//                             <option value="income">INCOME</option>
//                         </select>
//                     </div>

//                 <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
//                     <div className="overflow-x-auto">
//                         <table className="w-full text-left border-collapse">
//                             <thead>
//                                 <tr className="bg-slate-800/50 border-b border-slate-700">
//                                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Title</th>
//                                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Description</th>
//                                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Amount
//                                     <button onClick={()=>{setsort(1)}}><ArrowUp /></button>
//                                     <button onClick={()=>{setsort(-1)}}><ArrowDown /></button>
//                                     </th>
//                                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Date
//                                         <button onClick={()=>{setdateSort(1)}}><ArrowUp /></button>
//                                         <button onClick={()=>{setdateSort(-1)}}><ArrowDown /></button>
//                                     </th>
//                                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Category</th>
//                                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Mode</th>
//                                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-slate-800">
//                                 {loading ? (
//                                     <tr>
//                                         <td colSpan="7" className="px-6 py-12 text-center text-slate-500 italic">
//                                             Loading your expenses...
//                                         </td>
//                                     </tr>
//                                 ) : !expenses || expenses.length === 0 ? (
//                                     <tr>
//                                         <td colSpan="7" className="px-6 py-12 text-center text-slate-500 italic">
//                                             No expenses found.
//                                         </td>
//                                     </tr>
//                                 ) : (
//                                     expenses.map((ex) => (
//                                         <tr key={ex._id} className="hover:bg-slate-800/30 transition-colors group">
//                                             <td className="px-6 py-4 whitespace-nowrap font-medium text-white">{ex.title}</td>
//                                             <td className="px-6 py-4 max-w-xs truncate text-slate-400" title={ex.description}>
//                                                 {ex.description || '---'}
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-emerald-400">
//                                                 ${parseFloat(type=="expense"?ex.amount:ex.income).toLocaleString(undefined, { minimumFractionDigits: 2 })}
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-slate-400">
//                                                 {new Date(ex.expenseDate).toLocaleDateString()}
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <span className="px-3 py-1 bg-slate-800 text-indigo-300 rounded-lg text-sm border border-slate-700">
//                                                     {type == "expense"?ex.expCat?.catName?.toUpperCase() :ex.incomeCategory?.catName?.toUpperCase() || 'Uncategorized'}
//                                                 </span>
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
//                                                     ex.paymentMode === 'CASH' ? 'text-amber-400 bg-amber-400/10' :
//                                                     ex.paymentMode === 'CARD' ? 'text-blue-400 bg-blue-400/10' :
//                                                     ex.paymentMode === 'UPI' ? 'text-purple-400 bg-purple-400/10' :
//                                                     'text-slate-400 bg-slate-400/10'
//                                                 }`}>
//                                                     {ex.paymentMode}
//                                                 </span>
//                                             </td>
                                            
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }



import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import {
    ArrowUp,
    ArrowDown,
    Trash2,
    Search
} from "lucide-react";

export const MyExpenses = () => {

    const [expenses, setExpenses] = useState([]);

    const [loading, setLoading] = useState(true);

    const [sort, setSort] = useState(1);

    const [dateSort, setDateSort] = useState(1);

    const [type, setType] = useState("expense");

    // GET EXPENSES
    const getMyExpenses = async () => {

        try {

            setLoading(true);

            const res = await axiosInstance.get(

                `/exp/expbyuserid?sort=${sort}&date=${dateSort}&type=${type}`
            );

            setExpenses(res.data.data);

        } catch (err) {

            console.log(err);

            toast.error("Failed To Load Expenses");

        } finally {

            setLoading(false);
        }
    };

    // SEARCH
    const searchHandler = async (e) => {

        try {

            const value = e.target.value;

            const res = await axiosInstance.get(

                `/exp/search?expName=${value}`
            );

            setExpenses(res.data.data);

        } catch (err) {

            console.log(err);
        }
    };

    // DELETE
    const deleteExpense = async (id) => {

        try {

            const confirmDelete = window.confirm(
                "Are you sure you want to delete this expense?"
            );

            if (!confirmDelete) {

                return;
            }

            await axiosInstance.delete(`/exp/${id}`);

            toast.success("Expense Deleted Successfully");

            getMyExpenses();

        } catch (err) {

            console.log(err);

            toast.error("Delete Failed");
        }
    };

    useEffect(() => {

        getMyExpenses();

    }, [sort, dateSort, type]);

    return (

        <div className="min-h-screen bg-slate-950 text-white p-6">

            <div className="max-w-7xl mx-auto">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-5">

                    <div>

                        <h1 className="text-4xl font-black">
                            My Expenses
                        </h1>

                        <p className="text-slate-400 mt-2">
                            Manage all your expenses & income
                        </p>

                    </div>

                    <div className="bg-indigo-500/10 border border-indigo-500/20 px-5 py-2 rounded-2xl text-indigo-300 font-semibold">

                        Total Records : {expenses.length}

                    </div>

                </div>

                {/* FILTERS */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-8 shadow-2xl">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                        {/* SEARCH */}
                        <div>

                            <label className="text-slate-400 block mb-2">
                                Search
                            </label>

                            <div className="relative">

                                <Search
                                    className="absolute left-4 top-3.5 text-slate-500"
                                    size={18}
                                />

                                <input
                                    type="text"
                                    placeholder="Search expense..."
                                    onChange={searchHandler}
                                    className="
                                    w-full
                                    bg-slate-800
                                    border border-slate-700
                                    rounded-2xl
                                    pl-12
                                    pr-4
                                    py-3
                                    outline-none
                                    focus:border-indigo-500
                                    "
                                />

                            </div>

                        </div>

                        {/* TYPE */}
                        <div>

                            <label className="text-slate-400 block mb-2">
                                Type
                            </label>

                            <select

                                onChange={(e) =>
                                    setType(e.target.value)
                                }

                                className="
                                w-full
                                bg-slate-800
                                border border-slate-700
                                rounded-2xl
                                px-4 py-3
                                outline-none
                                focus:border-indigo-500
                                "
                            >

                                <option value="expense">
                                    Expense
                                </option>

                                <option value="income">
                                    Income
                                </option>

                            </select>

                        </div>

                        {/* SORT */}
                        <div>

                            <label className="text-slate-400 block mb-2">
                                Sort By Amount
                            </label>

                            <div className="flex gap-3">

                                <button

                                    onClick={() => setSort(1)}

                                    className="
                                    flex items-center gap-2
                                    bg-slate-800
                                    hover:bg-indigo-600
                                    px-5 py-3
                                    rounded-2xl
                                    transition-all
                                    "
                                >

                                    <ArrowUp size={18} />

                                    Asc

                                </button>

                                <button

                                    onClick={() => setSort(-1)}

                                    className="
                                    flex items-center gap-2
                                    bg-slate-800
                                    hover:bg-indigo-600
                                    px-5 py-3
                                    rounded-2xl
                                    transition-all
                                    "
                                >

                                    <ArrowDown size={18} />

                                    Desc

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

                {/* TABLE */}
                <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-slate-800 border-b border-slate-700">

                                <tr>

                                    <th className="px-6 py-5 text-left text-slate-400 uppercase text-sm">
                                        Title
                                    </th>

                                    <th className="px-6 py-5 text-left text-slate-400 uppercase text-sm">
                                        Description
                                    </th>

                                    <th className="px-6 py-5 text-right text-slate-400 uppercase text-sm">
                                        Amount
                                    </th>

                                    <th className="px-6 py-5 text-left text-slate-400 uppercase text-sm">

                                        <div className="flex items-center gap-2">

                                            Date

                                            <button
                                                onClick={() => setDateSort(1)}
                                            >
                                                <ArrowUp size={16} />
                                            </button>

                                            <button
                                                onClick={() => setDateSort(-1)}
                                            >
                                                <ArrowDown size={16} />
                                            </button>

                                        </div>

                                    </th>

                                    <th className="px-6 py-5 text-left text-slate-400 uppercase text-sm">
                                        Category
                                    </th>

                                    <th className="px-6 py-5 text-left text-slate-400 uppercase text-sm">
                                        Payment
                                    </th>

                                    <th className="px-6 py-5 text-center text-slate-400 uppercase text-sm">
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {
                                    loading ? (

                                        <tr>

                                            <td
                                                colSpan="7"
                                                className="text-center py-16 text-slate-500"
                                            >
                                                Loading...
                                            </td>

                                        </tr>

                                    ) : expenses.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="7"
                                                className="text-center py-16 text-slate-500"
                                            >
                                                No Expenses Found
                                            </td>

                                        </tr>

                                    ) : (

                                        expenses.map((ex) => (

                                            <tr

                                                key={ex._id}

                                                className="
                                                border-b border-slate-800
                                                hover:bg-slate-800/40
                                                transition-all
                                                "
                                            >

                                                {/* TITLE */}
                                                <td className="px-6 py-5 font-semibold">
                                                    {ex.title}
                                                </td>

                                                {/* DESC */}
                                                <td className="px-6 py-5 text-slate-400 max-w-xs truncate">
                                                    {ex.description || "---"}
                                                </td>

                                                {/* AMOUNT */}
                                                <td className="px-6 py-5 text-right text-emerald-400 font-bold">

                                                    ₹
                                                    {
                                                        type === "expense"
                                                            ? ex.amount
                                                            : ex.income
                                                    }

                                                </td>

                                                {/* DATE */}
                                                <td className="px-6 py-5 text-slate-300">

                                                    {
                                                        new Date(ex.expenseDate)
                                                            .toLocaleDateString()
                                                    }

                                                </td>

                                                {/* CATEGORY */}
                                                <td className="px-6 py-5">

                                                    <span className="
                                                    bg-indigo-500/10
                                                    border border-indigo-500/20
                                                    text-indigo-300
                                                    px-3 py-1
                                                    rounded-xl
                                                    text-sm
                                                    ">

                                                        {
                                                            type === "expense"
                                                                ? ex.expCat?.catName
                                                                : ex.incomeCategory?.catName
                                                        }

                                                    </span>

                                                </td>

                                                {/* PAYMENT */}
                                                <td className="px-6 py-5">

                                                    <span className="
                                                    bg-slate-800
                                                    border border-slate-700
                                                    px-3 py-1
                                                    rounded-xl
                                                    text-sm
                                                    ">

                                                        {ex.paymentMode}

                                                    </span>

                                                </td>

                                                {/* ACTION */}
                                                <td className="px-6 py-5 text-center">

                                                    <button

                                                        onClick={() =>
                                                            deleteExpense(ex._id)
                                                        }

                                                        className="
                                                        bg-red-500
                                                        hover:bg-red-600
                                                        p-3
                                                        rounded-xl
                                                        transition-all
                                                        hover:scale-105
                                                        "
                                                    >

                                                        <Trash2 size={18} />

                                                    </button>

                                                </td>

                                            </tr>
                                        ))
                                    )
                                }

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>
    );
};