import { useState, useEffect, useRef } from 'react';
import SideBar from '../../Components/SideBar';
import TopBar from '../../Components/TopBar';
import { Edit, Trash2 } from 'lucide-react';
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
  
  // Process room details from roomData array
  const processRoomDetails = () => {
    const details = [];
    
    // Add category if available
    if (projectData?.category) {
      details.push({ category: "Category", value: projectData.category });
    }
    
    // Process roomData array
    if (projectData?.roomData && Array.isArray(projectData.roomData)) {
      console.log("Room data for display:", projectData.roomData);
      
      // Extract data from roomData array
      projectData.roomData.forEach((item, index) => {
        // Handle different data formats within roomData
        if (item && typeof item === 'object') {
          // If item is an object with name/value pairs
          if (item.name && item.value !== undefined) {
            details.push({ category: item.name, value: item.value });
          }
          // If item is an object with other properties
          else {
            // Extract all properties from the object
            Object.entries(item).forEach(([key, value]) => {
              // Format the key for display (capitalize first letter, add spaces before capitals)
              const formattedKey = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());
              
              details.push({ category: formattedKey, value: value });
            });
          }
        }
        // If item is a primitive value (string, number)
        else if (item !== undefined) {
          // Use predefined labels based on index position
          const labels = ["Dimensions", "Name", "Value", "Property"];
          const label = index < labels.length ? labels[index] : `Property ${index + 1}`;
          details.push({ category: label, value: item });
        }
      });
    }
    
    return details;
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
          <table className="w-full h-full font-SFProDisplay">
            <tbody>
              {roomDetails.length > 0 ? (
                roomDetails.map((detail, index) => (
                  <tr key={index} className="">
                    <td className="text-left py-1 px-2 font-[400] text-[#090D00]">{detail.category}</td>
                    <td className="text-right py-1 px-2 font-medium text-[#090D00]">{detail.value}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center py-4 text-gray-500">No room details available</td>
                </tr>
              )}
            </tbody>
          </table>
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



// import { useState, useEffect, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Edit, Trash2 } from 'lucide-react';
// import SideBar from '../../Components/SideBar';
// import TopBar from '../../Components/TopBar';
// import { db } from '../../firebase';
// import { doc, getDoc } from 'firebase/firestore';
// import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
// import '@google/model-viewer';
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// // Enhanced USDZ Viewer that combines model-viewer with Three.js for better USDZ support
// function ModelViewer({ modelUrl }) {
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [fallbackMode, setFallbackMode] = useState(false);
//   const [isUSDZ, setIsUSDZ] = useState(false);
//   const [isIOSDevice, setIsIOSDevice] = useState(false);
//   const [useThreeJS, setUseThreeJS] = useState(false);
  
//   // Refs for Three.js implementation
//   const containerRef = useRef(null);
//   const rendererRef = useRef(null);
//   const sceneRef = useRef(null);
//   const cameraRef = useRef(null);
//   const controlsRef = useRef(null);
//   const animationFrameRef = useRef(null);
//   const clockRef = useRef(new THREE.Clock());
//   const usdzLoaderRef = useRef(null);
//   const modelGroupRef = useRef(null);
  
//   // Detect iOS device
//   useEffect(() => {
//     const checkIsIOS = () => {
//       const userAgent = navigator.userAgent || navigator.vendor || window.opera;
//       return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
//     };
    
//     setIsIOSDevice(checkIsIOS());
//   }, []);
  
//   // Detect file type and set up model loading
//   useEffect(() => {
//     if (!modelUrl) {
//       setError('No model URL provided');
//       setIsLoading(false);
//       setFallbackMode(true);
//       return;
//     }
    
//     // Reset state when model URL changes
//     setError(null);
//     setIsLoading(true);
//     setFallbackMode(false);
    
//     // Check if it's a USDZ file
//     const isUSDZFile = modelUrl.toLowerCase().endsWith('.usdz');
//     setIsUSDZ(isUSDZFile);
    
//     // If it's a USDZ file and not on iOS, use Three.js
//     if (isUSDZFile && !isIOSDevice) {
//       console.log('USDZ file on non-iOS device - using Three.js viewer');
//       setUseThreeJS(true);
      
//       // Try to load Three.js USDZ loader
//       import('three-usdz-loader').then(({ USDZLoader }) => {
//         // We have the loader, initialize Three.js scene
//         usdzLoaderRef.current = new USDZLoader('/wasm');
//         initThreeJSScene();
//       }).catch(err => {
//         console.error("Failed to load USDZ loader:", err);
//         setError("Failed to load USDZ loader");
//         setFallbackMode(true);
//         setIsLoading(false);
//       });
//     } else {
//       setUseThreeJS(false);
//     }
//   }, [modelUrl, isIOSDevice]);

//   // Initialize Three.js scene for USDZ files
//   const initThreeJSScene = () => {
//     if (!containerRef.current || !usdzLoaderRef.current) return;
    
//     try {
//       // Clean up any existing scene
//       cleanupThreeJSScene();
      
//       // Create scene
//       const scene = new THREE.Scene();
//       scene.background = new THREE.Color(0x000000);
//       sceneRef.current = scene;

//       // Create camera
//       const camera = new THREE.PerspectiveCamera(
//         75,
//         containerRef.current.clientWidth / containerRef.current.clientHeight,
//         0.1,
//         1000
//       );
//       camera.position.z = 5;
//       cameraRef.current = camera;

//       // Create renderer
//       const renderer = new THREE.WebGLRenderer({ antialias: true });
//       renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
//       renderer.setPixelRatio(window.devicePixelRatio);
//       renderer.shadowMap.enabled = true;
//       containerRef.current.appendChild(renderer.domElement);
//       rendererRef.current = renderer;

//       // Add controls
//       const controls = new OrbitControls(camera, renderer.domElement);
//       controls.enableDamping = true;
//       controlsRef.current = controls;

//       // Add lights
//       const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
//       scene.add(ambientLight);

//       const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
//       directionalLight.position.set(1, 1, 1);
//       directionalLight.castShadow = true;
//       scene.add(directionalLight);

//       // Create a group to hold the model
//       const modelGroup = new THREE.Group();
//       scene.add(modelGroup);
//       modelGroupRef.current = modelGroup;

//       // Start animation loop
//       const animate = () => {
//         animationFrameRef.current = requestAnimationFrame(animate);
        
//         if (controlsRef.current) {
//           controlsRef.current.update();
//         }
        
//         if (sceneRef.current && cameraRef.current && rendererRef.current) {
//           rendererRef.current.render(sceneRef.current, cameraRef.current);
//         }
//       };
      
//       animate();

//       // Load the model
//       loadModelWithThreeJS();
      
//       // Handle window resize
//       const handleResize = () => {
//         if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
        
//         const width = containerRef.current.clientWidth;
//         const height = containerRef.current.clientHeight;
        
//         cameraRef.current.aspect = width / height;
//         cameraRef.current.updateProjectionMatrix();
//         rendererRef.current.setSize(width, height);
//       };

//       window.addEventListener('resize', handleResize);
      
//       // Return cleanup function
//       return () => {
//         window.removeEventListener('resize', handleResize);
//         cleanupThreeJSScene();
//       };
//     } catch (err) {
//       console.error("Failed to initialize Three.js scene:", err);
//       setError("Failed to initialize 3D viewer");
//       setFallbackMode(true);
//       setIsLoading(false);
//     }
//   };

//   // Load the USDZ model using Three.js
//   const loadModelWithThreeJS = async () => {
//     if (!usdzLoaderRef.current || !modelGroupRef.current || !sceneRef.current) {
//       setError("3D viewer not initialized properly");
//       setFallbackMode(true);
//       setIsLoading(false);
//       return;
//     }

//     try {
//       // Fetch the model file
//       const response = await fetch(modelUrl);
//       const blob = await response.blob();
//       const file = new File([blob], "model.usdz");
      
//       // Load the USDZ file
//       const usdzInstance = await usdzLoaderRef.current.loadFile(file, modelGroupRef.current);
      
//       // Auto-center and adjust camera to fit the model
//       const box = new THREE.Box3().setFromObject(modelGroupRef.current);
//       const center = box.getCenter(new THREE.Vector3());
//       const size = box.getSize(new THREE.Vector3());
      
//       // Center the model
//       modelGroupRef.current.position.sub(center);
      
//       // Adjust camera
//       const maxDim = Math.max(size.x, size.y, size.z);
//       const fov = cameraRef.current.fov * (Math.PI / 180);
//       let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
      
//       // Add some padding
//       cameraDistance *= 1.5;
      
//       cameraRef.current.position.z = cameraDistance;
//       if (controlsRef.current) {
//         controlsRef.current.target.set(0, 0, 0);
//         controlsRef.current.update();
//       }
      
//       setIsLoading(false);
//     } catch (err) {
//       console.error("Failed to load USDZ file with Three.js:", err);
//       setError("Failed to load 3D model");
//       setFallbackMode(true);
//       setIsLoading(false);
//     }
//   };

//   // Clean up Three.js resources
//   const cleanupThreeJSScene = () => {
//     if (animationFrameRef.current) {
//       cancelAnimationFrame(animationFrameRef.current);
//       animationFrameRef.current = null;
//     }
    
//     if (rendererRef.current && rendererRef.current.domElement && containerRef.current) {
//       containerRef.current.removeChild(rendererRef.current.domElement);
//       rendererRef.current.dispose();
//       rendererRef.current = null;
//     }
    
//     if (sceneRef.current) {
//       // Dispose of all geometries and materials
//       sceneRef.current.traverse((object) => {
//         if (object.geometry) object.geometry.dispose();
//         if (object.material) {
//           if (Array.isArray(object.material)) {
//             object.material.forEach(material => material.dispose());
//           } else {
//             object.material.dispose();
//           }
//         }
//       });
      
//       // Clear the scene
//       while (sceneRef.current.children.length > 0) {
//         sceneRef.current.remove(sceneRef.current.children[0]);
//       }
      
//       sceneRef.current = null;
//     }
    
//     modelGroupRef.current = null;
//   };

//   // Handle errors from the model-viewer
//   const handleModelViewerError = (event) => {
//     console.error('Model-viewer error:', event.detail);
//     setError(`Failed to load model: ${event.detail.type || 'Unknown error'}`);
//     setFallbackMode(true);
//     setIsLoading(false);
//   };

//   // Handle when model is loaded successfully
//   const handleModelLoad = () => {
//     console.log('Model loaded successfully');
//     setIsLoading(false);
//   };

//   // Simple fallback component that shows the error message
//   const FallbackComponent = () => (
//     <div className="w-full h-full flex flex-col items-center justify-center bg-[#000000] p-4">
//       <p className="text-white text-sm mb-2">Failed to load 3D model</p>
//       {error && <p className="text-red-400 text-xs">{error}</p>}
      
//       {isUSDZ && (
//         <p className="text-white text-xs mt-2">
//           USDZ files are best viewed on iOS devices
//         </p>
//       )}
//     </div>
//   );

//   // Loading indicator
//   const LoadingIndicator = () => (
//     <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
//       <p className="text-white">Loading 3D model...</p>
//     </div>
//   );

//   // Simple USDZ fallback viewer (used when three.js initialization fails)
//   const SimpleUSDZViewer = () => (
//     <div className="w-full h-full flex flex-col items-center justify-center bg-[#000000] p-4">
//       <p className="text-white text-sm mb-4">USDZ Model</p>
//       <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
//         <span className="text-white text-xs">3D</span>
//       </div>
//       <p className="text-white text-xs text-center">
//         USDZ files are best viewed on iOS devices.
//         <br />
//         <a 
//           href={modelUrl} 
//           download 
//           className="text-blue-400 hover:underline mt-2 inline-block"
//         >
//           Download model
//         </a>
//       </p>
//     </div>
//   );

//   // Determine what to render
//   if (fallbackMode) {
//     return <FallbackComponent />;
//   }
  
//   // For USDZ files on non-iOS that need Three.js rendering
//   if (isUSDZ && !isIOSDevice && useThreeJS) {
//     return (
//       <div className="relative w-full h-full" ref={containerRef}>
//         {isLoading && <LoadingIndicator />}
//       </div>
//     );
//   }
  
//   // For USDZ files on non-iOS where Three.js failed to initialize
//   if (isUSDZ && !isIOSDevice && !useThreeJS) {
//     return <SimpleUSDZViewer />;
//   }
  
//   // Otherwise use model-viewer with appropriate settings
//   return (
//     <div className="relative w-full h-full">
//       <model-viewer
//         src={isUSDZ ? "" : modelUrl}   // For USDZ, leave src empty
//         ios-src={isUSDZ ? modelUrl : ""} // Only set ios-src for USDZ files
//         alt="3D Model"
//         camera-controls
//         auto-rotate
//         shadow-intensity="1"
//         style={{
//           width: '100%',
//           height: '270px',
//           backgroundColor: '#000000'
//         }}
//         onLoad={handleModelLoad}
//         onError={handleModelViewerError}
//       ></model-viewer>
      
//       {isLoading && <LoadingIndicator />}
//     </div>
//   );
// }

// function RoomMeasurementInterface({ projectData }) {
//   const navigate = useNavigate();
  
//   const roomDetails = [
//     { category: "Category", value: projectData?.category || "N/A" },
//     { category: "Certainty", value: projectData?.certainty || "N/A" },
//     { category: "Left Wall Width", value: projectData?.leftWallWidth || "N/A" },
//     { category: "Right Wall Width", value: projectData?.rightWallWidth || "N/A" },
//     { category: "Wall Height", value: projectData?.wallHeight || "N/A" },
//     { category: "Surface Area", value: projectData?.surfaceArea || "N/A" },
//     { category: "Window", value: projectData?.windows || "N/A" },
//   ];
  
//   return (
//     <div className="min-h-screen max-w-[22rem] md:max-w-5xl xl:max-w-7xl bg-[#1E3A5F] rounded-xl">
//       {/* Project Name and Description Section */}
//       <div className="p-4 border-b border-white flex items-center justify-between">
//         <div className='flex flex-col gap-5 font-monrope'>
//           <h1 className='font-[700] text-2xl md:text-[31px]'>{projectData?.name || 'Unnamed Project'}</h1>
//           <h3 className='font-[500] text-sm md:text-[20px]'>{projectData?.description || 'No description available'}</h3>
//         </div>
      
//         <div className="flex items-center justify-center gap-3 font-Urbanist h-12">
//           <button 
//             onClick={() => navigate(`/edit-project/${projectData?.id}`)}
//             className="bg-[#1E3A5F] border border-white text-white px-3 py-1 rounded-lg text-sm flex items-center"
//           >
//             <Edit size={16} className="mr-1" /> Edit
//           </button>
//           <button className="bg-[#FB0000] border border-[#FB0000] text-white px-3 py-1 rounded-lg text-sm flex items-center">
//             <Trash2 size={16} className="mr-1" /> Delete
//           </button>
//         </div>
//       </div>

//       <div className='flex flex-col md:flex-row justify-between gap-5 max-w-[61rem] mt-10 md:mt-20 mx-auto'>
//         {/* 3D Model Viewer */}
//         <div className="md:w-[405px] md:h-[270px] max-w-sm bg-[#000000] rounded-xl overflow-hidden">
//           {projectData?.usdFileUrl ? (
//             <ModelViewer 
//               modelUrl={projectData.usdFileUrl} 
//             />
//           ) : (
//             <div className="w-full h-full flex items-center justify-center">
//               <p className="text-white text-sm">No 3D model available</p>
//             </div>
//           )}
//         </div>
  
//         {/* Room Details Table */}
//         <div className="p-4 md:w-[583px] md:h-[370px] max-w-sm rounded-3xl bg-white">
//           <table className="w-full h-full font-SFProDisplay">
//             <tbody>
//               {roomDetails.map((detail, index) => (
//                 <tr key={index} className="">
//                   <td className="text-left py-1 px-2 font-[400] text-[#090D00]">{detail.category}</td>
//                   <td className="text-right py-1 px-2 font-medium text-[#090D00]">{detail.value}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// function ProjectDetails() {
//   const { projectId } = useParams();
//   const [projectData, setProjectData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();
  
//   useEffect(() => {
//     const fetchProjectData = async () => {
//       if (!projectId) return;
      
//       try {
//         setLoading(true);
//         // 1. Fetch project document
//         const projectRef = doc(db, "projects", projectId);
//         const projectSnap = await getDoc(projectRef);
        
//         if (!projectSnap.exists()) {
//           setError("Project not found");
//           return;
//         }
        
//         const projectData = projectSnap.data();
        
//         // 2. If there's a 3D model URL, get the download URL
//         let modelUrl = null;
//         if (projectData.usdFileUrl) {
//           try {
//             const storage = getStorage();
//             // Get file reference
//             const fileRef = storageRef(storage, projectData.usdFileUrl);
            
//             // Get download URL
//             modelUrl = await getDownloadURL(fileRef);
//             console.log('Retrieved model URL:', modelUrl);
//           } catch (e) {
//             console.error('Could not load model URL:', e);
//           }
//         }
        
//         // Set project data with all required fields
//         setProjectData({
//           id: projectId,
//           name: projectData.name || 'Unnamed Project',
//           description: projectData.description || '',
//           category: projectData.category || '',
//           certainty: projectData.certainty || '',
//           leftWallWidth: projectData.leftWallWidth || '',
//           rightWallWidth: projectData.rightWallWidth || '',
//           wallHeight: projectData.wallHeight || '',
//           surfaceArea: projectData.surfaceArea || '',
//           windows: projectData.windows || '',
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
//   }, [projectId]);

//   return (
//     <div className="flex min-h-screen h-full bg-black text-white">
//       <SideBar />
//       <div className="flex-1 p-6">
//         <TopBar />
//         <div className="flex justify-between font-DMSansRegular items-center mb-6">
//           <h1 className="text-2xl md:text-3xl font-[500]">Project Details</h1>
//           <button
//             onClick={() => navigate(-1)}
//             className="bg-[#1E3A5F] text-white py-2 px-4 rounded-md"
//           >
//             Back
//           </button>
//         </div>  
        
//         {loading ? (
//           <div className="flex items-center justify-center h-64">
//             <p className="text-white">Loading project data...</p>
//           </div>
//         ) : error ? (
//           <div className="p-4 bg-red-500 text-white rounded-lg">
//             {error}
//           </div>
//         ) : (
//           <RoomMeasurementInterface 
//             projectData={projectData} 
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// export default ProjectDetails;