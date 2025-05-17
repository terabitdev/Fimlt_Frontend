
// import { useState, useEffect } from 'react';
// import SideBar from '../../Components/SideBar';
// import TopBar from '../../Components/TopBar';
// import { Edit, Trash2, ExternalLink } from 'lucide-react';
// import { Link, useParams, useNavigate } from 'react-router-dom';
// import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
// import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
// import { db } from '../../firebase'; // adjust if needed

// // This component shows a direct USDZ viewer in the card
// function ProjectCard({ project }) {
//   const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
//   const [loading, setLoading] = useState(true);
//   const [viewerUrl, setViewerUrl] = useState('');
  
//   useEffect(() => {
//     if (project.usdFileUrl) {
//       // Create a viewer URL using the USDZ file
//       createViewerUrl(project.usdFileUrl);
//     }
//   }, [project.usdFileUrl]);
  
//   const createViewerUrl = (usdzUrl) => {
//     // Using the modelviewer.dev service which can show various 3D formats including USDZ
//     // This is a CORS-friendly approach that embeds a viewer directly
//     // Note: This is a public service for testing - for production, consider a paid service
    
//     // URL-encode the model URL for use as a parameter
//     const encodedUrl = encodeURIComponent(usdzUrl);
    
//     // Create a viewer URL with the USDZ file as a parameter
//     const viewer = `https://modelviewer.dev/shared-assets/viewer.html?src=${encodedUrl}&alt=A%203D%20model%20viewer&ar=true`;
    
//     setViewerUrl(viewer);
//     setLoading(false);
//   };

//   return (
//     <div className="bg-[#202022] rounded-lg overflow-hidden shadow-lg">
//       <div className="p-4 flex gap-5">
//         <div className="w-[147px] h-[100px] relative group">
//           {project.usdFileUrl ? (
//             <>
//               {/* Use an iframe to embed the 3D viewer */}
//               <div className="w-full h-full rounded-xl overflow-hidden">
//                 {loading ? (
//                   <div className="absolute inset-0 flex items-center justify-center bg-[#303035]">
//                     <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
//                   </div>
//                 ) : (
//                   <iframe
//                     src={viewerUrl}
//                     title={`3D Model: ${project.name}`}
//                     frameBorder="0"
//                     allowFullScreen
//                     style={{
//                       width: '147px',
//                       height: '100px',
//                       backgroundColor: '#202022'
//                     }}
//                     loading="lazy"
//                   ></iframe>
//                 )}
//               </div>
              
//               {/* Overlay buttons */}
//               <div className="absolute bottom-1 left-0 right-0 flex justify-center">
//                 <Link 
//                   to={`/project-details/${project.id}`} 
//                   className="bg-blue-500 text-white text-xs px-3 py-1 rounded-lg z-10"
//                 >
//                   View
//                 </Link>
//               </div>
              
//               {/* iOS AR Quick Look button */}
//               {isIOS && (
//                 <a
//                   href={project.usdFileUrl}
//                   rel="ar"
//                   className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded z-10"
//                 >
//                   AR
//                 </a>
//               )}
//             </>
//           ) : (
//             <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-xl">
//               <p className="text-white text-xs">No Model</p>
//             </div>
//           )}
//         </div>
//         <div className="flex flex-col gap-2 justify-center font-SFProDisplay">
//           <h3 className="text-white leading-3 font-medium">
//             {project.name || "Unnamed Project"}
//           </h3>
//           <p className="text-white text-xs">
//             {project.description || "No description"}
//           </p>
//           <Link to={`/project-details/${project.id}`}>
//             <button className="w-32 bg-white text-[#0D0D12] rounded-full px-2 py-2 text-xs font-medium">
//               View
//             </button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

// function FacilityDashboard({ userData, projects, loading }) {
//   const navigate = useNavigate();

