import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { Login } from "../common/Login"
import { UserNavbar } from "../user/UserNavbar"
import { ExpenseDashboard } from "../user/ExpenseDashboard"
import { AddCategory } from "../user/AddCategory"
import { GetMyCategories } from "../user/GetMyCategories"

const AppRoutes = ()=>{


    const router = createBrowserRouter([
        {
            path:"/login",
            element:<Login/>
        },
        {
            path:"",
            element:<UserNavbar/>,
            children:[
                {
                    path:"",
                    element:<ExpenseDashboard/>
                },
                {
                    path:"add-category",
                    element:<AddCategory/>
                },{
                    path:"my-categories",
                    element:<GetMyCategories/>
                }
            ]
        }
        // {
        //     path:"/signup",
        //     element:<Signup/>
        // }
    ])

    return <RouterProvider router={router} />

}
export default AppRoutes;