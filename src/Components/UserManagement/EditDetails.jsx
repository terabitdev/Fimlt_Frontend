

// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import SideBar from '../SideBar';
// import TopBar from '../TopBar';
// import { CiEdit } from "react-icons/ci";
// import { db } from '../../firebase';
// import { doc, getDoc, updateDoc } from 'firebase/firestore';
// import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
// import ModelViewer from './ModelViewer'; // Adjust this path

// function RoomMeasurementInterface({ projectData, onUpdateDetails, onUpdatePreview }) {
//   const navigate = useNavigate();
  
//   // State for editing
//   const [projectName, setProjectName] = useState(projectData?.name || "");
//   const [projectDescription, setProjectDescription] = useState(projectData?.description || "");
//   const [isEditingName, setIsEditingName] = useState(false);
//   const [isEditingDescription, setIsEditingDescription] = useState(false);
  
//   // States for editing individual room details
//   const [editingField, setEditingField] = useState(null); // { type: 'category'|'name'|'dimension', index: number }
//   const [editValue, setEditValue] = useState("");

//   // Process room details from roomData array - handle name/dimensions structure
//   const processRoomDetails = () => {
//     const groupedDetails = {
//       category: [],
//       names: [],
//       dimensions: []
//     };
    
//     // Add main category if available
//     if (projectData?.category) {
//       groupedDetails.category.push(projectData.category);
//     }
    
//     // Process roomData array
//     if (projectData?.roomData && Array.isArray(projectData.roomData)) {
//       console.log("Room data for display:", projectData.roomData);
      
//       projectData.roomData.forEach((item, index) => {
//         if (item && typeof item === 'object') {
//           // Handle the specific structure: {name: "Category", dimensions: "Room"}
//           if (item.name !== undefined && item.dimensions !== undefined) {
//             // For index 0, change "Category" to "Subcategory"
//             const displayName = index === 0 && item.name === "Category" ? "Subcategory" : item.name;
//             groupedDetails.names.push(displayName);
//             groupedDetails.dimensions.push(item.dimensions);
//           }
//           // Fallback for other object structures
//           else {
//             Object.entries(item).forEach(([key, value]) => {
//               if (key.toLowerCase().includes('name')) {
//                 groupedDetails.names.push(value);
//               } else if (key.toLowerCase().includes('dimension')) {
//                 groupedDetails.dimensions.push(value);
//               }
//             });
//           }
//         }
//         // Handle primitive values
//         else if (item !== undefined) {
//           groupedDetails.names.push(item);
//         }
//       });
//     }
    
//     return groupedDetails;
//   };

//   // Update project name and description when projectData changes
//   useEffect(() => {
//     if (projectData) {
//       setProjectName(projectData.name || "");
//       setProjectDescription(projectData.description || "");
//     }
//   }, [projectData]);

//   // Handle starting to edit a field
//   const handleEditClick = (type, index = 0) => {
//     const roomDetails = processRoomDetails();
//     let currentValue = "";
    
//     switch (type) {
//       case 'category':
//         currentValue = roomDetails.category[0] || "";
//         break;
//       case 'name':
//         currentValue = roomDetails.names[index] || "";
//         break;
//       case 'dimension':
//         currentValue = roomDetails.dimensions[index] || "";
//         break;
//     }
    
//     setEditingField({ type, index });
//     setEditValue(String(currentValue));
//   };

//   // Handle input change
//   const handleInputChange = (e) => {
//     setEditValue(e.target.value);
//   };

//   // Handle saving the edited value
//   const handleSave = () => {
//     if (!editingField || !projectData) return;
    
//     // Create a deep copy of roomData
//     const updatedRoomData = projectData.roomData ? [...projectData.roomData] : [];
//     let updatedCategory = projectData.category;
    
//     const { type, index } = editingField;
    
//     // Update the appropriate field based on type
//     switch (type) {
//       case 'category':
//         updatedCategory = editValue;
//         break;
//       case 'name':
//         // Update the name field in the roomData object at index
//         if (updatedRoomData[index]) {
//           updatedRoomData[index] = {
//             ...updatedRoomData[index],
//             name: editValue
//           };
//         }
//         break;
//       case 'dimension':
//         // Update the dimensions field in the roomData object at index
//         if (updatedRoomData[index]) {
//           updatedRoomData[index] = {
//             ...updatedRoomData[index],
//             dimensions: editValue
//           };
//         }
//         break;
//     }
    
