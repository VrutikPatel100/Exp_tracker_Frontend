import React, { useEffect } from 'react'
import axios from '../api/axiosInstance'

export const GetMyCategories = () => {
    const getAllCategories = async()=>{
        const res = await axios.get("/expCat/userCategory")
        console.log(res.data)
    }
    useEffect(()=>{
        getAllCategories()
    },[])
  return (
    <div>GetMyCategories</div>
  )
}