// import { useState } from 'react';
// import SideBar from '../SideBar'
// import TopBar from '../TopBar'
// import {Plus} from 'lucide-react';
// import { Link } from 'react-router-dom';
// import React from 'react';


//  function FacilityDashboard() {
//     const [userData, setUserData] = useState({
//       name: "Alexa Jhon",
//       email: "abc@gmail.com",
//       role: "User"
//     });
  
//     const facilities = [
//       { id: 1, name: "Main Office", description: "Finance Department Layout", image: "/img2" },
//       { id: 2, name: "ICU Wing", description: "City Hospital", image: "/img1" },
//       { id: 3, name: "Ground Layout", description: "Green Mall", image: "/img2" },
//       { id: 4, name: "Basement", description: "Arena Tower", image: "/img1" },
//     ];
  
//     return (
//       <div className="min-h-screen bg-[#1E3A5F] rounded-xl">
//         {/* User Profile Section */}
//         <div className="p-4 pb-6 border-b border-white flex justify-between items-start">
//           <div>
//             <h2 className="text-white font-[600] font-ManropeSemiBold mb-1">Name: <span className='font-[400]'> {userData.name}</span></h2>
//             <p className="text-white font-[600] font-ManropeSemiBold mb-1">Email: <span className='font-[400]'> {userData.email}</span></p>
//             <p className="text-white font-[600] font-ManropeSemiBold">Role: <span className='font-[400]'> {userData.role}</span></p>
//           </div>
//           <div className="flex gap-2 font-Urbanist">
//             <button className="bg-[#1E3A5F] border border-white text-white px-3 py-1 rounded-lg text-sm">
//               Edit
//             </button>
//             <button className="bg-[#FB0000] border border-[#FB0000] text-white px-3 py-1 rounded-lg text-sm">
//               Delete
//             </button>
//           </div>
//         </div>

//         {/* Facilities Grid */}
//         <div className="p- grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-4 mt-6">
//           {facilities.map((facility) => (
//             <div
//               key={facility.id}
//               className="bg-[#202022] rounded-lg overflow-hidden shadow-lg"
//             >
//               <div className="p-4 flex gap-5">
//                 <div className=" w-[147px] h-[100px]  ">
//                     <img
//                         src={`/assets/${facility.image}.png`}
//                         alt={facility.name}
//                         className="w-full h-full object-cover rounded-xl"
//                     />
//                 </div>
//                 <div className="flex flex-col gap-2 justify-center font-SFProDisplay  ">
//                   <h3 className="text-white leading-3 font-medium  ">{facility.name}</h3>
//                   <p className="text-white text-xs">
//                     {facility.description}
//                   </p>
//                     <Link to={`/project-details`}>
//                     <button className="w-32 bg-white text-[#0D0D12] rounded-full px-2 py-2 text-xs font-medium">
//                       View
//                     </button>
//                     </Link>
         
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

// function UserDetails() {
//   return (
//     <>
//      <div className="flex min-h-screen h-full bg-black text-white">
//     <SideBar />
//      {/* Main Content */}
//      <div className="flex-1 p-6">
//         {/* Top Bar */}
//         <TopBar />
//         {/* Welcome */}
//         <div className="flex justify-between font-DMSansRegular items-center mb-6">
//           <h1 className="text-2xl md:text-3xl font-[500]">Users Details</h1>
//         </div>  
//         <FacilityDashboard />
//       </div>
   
//     </div>
//     </>
//   )
// }

// export default UserDetails




// import { useState, useEffect } from 'react';
// import SideBar from '../../Components/SideBar';
// import TopBar from '../../Components/TopBar';
// import { Edit, Trash2, ExternalLink } from 'lucide-react';
// import { Link, useParams, useNavigate } from 'react-router-dom';
// import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
// import { db } from '../../firebase'; // Adjust the path based on your file structure

// function FacilityDashboard({ userData, projects, loading }) {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen bg-[#1E3A5F] rounded-xl">
//       {/* User Profile Section */}
//       {loading ? (
//         <div className="p-8 text-center text-white">
//           <p>Loading user data...</p>
//         </div>
//       ) : (
//         <>
//           <div className="p-4 pb-6 border-b border-white flex justify-between items-start">
//             <div>
//               <h2 className="text-white font-[600] font-ManropeSemiBold mb-1">Name: <span className='font-[400]'> {userData.name || 'N/A'}</span></h2>
//               <h2 className="text-white font-[600] font-ManropeSemiBold mb-1">Email: <span className='font-[400]'> {userData.email || 'N/A'}</span></h2>
//               <h2 className="text-white font-[600] font-ManropeSemiBold mb-1">Role: <span className='font-[400]'> {userData.role || 'User'}</span></h2>
//               <h2 className="text-white font-[600] font-ManropeSemiBold">Projects: <span className='font-[400]'> {projects.length}</span></h2>
//             </div>
//             <div className="flex gap-2 font-Urbanist">
//               <button 
//                 onClick={() => navigate(`/edit-details/${userData.id}`)}
//                 className="bg-[#1E3A5F] border border-white text-white px-3 py-1 rounded-lg text-sm flex items-center"
//               >
//                 <Edit size={16} className="mr-1" /> Edit
//               </button>
//               <button className="bg-[#FB0000] border border-[#FB0000] text-white px-3 py-1 rounded-lg text-sm flex items-center">
//                 <Trash2 size={16} className="mr-1" /> Delete
//               </button>
//             </div>
//           </div>

