// import { useState } from 'react';
// import SideBar from '../SideBar'
// import TopBar from '../TopBar'
// import {Plus} from 'lucide-react';
// import { Link } from 'react-router-dom';

// function RoomMeasurementInterface() {
//     const roomDetails = [
//       { category: "Certainty", value: "High" },
//       { category: "Left Wall Width", value: "5.37 meters" },
//       { category: "Right Wall Width", value: "6.47 meters" },
//       { category: "Wall Height", value: "6.13 meters" },
//       { category: "Surface Area", value: "32.94 m²" },
//       { category: "Window", value: "5 ft × 4 ft" },
//     ];
 
  
//     return (
//       <div className="min-h-screen max-w-[22rem] md:max-w-5xl xl:max-w-7xl   bg-[#1E3A5F] rounded-xl">

//          {/* User Profile Section */}
//          <div className="p-4  border-b border-white flex items-center justify-between ">

//             <div className='flex flex-col gap-5 font-monrope' >
//                 <h1 className='font-[700] text-2xl md:text-[31px]'>Main Office</h1>
//                 <h3 className='font-[500] text-sm md:text-[20px]'>Finance Department Layout</h3>
//             </div>
        
//           <div className="flex items-center justify-center gap-3 font-Urbanist h-12 ">
//             <Link to="/edit-details">
//             <button className="bg-[#1E3A5F] border border-white text-white px-3 py-1 rounded-lg text-sm">
//               Edit
//             </button>
//             </Link>
//             <button className="bg-[#FB0000] border border-[#FB0000] text-white px-3 py-1 rounded-lg text-sm">
//               Delete
//             </button>
//           </div>
//         </div>

//         <div className='flex flex-col md:flex-row justify-between gap-5 max-w-[61rem] mt-10 md:mt-20 mx-auto'>

        
//           {/* Room Preview Image */}
//           <div className="md:w-[405px] md:h-[270px] max-w-sm ">
//             <img
//               src="/assets/img2.png"
//               alt="Room Preview"
//               className="w-full h-full  "
//             />
//           </div>
  
//           {/* Room Details Table */}
//           <div className="p-4 md:w-[583px] md:h-[370px] max-w-sm rounded-3xl bg-white">
//             <table className=" w-full h-full font-SFProDisplay">
//               <thead>
//                 <tr>
//                   <th className="text-left py-1 px-2 font-[400] text-[#090D00]">Category</th>
//                   <th className="text-right py-1 px-2 font-medium text-[#090D00]">Room</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {roomDetails.map((detail, index) => (
//                   <tr key={index} className="">
//                     <td className="text-left py-1 px-2 font-[400] text-[#090D00]">{detail.category}</td>
//                     <td className="text-right py-1 px-2 font-medium text-[#090D00]">{detail.value}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           </div>
//         </div>
    
//     );
//   }

// function ProjectDetails() {
//   return (
//     <>
//     <div className="flex min-h-screen h-full bg-black text-white">
//    <SideBar />
//     {/* Main Content */}
//     <div className="flex-1 p-6">
//        {/* Top Bar */}
//        <TopBar />
//        {/* Welcome */}
//        <div className="flex justify-between font-DMSansRegular items-center mb-6">
//          <h1 className="text-2xl md:text-3xl font-[500]">Project Details</h1>
//        </div>  
           
//         {/* Project Details */}
//         <RoomMeasurementInterface />
//      </div>
  
//    </div>
//    </>
//   )
// }

// export default ProjectDetails