//   if (loading) {
//     return (
//       <div className="p-8 text-center text-white">
//         <p>Loading user data...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#1E3A5F] rounded-xl">
//       {/* User Profile Section */}
//       <div className="p-4 pb-6 border-b border-white flex justify-between items-start">
//         <div>
//           <h2 className="text-white font-[600] mb-1">
//             Name: <span className="font-[400]">{userData.name}</span>
//           </h2>
//           <h2 className="text-white font-[600] mb-1">
//             Email: <span className="font-[400]">{userData.email}</span>
//           </h2>
//           <h2 className="text-white font-[600] mb-1">
//             Role: <span className="font-[400]">{userData.role}</span>
//           </h2>
//           <h2 className="text-white font-[600]">
//             Projects: <span className="font-[400]">{projects.length}</span>
//           </h2>
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={() => navigate(`/edit-details/${userData.id}`)}
//             className="bg-[#1E3A5F] border border-white text-white px-3 py-1 rounded-lg text-sm flex items-center"
//           >
//             <Edit size={16} className="mr-1" /> Edit
//           </button>
//           <button className="bg-[#FB0000] border border-[#FB0000] text-white px-3 py-1 rounded-lg text-sm flex items-center">
//             <Trash2 size={16} className="mr-1" /> Delete
//           </button>
//         </div>
//       </div>