//           {/* Facilities Grid */}
//           {projects.length > 0 ? (
//             <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto mt-6">
//               {projects.map((project) => (
//                 <div
//                   key={project.id}
//                   className="bg-[#202022] rounded-lg overflow-hidden shadow-lg"
//                 >
//                   <div className="p-4 flex gap-5">
//                     <div className="w-[147px] h-[100px] relative group">
//                       {project.usdFileUrl ? (
//                         <>
//                           <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-xl">
//                             <div className="text-center">
//                               <p className="text-white text-xs mb-1">3D Model</p>
//                               <a 
//                                 href={project.usdFileUrl} 
//                                 target="_blank" 
//                                 rel="noopener noreferrer"
//                                 className="text-blue-400 hover:text-blue-300 text-xs flex items-center justify-center"
//                               >
//                                 <ExternalLink size={14} className="mr-1" />
//                                 View
//                               </a>
//                             </div>
//                           </div>
//                         </>
//                       ) : (
//                         <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-xl">
//                           <p className="text-white text-xs">No Model</p>
//                         </div>
//                       )}
//                     </div>
//                     <div className="flex flex-col gap-2 justify-center font-SFProDisplay">
//                       <h3 className="text-white leading-3 font-medium">{project.name || 'Unnamed Project'}</h3>
//                       <p className="text-white text-xs">
//                         {project.description || 'No description'}
//                       </p>
//                       <Link to={`/project-details/${project.id}`}>
//                         <button className="w-32 bg-white text-[#0D0D12] rounded-full px-2 py-2 text-xs font-medium">
//                           View
//                         </button>
//                       </Link>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="p-8 text-center text-white">
//               <p>No projects found for this user.</p>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

// function UserDetails() {
//   const { userId } = useParams(); // Get userId from URL parameter
//   const [userData, setUserData] = useState({});
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         setLoading(true);
        
//         if (!userId) {
//           console.error("No user ID provided");
//           setLoading(false);
//           return;
//         }

//         // Fetch user data
//         const userDoc = await getDoc(doc(db, 'users', userId));
        
//         if (userDoc.exists()) {
//           const data = userDoc.data();
//           setUserData({
//             id: userId,
//             name: data.name || 'Unknown',
//             email: data.email || '',
//             role: data.type || 'User'
//           });
          
//           // Fetch user's projects
//           const projectsQuery = query(
//             collection(db, 'projects'),
//             where('creatorID', '==', userId) // Using creatorID as per your UsersManagement component
//           );
          
//           const projectsSnapshot = await getDocs(projectsQuery);
//           const projectsList = [];
          
//           projectsSnapshot.forEach((doc) => {
//             const projectData = doc.data();
//             projectsList.push({
//               id: doc.id,
//               name: projectData.name || 'Unnamed Project',
//               description: projectData.description || '',
//               usdFileUrl: projectData.usdFileUrl || null,
//               ...projectData
//             });
//           });
          
//           setProjects(projectsList);
//         } else {
//           console.error("User not found");
//         }
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, [userId]);

//   return (
//     <div className="flex min-h-screen h-full bg-black text-white">
//       <SideBar />
//       {/* Main Content */}
//       <div className="flex-1 p-6">
//         {/* Top Bar */}
//         <TopBar />
//         {/* Welcome */}
//         <div className="flex justify-between font-DMSansRegular items-center mb-6">
//           <h1 className="text-2xl md:text-3xl font-[500]">User Details</h1>
//           <button 
//             onClick={() => navigate('/users-management')} 
//             className="bg-[#1E3A5F] text-white py-2 px-4 rounded-md"
//           >
//             Back to Users
//           </button>
//         </div>  
//         <FacilityDashboard 
//           userData={userData} 
//           projects={projects} 
//           loading={loading} 
//         />
//       </div>
//     </div>
//   );
// }

// export default UserDetails;



// src/pages/UserDetails.jsx

