import React from 'react'
import { useForm } from 'react-hook-form'
import axios from '../api/axiosInstance'

export const AddCategory = () => {

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm()

    const submitHanlder = async (data) => {

        console.log("data...", data)

        try {

            if (data.type === "expense") {
                const res = await axios.post("/expCat/", data)
                console.log(res)
            }

            if (data.type === "income") {
                const res = await axios.post("/incomeCat/", data)
                console.log(res)
            }

        } catch (err) {
            console.log(err)
        }
    }

    return (
        <>
            <style>
                {`
                    body{
                        margin:0;
                        padding:0;
                        font-family: Arial, Helvetica, sans-serif;
                        background: linear-gradient(135deg,#1e3c72,#2a5298);
                    }

                    .category-container{
                        display:flex;
                        justify-content:center;
                        align-items:center;
                        min-height:100vh;
                    }

                    .category-card{
                        width:400px;
                        background:white;
                        padding:35px;
                        border-radius:20px;
                        box-shadow:0px 10px 30px rgba(0,0,0,0.2);
                        transition:0.3s;
                    }

                    .category-card:hover{
                        transform:translateY(-5px);
                    }

                    .title{
                        text-align:center;
                        color:#1e3c72;
                        margin-bottom:25px;
                        font-size:32px;
                        font-weight:bold;
                    }

                    .form-group{
                        margin-bottom:20px;
                    }

                    .form-group label{
                        display:block;
                        margin-bottom:8px;
                        font-weight:600;
                        color:#333;
                    }

                    .form-control{
                        width:100%;
                        padding:12px;
                        border:2px solid #ddd;
                        border-radius:10px;
                        font-size:16px;
                        outline:none;
                        transition:0.3s;
                        box-sizing:border-box;
                    }

                    .form-control:focus{
                        border-color:#2a5298;
                        box-shadow:0px 0px 8px rgba(42,82,152,0.4);
                    }

                    .error{
                        color:red;
                        font-size:14px;
                        margin-top:5px;
                    }

                    .submit-btn{
                        width:100%;
                        padding:14px;
                        border:none;
                        border-radius:12px;
                        background:linear-gradient(135deg,#1e3c72,#2a5298);
                        color:white;
                        font-size:18px;
                        font-weight:bold;
                        cursor:pointer;
                        transition:0.3s;
                    }

                    .submit-btn:hover{
                        transform:scale(1.02);
                        background:linear-gradient(135deg,#2a5298,#1e3c72);
                    }
                `}
            </style>

            <div className="category-container">

                <div className="category-card">

                    <h1 className="title">
                        Add Category
                    </h1>

                    <form onSubmit={handleSubmit(submitHanlder)}>

                        <div className="form-group">
                            <label>Category Type</label>

                            <select
                                className="form-control"
                                {...register("type", {
                                    required: {
                                        value: true,
                                        message: "Select type"
                                    }
                                })}
                            >
                                <option value="">Select Type</option>
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>

                            <p className="error">
                                {errors.type && errors.type.message}
                            </p>
                        </div>

                        <div className="form-group">
                            <label>Category Name</label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter category name"
                                {...register("catName", {
                                    required: "Category name is required"
                                })}
                            />

                            <p className="error">
                                {errors.catName && errors.catName.message}
                            </p>
                        </div>

                        <div className="form-group">
                            <label>Description</label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter description"
                                {...register("description")}
                            />
                        </div>

                        <button type="submit" className="submit-btn">
                            Add Category
                        </button>

                    </form>

                </div>

            </div>
        </>
    )
}