//     // Update the project data
//     const updatedProject = {
//       ...projectData,
//       category: updatedCategory,
//       roomData: updatedRoomData
//     };
    
//     // Send updated data to parent component
//     if (onUpdateDetails) {
//       onUpdateDetails(updatedProject);
//     }
    
//     setEditingField(null);
//   };

//   // Handle key press (Enter to save, Escape to cancel)
//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter') {
//       handleSave();
//     } else if (e.key === 'Escape') {
//       setEditingField(null);
//     }
//   };

//   // Save all edits
//   const handleSaveAllEdits = () => {
//     if (!projectData?.id) return;
    
//     // Create updated project data object
//     const updatedProject = {
//       ...projectData,
//       name: projectName,
//       description: projectDescription
//     };
    
//     // Send updated data to parent component
//     if (onUpdateDetails) {
//       onUpdateDetails(updatedProject);
//     }
//   };

//   const roomDetails = processRoomDetails();

//   return (
//     <div className="min-h-screen max-w-[22rem] md:max-w-5xl xl:max-w-7xl bg-[#1E3A5F] rounded-xl">
//       {/* Project Name and Description Section */}
//       <div className="p-4 border-b border-white flex items-center justify-between">
//         <div className="flex flex-col gap-5 font-monrope w-full">
//           {isEditingName ? (
//             <input 
//               type="text" 
//               value={projectName} 
//               onChange={(e) => setProjectName(e.target.value)}
//               onBlur={() => setIsEditingName(false)}
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter') setIsEditingName(false);
//                 if (e.key === 'Escape') {
//                   setProjectName(projectData?.name || "");
//                   setIsEditingName(false);
//                 }
//               }}
//               className="font-[700] text-2xl md:text-[31px] bg-transparent text-white border-b border-white px-2"
//               autoFocus
//             />
//           ) : (
//             <div 
//               className="font-[700] text-2xl md:text-[31px] text-white flex items-center cursor-pointer"
//               onClick={() => setIsEditingName(true)}
//             >
//               {projectName || 'Unnamed Project'}
//               <CiEdit size={20} className="text-white ml-2" />
//             </div>
//           )}
          
//           {isEditingDescription ? (
//             <input 
//               type="text" 
//               value={projectDescription} 
//               onChange={(e) => setProjectDescription(e.target.value)}
//               onBlur={() => setIsEditingDescription(false)}
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter') setIsEditingDescription(false);
//                 if (e.key === 'Escape') {
//                   setProjectDescription(projectData?.description || "");
//                   setIsEditingDescription(false);
//                 }
//               }}
//               className="font-[500] text-sm md:text-[20px] bg-transparent text-white border-b border-white px-2"
//               autoFocus
//             />
//           ) : (
//             <div 
//               className="font-[500] text-sm md:text-[20px] text-white flex items-center cursor-pointer"
//               onClick={() => setIsEditingDescription(true)}
//             >
//               {projectDescription || 'No description available'}
//               <CiEdit size={20} className="text-white ml-2" />
//             </div>
//           )}
//         </div>
        
//         <div className="flex items-center justify-center font-Urbanist h-12">
//           <button
//             onClick={() => navigate(-1)}
//             className="bg-[#1E3A5F] border border-white text-white px-3 py-1 rounded-lg text-sm"
//           >
//             Back
//           </button>
//         </div>
//       </div>

//       <div className="flex flex-col md:flex-row justify-between gap-5 max-w-[61rem] mt-10 md:mt-20 mx-auto">
//         {/* 3D Model Viewer */}
//         <div className="flex flex-col gap-5 md:w-[405px] md:h-[270px] max-w-sm">
//           <div className="md:w-[405px] md:h-[270px] max-w-sm bg-[#000000] rounded-xl overflow-hidden">
//             {projectData?.usdFileUrl ? (
//               <ModelViewer 
//                 modelUrl={projectData.usdFileUrl} 
//                 projectData={projectData} 
//                 onUpdatePreview={onUpdatePreview}
//               />
//             ) : (
//               <div className="w-full h-full flex items-center justify-center">
//                 <p className="text-white text-sm">No 3D model available</p>
//               </div>
//             )}
//           </div>
//           <button 
//             onClick={handleSaveAllEdits}
//             className="w-full bg-white text-[#1E3A5F] rounded-full px-2 py-3 font-SFProDisplay text-[16px] font-medium"
//           >
//             Save All Changes
//           </button>
//         </div>

