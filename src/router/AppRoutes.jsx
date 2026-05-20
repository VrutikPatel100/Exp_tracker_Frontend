import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { Login } from "../common/Login"
import { UserNavbar } from "../user/UserNavbar"
import { ExpenseDashboard } from "../user/ExpenseDashboard"
import { AddCategory } from "../user/AddCategory"
import { GetMyCategories } from "../user/GetMyCategories"
import { AddExpense } from "../user/AddExpence"
import { MyExpenses } from "../user/MyExpenses"
import { Report } from "../user/Report"
import { UserProfile } from "../user/UserProfile"

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
                },{
                    path:"add-expense",
                    element:<AddExpense/>
                },{
                    path:"my-expenses",
                    element:<MyExpenses/>
                },
                {
                    path:"reports",
                    element:<Report/>
                },
                {
                    path:"User-profile",
                    element:<UserProfile/>
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