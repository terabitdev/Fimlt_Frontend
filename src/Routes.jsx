import React from "react";
import { useRoutes } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import SignUpPage from "./Pages/SignUpPage";
import FimitDashboard from "./Pages/FimitDashboard";
import UsersManagement from "./Pages/UsersManagement";
import UserDetails from "./Components/UserManagement/UserDetails";
import ProjectDetails from "./Components/UserManagement/ProjectDetails";
import EditDetails from "./Components/UserManagement/EditDetails";
import FloorsPlan from "./Pages/FloorsPlan";
import ProjectDetailsFloorsPlan from "./Components/FloorsPlan/ProjectDetails";

const ProjectRoutes = () => {
    let element = useRoutes([
        { path: "/", element: <LoginPage /> },
        { path : "/signup", element: <SignUpPage /> },  
        { path : "/dashboard", element: <FimitDashboard /> },
        { path : "/users-management", element: <UsersManagement /> },
        { path : "/user-details", element: <UserDetails /> },
        { path : "/project-details", element: <ProjectDetails /> },
        { path : "/edit-details", element: <EditDetails /> },
        { path : "/floors-plan", element: <FloorsPlan /> },
        { path : "/project-details-floors-plan", element: <ProjectDetailsFloorsPlan /> },
        { path : "*", element: <LoginPage /> }, // Redirect to LoginPage for any other route
    ]);
    return element;
  };
  export default ProjectRoutes;