import { useState, useEffect } from 'react';
import SideBar from '../../Components/SideBar';
import TopBar from '../../Components/TopBar';
import { Edit, Trash2 } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase'; // Assuming you have firebase config in this file
import { doc, getDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
import '@google/model-viewer'; // register the <model-viewer> web component



function RoomMeasurementInterface({ projectData }) {
  const navigate = useNavigate();
  
  const roomDetails = [
    { category: "Category", value: projectData?.category || "N/A" },
    { category: "Certainty", value: projectData?.certainty || "N/A" },
    { category: "Left Wall Width", value: projectData?.leftWallWidth || "N/A" },
    { category: "Right Wall Width", value: projectData?.rightWallWidth || "N/A" },
    { category: "Wall Height", value: projectData?.wallHeight || "N/A" },
    { category: "Surface Area", value: projectData?.surfaceArea || "N/A" },
    { category: "Window", value: projectData?.windows || "N/A" },
  ];
  
  return (
    <div className="min-h-screen max-w-[22rem] md:max-w-5xl xl:max-w-7xl bg-[#1E3A5F] rounded-xl">
      {/* Project Name and Description Section */}
      <div className="p-4 border-b border-white flex items-center justify-between">
        <div className='flex flex-col gap-5 font-monrope'>
          <h1 className='font-[700] text-2xl md:text-[31px]'>{projectData?.name || 'Unnamed Project'}</h1>
          <h3 className='font-[500] text-sm md:text-[20px]'>{projectData?.description || 'No description available'}</h3>
        </div>
      
        <div className="flex items-center justify-center gap-3 font-Urbanist h-12">
          <button 
            onClick={() => navigate(`/edit-project/${projectData?.id}`)}
            className="bg-[#1E3A5F] border border-white text-white px-3 py-1 rounded-lg text-sm flex items-center"
          >
            <Edit size={16} className="mr-1" /> Edit
          </button>
          <button className="bg-[#FB0000] border border-[#FB0000] text-white px-3 py-1 rounded-lg text-sm flex items-center">
            <Trash2 size={16} className="mr-1" /> Delete
          </button>
        </div>
      </div>

      <div className='flex flex-col md:flex-row justify-between gap-5 max-w-[61rem] mt-10 md:mt-20 mx-auto'>
        {/* 3D Model Viewer */}
        <div className="md:w-[405px] md:h-[270px] max-w-sm bg-[#202022] rounded-xl overflow-hidden">
          {projectData?.usdFileUrl ? (
            <model-viewer
              src={projectData.usdFileUrl}
              alt={projectData.name || "3D Model"}
              camera-controls
              auto-rotate
              ar
              style={{
                width: '100%',
                height: '270px',
                backgroundColor: '#202022'
              }}
            ></model-viewer>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-white text-sm">No 3D model available</p>
            </div>
          )}
        </div>
  
        {/* Room Details Table */}
        <div className="p-4 md:w-[583px] md:h-[370px] max-w-sm rounded-3xl bg-white">
          <table className="w-full h-full font-SFProDisplay">
            {/* <thead>
              <tr>
                <th className="text-left py-1 px-2 font-[400] text-[#090D00]">Category</th>
                <th className="text-right py-1 px-2 font-medium text-[#090D00]">Room</th>
              </tr>
            </thead> */}
            <tbody>
              {roomDetails.map((detail, index) => (
                <tr key={index} className="">
                  <td className="text-left py-1 px-2 font-[400] text-[#090D00]">{detail.category}</td>
                  <td className="text-right py-1 px-2 font-medium text-[#090D00]">{detail.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProjectDetails() {
  const { projectId } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        // 1. Fetch project document
        const projectRef = doc(db, "projects", projectId);
        const projectSnap = await getDoc(projectRef);
        
        if (!projectSnap.exists()) {
          setError("Project not found");
          return;
        }
        
        const projectData = projectSnap.data();
        
        // 2. If there's a 3D model URL, get the download URL
        let modelUrl = null;
        if (projectData.usdFileUrl) {
          try {
            const storage = getStorage();
            modelUrl = await getDownloadURL(
              storageRef(storage, projectData.usdFileUrl)
            );
          } catch (e) {
            console.warn('Could not load model URL:', e);
            console.error("Error fetching model URL:", e);
          }
        }
        
        // Set project data with all required fields
        setProjectData({
          id: projectId,
          name: projectData.name || 'Unnamed Project',
          description: projectData.description || '',
          category: projectData.category || '',
          certainty: projectData.certainty || '',
          leftWallWidth: projectData.leftWallWidth || '',
          rightWallWidth: projectData.rightWallWidth || '',
          wallHeight: projectData.wallHeight || '',
          surfaceArea: projectData.surfaceArea || '',
          windows: projectData.windows || '',
          usdFileUrl: modelUrl
        });
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError("Failed to load project data");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  return (
    <div className="flex min-h-screen h-full bg-black text-white">
      <SideBar />
      <div className="flex-1 p-6">
        <TopBar />
        <div className="flex justify-between font-DMSansRegular items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-[500]">Project Details</h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#1E3A5F] text-white py-2 px-4 rounded-md"
          >
            Back
          </button>
        </div>  
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-white">Loading project data...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500 text-white rounded-lg">
            {error}
          </div>
        ) : (
          <RoomMeasurementInterface projectData={projectData} />
        )}
      </div>
    </div>
  );
}

export default ProjectDetails;