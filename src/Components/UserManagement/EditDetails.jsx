
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
  
  // State for room details and editing
  const [roomDetails, setRoomDetails] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [projectName, setProjectName] = useState(projectData?.name || "");
  const [projectDescription, setProjectDescription] = useState(projectData?.description || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  // Process room details from projectData when it changes
  useEffect(() => {
    if (projectData) {
      const details = [];
      
      // Add category if available
      if (projectData.category) {
        details.push({ category: "Category", value: projectData.category, key: "category" });
      }
      
      // Process roomData array
      if (projectData.roomData && Array.isArray(projectData.roomData)) {
        projectData.roomData.forEach((item, index) => {
          // Handle different data formats within roomData
          if (item && typeof item === 'object') {
            // If item is an object with name/value pairs
            if (item.name && item.value !== undefined) {
              details.push({ category: item.name, value: item.value, key: `roomData[${index}].value` });
            }
            // If item is an object with other properties
            else {
              // Extract all properties from the object
              Object.entries(item).forEach(([key, value]) => {
                // Format the key for display (capitalize first letter, add spaces before capitals)
                const formattedKey = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase());
                
                details.push({ 
                  category: formattedKey, 
                  value: value, 
                  key: `roomData[${index}].${key}` 
                });
              });
            }
          }
          // If item is a primitive value (string, number)
          else if (item !== undefined) {
            // Use predefined labels based on index position
            const labels = ["Dimensions", "Name", "Value", "Property"];
            const label = index < labels.length ? labels[index] : `Property ${index + 1}`;
            details.push({ 
              category: label, 
              value: item, 
              key: `roomData[${index}]` 
            });
          }
        });
      }
      
      setRoomDetails(details);
      setProjectName(projectData.name || "");
      setProjectDescription(projectData.description || "");
    }
  }, [projectData]);

  // Handle starting to edit a field - UPDATED
  const handleEditClick = (index) => {
    // Store the current index being edited
    setEditingIndex(index);
    
    // Ensure we're setting the value correctly
    const currentValue = roomDetails[index].value;
    console.log("Setting edit value:", currentValue); // Debug log
    
    // Set the edit value with explicit string conversion
    setEditValue(String(currentValue || ''));
  };

  // Handle input change - UPDATED
  const handleInputChange = (e) => {
    console.log("Input changed to:", e.target.value); // Debug log
    setEditValue(e.target.value);
  };

  // Handle saving the edited value
  const handleSave = (index) => {
    const updatedDetails = [...roomDetails];
    updatedDetails[index] = { ...updatedDetails[index], value: editValue };
    setRoomDetails(updatedDetails);
    setEditingIndex(null);
  };

  // Handle key press (Enter to save, Escape to cancel)
  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      handleSave(index);
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
    }
  };

  // Save all edits
  const handleSaveAllEdits = () => {
    if (!projectData?.id) return;
    
    // Create updated project data object
    const updatedProject = { ...projectData };
    
    // Update name and description
    updatedProject.name = projectName;
    updatedProject.description = projectDescription;
    
    // Update room details
    roomDetails.forEach(detail => {
      if (detail.key.startsWith('roomData')) {
        // Handle nested roomData properties
        const path = detail.key.split('.');
        const roomDataIndex = parseInt(path[0].match(/\d+/)[0]);
        
        // Ensure roomData array exists
        if (!updatedProject.roomData) {
          updatedProject.roomData = [];
        }
        
        // Ensure roomData item exists
        if (!updatedProject.roomData[roomDataIndex]) {
          updatedProject.roomData[roomDataIndex] = {};
        }
        
        if (path.length === 1) {
          // Direct roomData array item
          updatedProject.roomData[roomDataIndex] = detail.value;
        } else {
          // Nested property in roomData object
          const propertyName = path[1];
          updatedProject.roomData[roomDataIndex][propertyName] = detail.value;
        }
      } else if (detail.key === 'category') {
        updatedProject.category = detail.value;
      }
    });
    
    // Send updated data to parent component
    if (onUpdateDetails) {
      onUpdateDetails(updatedProject);
    }
  };

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
              className="font-[700] text-2xl md:text-[31px] text-white flex items-center"
              onClick={() => setIsEditingName(true)}
            >
              {projectName || 'Unnamed Project'}
              <CiEdit size={20} className="text-white ml-2 cursor-pointer" />
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
              className="font-[500] text-sm md:text-[20px] text-white flex items-center"
              onClick={() => setIsEditingDescription(true)}
            >
              {projectDescription || 'No description available'}
              <CiEdit size={20} className="text-white ml-2 cursor-pointer" />
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

        {/* Room Details Table - UPDATED */}
        <div className="p-4 md:w-[583px] md:h-[370px] max-w-sm rounded-3xl bg-white overflow-y-auto scrollbar-hide">
          <div className="w-full font-SFProDisplay">
            {roomDetails.length > 0 ? (
              roomDetails.map((detail, index) => (
                <div key={index} className="flex items-center justify-between py-1">
                  <div className="text-xl font-[400] text-[#090D00]">
                    {detail.category}
                  </div>
                  <div className="flex items-center">
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={handleInputChange}
                        onBlur={() => handleSave(index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="border border-[#090D00] rounded-sm px-1 py-1 text-right w-40 mr-2 text-lg font-medium text-black"
                        autoFocus
                      />
                    ) : (
                      <div className="border border-[#090D00] text-black rounded-sm px-1 py-1 text-right w-40 mr-2 text-lg font-medium">
                        {detail.value}
                      </div>
                    )}
                    <button
                      onClick={() => handleEditClick(index)}
                      className="p-2"
                      aria-label={`Edit ${detail.category}`}
                    >
                      <CiEdit size={25} className="text-[#090D00]" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">No room details available</div>
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