// src/pages/UserDetails.jsx

import { useState, useEffect } from 'react';
import SideBar from '../../Components/SideBar';
import TopBar from '../../Components/TopBar';
import { Edit, Trash2, Box, ExternalLink } from 'lucide-react';  // Changed Cube to Box
import { Link, useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { db } from '../../firebase'; // adjust if needed
import '@google/model-viewer';      // register the <model-viewer> web component

function ProjectCard({ project }) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Debug info
  useEffect(() => {
    console.log("Project data:", project);
    console.log("iOS device:", isIOS);
    console.log("Model URL:", project.usdFileUrl);
  }, [project, isIOS]);

  return (
    <div className="bg-[#202022] rounded-lg overflow-hidden shadow-lg">
      <div className="p-4 flex gap-5">
        <div className="w-[147px] h-[100px] relative group">
          {project.usdFileUrl ? (
            <>
              {/* Visual indicator for 3D model - works on all platforms */}
              <div className="w-full h-full relative flex items-center justify-center">
                <div className="absolute inset-0 bg-[#303035] rounded-xl flex flex-col items-center justify-center">
                  <Box size={32} className="text-white mb-2" />  {/* Changed from Cube to Box */}
                  <p className="text-white text-xs font-medium">3D Model</p>
                </div>
                
                {/* Overlay action buttons */}
                {isIOS ? (
                  <a
                    href={project.usdFileUrl}
                    rel="ar"
                    className="absolute bottom-2 bg-blue-500 text-white text-xs px-3 py-1 rounded-lg z-10"
                  >
                    View AR
                  </a>
                ) : (
                  <Link 
                    to={`/project-details/${project.id}`} 
                    className="absolute bottom-2 bg-blue-500 text-white text-xs px-3 py-1 rounded-lg z-10"
                  >
                    View Details
                  </Link>
                )}
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-xl">
              <p className="text-white text-xs">No Model</p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 justify-center font-SFProDisplay">
          <h3 className="text-white leading-3 font-medium">
            {project.name || "Unnamed Project"}
          </h3>
          <p className="text-white text-xs">
            {project.description || "No description"}
          </p>
          <Link to={`/project-details/${project.id}`}>
            <button className="w-32 bg-white text-[#0D0D12] rounded-full px-2 py-2 text-xs font-medium">
              View
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Rest of the components remain the same...

export default function UserDetails() {
  const { userId } = useParams();
  const [userData, setUserData] = useState({});
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        if (!userId) return;

        // 1. Fetch user document
        const userSnap = await getDoc(doc(db, 'users', userId));
        if (!userSnap.exists()) {
          console.error('User not found');
          return;
        }
        const u = userSnap.data();
        setUserData({
          id: userId,
          name: u.name || 'Unknown',
          email: u.email || '',
          role: u.type || 'User',
        });

        // 2. Fetch projects and convert storage paths to public URLs
        const q = query(
          collection(db, 'projects'),
          where('creatorID', '==', userId)
        );
        const snap = await getDocs(q);
        const storage = getStorage();

        const projList = await Promise.all(
          snap.docs.map(async (docSnap) => {
            const data = docSnap.data();
            let publicUrl = null;

            if (data.usdFileUrl) {
              try {
                // IMPORTANT: Log the original path for debugging
                console.log("Original storage path:", data.usdFileUrl);
                
                // Get a proper download URL from Firebase Storage
                publicUrl = await getDownloadURL(
                  storageRef(storage, data.usdFileUrl)
                );
                console.log("Generated model URL:", publicUrl);
              } catch (e) {
                console.error('Could not load model URL:', e);
                console.error('Error details:', e.message);
              }
            }

            return {
              id: docSnap.id,
              name: data.name || 'Unnamed Project',
              description: data.description || '',
              usdFileUrl: publicUrl,
              originalPath: data.usdFileUrl // Keep the original path for reference
            };
          })
        );

        setProjects(projList);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Component rendering remains the same
  return (
    <div className="flex min-h-screen h-full bg-black text-white">
      <SideBar />
      <div className="flex-1 p-6">
        <TopBar />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-[500]">User Details</h1>
          <button
            onClick={() => navigate('/users-management')}
            className="bg-[#1E3A5F] text-white py-2 px-4 rounded-md"
          >
            Back to Users
          </button>
        </div>
        <FacilityDashboard
          userData={userData}
          projects={projects}
          loading={loading}
        />
      </div>
    </div>
  );
}

// ProjectDetailPage component with enhanced visualization
export function ProjectDetailPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        if (!projectDoc.exists()) {
          console.error('Project not found');
          return;
        }
        
        const data = projectDoc.data();
        let modelUrl = null;
        
        if (data.usdFileUrl) {
          try {
            const storage = getStorage();
            console.log("Detail page original path:", data.usdFileUrl);
            modelUrl = await getDownloadURL(storageRef(storage, data.usdFileUrl));
            console.log("Detail page model URL:", modelUrl);
          } catch (e) {
            console.error('Could not load model URL:', e);
          }
        }
        
        setProject({
          ...data,
          id: projectId,
          usdFileUrl: modelUrl
        });
      } catch (err) {
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [projectId]);

  if (loading) return (
    <div className="flex min-h-screen h-full bg-black text-white">
      <SideBar />
      <div className="flex-1 p-6">
        <TopBar />
        <div className="text-center p-10">Loading project details...</div>
      </div>
    </div>
  );
  
  if (!project) return (
    <div className="flex min-h-screen h-full bg-black text-white">
      <SideBar />
      <div className="flex-1 p-6">
        <TopBar />
        <div className="text-center p-10">Project not found</div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen h-full bg-black text-white">
      <SideBar />
      <div className="flex-1 p-6">
        <TopBar />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-[500]">Project Details</h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#1E3A5F] text-white py-2 px-4 rounded-md"
          >
            Back
          </button>
        </div>
        
        <div className="bg-[#1E3A5F] p-6 rounded-xl">
          <div className="mb-6">
            <h2 className="text-xl font-[500] mb-2">{project.name || "Unnamed Project"}</h2>
            <p className="text-white mb-4">{project.description || "No description available"}</p>
          </div>
          
          {project.usdFileUrl && (
            <div className="mb-6">
              <h2 className="text-xl font-[500] mb-4">3D Model Viewer</h2>
              
              <div className="bg-[#202022] p-8 rounded-lg">
                {/* 3D Model visual indicator */}
                <div className="flex flex-col items-center justify-center mb-6">
                  <Box size={64} className="text-white mb-3" />  {/* Changed from Cube to Box */}
                  <h3 className="text-xl text-white mb-2">3D Model Available</h3>
                  <p className="text-gray-400 text-center max-w-md">
                    This project includes a 3D model created with ARKit
                  </p>
                </div>
                
                <div className="flex justify-center mt-6">
                  {isIOS ? (
                    // iOS AR Quick Look button
                    <a
                      href={project.usdFileUrl}
                      rel="ar"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg inline-flex items-center font-medium"
                    >
                      <ExternalLink size={18} className="mr-2" />
                      View in AR
                    </a>
                  ) : (
                    // Non-iOS download button
                    <a
                      href={project.usdFileUrl}
                      download
                      className="bg-white text-[#0D0D12] px-6 py-3 rounded-lg inline-flex items-center font-medium"
                    >
                      <ExternalLink size={18} className="mr-2" />
                      Download 3D Model
                    </a>
                  )}
                </div>
                
                {!isIOS && (
                  <p className="text-gray-400 text-center text-sm mt-4">
                    This 3D model is in USDZ format, optimized for iOS devices.
                    For the best AR experience, view on an iPhone or iPad.
                  </p>
                )}
                
                {/* Add direct model URL for troubleshooting - remove in production */}
                <div className="mt-8 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500 break-all">
                    Model URL: {project.usdFileUrl}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Don't forget to add ProjectDetailPage to your routes
/* 
In your routing configuration:
import { ProjectDetailPage } from './path/to/UserDetails';
<Route path="/project-details/:projectId" element={<ProjectDetailPage />} />
*/

function FacilityDashboard({ userData, projects, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="p-8 text-center text-white">
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E3A5F] rounded-xl">
      {/* User Profile Section */}
      <div className="p-4 pb-6 border-b border-white flex justify-between items-start">
        <div>
          <h2 className="text-white font-[600] mb-1">
            Name: <span className="font-[400]">{userData.name}</span>
          </h2>
          <h2 className="text-white font-[600] mb-1">
            Email: <span className="font-[400]">{userData.email}</span>
          </h2>
          <h2 className="text-white font-[600] mb-1">
            Role: <span className="font-[400]">{userData.role}</span>
          </h2>
          <h2 className="text-white font-[600]">
            Projects: <span className="font-[400]">{projects.length}</span>
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/edit-details/${userData.id}`)}
            className="bg-[#1E3A5F] border border-white text-white px-3 py-1 rounded-lg text-sm flex items-center"
          >
            <Edit size={16} className="mr-1" /> Edit
          </button>
          <button className="bg-[#FB0000] border border-[#FB0000] text-white px-3 py-1 rounded-lg text-sm flex items-center">
            <Trash2 size={16} className="mr-1" /> Delete
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto mt-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-white">
          <p>No projects found for this user.</p>
        </div>
      )}
    </div>
  );
}