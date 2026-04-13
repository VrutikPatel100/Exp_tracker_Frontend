import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Login } from "../common/Login"

const AppRoutes = ()=>{
    const router = createBrowserRouter([
        {
        path:"/login",
        element:<Login/>
        },
         // {
        //     path:"/signup",
        //     element:<Signup/>
        // }
    ])
     return <RouterProvider router={router} />
}
export default AppRoutes;