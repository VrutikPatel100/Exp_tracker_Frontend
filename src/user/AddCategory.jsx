import React from 'react'
import { useForm } from 'react-hook-form'
import axios from '../api/axiosInstance'

export const AddCategory = () => {

    const {register,handleSubmit}=useForm()
    const submitHanlder = async(data)=>{
        //api
        const res = await axios.post("/expCat/",data)
        console.log(res)
    }
  return (
    <div>
        <h1>ADD CATEGORY</h1>
        <form onSubmit={handleSubmit(submitHanlder)}>
            <div>
                <label htmlFor="name">Category Name</label>
                <input type="text" id="name" {...register("name")} />
            </div>
            <div>
                <lable>DESCRIPTION</lable>
                <input type="text" id="description" {...register("description")} />
            </div>
            <button type="submit">Add Category</button>
        </form>
    </div>
  )
}