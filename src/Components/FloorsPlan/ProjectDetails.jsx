import { useState, useEffect } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { db } from "../../firebase";
import SideBar from "../SideBar";
import TopBar from "../TopBar";
import { Link, useParams } from "react-router-dom";
import React from "react";
import FilterByCategories from "./FilterByCategories";
import ModelViewer from "../UserManagement/ModelViewer"; // Import your ModelViewer component

function RoomMeasurementInterface() {
  const { projectId } = useParams();
  
  const [userData, setUserData] = useState({
    projectname: "",
    scannedby: "",
    date: "",
  });
  
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format date helper function
  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = (hours % 12 || 12).toString();
    
    return `${day} ${month}, ${formattedHours}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        if (!projectId) {
          setError("No project ID provided");
          setLoading(false);
          return;
        }
        
        // Fetch project details
        const projectRef = doc(db, "projects", projectId);
        const projectSnap = await getDoc(projectRef);
        
        if (projectSnap.exists()) {
          const projectData = projectSnap.data();
          
          // Get users to match with project creator
          const usersRef = collection(db, "users");
          const usersSnapshot = await getDocs(usersRef);
          
          const userMap = {};
          usersSnapshot.forEach((userDoc) => {
            const userData = userDoc.data();
            if (userData.uid) {
              userMap[userData.uid] = userData.name || "Unknown User";
            }
          });
          
          const date = projectData.creationDate ? 
            new Date(projectData.creationDate.toDate ? projectData.creationDate.toDate() : projectData.creationDate) : 
            new Date();
          
          const formattedDate = formatDate(date);
          
          const creatorID = projectData.creatorID;
          let scannedBy = "Unknown User";
          
          if (creatorID && userMap[creatorID]) {
            scannedBy = userMap[creatorID];
          }
          
          setUserData({
            projectname: projectData.name || "Unnamed Project",
            scannedby: scannedBy,
            date: formattedDate,
          });
          
          // Get 3D model URL if available
          let modelUrl = null;
          if (projectData.usdFileUrl) {
            try {
              const storage = getStorage();
              const fileRef = storageRef(storage, projectData.usdFileUrl);
              modelUrl = await getDownloadURL(fileRef);
              console.log('Retrieved model URL for floors plan:', modelUrl);
            } catch (e) {
              console.error('Could not load model URL:', e);
            }
          }
          
          // Count rooms from roomData array if available
          const roomCount = Array.isArray(projectData.roomData) ? projectData.roomData.length : 0;
          
          // Create facility item with 3D model data
          const facilitiesData = [{
            id: projectId,
            name: projectData.name || "Unnamed Project",
            description: `${roomCount} Rooms`,
            imageUrl: projectData.imageUrl || null,
            category: projectData.category || "Unknown",
            modelUrl: modelUrl,
            modelFormat: projectData.modelFormat || null,
            hasModel: !!modelUrl
          }];
          
          setFacilities(facilitiesData);
        } else {
          setError("Project not found");
        }
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError("Failed to load project data");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E3A5F] rounded-xl flex justify-center items-center">
        <div className="text-white text-xl">Loading project data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1E3A5F] rounded-xl flex justify-center items-center">
        <div className="text-white text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E3A5F] rounded-xl">
      {/* User Profile Section */}
      <div className="p-4 pb-6 border-b border-white flex justify-between items-start">
        <div>
          <h2 className="text-white font-[600] font-ManropeSemiBold mb-1">
            Project Name: <span className="font-[400]"> {userData.projectname}</span>
          </h2>
          <p className="text-white font-[600] font-ManropeSemiBold mb-1">
            Scanned By: <span className="font-[400]"> {userData.scannedby}</span>
          </p>
          <p className="text-white font-[600] font-ManropeSemiBold">
            Date: <span className="font-[400]"> {userData.date}</span>
          </p>
        </div>
        {/* <div className="flex flex-col md:flex-row gap-2 font-Urbanist">
          <FilterByCategories />
        </div> */}
      </div>

      {/* Facility Card - Keep Original Size */}
      <div className="p- grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-4 mt-6">
        {facilities.length > 0 ? (
          facilities.map((facility) => (
            <div
              key={facility.id}
              className="bg-[#202022] rounded-lg overflow-hidden shadow-lg"
            >
              <div className="p-4 flex flex-row gap-4">
                {/* 3D Model or Image - Keep Original 150x150 Size */}
                <div className="w-full md:w-[150px] h-[150px] mb-4 md:mb-0">
                  {facility.hasModel ? (
                    <div 
                      className="w-full h-full bg-black rounded-xl overflow-hidden flex items-center justify-center model-viewer-container"
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div 
                        className="w-full h-full relative"
                        style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <ModelViewer 
                          modelUrl={facility.modelUrl}
                          projectData={{
                            modelFormat: facility.modelFormat,
                            name: facility.name
                          }}
                          onUpdatePreview={() => {}} // No preview update needed for this view
                        />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={facility.imageUrl || `/assets/img1.png`}
                      alt={facility.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  )}
                </div>
                
                {/* Project Info - Keep Original Layout */}
                <div className="flex flex-col gap-2 justify-center font-SFProDisplay">
                  <h3 className="text-white text-xl font-medium">
                    {facility.name}
                  </h3>
                  <p className="text-white">{facility.category}</p>
                  {facility.hasModel && (
                    <p className="text-green-400 text-sm">3D Model Available</p>
                  )}
                  
                  <div className="flex gap-3">
                    <Link to={`/project-details/${facility.id}`}>
                      <button className="bg-white text-[#0D0D12] rounded-lg px-4 py-2 text-sm font-medium">
                        View 
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-white py-10">
            Project details not available.
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectDetails() {
  return (
    <>
      <div className="flex min-h-screen h-full bg-black text-white">
        <SideBar />
        <div className="flex-1 p-6">
          <TopBar />
          <div className="flex justify-between font-DMSansRegular items-center mb-6">
            <h1 className="text-3xl font-[500]">Floors Plan</h1>
          </div>
          <RoomMeasurementInterface />
        </div>
      </div>
    </>
  );
}

export default ProjectDetails;