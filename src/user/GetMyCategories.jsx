// import React, { useEffect,useState } from 'react'
// import axios from '../api/axiosInstance'

// export const GetMyCategories = () => {
//   const [categories, setCategories] = useState([])
//   const [selectedCategory, setselectedCategory] = useState("income")

//     const getAllCategories = async () => {
//         const res = await axios.get("/expCat/userCategory") //token
//         if (res.data && Array.isArray(res.data.data)) {
//             setCategories(res.data.data)
//         } else {
//             setCategories([])
//         }
//     }
//     const getAllIncomeCategories = async()=>{
//       const res = await axios.get("/incomeCat/incomeCategory") //token
//         if (res.data && Array.isArray(res.data.data)) {
//             setCategories(res.data.data)
//         } else {
//             setCategories([])
//         }
//     }
//     useEffect(()=>{
//         if(selectedCategory == "expense"){
//             getAllCategories()
//         }else{
//             getAllIncomeCategories()
//         }
//     },[selectedCategory])
//    const deleteCategory = async (id) => {

//   try {

//     let res

//     // EXPENSE CATEGORY DELETE
//     if (selectedCategory === "expense") {

//       res = await axios.delete(
//         `/expCat/deletemycat/${id}`
//       )

//       if (res.status === 200) {

//         getAllCategories()

//         alert("Expense category deleted successfully")
//       }

//     }

//     // INCOME CATEGORY DELETE
//     else {

//       res = await axios.delete(
//         `/incomeCat/deleteincomecat/${id}`
//       )

//       if (res.status === 200) {

//         getAllIncomeCategories()

//         alert("Income category deleted successfully")
//       }
//     }

//   } catch (err) {

//     console.log(err)

