import React from "react";
import { useRoutes } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import SignUpPage from "./Pages/SignUpPage";
import FimitDashboard from "./Pages/FimitDashboard";

const ProjectRoutes = () => {
    let element = useRoutes([
        { path: "/", element: <LoginPage /> },
        { path : "/signup", element: <SignUpPage /> },  
        { path : "/dashboard", element: <FimitDashboard /> },
    ]);
    return element;
  };
  export default ProjectRoutes;