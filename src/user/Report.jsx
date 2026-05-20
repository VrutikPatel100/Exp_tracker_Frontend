import React, { useEffect, useState } from 'react'
import axiosInstance from '../api/axiosInstance'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const Report = () => {
    const [expense, setExpenses] = useState([])
    const [isLoading, setisLoading] = useState(false)
    const [data, setdata] = useState({labels:[],datasets:[]})

    const getMyExpenses = async () => {
        try {
            //const res = await axiosInstance.get("/exp/expbyuserid?sort="+sort)
            const res = await axiosInstance.get(`/exp/expbyuserid`)
            setExpenses(res.data.data)
            console.log(res.data.data)
            
            if (res.data && Array.isArray(res.data.data)) {
                var data1 = {
                    labels: res.data.data.map((exp) => exp.expCat?.catName),
                    datasets: [
                        {
                            label: "amount",
                            data: res.data.data.map((exp) => exp.amount),
                            backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)',
                        'rgba(255, 159, 64, 0.5)',
    ],
    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 1,
                        }
                    ]
                }
                setdata(data1)
            }

        } catch (err) {
            console.error("Error fetching expenses", err)
        } finally {
            setisLoading(false)
        }
    }

    useEffect(()=>{
            getMyExpenses();
    },[])
  return (
    <div style={{textAlign:"center"}}>
        <h1>EXPENSE REPORT</h1>
        <Pie data={data}></Pie>
    </div>
  )
}