//         {/* Room Details Table - Keep original design but remove Other Properties */}
//         <div className="p-4 md:w-[583px] md:h-[370px] max-w-sm rounded-3xl bg-white overflow-y-auto scrollbar-hide">
//           <div className="w-full h-full font-SFProDisplay">
//             <table className="w-full">
//               <tbody>
//                 {/* Category Row */}
//                 {roomDetails.category.length > 0 && (
//                   <>
//                     <tr>
//                       <td className="text-left py-1 px-2 font-[600] text-[#090D00] text-lg border-b border-gray-200">
//                         Category
//                       </td>
//                       <td className="text-right py-1 px-2">
//                         <button
//                           onClick={() => handleEditClick('category', 0)}
//                           className="p-1"
//                           aria-label="Edit Category"
//                         >
//                           <CiEdit size={20} className="text-[#090D00]" />
//                         </button>
//                       </td>
//                     </tr>
//                     <tr>
//                       <td colSpan="2" className="text-left py-1 px-2 font-[400] text-[#090D00]">
//                         {editingField?.type === 'category' && editingField?.index === 0 ? (
//                           <input
//                             type="text"
//                             value={editValue}
//                             onChange={handleInputChange}
//                             onBlur={handleSave}
//                             onKeyDown={handleKeyDown}
//                             className="w-full border border-[#090D00] rounded-sm px-2 py-1 text-black"
//                             autoFocus
//                           />
//                         ) : (
//                           roomDetails.category[0]
//                         )}
//                       </td>
//                     </tr>
//                   </>
//                 )}

//                 {/* Name and Dimensions Header Row */}
//                 {(roomDetails.names.length > 0 || roomDetails.dimensions.length > 0) && (
//                   <tr>
//                     <td className="text-left py-1 px-2 font-[600] text-[#090D00] text-lg border-b border-gray-200 pt-4">
//                       Name
//                     </td>
//                     <td className="text-right py-1 px-2 font-[600] text-[#090D00] text-lg border-b border-gray-200 pt-4">
//                       Dimension
//                     </td>
//                   </tr>
//                 )}

//                 {/* Name and Dimension Rows */}
//                 {Math.max(roomDetails.names.length, roomDetails.dimensions.length) > 0 && 
//                   Array.from({ length: Math.max(roomDetails.names.length, roomDetails.dimensions.length) }).map((_, index) => (
//                     <tr key={`name-dimension-${index}`}>
//                       <td className="text-left py-1 px-2 font-[400] text-[#090D00] relative">
//                         <div className="flex items-center justify-between">
//                           {editingField?.type === 'name' && editingField?.index === index ? (
//                             <input
//                               type="text"
//                               value={editValue}
//                               onChange={handleInputChange}
//                               onBlur={handleSave}
//                               onKeyDown={handleKeyDown}
//                               className="flex-1 border border-[#090D00] rounded-sm px-2 py-1 text-black mr-2"
//                               autoFocus
//                             />
//                           ) : (
//                             <span>{roomDetails.names[index] || `Room ${index + 1}`}</span>
//                           )}
//                           <button
//                             onClick={() => handleEditClick('name', index)}
//                             className="p-1"
//                             aria-label={`Edit Name ${index + 1}`}
//                           >
//                             <CiEdit size={16} className="text-[#090D00]" />
//                           </button>
//                         </div>
//                       </td>
//                       <td className="text-right py-1 px-2 font-medium text-[#090D00] relative">
//                         <div className="flex items-center justify-end">
//                           {editingField?.type === 'dimension' && editingField?.index === index ? (
//                             <input
//                               type="text"
//                               value={editValue}
//                               onChange={handleInputChange}
//                               onBlur={handleSave}
//                               onKeyDown={handleKeyDown}
//                               className="flex-1 border border-[#090D00] rounded-sm px-2 py-1 text-black mr-2 text-right"
//                               autoFocus
//                             />
//                           ) : (
//                             <span>{roomDetails.dimensions[index] || ''}</span>
//                           )}
//                           <button
//                             onClick={() => handleEditClick('dimension', index)}
//                             className="p-1"
//                             aria-label={`Edit Dimension ${index + 1}`}
//                           >
//                             <CiEdit size={16} className="text-[#090D00]" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 }
//               </tbody>
//             </table>