//     alert("Error while deleting category")
//   }
// }
//   return (
//     <div className="container mx-auto">
//       <h1 className="text-3xl font-bold mb-6">My Categories</h1>
//        <div className="flex">
//           <label>SELECT CATEGORY TYPE</label>
//           <select onChange={(e)=>setselectedCategory(e.target.value)}>
//             <option value="expense">EXPENSE</option>
//             <option value="income">INCOME</option>
//           </select>
//        </div>
//       <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
//         <thead className="bg-gray-50">
//           <tr>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">ID</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Name</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Description</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Actions</th>
//           </tr>
//         </thead>
//         <tbody className="bg-white">
//           {categories.map((category) => (
//             <tr key={category._id} className="border-b border-gray-200 hover:bg-gray-50">
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category._id}</td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.catName}</td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.description}</td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                 <button onClick={() => deleteCategory(category._id)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 ml-2">Delete</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   )
// }

import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { Trash2, Layers3 } from "lucide-react";
import { toast } from "react-toastify";

export const GetMyCategories = () => {

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("expense");
    const [loading, setLoading] = useState(true);

    // =========================
    // GET EXPENSE CATEGORIES
    // =========================
    const getAllCategories = async () => {

        try {

            setLoading(true);

            const res = await axios.get(
                "/expCat/userCategory"
            );

            if (
                res.data &&
                Array.isArray(res.data.data)
            ) {

                setCategories(res.data.data);

            } else {

                setCategories([]);
            }

        } catch (err) {

            console.log(err);

            toast.error(
                "Failed To Load Categories"
            );

        } finally {

            setLoading(false);
        }
    };

    // =========================
    // GET INCOME CATEGORIES
    // =========================
    const getAllIncomeCategories = async () => {

        try {

            setLoading(true);

            const res = await axios.get(
                "/incomeCat/incomeCategory"
            );

            if (
                res.data &&
                Array.isArray(res.data.data)
            ) {

                setCategories(res.data.data);

            } else {

                setCategories([]);
            }

        } catch (err) {

            console.log(err);

            toast.error(
                "Failed To Load Categories"
            );

        } finally {

            setLoading(false);
        }
    };

    // =========================
    // USE EFFECT
    // =========================
    useEffect(() => {

        if (selectedCategory === "expense") {

            getAllCategories();

        } else {

            getAllIncomeCategories();
        }

    }, [selectedCategory]);

    // =========================
    // DELETE CATEGORY
    // =========================
    const deleteCategory = async (id) => {

        try {

            if (
                !window.confirm(
                    "Are you sure you want to delete this category?"
                )
            ) {
                return;
            }

            let res;

            // EXPENSE CATEGORY DELETE
            if (
                selectedCategory === "expense"
            ) {

                res = await axios.delete(
                    `/expCat/deletemycat/${id}`
                );

                if (res.status === 200 || res.status === 201) {

                    toast.success(
                        "Expense Category Deleted"
                    );

                    getAllCategories();
                }

            }

            // INCOME CATEGORY DELETE
            else {

                res = await axios.delete(
                    `/incomeCat/deleteincomecat/${id}`
                );

                if (res.status === 200 || res.status === 201) {

                    toast.success(
                        "Income Category Deleted"
                    );

                    getAllIncomeCategories();
                }
            }

        } catch (err) {

            console.log(err);

            toast.error(
                "Error While Deleting Category"
            );
        }
    };

    return (

        <div className="min-h-screen bg-slate-950 py-10 px-4 text-white">

            <div className="max-w-7xl mx-auto">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">

                    <div>

                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">

                            <Layers3 className="text-indigo-500" size={38} />

                            My Categories
                        </h1>

                        <p className="text-slate-400 mt-2">

                            Manage all your expense and income categories
                        </p>

                    </div>

                    {/* SELECT */}
                    <div className="flex items-center gap-3">

                        <label className="font-semibold text-slate-300">

                            Category Type
                        </label>

                        <select

                            value={selectedCategory}

                            onChange={(e) =>
                                setSelectedCategory(
                                    e.target.value
                                )
                            }

                            className="bg-slate-800 border border-slate-700 px-5 py-3 rounded-2xl outline-none focus:border-indigo-500"
                        >

                            <option value="expense">

                                Expense

                            </option>

                            <option value="income">

                                Income

                            </option>

                        </select>

                    </div>

                </div>

                {/* CARD */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">

                    {/* TOP */}
                    <div className="flex justify-between items-center px-8 py-6 border-b border-slate-800 bg-slate-900/80">

                        <h2 className="text-2xl font-bold">

                            {
                                selectedCategory === "expense"
                                    ? "Expense Categories"
                                    : "Income Categories"
                            }

                        </h2>

                        <span className="bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-full text-sm font-bold">

                            Total : {categories.length}

                        </span>

                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-slate-800/50">

                                <tr>

                                    <th className="px-6 py-5 text-left text-sm uppercase tracking-wider text-slate-400">

                                        ID

                                    </th>

                                    <th className="px-6 py-5 text-left text-sm uppercase tracking-wider text-slate-400">

                                        Category Name

                                    </th>

                                    <th className="px-6 py-5 text-left text-sm uppercase tracking-wider text-slate-400">

                                        Description

                                    </th>

                                    <th className="px-6 py-5 text-center text-sm uppercase tracking-wider text-slate-400">

                                        Action

                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {
                                    loading ? (

                                        <tr>

                                            <td
                                                colSpan="4"
                                                className="text-center py-16 text-slate-500"
                                            >

                                                Loading Categories...

                                            </td>

                                        </tr>

                                    ) : categories.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="4"
                                                className="text-center py-16 text-slate-500"
                                            >

                                                No Categories Found

                                            </td>

                                        </tr>

                                    ) : (

                                        categories.map((category) => (

                                            <tr
                                                key={category._id}
                                                className="border-t border-slate-800 hover:bg-slate-800/40 transition-all duration-300"
                                            >

                                                {/* ID */}
                                                <td className="px-6 py-5 text-slate-400 text-sm">

                                                    {category._id}

                                                </td>

                                                {/* NAME */}
                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-3">

                                                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center font-black text-lg">

                                                            {
                                                                category.catName
                                                                    ?.charAt(0)
                                                                    ?.toUpperCase()
                                                            }

                                                        </div>

                                                        <div>

                                                            <h3 className="font-bold text-lg">

                                                                {
                                                                    category.catName
                                                                }

                                                            </h3>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* DESCRIPTION */}
                                                <td className="px-6 py-5 text-slate-300">

                                                    {
                                                        category.description ||
                                                        "No Description"
                                                    }

                                                </td>

                                                {/* ACTION */}
                                                <td className="px-6 py-5 text-center">

                                                    <button

                                                        onClick={() =>
                                                            deleteCategory(
                                                                category._id
                                                            )
                                                        }

                                                        className="bg-red-500 hover:bg-red-600 transition-all duration-300 px-5 py-3 rounded-2xl flex items-center gap-2 mx-auto font-semibold shadow-lg"
                                                    >

                                                        <Trash2 size={18} />

                                                        Delete

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