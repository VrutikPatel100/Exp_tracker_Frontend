import axios from "axios"

const axiosInstance = axios.create({
    baseURL: "http://localhost:3000"
})

axiosInstance.interceptors.request.use(

    (config)=>{

        const token = localStorage.getItem("token")

        console.log("FINAL TOKEN =", token)

        if(token){

            config.headers.Authorization = `Bearer ${token}`

        }

        console.log("HEADERS =", config.headers)

        return config
    },

    (error)=>{
        return Promise.reject(error)
    }

)

export default axiosInstance