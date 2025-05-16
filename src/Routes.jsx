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
import AddCategories from "./Modal/AddCategories";

const ProjectRoutes = () => {
    let element = useRoutes([
        { path: "/", element: <LoginPage /> },
        { path: "/signup", element: <SignUpPage /> },  
        { path: "/dashboard", element: <FimitDashboard /> },
        { path: "/users-management", element: <UsersManagement /> },
        { path: "/user-details/:userId", element: <UserDetails /> }, // Added userId parameter
        { path: "/project-details/:projectId", element: <ProjectDetails /> }, // Added projectId parameter
        { path: "/edit-details/:userId", element: <EditDetails /> }, // Added userId parameter
        { path: "/floors-plan", element: <FloorsPlan /> },
        { path: "/project-details-floors-plan/:projectId", element: <ProjectDetailsFloorsPlan /> }, // Added projectId parameter
        { path: "/add-categories", element: <AddCategories /> },
    ]);
    return element;
  };
  export default ProjectRoutes;