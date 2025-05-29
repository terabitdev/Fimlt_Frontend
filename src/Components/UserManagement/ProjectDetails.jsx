
import { useState, useEffect, useRef } from 'react';
import SideBar from '../../Components/SideBar';
import TopBar from '../../Components/TopBar';
import { Edit, Trash2} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { 
  getStorage, 
  ref as storageRef, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import '@google/model-viewer';
import ModelViewer from './ModelViewer';

// Model Viewer Component
<ModelViewer />

function RoomMeasurementInterface({ projectData, onUpdatePreview, onDeleteProject }) {
  const navigate = useNavigate();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  // Process room details from roomData array - handle name/dimensions structure
  const processRoomDetails = () => {
    const groupedDetails = {
      category: projectData?.category || '',
      subCategory: projectData?.subCategory || '',
      names: [],
      dimensions: []
    };
    
    // Process roomData array
    if (projectData?.roomData && Array.isArray(projectData.roomData)) {
      console.log("Room data for display:", projectData.roomData);
      
      projectData.roomData.forEach((item, index) => {
        // Skip index 0
        if (index === 0) {
          return;
        }
        
        if (item && typeof item === 'object') {
          // Handle the specific structure: {name: "Category", dimensions: "Room"}
          if (item.name !== undefined && item.dimensions !== undefined) {
            // Add all items to arrays (excluding index 0)
            groupedDetails.names.push(item.name);
            groupedDetails.dimensions.push(item.dimensions);
          }
          // If item is an object with name/value pairs
          else if (item.name && item.value !== undefined) {
            const key = item.name.toLowerCase();
            if (key.includes('name') || key.includes('room')) {
              groupedDetails.names.push(item.value);
            } else if (key.includes('dimension') || key.includes('size') || key.includes('area') || key.includes('length') || key.includes('width') || key.includes('height')) {
              groupedDetails.dimensions.push(item.value);
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
  const confirmDelete = async () => {
    if (onDeleteProject) {
      await onDeleteProject(projectData.id);
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
            className="bg-[#1E3A5F] border border-white text-white px-3 py-1 rounded-lg text-sm flex items-center hover:bg-blue-700 transition-colors"
          >
            <Edit size={16} className="mr-1" /> Edit
          </button>
          <button 
            onClick={handleDeleteClick}
            className="bg-[#FB0000] border border-[#FB0000] text-white px-3 py-1 rounded-lg text-sm flex items-center hover:bg-red-700 transition-colors"
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
                {/* Category Row */}
                {roomDetails.category && (
                  <tr>
                    <td className="text-left py-1 px-2 font-[600] text-[#090D00] text-lg border-b border-gray-200">
                      Category
                    </td>
                    <td className="text-right py-1 px-2 font-[400] text-[#090D00] border-b border-gray-200">
                      {roomDetails.category}
                    </td>
                  </tr>
                )}

                {/* Sub Category Row */}
                {roomDetails.subCategory && (
                  <tr>
                    <td className="text-left py-1 px-2 font-[600] text-[#090D00] text-lg border-b border-gray-200">
                      Sub Category
                    </td>
                    <td className="text-right py-1 px-2 font-[400] text-[#090D00] border-b border-gray-200">
                      {roomDetails.subCategory}
                    </td>
                  </tr>
                )}

                {/* Name and Dimensions Header Row */}
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
                    
                    {/* Map through all name-dimension pairs */}
                    {Math.max(roomDetails.names.length, roomDetails.dimensions.length) > 0 && 
                      Array.from({ length: Math.max(roomDetails.names.length, roomDetails.dimensions.length) }, (_, index) => (
                        <tr key={`name-dimension-${index}`}>
                          <td className="text-left py-1 px-2 font-[400] text-[#090D00]">
                            {roomDetails.names[index] || `Room ${index + 1}`}
                          </td>
                          <td className="text-right py-1 px-2 font-medium text-[#090D00]">
                            {roomDetails.dimensions[index] || ''}
                          </td>
                        </tr>
                      ))
                    }
                  </>
                )}
              </tbody>
            </table>

            {/* No Data Message */}
            {!roomDetails.category && !roomDetails.subCategory && 
             roomDetails.names.length === 0 && roomDetails.dimensions.length === 0 && (
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
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the project "{projectData?.name || 'Unnamed Project'}"? 
              This action cannot be undone and will permanently remove:
            </p>
            <ul className="text-gray-600 mb-6 ml-4 list-disc">
              <li>Project data and details</li>
              <li>3D model files</li>
              <li>Preview images</li>
            </ul>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete Project
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
  
  // Handle project deletion with improved error handling and user feedback
  const handleDeleteProject = async (id) => {
    if (!id) {
      console.error('No project ID provided for deletion');
      return;
    }
    
    try {
      setDeleteStatus({ loading: true, error: null });
      console.log('Starting deletion process for project:', id);
      
      const storage = getStorage();
      const deletionTasks = [];
      
      // 1. Delete 3D model file if exists
      if (projectData?.usdFileUrl && !projectData.usdFileUrl.startsWith('http')) {
        const modelRef = storageRef(storage, projectData.usdFileUrl);
        deletionTasks.push(
          deleteObject(modelRef)
            .then(() => console.log('✓ 3D model file deleted'))
            .catch(err => console.warn('⚠ Could not delete 3D model file:', err.message))
        );
      }
      
      // 2. Delete preview image if exists
      if (projectData?.previewImageUrl && projectData.previewImageUrl.includes('projects')) {
        const previewPath = `projects/${id}/preview.png`;
        const previewRef = storageRef(storage, previewPath);
        deletionTasks.push(
          deleteObject(previewRef)
            .then(() => console.log('✓ Preview image deleted'))
            .catch(err => console.warn('⚠ Could not delete preview image:', err.message))
        );
      }
      
      // Execute all file deletions in parallel
      await Promise.allSettled(deletionTasks);
      
      // 3. Delete the project document from Firestore
      const projectRef = doc(db, "projects", id);
      await deleteDoc(projectRef);
      console.log('✓ Project document deleted from Firestore');
      
      // 4. Success - navigate to user details page
      setDeleteStatus({ loading: false, error: null });
      console.log('✓ Project deletion completed successfully');
      
      // Navigate to user details page to show remaining projects
      navigate('/dashboard', { 
        replace: true,
        state: { 
          message: `Project "${projectData?.name || 'Unnamed Project'}" has been deleted successfully.`,
          type: 'success'
        }
      });
      
    } catch (err) {
      console.error('✗ Error during project deletion:', err);
      setDeleteStatus({ 
        loading: false, 
        error: err.message || 'An unexpected error occurred while deleting the project'
      });
      
      // Show error alert
      alert(`Failed to delete project: ${err.message}`);
    }
  };
  
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) {
        setError("No project ID provided");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
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
            const fileRef = storageRef(storage, projectData.usdFileUrl);
            
            // Try to get metadata for format detection
            try {
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
            
            // If no format detected from metadata, determine from URL
            if (!modelFormat) {
              const fileExtension = modelUrl.split('?')[0].split('.').pop().toLowerCase();
              const formatMap = {
                'glb': 'model/gltf-binary',
                'gltf': 'model/gltf+json',
                'usdz': 'model/vnd.usdz+zip'
              };
              setModelFormat(formatMap[fileExtension] || null);
            }
          } catch (e) {
            console.error('Could not load model URL:', e);
          }
        }
        
        // Set project data with all required fields
        setProjectData({
          id: projectId,
          name: projectData.name || 'Unnamed Project',
          description: projectData.description || '',
          category: projectData.category || '',
          subCategory: projectData.subCategory || '',
          roomData: projectData.roomData || [],
          usdFileUrl: modelUrl,
          modelFormat: modelFormat,
          previewImageUrl: projectData.previewImageUrl || null
        });
        
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError("Failed to load project data. Please try again.");
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
        </div>  
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Loading project data...</p>
            </div>
          </div>
        ) : deleteStatus.loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-white">Deleting project...</p>
              <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500 text-white rounded-lg">
            <h3 className="font-bold mb-2">Error</h3>
            <p>{error}</p>
            <button 
              onClick={() => navigate('/user-details')}
              className="mt-3 bg-white text-red-500 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
            >
              Go Back to Projects
            </button>
          </div>
        ) : deleteStatus.error ? (
          <div className="p-4 bg-red-500 text-white rounded-lg">
            <h3 className="font-bold mb-2">Deletion Failed</h3>
            <p>Error deleting project: {deleteStatus.error}</p>
            <div className="mt-3 space-x-2">
              <button 
                onClick={() => setDeleteStatus({ loading: false, error: null })}
                className="bg-white text-red-500 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={() => navigate('/user-details')}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
            </div>
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