//             {/* No Data Message */}
//             {roomDetails.category.length === 0 && roomDetails.names.length === 0 && 
//              roomDetails.dimensions.length === 0 && (
//               <div className="flex items-center justify-center h-full">
//                 <p className="text-center text-gray-500">No room details available</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// function EditDetails() {
//   const { projectId } = useParams();
//   const [projectData, setProjectData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();
  
//   // Handle preview image updates
//   const handlePreviewUpdate = (previewUrl) => {
//     if (previewUrl && projectData) {
//       setProjectData({
//         ...projectData,
//         previewImageUrl: previewUrl
//       });
//     }
//   };
  
//   // Update project data
//   const handleUpdateDetails = async (updatedProject) => {
//     if (!projectId) return;
    
//     try {
//       // Update document in Firestore
//       const projectRef = doc(db, "projects", projectId);
      
//       // Update only specific fields to avoid overwriting data
//       const updateData = {
//         name: updatedProject.name,
//         description: updatedProject.description,
//         category: updatedProject.category,
//         roomData: updatedProject.roomData
//       };
      
//       await updateDoc(projectRef, updateData);
      
//       // Update local state
//       setProjectData({
//         ...projectData,
//         ...updateData
//       });
      
//       alert("Project updated successfully!");
//     } catch (err) {
//       console.error("Error updating project:", err);
//       alert("Failed to update project. Please try again.");
//     }
//   };
  
//   // Simplified data fetching with better error handling
//   useEffect(() => {
//     const fetchProjectData = async () => {
//       if (!projectId) {
//         setLoading(false);
//         setError("No project ID provided");
//         return;
//       }
      
//       try {
//         setLoading(true);
//         console.log("Fetching project with ID:", projectId);
        
//         // 1. Fetch project document
//         const projectRef = doc(db, "projects", projectId);
//         const projectSnap = await getDoc(projectRef);
        
//         if (!projectSnap.exists()) {
//           console.error("Project not found");
//           setError("Project not found");
//           setLoading(false);
//           return;
//         }
        
//         const projectData = projectSnap.data();
//         console.log("Raw project data from Firebase:", projectData);
        
//         // 2. If there's a 3D model URL, get the download URL
//         let modelUrl = null;
//         if (projectData.usdFileUrl) {
//           try {
//             const storage = getStorage();
//             // Get file reference - check if it's already a full URL or a path
//             const path = projectData.usdFileUrl.startsWith('http') 
//               ? projectData.usdFileUrl 
//               : projectData.usdFileUrl;
              
//             if (path.startsWith('http')) {
//               // If it's already a URL, use it directly
//               modelUrl = path;
//               console.log('Using provided URL:', modelUrl);
//             } else {
//               // If it's a path, get the download URL
//               const fileRef = storageRef(storage, path);
//               modelUrl = await getDownloadURL(fileRef);
//               console.log('Retrieved model URL:', modelUrl);
//             }
//           } catch (e) {
//             console.error('Could not load model URL:', e);
//             // Continue even if model URL can't be loaded
//           }
//         }
        
//      // Set project data with all required fields
//         setProjectData({
//           id: projectId,
//           // Core project info
//           name: projectData.name || 'Unnamed Project',
//           description: projectData.description || '',
          
//           // Actual Firebase fields - keep what's in the actual database
//           category: projectData.category || '',
//           roomData: projectData.roomData || [],
          
//           // 3D model info
//           usdFileUrl: modelUrl,
//           previewImageUrl: projectData.previewImageUrl || null
//         });
//       } catch (err) {
//         console.error("Error fetching project data:", err);
//         setError("Failed to load project data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProjectData();
//   }, [projectId,]);

//   // Log loading state for debugging
//   useEffect(() => {
//     console.log("Loading state:", loading);
//     console.log("Project data:", projectData);
//     console.log("Error:", error);
//   }, [loading, projectData, error]);

//   return (
//     <div className="flex min-h-screen h-full bg-black text-white">
//       <SideBar />
//       <div className="flex-1 p-6">
//         <TopBar />
//         <div className="flex justify-between font-DMSansRegular items-center mb-6">
//           <h1 className="text-2xl md:text-3xl font-[500]">Edit Project Details</h1>
//         </div>
        
