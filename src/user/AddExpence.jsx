
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import axiosInstance from '../api/axiosInstance'
import { useNavigate } from 'react-router-dom'

export const AddExpense = () => {
    const {register,handleSubmit,formState:{errors}}=useForm()
    const [categories, setcategories] = useState([])
    const [selectedFile, setselectedFile] = useState("")
    const navigate = useNavigate()
    const [selectedType, setselectedType] = useState("expense")

    const getMyExpCategories = async()=>{
        const res = await axiosInstance.get("/expCat/userCategory")
        console.log(res.data.data)
        setcategories(res.data.data)
    }
    const getMyIncomeCategories = async()=>{
        const res = await axiosInstance.get("/incomeCat/incomeCategory")
        console.log(res.data.data)
        setcategories(res.data.data)
    }

    useEffect(()=>{
      if(selectedType == "expense"){
        getMyExpCategories()
      }else{
        getMyIncomeCategories()
      }
    },[selectedType])

    const submitHandler = async(data)=>{
      //data.amount
     try{
        console.log(data)
        if(selectedType =="income"){
          alert("income")
          data.income = data.amount
          delete data.amount
          data.incomeCategory = data.expCat
          delete data.expCat
          
        }
        const res = await axiosInstance.post("/exp/",data)
        console.log(res) //expid _id
        if(res.status==201){

            //file upload api 
            if(selectedFile){
                const formData = new FormData()
                formData.append("expId",res.data.data._id) //exp id
                formData.append("receipt",selectedFile)
                const res2 = await axiosInstance.put("/exp/uploadreceipt",formData)
                console.log("file upload response",res2)
                if(res2.status == 200){
                     alert("expense added successfully with receipt")
                     navigate("/my-expenses")
                }
                else{
                    alert("expense added successfully but receipt upload fail")
                    navigate("/my-expenses")
                }
            }else{
                alert("expense added successfully without receipt")
                navigate("/my-expenses")
            }
            


           
            
        }
     }catch(err){
        alert(err.response.data.message)
     }
    }

  return (
    <div className="min-h-screen bg-bg-muted flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl border border-primary-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-primary-900 tracking-tight">
            Add New Expense
          </h2>
          <p className="mt-2 text-center text-sm text-text-muted">
            Fill in the details below to track your spending
          </p>
        </div>
        <div className="flex">
          <label>SELECT CATEGORY TYPE</label>
          <select onChange={(e)=>setselectedType(e.target.value)}>
            <option value="expense">EXPENSE</option>
            <option value="income">INCOME</option>
          </select>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(submitHandler)}>
          <div className="space-y-4">
            <div className="flex flex-col space-y-1">
              <label htmlFor="title" className="text-sm font-medium text-text-base">
                Title
              </label>
              <input
                type="text"
                id="title"
                {...register("title")}
                placeholder="e.g. Grocery Shopping"
                className="w-full px-4 py-3 rounded-xl border-2 border-primary-50 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all outline-none bg-white text-text-base"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label htmlFor="description" className="text-sm font-medium text-text-base">
                Description
              </label>
              <input
                type="text"
                id="description"
                {...register("description")}
                placeholder="Details about the expense"
                className="w-full px-4 py-3 rounded-xl border-2 border-primary-50 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all outline-none bg-white text-text-base"
              />
            </div>


            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col space-y-1">
                <label htmlFor="amount" className="text-sm font-medium text-text-base">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-text-muted">$</span>
                  <input
                    type="number"
                    id="amount"
                    {...register("amount")}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-primary-50 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all outline-none bg-white text-text-base"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label htmlFor="expenseDate" className="text-sm font-medium text-text-base">
                  Date
                </label>
                <input
                  type="date"
                  id="expenseDate"
                  {...register("expenseDate")}
                  className="w-full px-4 py-3 rounded-xl border-2 border-primary-50 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all outline-none bg-white text-text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col space-y-1">
                <label htmlFor="expCat" className="text-sm font-medium text-text-base">
                  Category
                </label>
                <select
                  id="expCat"
                  {...register("expCat")}
                  className="w-full px-4 py-3 rounded-xl border-2 border-primary-50 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all outline-none bg-white text-text-base appearance-none"
                >
                  <option value="">Select Category</option>
                  {categories?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.catName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <label htmlFor="paymentMode" className="text-sm font-medium text-text-base">
                  Payment Mode
                </label>
                <select
                  id="paymentMode"
                  {...register("paymentMode")}
                  className="w-full px-4 py-3 rounded-xl border-2 border-primary-50 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all outline-none bg-white text-text-base appearance-none"
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-text-base">Receipt</label>
            <input onChange={(event)=>{setselectedFile(event.target.files[0])}} className="w-full px-4 py-3 rounded-xl border-2 border-primary-50 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all outline-none bg-white text-text-base" type="file" />
          </div>
          <div className='flex flex-col space-y-1'>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all duration-200 shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}