//       {/* Projects Grid */}
//       {projects.length > 0 ? (
//         <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto mt-6">
//           {projects.map((project) => (
//             <ProjectCard key={project.id} project={project} />
//           ))}
//         </div>
//       ) : (
//         <div className="p-8 text-center text-white">
//           <p>No projects found for this user.</p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default function UserDetails() {
//   const { userId } = useParams();
//   const [userData, setUserData] = useState({});
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUserData = async () => {
//       setLoading(true);
//       try {
//         if (!userId) return;

//         // 1. Fetch user document
//         const userSnap = await getDoc(doc(db, 'users', userId));
//         if (!userSnap.exists()) {
//           console.error('User not found');
//           return;
//         }
//         const u = userSnap.data();
//         setUserData({
//           id: userId,
//           name: u.name || 'Unknown',
//           email: u.email || '',
//           role: u.type || 'User',
//         });

//         // 2. Fetch projects and convert storage paths to public URLs
//         const q = query(
//           collection(db, 'projects'),
//           where('creatorID', '==', userId)
//         );
//         const snap = await getDocs(q);
//         const storage = getStorage();

//         const projList = await Promise.all(
//           snap.docs.map(async (docSnap) => {
//             const data = docSnap.data();
//             let publicUrl = null;

//             if (data.usdFileUrl) {
//               try {
//                 publicUrl = await getDownloadURL(
//                   storageRef(storage, data.usdFileUrl)
//                 );
//                 console.log("Generated model URL:", publicUrl);
//               } catch (e) {
//                 console.error('Could not load model URL:', e);
//               }
//             }

//             return {
//               id: docSnap.id,
//               name: data.name || 'Unnamed Project',
//               description: data.description || '',
//               usdFileUrl: publicUrl,
//             };
//           })
//         );

//         setProjects(projList);
//       } catch (err) {
//         console.error('Error fetching data:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, [userId]);

//   return (
//     <div className="flex min-h-screen h-full bg-black text-white">
//       <SideBar />
//       <div className="flex-1 p-6">
//         <TopBar />
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-[500]">User Details</h1>
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

// // ProjectDetailPage with enhanced viewing capabilities
// export function ProjectDetailPage() {
//   const { projectId } = useParams();
//   const [project, setProject] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
//   const navigate = useNavigate();
//   const [viewerUrl, setViewerUrl] = useState('');

//   useEffect(() => {
//     const fetchProjectData = async () => {
//       try {
//         const projectDoc = await getDoc(doc(db, 'projects', projectId));
//         if (!projectDoc.exists()) {
//           console.error('Project not found');
//           return;
//         }
        
//         const data = projectDoc.data();
//         let modelUrl = null;
        
//         if (data.usdFileUrl) {
//           try {
//             const storage = getStorage();
//             modelUrl = await getDownloadURL(storageRef(storage, data.usdFileUrl));
//             console.log("Detail page model URL:", modelUrl);
            
//             // Create viewer URL
//             const encodedUrl = encodeURIComponent(modelUrl);
//             const viewer = `https://modelviewer.dev/shared-assets/viewer.html?src=${encodedUrl}&alt=${encodeURIComponent(data.name || 'A 3D model')}&ar=true&camera-controls=true&auto-rotate=true`;
//             setViewerUrl(viewer);
//           } catch (e) {
//             console.error('Could not load model URL:', e);
//           }
//         }
        
//         setProject({
//           ...data,
//           id: projectId,
//           usdFileUrl: modelUrl
//         });
//       } catch (err) {
//         console.error('Error fetching project:', err);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchProjectData();
//   }, [projectId]);

//   if (loading) return (
//     <div className="flex min-h-screen h-full bg-black text-white">
//       <SideBar />
//       <div className="flex-1 p-6">
//         <TopBar />
//         <div className="text-center p-10">Loading project details...</div>
//       </div>
//     </div>
//   );
  
//   if (!project) return (
//     <div className="flex min-h-screen h-full bg-black text-white">
//       <SideBar />
//       <div className="flex-1 p-6">
//         <TopBar />
//         <div className="text-center p-10">Project not found</div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="flex min-h-screen h-full bg-black text-white">
//       <SideBar />
//       <div className="flex-1 p-6">
//         <TopBar />
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-[500]">Project Details</h1>
//           <button
//             onClick={() => navigate(-1)}
//             className="bg-[#1E3A5F] text-white py-2 px-4 rounded-md"
//           >
//             Back
//           </button>
//         </div>
        
//         <div className="bg-[#1E3A5F] p-6 rounded-xl">
//           <div className="mb-6">
//             <h2 className="text-xl font-[500] mb-2">{project.name || "Unnamed Project"}</h2>
//             <p className="text-white mb-4">{project.description || "No description available"}</p>
//           </div>
          
//           {project.usdFileUrl && (
//             <div className="mb-6">
//               <h2 className="text-xl font-[500] mb-4">3D Model Viewer</h2>
              
//               <div className="bg-[#202022] p-4 rounded-lg">
//                 {/* Large embedded viewer iframe */}
//                 <div className="w-full h-96 mb-6 rounded-lg overflow-hidden">
//                   <iframe
//                     src={viewerUrl}
//                     title={`3D Model: ${project.name}`}
//                     frameBorder="0"
//                     allowFullScreen
//                     style={{
//                       width: '100%',
//                       height: '100%',
//                       backgroundColor: '#303035'
//                     }}
//                   ></iframe>
//                 </div>
                
//                 <div className="flex flex-wrap justify-center gap-4 mt-6">
//                   {isIOS && (
//                     <a
//                       href={project.usdFileUrl}
//                       rel="ar"
//                       className="bg-blue-600 text-white px-6 py-3 rounded-lg inline-flex items-center font-medium"
//                     >
//                       <ExternalLink size={18} className="mr-2" />
//                       View in AR
//                     </a>
//                   )}
                  
//                   <a
//                     href={project.usdFileUrl}
//                     download
//                     className="bg-white text-[#0D0D12] px-6 py-3 rounded-lg inline-flex items-center font-medium"
//                   >
//                     <ExternalLink size={18} className="mr-2" />
//                     Download USDZ
//                   </a>
                  
//                   <a
//                     href={viewerUrl}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="bg-gray-700 text-white px-6 py-3 rounded-lg inline-flex items-center font-medium"
//                   >
//                     <ExternalLink size={18} className="mr-2" />
//                     Open in Full Screen
//                   </a>
//                 </div>
                
//                 {/* Instructions for best experience */}
//                 <div className="mt-6 p-4 border border-gray-700 rounded-lg">
//                   <h3 className="text-white text-lg mb-2">Viewing Instructions</h3>
//                   <ul className="text-gray-300 space-y-2 list-disc pl-5">
//                     <li>Use mouse to rotate the model (click and drag)</li>
//                     <li>Scroll to zoom in and out</li>
//                     <li>Right-click and drag to pan the view</li>
//                     {isIOS && <li>Tap "View in AR" to see the model in your real environment</li>}
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }




// src/pages/UserDetails.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { db } from '../../firebase'; // adjust if needed
import SideBar from '../../Components/SideBar';
import TopBar from '../../Components/TopBar';
import ProjectCard from '../UserManagement/ProjectCard';
import { Edit, Trash2 } from 'lucide-react';

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

        // 2. Fetch projects and get download URLs
        const q = query(
          collection(db, 'projects'),
          where('creatorID', '==', userId)
        );
        const snap = await getDocs(q);
        const storage = getStorage();

        const projList = await Promise.all(
          snap.docs.map(async (docSnap) => {
            const data = docSnap.data();
            let downloadUrl = null;

            if (data.usdFileUrl) {
              try {
                // Get the download URL without modifying the content type
                downloadUrl = await getDownloadURL(
                  storageRef(storage, data.usdFileUrl)
                );
              } catch (e) {
                console.warn('Could not load model URL:', e);
              }
            }

            return {
              id: docSnap.id,
              name: data.name || 'Unnamed Project',
              description: data.description || '',
              usdFileUrl: downloadUrl, // Pass the download URL directly
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