//         {loading ? (
//           <div className="flex flex-col items-center justify-center h-64">
//             <p className="text-white mb-2">Loading project data...</p>
//             <p className="text-gray-400 text-sm">Please wait while we fetch your project</p>
//           </div>
//         ) : error ? (
//           <div className="p-4 bg-red-500 text-white rounded-lg">
//             <p className="font-bold mb-2">Error</p>
//             <p>{error}</p>
//             <button 
//               onClick={() => navigate(-1)}
//               className="mt-4 bg-white text-red-500 px-4 py-2 rounded"
//             >
//               Go Back
//             </button>
//           </div>
//         ) : projectData ? (
//           <RoomMeasurementInterface 
//             projectData={projectData} 
//             onUpdateDetails={handleUpdateDetails}
//             onUpdatePreview={handlePreviewUpdate}
//           />
//         ) : (
//           <div className="p-4 bg-yellow-500 text-white rounded-lg">
//             <p>No project data available. Please try again or create a new project.</p>
//             <button 
//               onClick={() => navigate(-1)}
//               className="mt-4 bg-white text-yellow-500 px-4 py-2 rounded"
//             >
//               Go Back
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default EditDetails;




import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SideBar from '../SideBar';
import TopBar from '../TopBar';
import { CiEdit } from "react-icons/ci";
import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
import ModelViewer from './ModelViewer'; // Adjust this path

