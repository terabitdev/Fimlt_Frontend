

import { useState, useEffect, useRef } from 'react';
import SideBar from '../../Components/SideBar';
import TopBar from '../../Components/TopBar';
import { Edit, Trash2} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore'; // Added deleteDoc
import { 
  getStorage, 
  ref as storageRef, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage'; // Added deleteObject
import '@google/model-viewer';
import ModelViewer from './ModelViewer';

// Model Viewer Component
<ModelViewer />

function RoomMeasurementInterface({ projectData, onUpdatePreview, onDeleteProject }) {
  const navigate = useNavigate();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  // Process room details from roomData array - grouped by category
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
  
  // Handle delete confirmation
  const handleDeleteClick = () => {
    setIsDeleteConfirmOpen(true);
  };
  
  // Confirm delete action
  const confirmDelete = () => {
    if (onDeleteProject) {
      onDeleteProject(projectData.id);
    }
    setIsDeleteConfirmOpen(false);
  };
  
  // Cancel delete action
  const cancelDelete = () => {
    setIsDeleteConfirmOpen(false);
  };
  
  const roomDetails = processRoomDetails();
  
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
            onClick={() => navigate(`/edit-details/${projectData?.id}`)}
            className="bg-[#1E3A5F] border border-white text-white px-3 py-1 rounded-lg text-sm flex items-center"
          >
            <Edit size={16} className="mr-1" /> Edit
          </button>
          <button 
            onClick={handleDeleteClick}
            className="bg-[#FB0000] border border-[#FB0000] text-white px-3 py-1 rounded-lg text-sm flex items-center"
          >
            <Trash2 size={16} className="mr-1" /> Delete
          </button>
        </div>
      </div>

      <div className='flex flex-col md:flex-row justify-between gap-5 max-w-[61rem] mt-10 md:mt-20 mx-auto'>
        {/* 3D Model Viewer */}
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
  
        {/* Room Details Table */}
        <div className="p-4 md:w-[583px] md:h-[370px] max-w-sm rounded-3xl bg-white overflow-y-auto scrollbar-hide">
          <div className="w-full h-full font-SFProDisplay">
            <table className="w-full">
              <tbody>
                {/* Category and Names Row */}
                {(roomDetails.category.length > 0 || roomDetails.names.length > 0) && (
                  <>
                    <tr>
                      <td className="text-left py-1 px-2 font-[600] text-[#090D00] text-lg border-b border-gray-200">
                        Category
                      </td>
                    </tr>
                    <tr>
                      <td className="text-left py-1 px-2 font-[400] text-[#090D00]">
                        {roomDetails.category.length > 0 ? roomDetails.category[0] : ''}
                      </td>
                    </tr>
                  </>
                )}

                {/* Name and Dimensions Row */}
                {(roomDetails.names.length > 0 || roomDetails.dimensions.length > 0) && (
                  <>
                    <tr>
                      <td className="text-left py-1 px-2 font-[600] text-[#090D00] text-lg border-b border-gray-200 pt-4">
                        Name
                      </td>
                      <td className="text-right py-1 px-2 font-[600] text-[#090D00] text-lg border-b border-gray-200 pt-4">
                        Dimension
                      </td>
                    </tr>
                    <tr>
                      <td className="text-left py-1 px-2 font-[400] text-[#090D00]">
                        {roomDetails.names.length > 0 ? roomDetails.names[0] : ''}
                      </td>
                      <td className="text-right py-1 px-2 font-medium text-[#090D00]">
                        {roomDetails.dimensions.length > 0 ? roomDetails.dimensions[0] : ''}
                      </td>
                    </tr>
                  </>
                )}

                {/* Additional Dimensions with different names or room identifiers */}
                {roomDetails.dimensions.slice(1).map((dimension, index) => (
                  <tr key={`dimension-${index}`}>
                    <td className="text-left py-1 px-2 font-[400] text-[#090D00]">
                      {roomDetails.names[index + 1] || `Room ${index + 2}`}
                    </td>
                    <td className="text-right py-1 px-2 font-medium text-[#090D00]">
                      {dimension}
                    </td>
                  </tr>
                ))}

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
                        <td className="text-left py-1 px-2 font-[400] text-[#090D00]">{detail.name}</td>
                        <td className="text-right py-1 px-2 font-medium text-[#090D00]">{detail.value}</td>
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
      
      {/* Delete Confirmation Dialog */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the project "{projectData?.name || 'Unnamed Project'}"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectDetails() {
  const { projectId } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modelFormat, setModelFormat] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState({ loading: false, error: null });
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
  
  // Handle project deletion
  const handleDeleteProject = async (id) => {
    if (!id) return;
    
    try {
      setDeleteStatus({ loading: true, error: null });
      console.log('Deleting project:', id);
      
      // 1. Delete associated files from Storage
      const storage = getStorage();
      
      // Delete 3D model if exists
      if (projectData.usdFileUrl && !projectData.usdFileUrl.startsWith('http')) {
        try {
          const modelRef = storageRef(storage, projectData.usdFileUrl);
          await deleteObject(modelRef);
          console.log('Deleted 3D model file');
        } catch (err) {
          console.error('Error deleting 3D model file:', err);
          // Continue deletion process even if file deletion fails
        }
      }
      
      // Delete preview image if exists
      if (projectData.previewImageUrl && projectData.previewImageUrl.includes('projects')) {
        try {
          // Extract the path from the URL if needed
          const previewPath = `projects/${id}/preview.png`;
          const previewRef = storageRef(storage, previewPath);
          await deleteObject(previewRef);
          console.log('Deleted preview image');
        } catch (err) {
          console.error('Error deleting preview image:', err);
          // Continue deletion process even if file deletion fails
        }
      }
      
      // 2. Delete the project document from Firestore
      const projectRef = doc(db, "projects", id);
      await deleteDoc(projectRef);
      console.log('Project document deleted successfully');
      
      // 3. Navigate back to projects list
      setDeleteStatus({ loading: false, error: null });
      alert('Project deleted successfully');
      navigate(`/edit-details ${projectId}`); 
      
    } catch (err) {
      console.error('Error deleting project:', err);
      setDeleteStatus({ loading: false, error: err.message });
      alert(`Failed to delete project: ${err.message}`);
    }
  };
  
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
        console.log("Raw project data from Firebase:", projectData);
        
        // 2. If there's a 3D model URL, get the download URL
        let modelUrl = null;
        if (projectData.usdFileUrl) {
          try {
            const storage = getStorage();
            // Get file reference
            const fileRef = storageRef(storage, projectData.usdFileUrl);
            
            try {
              // This may not be supported in all Firebase setups
              const metadata = await fileRef.getMetadata();
              console.log('File metadata:', metadata);
              if (metadata.contentType) {
                setModelFormat(metadata.contentType);
              }
            } catch (metaErr) {
              console.warn('Could not get metadata:', metaErr);
            }
            
            // Get download URL
            modelUrl = await getDownloadURL(fileRef);
            console.log('Retrieved model URL:', modelUrl);
            
            // If no format detected, try to determine from URL
            if (!modelFormat) {
              const fileExtension = modelUrl.split('?')[0].split('.').pop().toLowerCase();
              if (fileExtension === 'glb') {
                setModelFormat('model/gltf-binary');
              } else if (fileExtension === 'gltf') {
                setModelFormat('model/gltf+json');
              } else if (fileExtension === 'usdz') {
                setModelFormat('model/vnd.usdz+zip');
              }
            }
          } catch (e) {
            console.error('Could not load model URL:', e);
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
          modelFormat: modelFormat,
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
  }, [projectId, modelFormat]);

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
        ) : deleteStatus.loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-white">Deleting project...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500 text-white rounded-lg">
            {error}
          </div>
        ) : deleteStatus.error ? (
          <div className="p-4 bg-red-500 text-white rounded-lg">
            <p>Error deleting project: {deleteStatus.error}</p>
            <button 
              onClick={() => setDeleteStatus({ loading: false, error: null })}
              className="mt-2 bg-white text-red-500 px-3 py-1 rounded"
            >
              Dismiss
            </button>
          </div>
        ) : (
          <RoomMeasurementInterface 
            projectData={projectData} 
            onUpdatePreview={handlePreviewUpdate}
            onDeleteProject={handleDeleteProject}
          />
        )}
      </div>
    </div>
  );
}

export default ProjectDetails;