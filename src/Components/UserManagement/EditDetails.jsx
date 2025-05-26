
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SideBar from '../SideBar';
import TopBar from '../TopBar';
import { CiEdit } from "react-icons/ci";
import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
import ModelViewer from './ModelViewer'; // Adjust this path

function RoomMeasurementInterface({ projectData, onUpdateDetails, onUpdatePreview }) {
  const navigate = useNavigate();
  
  // State for editing
  const [projectName, setProjectName] = useState(projectData?.name || "");
  const [projectDescription, setProjectDescription] = useState(projectData?.description || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  
  // States for editing individual room details
  const [editingField, setEditingField] = useState(null); // { type: 'category'|'name'|'dimension'|'other', index: number }
  const [editValue, setEditValue] = useState("");

  // Process room details from roomData array - grouped by category (same as ProjectDetails)
  const processRoomDetails = () => {
    const groupedDetails = {
      category: [],
      names: [],
      dimensions: [],
      other: []
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
          // If item is an object with name/value pairs
          if (item.name && item.value !== undefined) {
            const key = item.name.toLowerCase();
            if (key.includes('name') || key.includes('room')) {
              groupedDetails.names.push(item.value);
            } else if (key.includes('dimension') || key.includes('size') || key.includes('area') || key.includes('length') || key.includes('width') || key.includes('height')) {
              groupedDetails.dimensions.push(item.value);
            } else {
              groupedDetails.other.push({ name: item.name, value: item.value });
            }
          }
          // If item is an object with other properties
          else {
            Object.entries(item).forEach(([key, value]) => {
              const lowerKey = key.toLowerCase();
              if (lowerKey.includes('name') || lowerKey.includes('room')) {
                groupedDetails.names.push(value);
              } else if (lowerKey.includes('dimension') || lowerKey.includes('size') || lowerKey.includes('area') || lowerKey.includes('length') || lowerKey.includes('width') || lowerKey.includes('height')) {
                groupedDetails.dimensions.push(value);
              } else {
                const formattedKey = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase());
                groupedDetails.other.push({ name: formattedKey, value: value });
              }
            });
          }
        }
        // If item is a primitive value (string, number)
        else if (item !== undefined) {
          // Try to determine what type of data this is based on content
          const itemString = item.toString().toLowerCase();
          if (itemString.includes('room') || itemString.includes('name')) {
            groupedDetails.names.push(item);
          } else if (itemString.includes('dimension') || itemString.includes('size') || itemString.includes('area') || /\d+\s*(x|×|by)\s*\d+/.test(itemString)) {
            groupedDetails.dimensions.push(item);
          } else {
            groupedDetails.other.push({ name: `Property ${index + 1}`, value: item });
          }
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
      case 'other':
        currentValue = roomDetails.other[index]?.value || "";
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
        // Find and update name in roomData
        // This is a simplified approach - you might need to adjust based on your data structure
        if (updatedRoomData[index]) {
          if (typeof updatedRoomData[index] === 'object' && updatedRoomData[index].name) {
            updatedRoomData[index].value = editValue;
          } else {
            updatedRoomData[index] = editValue;
          }
        }
        break;
      case 'dimension':
        // Similar logic for dimensions
        if (updatedRoomData[index]) {
          if (typeof updatedRoomData[index] === 'object') {
            updatedRoomData[index].value = editValue;
          } else {
            updatedRoomData[index] = editValue;
          }
        }
        break;
      case 'other':
        // Handle other properties
        if (updatedRoomData[index]) {
          if (typeof updatedRoomData[index] === 'object') {
            updatedRoomData[index].value = editValue;
          } else {
            updatedRoomData[index] = editValue;
          }
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
            className="w-full bg-white text-[#1E3A5F] rounded-full px-2 py-3 font-SFProDisplay text-[16px] font-medium"
          >
            Save All Changes
          </button>
        </div>

        {/* Room Details Table - Updated to match ProjectDetails format */}
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

                {/* Other Properties Section */}
                {roomDetails.other.length > 0 && (
                  <>
                    <tr>
                      <td colSpan="2" className="text-left py-1 px-2 font-[600] text-[#090D00] text-lg border-b border-gray-200 pt-4">
                        Other Properties
                      </td>
                    </tr>
                    {roomDetails.other.map((detail, index) => (
                      <tr key={`other-${index}`}>
                        <td className="text-left py-1 px-2 font-[400] text-[#090D00]">
                          {detail.name}
                        </td>
                        <td className="text-right py-1 px-2 font-medium text-[#090D00] relative">
                          <div className="flex items-center justify-end">
                            {editingField?.type === 'other' && editingField?.index === index ? (
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
                              <span>{detail.value}</span>
                            )}
                            <button
                              onClick={() => handleEditClick('other', index)}
                              className="p-1"
                              aria-label={`Edit ${detail.name}`}
                            >
                              <CiEdit size={16} className="text-[#090D00]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>

            {/* No Data Message */}
            {roomDetails.category.length === 0 && roomDetails.names.length === 0 && 
             roomDetails.dimensions.length === 0 && roomDetails.other.length === 0 && (
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
      
      alert("Project updated successfully!");
    } catch (err) {
      console.error("Error updating project:", err);
      alert("Failed to update project. Please try again.");
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
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-white mb-2">Loading project data...</p>
            <p className="text-gray-400 text-sm">Please wait while we fetch your project</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500 text-white rounded-lg">
            <p className="font-bold mb-2">Error</p>
            <p>{error}</p>
            <button 
              onClick={() => navigate(-1)}
              className="mt-4 bg-white text-red-500 px-4 py-2 rounded"
            >
              Go Back
            </button>
          </div>
        ) : projectData ? (
          <RoomMeasurementInterface 
            projectData={projectData} 
            onUpdateDetails={handleUpdateDetails}
            onUpdatePreview={handlePreviewUpdate}
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