function RoomMeasurementInterface({ projectData, onUpdateDetails, onUpdatePreview, isUpdating }) {
  const navigate = useNavigate();
  
  // State for editing
  const [projectName, setProjectName] = useState(projectData?.name || "");
  const [projectDescription, setProjectDescription] = useState(projectData?.description || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  
  // States for editing individual room details
  const [editingField, setEditingField] = useState(null); // { type: 'category'|'name'|'dimension', index: number }
  const [editValue, setEditValue] = useState("");

  // Process room details from roomData array - handle name/dimensions structure
  const processRoomDetails = () => {
    const groupedDetails = {
      category: [],
      names: [],
      dimensions: []
    };
    
    // Add main category if available
    if (projectData?.category) {
      groupedDetails.category.push(projectData.category);
    }
    
    // Process roomData array
    if (projectData?.roomData && Array.isArray(projectData.roomData)) {
      console.log("Room data for display:", projectData.roomData);
      
      projectData.roomData.forEach((item, index) => {
        if (item && typeof item === 'object') {
          // Handle the specific structure: {name: "Category", dimensions: "Room"}
          if (item.name !== undefined && item.dimensions !== undefined) {
            // For index 0, change "Category" to "Subcategory"
            const displayName = index === 0 && item.name === "Category" ? "Subcategory" : item.name;
            groupedDetails.names.push(displayName);
            groupedDetails.dimensions.push(item.dimensions);
          }
          // Fallback for other object structures
          else {
            Object.entries(item).forEach(([key, value]) => {
              if (key.toLowerCase().includes('name')) {
                groupedDetails.names.push(value);
              } else if (key.toLowerCase().includes('dimension')) {
                groupedDetails.dimensions.push(value);
              }
            });
          }
        }
        // Handle primitive values
        else if (item !== undefined) {
          groupedDetails.names.push(item);
        }
      });
    }
    
    return groupedDetails;
  };

  // Update project name and description when projectData changes
  useEffect(() => {
    if (projectData) {
      setProjectName(projectData.name || "");
      setProjectDescription(projectData.description || "");
    }
  }, [projectData]);

  // Handle starting to edit a field
  const handleEditClick = (type, index = 0) => {
    const roomDetails = processRoomDetails();
    let currentValue = "";
    
    switch (type) {
      case 'category':
        currentValue = roomDetails.category[0] || "";
        break;
      case 'name':
        currentValue = roomDetails.names[index] || "";
        break;
      case 'dimension':
        currentValue = roomDetails.dimensions[index] || "";
        break;
    }
    
    setEditingField({ type, index });
    setEditValue(String(currentValue));
  };

  // Handle input change
  const handleInputChange = (e) => {
    setEditValue(e.target.value);
  };

  // Handle saving the edited value
  const handleSave = () => {
    if (!editingField || !projectData) return;
    
    // Create a deep copy of roomData
    const updatedRoomData = projectData.roomData ? [...projectData.roomData] : [];
    let updatedCategory = projectData.category;
    
    const { type, index } = editingField;
    
    // Update the appropriate field based on type
    switch (type) {
      case 'category':
        updatedCategory = editValue;
        break;
      case 'name':
        // Update the name field in the roomData object at index
        if (updatedRoomData[index]) {
          updatedRoomData[index] = {
            ...updatedRoomData[index],
            name: editValue
          };
        }
        break;
      case 'dimension':
        // Update the dimensions field in the roomData object at index
        if (updatedRoomData[index]) {
          updatedRoomData[index] = {
            ...updatedRoomData[index],
            dimensions: editValue
          };
        }
        break;
    }
    
    // Update the project data
    const updatedProject = {
      ...projectData,
      category: updatedCategory,
      roomData: updatedRoomData
    };
    
    // Send updated data to parent component
    if (onUpdateDetails) {
      onUpdateDetails(updatedProject);
    }
    
    setEditingField(null);
  };

  // Handle key press (Enter to save, Escape to cancel)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditingField(null);
    }
  };

  // Save all edits
  const handleSaveAllEdits = () => {
    if (!projectData?.id) return;
    
    // Create updated project data object
    const updatedProject = {
      ...projectData,
      name: projectName,
      description: projectDescription
    };
    
    // Send updated data to parent component
    if (onUpdateDetails) {
      onUpdateDetails(updatedProject);
    }
  };

  const roomDetails = processRoomDetails();

  return (
    <div className="min-h-screen max-w-[22rem] md:max-w-5xl xl:max-w-7xl bg-[#1E3A5F] rounded-xl">
      {/* Project Name and Description Section */}
      <div className="p-4 border-b border-white flex items-center justify-between">
        <div className="flex flex-col gap-5 font-monrope w-full">
          {isEditingName ? (
            <input 
              type="text" 
              value={projectName} 
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingName(false);
                if (e.key === 'Escape') {
                  setProjectName(projectData?.name || "");
                  setIsEditingName(false);
                }
              }}
              className="font-[700] text-2xl md:text-[31px] bg-transparent text-white border-b border-white px-2"
              autoFocus
            />
          ) : (
            <div 
              className="font-[700] text-2xl md:text-[31px] text-white flex items-center cursor-pointer"
              onClick={() => setIsEditingName(true)}
            >
              {projectName || 'Unnamed Project'}
              <CiEdit size={20} className="text-white ml-2" />
            </div>
          )}
          
          {isEditingDescription ? (
            <input 
              type="text" 
              value={projectDescription} 
              onChange={(e) => setProjectDescription(e.target.value)}
              onBlur={() => setIsEditingDescription(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingDescription(false);
                if (e.key === 'Escape') {
                  setProjectDescription(projectData?.description || "");
                  setIsEditingDescription(false);
                }
              }}
              className="font-[500] text-sm md:text-[20px] bg-transparent text-white border-b border-white px-2"
              autoFocus
            />
          ) : (
            <div 
              className="font-[500] text-sm md:text-[20px] text-white flex items-center cursor-pointer"
              onClick={() => setIsEditingDescription(true)}
            >
              {projectDescription || 'No description available'}
              <CiEdit size={20} className="text-white ml-2" />
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-center font-Urbanist h-12">
          <button
            onClick={() => navigate(-1)}
            className="bg-[#1E3A5F] border border-white text-white px-3 py-1 rounded-lg text-sm"
          >
            Back
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-5 max-w-[61rem] mt-10 md:mt-20 mx-auto">
        {/* 3D Model Viewer */}
        <div className="flex flex-col gap-5 md:w-[405px] md:h-[270px] max-w-sm">
          <div className="md:w-[405px] md:h-[270px] max-w-sm bg-[#000000] rounded-xl overflow-hidden">
            {projectData?.usdFileUrl ? (
              <ModelViewer 
                modelUrl={projectData.usdFileUrl} 
                projectData={projectData} 
                onUpdatePreview={onUpdatePreview}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-white text-sm">No 3D model available</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleSaveAllEdits}
            disabled={isUpdating}
            className={`w-full ${isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-100'} text-[#1E3A5F] rounded-full px-2 py-3 font-SFProDisplay text-[16px] font-medium transition-colors flex items-center justify-center`}
          >
            {isUpdating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#1E3A5F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save All Changes'
            )}
          </button>
        </div>

        {/* Room Details Table - Keep original design but remove Other Properties */}
        <div className="p-4 md:w-[583px] md:h-[370px] max-w-sm rounded-3xl bg-white overflow-y-auto scrollbar-hide">
          <div className="w-full h-full font-SFProDisplay">
            <table className="w-full">
              <tbody>
                {/* Category Row */}
                {roomDetails.category.length > 0 && (
                  <>
                    <tr>
                      <td className="text-left py-1 px-2 font-[600] text-[#090D00] text-lg border-b border-gray-200">
                        Category
                      </td>
                      <td className="text-right py-1 px-2">
                        <button
                          onClick={() => handleEditClick('category', 0)}
                          className="p-1"
                          aria-label="Edit Category"
                        >
                          <CiEdit size={20} className="text-[#090D00]" />
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="2" className="text-left py-1 px-2 font-[400] text-[#090D00]">
                        {editingField?.type === 'category' && editingField?.index === 0 ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={handleInputChange}
                            onBlur={handleSave}
                            onKeyDown={handleKeyDown}
                            className="w-full border border-[#090D00] rounded-sm px-2 py-1 text-black"
                            autoFocus
                          />
                        ) : (
                          roomDetails.category[0]
                        )}
                      </td>
                    </tr>
                  </>
                )}

                {/* Name and Dimensions Header Row */}
                {(roomDetails.names.length > 0 || roomDetails.dimensions.length > 0) && (
                  <tr>
                    <td className="text-left py-1 px-2 font-[600] text-[#090D00] text-lg border-b border-gray-200 pt-4">
                      Name
                    </td>
                    <td className="text-right py-1 px-2 font-[600] text-[#090D00] text-lg border-b border-gray-200 pt-4">
                      Dimension
                    </td>
                  </tr>
                )}

                {/* Name and Dimension Rows */}
                {Math.max(roomDetails.names.length, roomDetails.dimensions.length) > 0 && 
                  Array.from({ length: Math.max(roomDetails.names.length, roomDetails.dimensions.length) }).map((_, index) => (
                    <tr key={`name-dimension-${index}`}>
                      <td className="text-left py-1 px-2 font-[400] text-[#090D00] relative">
                        <div className="flex items-center justify-between">
                          {editingField?.type === 'name' && editingField?.index === index ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={handleInputChange}
                              onBlur={handleSave}
                              onKeyDown={handleKeyDown}
                              className="flex-1 border border-[#090D00] rounded-sm px-2 py-1 text-black mr-2"
                              autoFocus
                            />
                          ) : (
                            <span>{roomDetails.names[index] || `Room ${index + 1}`}</span>
                          )}
                          <button
                            onClick={() => handleEditClick('name', index)}
                            className="p-1"
                            aria-label={`Edit Name ${index + 1}`}
                          >
                            <CiEdit size={16} className="text-[#090D00]" />
                          </button>
                        </div>
                      </td>
                      <td className="text-right py-1 px-2 font-medium text-[#090D00] relative">
                        <div className="flex items-center justify-end">
                          {editingField?.type === 'dimension' && editingField?.index === index ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={handleInputChange}
                              onBlur={handleSave}
                              onKeyDown={handleKeyDown}
                              className="flex-1 border border-[#090D00] rounded-sm px-2 py-1 text-black mr-2 text-right"
                              autoFocus
                            />
                          ) : (
                            <span>{roomDetails.dimensions[index] || ''}</span>
                          )}
                          <button
                            onClick={() => handleEditClick('dimension', index)}
                            className="p-1"
                            aria-label={`Edit Dimension ${index + 1}`}
                          >
                            <CiEdit size={16} className="text-[#090D00]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>

            {/* No Data Message */}
            {roomDetails.category.length === 0 && roomDetails.names.length === 0 && 
             roomDetails.dimensions.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-center text-gray-500">No room details available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


function EditDetails() {
  const { projectId } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  
  // Handle preview image updates
  const handlePreviewUpdate = (previewUrl) => {
    if (previewUrl && projectData) {
      setProjectData({
        ...projectData,
        previewImageUrl: previewUrl
      });
    }
  };
  
  // Update project data
  const handleUpdateDetails = async (updatedProject) => {
    if (!projectId) return;
    
    try {
      setIsUpdating(true);
      setError(null);
      setSuccessMessage(null);
      
      // Update document in Firestore
      const projectRef = doc(db, "projects", projectId);
      
      // Update only specific fields to avoid overwriting data
      const updateData = {
        name: updatedProject.name,
        description: updatedProject.description,
        category: updatedProject.category,
        roomData: updatedProject.roomData
      };
      
      await updateDoc(projectRef, updateData);
      
      // Update local state
      setProjectData({
        ...projectData,
        ...updateData
      });
      
      // Show success message
      setSuccessMessage("Project updated successfully!");
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err) {
      console.error("Error updating project:", err);
      setError("Failed to update project. Please try again.");
      
      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Simplified data fetching with better error handling
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) {
        setLoading(false);
        setError("No project ID provided");
        return;
      }
      
      try {
        setLoading(true);
        console.log("Fetching project with ID:", projectId);
        
        // 1. Fetch project document
        const projectRef = doc(db, "projects", projectId);
        const projectSnap = await getDoc(projectRef);
        
        if (!projectSnap.exists()) {
          console.error("Project not found");
          setError("Project not found");
          setLoading(false);
          return;
        }
        
        const projectData = projectSnap.data();
        console.log("Raw project data from Firebase:", projectData);
        
        // 2. If there's a 3D model URL, get the download URL
        let modelUrl = null;
        if (projectData.usdFileUrl) {
          try {
            const storage = getStorage();
            // Get file reference - check if it's already a full URL or a path
            const path = projectData.usdFileUrl.startsWith('http') 
              ? projectData.usdFileUrl 
              : projectData.usdFileUrl;
              
            if (path.startsWith('http')) {
              // If it's already a URL, use it directly
              modelUrl = path;
              console.log('Using provided URL:', modelUrl);
            } else {
              // If it's a path, get the download URL
              const fileRef = storageRef(storage, path);
              modelUrl = await getDownloadURL(fileRef);
              console.log('Retrieved model URL:', modelUrl);
            }
          } catch (e) {
            console.error('Could not load model URL:', e);
            // Continue even if model URL can't be loaded
          }
        }
        
     // Set project data with all required fields
        setProjectData({
          id: projectId,
          // Core project info
          name: projectData.name || 'Unnamed Project',
          description: projectData.description || '',
          
          // Actual Firebase fields - keep what's in the actual database
          category: projectData.category || '',
          roomData: projectData.roomData || [],
          
          // 3D model info
          usdFileUrl: modelUrl,
          previewImageUrl: projectData.previewImageUrl || null
        });
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError("Failed to load project data");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId,]);

  // Log loading state for debugging
  useEffect(() => {
    console.log("Loading state:", loading);
    console.log("Project data:", projectData);
    console.log("Error:", error);
  }, [loading, projectData, error]);

  return (
    <div className="flex min-h-screen h-full bg-black text-white">
      <SideBar />
      <div className="flex-1 p-6">
        <TopBar />
        <div className="flex justify-between font-DMSansRegular items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-[500]">Edit Project Details</h1>
        </div>
        
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500 text-white rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{successMessage}</span>
            </div>
            <button 
              onClick={() => setSuccessMessage(null)}
              className="text-white hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && !loading && (
          <div className="mb-6 p-4 bg-red-500 text-white rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-white hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-white mb-2">Loading project data...</p>
            <p className="text-gray-400 text-sm">Please wait while we fetch your project</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-400 text-center">Unable to load project data</p>
            <button 
              onClick={() => navigate(-1)}
              className="mt-4 bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
          </div>
        ) : projectData ? (
          <RoomMeasurementInterface 
            projectData={projectData} 
            onUpdateDetails={handleUpdateDetails}
            onUpdatePreview={handlePreviewUpdate}
            isUpdating={isUpdating}
          />
        ) : (
          <div className="p-4 bg-yellow-500 text-white rounded-lg">
            <p>No project data available. Please try again or create a new project.</p>
            <button 
              onClick={() => navigate(-1)}
              className="mt-4 bg-white text-yellow-500 px-4 py-2 rounded"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditDetails;