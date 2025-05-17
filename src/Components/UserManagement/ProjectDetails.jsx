// import { useState, useEffect, useRef } from 'react';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import SideBar from '../../Components/SideBar';
// import TopBar from '../../Components/TopBar';
// import { Edit, Trash2 } from 'lucide-react';
// import {  useParams, useNavigate } from 'react-router-dom';
// import { db } from '../../firebase';
// import { doc, getDoc } from 'firebase/firestore';
// import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
// import '@google/model-viewer';
// import JSZip from 'jszip';
// import * as THREE from 'three';


// // A more robust ModelViewer component that handles USDZ files better
// function ModelViewer({ modelUrl }) {
//   const [status, setStatus] = useState('loading'); // loading, error, success, fallback
//   const [processedUrl, setProcessedUrl] = useState(null);
//   const [modelType, setModelType] = useState('auto');
//   const [previewImageUrl, setPreviewImageUrl] = useState(null);
//   const threeContainerRef = useRef(null);
//   const rendererRef = useRef(null);

//   // Clean up Three.js resources on unmount
//   useEffect(() => {
//     return () => {
//       if (rendererRef.current) {
//         rendererRef.current.dispose();
//       }
      
//       // Clean up any blob URLs
//       if (processedUrl && processedUrl.startsWith('blob:')) {
//         URL.revokeObjectURL(processedUrl);
//       }
//       if (previewImageUrl && previewImageUrl.startsWith('blob:')) {
//         URL.revokeObjectURL(previewImageUrl);
//       }
//     };
//   }, [processedUrl, previewImageUrl]);

//   // Initialize Three.js scene when in fallback mode
//   useEffect(() => {
//     if (status === 'fallback' && threeContainerRef.current) {
//       if (previewImageUrl) {
//         // If we have a preview image, use that instead of 3D
//         showPreviewImage();
//       } else {
//         // Otherwise create a 3D visualization
//         initCustomRoomModel();
//       }
//     }
//   }, [status, previewImageUrl]);

//   // Process the model URL
//   useEffect(() => {
//     if (!modelUrl) {
//       setStatus('error');
//       return;
//     }

//     processModelFile(modelUrl);
//   }, [modelUrl]);

//   // Display a preview image extracted from USDZ
//   const showPreviewImage = () => {
//     if (!threeContainerRef.current || !previewImageUrl) return;
    
//     // Clear any existing content
//     threeContainerRef.current.innerHTML = '';
    
//     // Create image element
//     const img = document.createElement('img');
//     img.src = previewImageUrl;
//     img.alt = "3D Model Preview";
//     img.style.width = '100%';
//     img.style.height = '100%';
//     img.style.objectFit = 'contain';
    
//     // Add a label to indicate it's a preview
//     const label = document.createElement('div');
//     label.style.position = 'absolute';
//     label.style.bottom = '8px';
//     label.style.right = '8px';
//     label.style.backgroundColor = 'rgba(0,0,0,0.7)';
//     label.style.color = 'white';
//     label.style.padding = '4px 8px';
//     label.style.borderRadius = '4px';
//     label.style.fontSize = '12px';
//     label.innerText = '3D Preview';
    
//     // Create a container for the image and label
//     const container = document.createElement('div');
//     container.style.position = 'relative';
//     container.style.width = '100%';
//     container.style.height = '100%';
    
//     // Append elements
//     container.appendChild(img);
//     container.appendChild(label);
//     threeContainerRef.current.appendChild(container);
//   };

//   // Create a custom 3D visualization based on room dimensions
//   const initCustomRoomModel = () => {
//     if (!threeContainerRef.current) return;
    
//     // Clear any existing content
//     threeContainerRef.current.innerHTML = '';
    
//     // Set up scene
//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color(0x202022);
    
//     // Create a realistic room model with walls based on the mobile scan
//     const roomWidth = 4;
//     const roomLength = 4; 
//     const roomHeight = 2.5;
    
//     // Create the walls - simulating the layout from the image
//     const createWalls = () => {
//       // Group to hold all walls
//       const wallsGroup = new THREE.Group();
      
//       // Wall material - light gray
//       const wallMaterial = new THREE.MeshStandardMaterial({ 
//         color: 0xd8d8d8,
//         roughness: 0.9,
//         metalness: 0.1
//       });
      
//       // Floor material - slightly darker
//       const floorMaterial = new THREE.MeshStandardMaterial({ 
//         color: 0xb5b5b5,
//         roughness: 0.8,
//         metalness: 0.1
//       });
      
//       // Create floor
//       const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomLength);
//       const floor = new THREE.Mesh(floorGeometry, floorMaterial);
//       floor.rotation.x = -Math.PI / 2;
//       floor.position.y = -roomHeight/2;
//       wallsGroup.add(floor);
      
//       // Back wall (with opening for door or window)
//       const backWallGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, 0.1);
//       const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
//       backWall.position.z = -roomLength/2;
//       wallsGroup.add(backWall);
      
//       // Right side wall (partial)
//       const rightWallGeometry = new THREE.BoxGeometry(0.1, roomHeight, roomLength * 0.6);
//       const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
//       rightWall.position.x = roomWidth/2;
//       rightWall.position.z = -roomLength * 0.2;
//       wallsGroup.add(rightWall);
      
//       // Left side wall
//       const leftWallGeometry = new THREE.BoxGeometry(0.1, roomHeight, roomLength);
//       const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
//       leftWall.position.x = -roomWidth/2;
//       wallsGroup.add(leftWall);
      
//       // Front wall (bottom - similar to the image)
//       const frontWallLowerGeometry = new THREE.BoxGeometry(roomWidth * 0.7, roomHeight * 0.4, 0.1);
//       const frontWallLower = new THREE.Mesh(frontWallLowerGeometry, wallMaterial);
//       frontWallLower.position.z = roomLength/2;
//       frontWallLower.position.y = -roomHeight * 0.3;
//       wallsGroup.add(frontWallLower);
      
//       // Add window-like openings to match the image
//       const windowGeometry = new THREE.BoxGeometry(roomWidth * 0.3, roomHeight * 0.3, 0.05);
//       const windowMaterial = new THREE.MeshStandardMaterial({ 
//         color: 0xffffff, 
//         transparent: true,
//         opacity: 0.3,
//         roughness: 0.1,
//         metalness: 0.9
//       });
//       const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
//       window1.position.x = -roomWidth * 0.25;
//       window1.position.y = 0;
//       window1.position.z = -roomLength/2;
//       wallsGroup.add(window1);
      
//       return wallsGroup;
//     };
    
//     // Add the walls
//     const walls = createWalls();
//     scene.add(walls);
    
//     // Add a highlight to show the room's shape more clearly
//     const edgesGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(roomWidth, roomHeight, roomLength));
//     const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x4080ff, linewidth: 2 });
//     const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
//     scene.add(edges);
    
//     // Add lighting
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
//     scene.add(ambientLight);
    
//     const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
//     directionalLight.position.set(1, 1, 1);
//     scene.add(directionalLight);
    
//     // Add a subtle point light inside the room
//     const pointLight = new THREE.PointLight(0xf0f0ff, 1, 10);
//     pointLight.position.set(0, 0, 0);
//     scene.add(pointLight);
    
//     // Set up camera
//     const camera = new THREE.PerspectiveCamera(
//       45, 
//       threeContainerRef.current.clientWidth / threeContainerRef.current.clientHeight, 
//       0.1, 
//       1000
//     );
//     camera.position.set(5, 3, 5);
//     camera.lookAt(0, 0, 0);
    
//     // Create renderer
//     const renderer = new THREE.WebGLRenderer({ antialias: true });
//     renderer.setSize(
//       threeContainerRef.current.clientWidth, 
//       threeContainerRef.current.clientHeight
//     );
//     renderer.setPixelRatio(window.devicePixelRatio);
//     threeContainerRef.current.appendChild(renderer.domElement);
    
//     // Add orbit controls
//     const controls = new OrbitControls(camera, renderer.domElement);
//     controls.enableDamping = true;
//     controls.dampingFactor = 0.05;
//     controls.minDistance = 3;
//     controls.maxDistance = 10;
    
//     // Animation loop
//     const animate = () => {
//       requestAnimationFrame(animate);
//       controls.update();
//       renderer.render(scene, camera);
//     };
//     animate();
    
//     // Store renderer for cleanup
//     rendererRef.current = renderer;
    
//     // Handle window resizing
//     const handleResize = () => {
//       if (!threeContainerRef.current) return;
      
//       camera.aspect = threeContainerRef.current.clientWidth / threeContainerRef.current.clientHeight;
//       camera.updateProjectionMatrix();
//       renderer.setSize(
//         threeContainerRef.current.clientWidth, 
//         threeContainerRef.current.clientHeight
//       );
//     };
    
//     window.addEventListener('resize', handleResize);
    
//     return () => {
//       window.removeEventListener('resize', handleResize);
//     };
//   };

//   // Process and convert model file if needed
//   const processModelFile = async (fileUrl) => {
//     setStatus('loading');
    
//     try {
//       // 1. Fetch the file
//       const response = await fetch(fileUrl);
//       const contentType = response.headers.get('content-type');
//       console.log(`File content type: ${contentType}`);
      
//       // Check if it's already a supported format for model-viewer
//       if (contentType && (
//           contentType.includes('model/gltf') || 
//           contentType.includes('model/gltf-binary') ||
//           contentType.includes('application/octet-stream')
//         )) {
//         // It's a compatible format
//         setProcessedUrl(fileUrl);
//         setModelType(contentType.includes('gltf-binary') ? 'glb' : 'gltf');
//         setStatus('success');
//         return;
//       }
      
//       // If it's a USDZ file (ZIP archive)
//       if (contentType && (
//           contentType.includes('model/vnd.usdz+zip') || 
//           contentType.includes('application/zip') || 
//           fileUrl.toLowerCase().endsWith('.usdz')
//         )) {
        
//         try {
//           // Try to process the USDZ file
//           const arrayBuffer = await response.arrayBuffer();
//           await handleUSDZFile(arrayBuffer);
//         } catch (err) {
//           console.error('Error processing USDZ:', err);
//           // If USDZ processing fails, go to fallback
//           setStatus('fallback');
//         }
//       } else if (contentType && contentType.includes('model/vnd.usd') || 
//                 fileUrl.toLowerCase().match(/\.(usd|usda|usdc)$/)) {
//         // Handle raw USD file
//         console.log('Raw USD file detected, using fallback visualization');
//         setStatus('fallback');
//       } else {
//         // Unknown format - try direct loading first
//         console.log('Unknown format, attempting to use directly:', contentType);
//         try {
//           setProcessedUrl(fileUrl);
//           setModelType('auto');
//           setStatus('success');
//         } catch (e) {
//           console.error('Failed to use unknown format directly:', e);
//           setStatus('fallback');
//         }
//       }
//     } catch (err) {
//       console.error('Error processing model file:', err);
//       setStatus('fallback');
//     }
//   };

//   // Handle USDZ file extraction
//   const handleUSDZFile = async (arrayBuffer) => {
//     try {
//       // First, try to extract preview image or other content from the USDZ file
//       try {
//         // Load the zip file
//         const zip = new JSZip();
//         const contents = await zip.loadAsync(arrayBuffer);
        
//         console.log('USDZ contents:', Object.keys(contents.files));
        
//         // Extract preview image if available
//         const imageTypes = ['.png', '.jpg', '.jpeg'];
//         const imageFile = Object.keys(contents.files).find(filename => 
//           imageTypes.some(ext => filename.toLowerCase().endsWith(ext)) && 
//           !contents.files[filename].dir
//         );
        
//         if (imageFile) {
//           // Use image from USDZ as preview
//           const imageData = await contents.files[imageFile].async('blob');
//           const imageURL = URL.createObjectURL(imageData);
//           console.log('Found preview image in USDZ:', imageFile);
//           setPreviewImageUrl(imageURL);
//         }
        
//         // Look for GLB file in the USDZ package (rare but possible)
//         const glbFile = Object.keys(contents.files).find(filename => 
//           filename.toLowerCase().endsWith('.glb') && !contents.files[filename].dir
//         );
        
//         if (glbFile) {
//           // Extract GLB file
//           const fileData = await contents.files[glbFile].async('blob');
//           const fileURL = URL.createObjectURL(fileData);
//           setProcessedUrl(fileURL);
//           setModelType('glb');
//           setStatus('success');
//           console.log('Found and extracted GLB from USDZ');
//           return;
//         }
//       } catch (zipErr) {
//         console.warn('Error extracting USDZ as ZIP:', zipErr);
//         // Continue to fallback if ZIP extraction fails
//       }
      
//       // If we get here, we couldn't extract usable content from the USDZ
//       // Fall back to our custom visualization
//       setStatus('fallback');
//     } catch (err) {
//       console.error('Error in USDZ processing:', err);
//       setStatus('fallback');
//     }
//   };

//   // Render the appropriate viewer based on status
//   return (
//     <>
//       {status === 'loading' && (
//         <div className="w-full h-full flex items-center justify-center bg-[#202022]">
//           <p className="text-white text-sm">Loading 3D model...</p>
//         </div>
//       )}
      
//       {status === 'error' && (
//         <div className="w-full h-full flex items-center justify-center bg-[#202022]">
//           <p className="text-white text-sm">Failed to load 3D model</p>
//         </div>
//       )}
      
//       {status === 'fallback' && (
//         <div 
//           ref={threeContainerRef}
//           className="w-full h-full bg-[#202022]"
//           style={{ width: '100%', height: '270px' }}
//         />
//       )}
      
//       {status === 'success' && processedUrl && (
//         <model-viewer
//           src={processedUrl}
//           alt="3D Model"
//           camera-controls
//           auto-rotate
//           ar
//           format={modelType}
//           style={{
//             width: '100%',
//             height: '270px',
//             backgroundColor: '#202022'
//           }}
//           onError={(error) => {
//             console.error('Model viewer error:', error);
//             setStatus('fallback');
//           }}
//         ></model-viewer>
//       )}
//     </>
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
//         <div className="md:w-[405px] md:h-[270px] max-w-sm bg-[#202022] rounded-xl overflow-hidden">
//           {projectData?.usdFileUrl ? (
//             <ModelViewer modelUrl={projectData.usdFileUrl} />
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
//             modelUrl = await getDownloadURL(
//               storageRef(storage, projectData.usdFileUrl)
//             );
//           } catch (e) {
//             console.warn('Could not load model URL:', e);
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
//           usdFileUrl: modelUrl
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
//           <RoomMeasurementInterface projectData={projectData} />
//         )}
//       </div>
//     </div>
//   );
// }

// export default ProjectDetails;






import { useState, useEffect, useRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import SideBar from '../../Components/SideBar';
import TopBar from '../../Components/TopBar';
import { Edit, Trash2, QrCode, Camera, Info } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, getDownloadURL, uploadBytes } from 'firebase/storage';
import '@google/model-viewer';
import JSZip from 'jszip';
import * as THREE from 'three';

// Add QR code component
function ModelQRDisplay({ modelUrl, projectName }) {
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [showQR, setShowQR] = useState(false);
  
  useEffect(() => {
    if (modelUrl && showQR) {
      // Generate QR code using a free QR code API
      const encodedUrl = encodeURIComponent(modelUrl);
      const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedUrl}`;
      setQrCodeUrl(qrApi);
    }
  }, [modelUrl, showQR]);
  
  if (!modelUrl) return null;
  
  return (
    <div className="absolute bottom-3 right-3 z-10">
      {!showQR ? (
        <button 
          onClick={() => setShowQR(true)}
          className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs flex items-center"
        >
          <QrCode size={16} className="mr-1" /> View QR Code
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-3">
          <div className="flex justify-between items-center mb-2">
            <p className="text-black text-sm font-medium">Scan to view in AR</p>
            <button 
              onClick={() => setShowQR(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          {qrCodeUrl && (
            <img 
              src={qrCodeUrl} 
              alt="QR Code for 3D model" 
              className="w-24 h-24 mb-2"
            />
          )}
          <p className="text-gray-600 text-xs">
            Scan with iOS device
          </p>
          <div className="mt-2">
            <a 
              href={modelUrl}
              rel="ar"
              className="bg-blue-600 text-white px-2 py-1 rounded text-xs block text-center"
            >
              View in AR
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function ModelViewer({ modelUrl, projectData, onUpdatePreview }) {
  const [status, setStatus] = useState('loading');
  const [processedUrl, setProcessedUrl] = useState(null);
  const [modelType, setModelType] = useState('auto');
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [modelError, setModelError] = useState(null);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [showModelInfo, setShowModelInfo] = useState(false);
  const threeContainerRef = useRef(null);
  const rendererRef = useRef(null);
  const canvasRef = useRef(null);

  // Detect iOS device on component mount
  useEffect(() => {
    const checkIsIOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    };
    
    setIsIOSDevice(checkIsIOS());
  }, []);

  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      // Clean up any blob URLs
      if (processedUrl && processedUrl.startsWith('blob:')) {
        URL.revokeObjectURL(processedUrl);
      }
      if (previewImageUrl && previewImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewImageUrl);
      }
    };
  }, [processedUrl, previewImageUrl]);

  // Initialize Three.js scene when in fallback mode
  useEffect(() => {
    if (status === 'fallback' && threeContainerRef.current) {
      // Check if there's an existing preview image in the project data
      if (projectData?.previewImageUrl) {
        console.log('Using stored preview image:', projectData.previewImageUrl);
        setPreviewImageUrl(projectData.previewImageUrl);
        showPreviewImage();
      } else if (previewImageUrl) {
        // If we extracted a preview image
        showPreviewImage();
      } else {
        // Create a 3D visualization based on project data
        initCustomRoomModel();
      }
    }
  }, [status, previewImageUrl, projectData]);

  // Check if project has a preview image
  useEffect(() => {
    if (projectData?.previewImageUrl) {
      setPreviewImageUrl(projectData.previewImageUrl);
    }
  }, [projectData]);

  // Process the model URL
  useEffect(() => {
    if (!modelUrl) {
      console.error('No model URL provided');
      setModelError('No model URL provided');
      setStatus('error');
      return;
    }

    console.log('Processing model URL:', modelUrl);
    
    // Handle differently for iOS devices
    if (isIOSDevice) {
      // For iOS, we can use USDZ directly without processing
      if (modelUrl.toLowerCase().endsWith('.usdz')) {
        console.log('iOS device detected, using USDZ directly');
        setProcessedUrl(modelUrl);
        setModelType('usdz');
        setStatus('success');
      } else {
        // Non-USDZ formats - still process normally
        processModelFile(modelUrl);
      }
    } else {
      // For non-iOS, process normally
      processModelFile(modelUrl);
    }
  }, [modelUrl, isIOSDevice]);

  // Function to capture 3D model view as screenshot
  const captureModelView = () => {
    try {
      // Try to capture from model-viewer if it's active
      if (status === 'success' && processedUrl) {
        const modelViewer = document.querySelector('model-viewer');
        if (modelViewer) {
          // Use the model-viewer's toDataURL method if available
          if (typeof modelViewer.toDataURL === 'function') {
            const screenshot = modelViewer.toDataURL();
            saveScreenshot(screenshot);
            return;
          }
        }
      }
      
      // Fallback to capturing from Three.js canvas
      if (rendererRef.current && rendererRef.current.domElement) {
        try {
          const screenshot = rendererRef.current.domElement.toDataURL('image/png');
          saveScreenshot(screenshot);
          return;
        } catch (canvasErr) {
          console.warn('Error capturing from Three.js canvas:', canvasErr);
        }
      }
      
      // Simple DOM-based screenshot as final fallback
      if (threeContainerRef.current) {
        try {
          // Create a canvas element
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          // Set canvas dimensions to match the container
          const width = threeContainerRef.current.clientWidth;
          const height = threeContainerRef.current.clientHeight;
          canvas.width = width;
          canvas.height = height;
          
          // Draw a simple representation
          // Fill with black background
          context.fillStyle = '#000000';
          context.fillRect(0, 0, width, height);
          
          // Draw a simple room outline in white
          context.strokeStyle = '#ffffff';
          context.lineWidth = 2;
          
          // Draw floor
          context.beginPath();
          context.moveTo(width * 0.2, height * 0.7);
          context.lineTo(width * 0.8, height * 0.7);
          context.lineTo(width * 0.8, height * 0.4);
          context.lineTo(width * 0.2, height * 0.4);
          context.closePath();
          context.stroke();
          
          // Draw walls
          context.beginPath();
          context.moveTo(width * 0.2, height * 0.4);
          context.lineTo(width * 0.2, height * 0.2);
          context.lineTo(width * 0.8, height * 0.2);
          context.lineTo(width * 0.8, height * 0.4);
          context.stroke();
          
          // Add text
          context.fillStyle = '#ffffff';
          context.font = '12px Arial';
          context.fillText('Model Preview', width * 0.35, height * 0.85);
          
          const screenshot = canvas.toDataURL('image/png');
          saveScreenshot(screenshot);
        } catch (fallbackErr) {
          console.error('Error with fallback screenshot:', fallbackErr);
          alert('Could not capture model view. Please try on another device.');
        }
      }
    } catch (err) {
      console.error('Error capturing screenshot:', err);
    }
  };

  // Save screenshot to Firebase
  const saveScreenshot = async (dataUrl) => {
    if (!dataUrl || !projectData?.id) return;
    
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Get storage instance
      const storage = getStorage();
      
      // Upload to Firebase Storage
      const imgRef = storageRef(storage, `projects/${projectData.id}/preview.png`);
      await uploadBytes(imgRef, blob);
      
      // Get the download URL
      const downloadUrl = await getDownloadURL(imgRef);
      
      // Update project document with preview URL
      const projectRef = doc(db, "projects", projectData.id);
      await updateDoc(projectRef, {
        previewImageUrl: downloadUrl
      });
      
      // Update local state
      setPreviewImageUrl(downloadUrl);
      
      // Notify parent component
      if (onUpdatePreview) {
        onUpdatePreview(downloadUrl);
      }
      
      console.log('Model preview saved successfully');
      
      // Switch to showing the preview image
      showPreviewImage();
    } catch (err) {
      console.error('Error saving model preview:', err);
    }
  };

  // Display a preview image
  const showPreviewImage = () => {
    if (!threeContainerRef.current || !previewImageUrl) return;
    
    // Clear any existing content
    threeContainerRef.current.innerHTML = '';
    
    // Create image element
    const img = document.createElement('img');
    img.src = previewImageUrl;
    img.alt = "3D Model Preview";
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    
    // Add a label to indicate it's a preview
    const label = document.createElement('div');
    label.style.position = 'absolute';
    label.style.bottom = '8px';
    label.style.right = '8px';
    label.style.backgroundColor = 'rgba(0,0,0,0.7)';
    label.style.color = 'white';
    label.style.padding = '4px 8px';
    label.style.borderRadius = '4px';
    label.style.fontSize = '12px';
    label.innerText = '3D Preview';
    
    // Create a container for the image and label
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = '100%';
    
    // Append elements
    container.appendChild(img);
    container.appendChild(label);
    threeContainerRef.current.appendChild(container);
  };

  // Create a 3D visualization based on project data
  const initCustomRoomModel = () => {
    if (!threeContainerRef.current) return;
    
    // Clear any existing content
    threeContainerRef.current.innerHTML = '';
    
    // Set up scene with black background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Wall material
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf5f5f5,
      roughness: 0.1,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    // Floor material
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xeeeeee,
      roughness: 0.3,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    
    // Use project data to create a more accurate model
    const createRoom = () => {
      const roomGroup = new THREE.Group();
      
      // Parse dimensions from project data with fallbacks
      const leftWallWidth = parseFloat(projectData?.leftWallWidth) || 2.0;
      const rightWallWidth = parseFloat(projectData?.rightWallWidth) || 2.0;
      const wallHeight = parseFloat(projectData?.wallHeight) || 2.0;
      const hasWindows = (projectData?.windows || "0") !== "0";
      const surfaceArea = parseFloat(projectData?.surfaceArea) || 8.0;
      
      // Calculate room depth based on surface area and wall widths
      // Simplified formula: depth = surfaceArea / (leftWallWidth + rightWallWidth)
      const roomDepth = Math.max(2.0, surfaceArea / ((leftWallWidth + rightWallWidth) / 2));
      
      // Define polygon shape based on project data
      // We'll create a polygon that's more customized to the project dimensions
      const points = [];
      
      // For different room shapes based on category
      const category = projectData?.category?.toLowerCase() || '';
      
      if (category.includes('l-shaped') || category.includes('corner')) {
        // L-shaped room
        points.push(new THREE.Vector2(-leftWallWidth/2, -roomDepth/2));
        points.push(new THREE.Vector2(rightWallWidth/2, -roomDepth/2));
        points.push(new THREE.Vector2(rightWallWidth/2, roomDepth/4));
        points.push(new THREE.Vector2(0, roomDepth/4));
        points.push(new THREE.Vector2(0, roomDepth/2));
        points.push(new THREE.Vector2(-leftWallWidth/2, roomDepth/2));
      } else if (category.includes('pentagon') || surfaceArea > 15) {
        // Pentagonal room for large spaces
        points.push(new THREE.Vector2(-leftWallWidth/2, -roomDepth/2));
        points.push(new THREE.Vector2(rightWallWidth/2, -roomDepth/2));
        points.push(new THREE.Vector2(rightWallWidth/2 + 0.5, 0));
        points.push(new THREE.Vector2(rightWallWidth/4, roomDepth/2));
        points.push(new THREE.Vector2(-leftWallWidth/2, roomDepth/2));
      } else {
        // Default rectangular room
        points.push(new THREE.Vector2(-leftWallWidth/2, -roomDepth/2));
        points.push(new THREE.Vector2(rightWallWidth/2, -roomDepth/2));
        points.push(new THREE.Vector2(rightWallWidth/2, roomDepth/2));
        points.push(new THREE.Vector2(-leftWallWidth/2, roomDepth/2));
      }
      
      // Create the floor
      const floorShape = new THREE.Shape(points);
      const floorGeometry = new THREE.ShapeGeometry(floorShape);
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -wallHeight/2;
      roomGroup.add(floor);
      
      // Create walls by extrusion
      const extrudeSettings = {
        steps: 1,
        depth: wallHeight,
        bevelEnabled: false
      };
      
      const wallsGeometry = new THREE.ExtrudeGeometry(floorShape, extrudeSettings);
      const walls = new THREE.Mesh(wallsGeometry, wallMaterial);
      walls.position.y = -wallHeight/2;
      roomGroup.add(walls);
      
      // Add windows if the project has them
      if (hasWindows) {
        // Add windows to different walls based on room shape
        // Left wall window
        const leftWindowGeometry = new THREE.BoxGeometry(0.8, wallHeight * 0.4, 0.1);
        const leftWindow = new THREE.Mesh(leftWindowGeometry, new THREE.MeshBasicMaterial({color: 0x333333}));
        leftWindow.position.set(-leftWallWidth/2, 0, 0);
        leftWindow.rotation.y = Math.PI / 2;
        roomGroup.add(leftWindow);
        
        // Right wall window
        if (rightWallWidth > 1.5) {
          const rightWindowGeometry = new THREE.BoxGeometry(0.8, wallHeight * 0.4, 0.1);
          const rightWindow = new THREE.Mesh(rightWindowGeometry, new THREE.MeshBasicMaterial({color: 0x333333}));
          rightWindow.position.set(rightWallWidth/2, 0, 0);
          rightWindow.rotation.y = Math.PI / 2;
          roomGroup.add(rightWindow);
        }
      }
      
      // Add interior features based on certainty
      const certainty = projectData?.certainty?.toLowerCase() || '';
      if (certainty.includes('high') || certainty.includes('medium')) {
        // Add interior wall or divider
        const dividerWallGeometry = new THREE.BoxGeometry(leftWallWidth/2, wallHeight * 0.7, 0.1);
        const dividerWall = new THREE.Mesh(dividerWallGeometry, wallMaterial);
        dividerWall.position.set(0, -wallHeight * 0.15, 0);
        dividerWall.rotation.y = Math.PI / 4;
        roomGroup.add(dividerWall);
        
        // Add furniture-like objects
        const furnishingGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const furnishing = new THREE.Mesh(furnishingGeometry, new THREE.MeshStandardMaterial({color: 0xdddddd}));
        furnishing.position.set(-leftWallWidth/4, -wallHeight/2 + 0.25, -roomDepth/4);
        roomGroup.add(furnishing);
      }
      
      return roomGroup;
    };
    
    // Add the room
    const room = createRoom();
    scene.add(room);
    
    // Position the room for better viewing
    room.rotation.y = Math.PI / 6;
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      45, 
      threeContainerRef.current.clientWidth / threeContainerRef.current.clientHeight, 
      0.1, 
      1000
    );
    
    // Position camera for good initial view
    const wallHeight = parseFloat(projectData?.wallHeight) || 2.0;
    const leftWallWidth = parseFloat(projectData?.leftWallWidth) || 2.0;
    camera.position.set(leftWallWidth * 1.5, wallHeight * 0.8, leftWallWidth * 2);
    camera.lookAt(0, -wallHeight/4, 0);
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true // Needed for screenshots
    });
    renderer.setSize(
      threeContainerRef.current.clientWidth, 
      threeContainerRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    threeContainerRef.current.appendChild(renderer.domElement);
    
    // Store canvas reference for screenshots
    canvasRef.current = renderer.domElement;
    
    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    
    // Set initial control target
    controls.target.set(0, -wallHeight/4, 0);
    controls.update();
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    
    // Store renderer for cleanup
    rendererRef.current = renderer;
    
    // Handle window resizing
    const handleResize = () => {
      if (!threeContainerRef.current) return;
      
      camera.aspect = threeContainerRef.current.clientWidth / threeContainerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        threeContainerRef.current.clientWidth, 
        threeContainerRef.current.clientHeight
      );
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  };

  // Process and convert model file if needed
  const processModelFile = async (fileUrl) => {
    setStatus('loading');
    setModelError(null);
    
    console.log('Processing model file:', fileUrl);
    
    try {
      // Check if the URL is valid
      if (!fileUrl.startsWith('http')) {
        console.error('Invalid URL format:', fileUrl);
        setModelError('Invalid URL format');
        setStatus('fallback');
        return;
      }
      
      // 1. Fetch the file with proper CORS handling
      const response = await fetch(fileUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': '*/*'
        }
      });
      
      if (!response.ok) {
        console.error('Failed to fetch model:', response.status, response.statusText);
        setModelError(`Failed to fetch: ${response.status} ${response.statusText}`);
        setStatus('fallback');
        return;
      }
      
      const contentType = response.headers.get('content-type');
      console.log(`File content type: ${contentType}`);
      
      // Get the file extension from URL
      const fileExtension = fileUrl.split('.').pop().toLowerCase();
      console.log('File extension from URL:', fileExtension);
      
      // Check if it's a supported format for model-viewer
      if ((contentType && (
          contentType.includes('model/gltf') || 
          contentType.includes('model/gltf-binary') ||
          contentType.includes('application/octet-stream')
        )) || 
        fileExtension === 'gltf' || 
        fileExtension === 'glb') {
        
        console.log('Detected compatible format for model-viewer');
        // For GLB/GLTF, use directly
        setProcessedUrl(fileUrl);
        setModelType(fileExtension === 'glb' || contentType?.includes('gltf-binary') ? 'glb' : 'gltf');
        setStatus('success');
        return;
      }
      
      // If it's a USDZ file
      if ((contentType && (
          contentType.includes('model/vnd.usdz+zip') || 
          contentType.includes('application/zip') ||
          contentType.includes('application/octet-stream')
        )) || 
        fileExtension === 'usdz') {
        
        console.log('Detected USDZ format, attempting to process');
        
        try {
          // IMPORTANT: Get the binary data as arrayBuffer, not as text
          const arrayBuffer = await response.arrayBuffer();
          
          // Check for PK header (ZIP file signature)
          const headerView = new Uint8Array(arrayBuffer.slice(0, 4));
          const isPKZIP = headerView[0] === 80 && headerView[1] === 75; // "PK" signature
          
          if (isPKZIP) {
            console.log('Valid ZIP/USDZ file detected');
            // Process USDZ file (binary ZIP format)
            await handleUSDZFile(arrayBuffer, fileUrl);
          } else {
            console.warn('File has USDZ extension but not valid ZIP format');
            setModelError('Invalid USDZ format');
            setStatus('fallback');
          }
        } catch (err) {
          console.error('Error processing USDZ:', err);
          setModelError(`USDZ processing failed: ${err.message}`);
          setStatus('fallback');
        }
      } else if ((contentType && contentType.includes('model/vnd.usd')) || 
                ['usd', 'usda', 'usdc'].includes(fileExtension)) {
        // Handle raw USD file
        console.log('Raw USD file detected, using fallback visualization');
        setModelError('USD format requires conversion');
        setStatus('fallback');
      } else {
        // Unknown format - try direct loading through model-viewer
        console.log('Unknown format, attempting to use directly:', contentType || fileExtension);
        try {
          setProcessedUrl(fileUrl);
          setModelType('auto');
          setStatus('success');
        } catch (e) {
          console.error('Failed to use unknown format directly:', e);
          setModelError(`Unknown format: ${contentType || fileExtension}`);
          setStatus('fallback');
        }
      }
    } catch (err) {
      console.error('Error processing model file:', err);
      setModelError(`Processing failed: ${err.message}`);
      setStatus('fallback');
    }
  };

  // Handle USDZ file extraction
  const handleUSDZFile = async (arrayBuffer, originalUrl) => {
    try {
      console.log('Handling USDZ file...');
      
      // Since model-viewer often has issues with direct USDZ loading,
      // let's immediately prepare a fallback while we try to extract useful content
      
      // First, create a Blob from the arrayBuffer to work with the binary data
      const usdBlob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
      
      // If we're on iOS, we can use the USDZ directly
      if (isIOSDevice) {
        console.log('iOS device detected, using USDZ directly');
        const usdzURL = URL.createObjectURL(usdBlob);
        setProcessedUrl(originalUrl); // Use original URL for model-viewer
        setModelType('usdz');
        setStatus('success');
        return;
      }
      
      // For non-iOS, try to extract useful content using JSZip
      try {
        // Load the zip file carefully with proper binary handling
        const zip = new JSZip();
        // Using loadAsync with proper binary arrayBuffer
        const contents = await zip.loadAsync(arrayBuffer);
        
        console.log('USDZ contents:', Object.keys(contents.files));
        
        // Extract preview image if available
        const imageTypes = ['.png', '.jpg', '.jpeg'];
        const imageFile = Object.keys(contents.files).find(filename => 
          imageTypes.some(ext => filename.toLowerCase().endsWith(ext)) && 
          !contents.files[filename].dir
        );
        
        if (imageFile) {
          // Use image from USDZ as preview
          const imageData = await contents.files[imageFile].async('blob');
          const imageURL = URL.createObjectURL(imageData);
          console.log('Found preview image in USDZ:', imageFile);
          setPreviewImageUrl(imageURL);
          
          // If this is the first time we've found this preview, save it
          if (!projectData?.previewImageUrl) {
            saveImageToFirebase(imageData);
          }
        }
        
        // Look for any usable 3D content (GLB/GLTF)
        const glbFile = Object.keys(contents.files).find(filename => 
          filename.toLowerCase().endsWith('.glb') && !contents.files[filename].dir
        );
        
        if (glbFile) {
          // Extract GLB file and use it
          const fileData = await contents.files[glbFile].async('blob');
          const fileURL = URL.createObjectURL(fileData);
          setProcessedUrl(fileURL);
          setModelType('glb');
          console.log('Found and extracted GLB from USDZ');
          setStatus('success');
          return;
        }
        
        // If we couldn't extract a usable format, use our 3D fallback
        console.log('No compatible 3D format found in USDZ, using fallback');
        setStatus('fallback');
      } catch (zipErr) {
        console.warn('Error extracting USDZ as ZIP:', zipErr);
        // If all attempts fail, go to fallback
        setStatus('fallback');
      }
    } catch (err) {
      console.error('Error in USDZ processing:', err);
      setModelError(`USDZ extraction failed: ${err.message}`);
      setStatus('fallback');
    }
  };

  // Save extracted image to Firebase
  const saveImageToFirebase = async (imageBlob) => {
    if (!imageBlob || !projectData?.id) return;
    
    try {
      // Get storage instance
      const storage = getStorage();
      
      // Upload to Firebase Storage
      const imgRef = storageRef(storage, `projects/${projectData.id}/preview.png`);
      await uploadBytes(imgRef, imageBlob);
      
      // Get the download URL
      const downloadUrl = await getDownloadURL(imgRef);
      
      // Update project document with preview URL
      const projectRef = doc(db, "projects", projectData.id);
      await updateDoc(projectRef, {
        previewImageUrl: downloadUrl
      });
      
      // Notify parent component
      if (onUpdatePreview) {
        onUpdatePreview(downloadUrl);
      }
      
      console.log('Model preview saved successfully');
    } catch (err) {
      console.error('Error saving model preview:', err);
    }
  };

  // Custom error component with more details
  const ErrorDisplay = ({ error }) => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#000000] p-4">
      <p className="text-white text-sm mb-2">Failed to load 3D model</p>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button 
        className="mt-4 px-3 py-1 bg-blue-700 text-white text-xs rounded"
        onClick={() => processModelFile(modelUrl)}
      >
        Try Again
      </button>
    </div>
  );

  // AR button component for USDZ models
  const ARButton = ({ url }) => {
    if (!url) return null;
    
    return (
      <div className="absolute bottom-3 left-3 z-10">
        <a 
          href={url}
          rel="ar"
          className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs flex items-center"
        >
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 8V4H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 16V20H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 4H20V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 20H20V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M7 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          View in AR
        </a>
      </div>
    );
  };

  // Model information overlay
  const ModelInfoOverlay = () => (
    <div className="absolute inset-0 bg-black bg-opacity-80 z-20 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-4 max-w-xs">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-black">About This 3D Model</h3>
          <button 
            onClick={() => setShowModelInfo(false)}
            className="text-gray-500"
          >
            ✕
          </button>
        </div>
        <div className="text-gray-800 text-sm">
          <p className="mb-2">This is a 3D model in USDZ format, which is designed for iOS devices.</p>
          <p className="mb-2">For the best experience on non-iOS devices, we're showing a preview or room visualization based on the model's dimensions.</p>
          <p>To view the exact 3D model as scanned:</p>
          <ul className="list-disc ml-5 mt-1">
            <li>Scan the QR code with an iOS device</li>
            <li>View using the "View in AR" button on iOS</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Capture button component
  const CaptureButton = () => (
    <div className="absolute top-3 right-3 z-10">
      <button 
        onClick={captureModelView}
        className="bg-gray-800 text-white px-3 py-1 rounded-lg text-xs flex items-center"
        title="Save model view as preview image"
      >
        <Camera size={16} className="mr-1" /> Save View
      </button>
    </div>
  );

  // Info button component
  const InfoButton = () => (
    <div className="absolute top-3 left-3 z-10">
      <button 
        onClick={() => setShowModelInfo(true)}
        className="bg-gray-800 text-white px-2 py-1 rounded-full text-xs flex items-center"
        title="About this 3D model"
      >
        <Info size={16} />
      </button>
    </div>
  );

  // Render the appropriate viewer based on status
  return (
    <div className="relative w-full h-full">
      {status === 'loading' && (
        <div className="w-full h-full flex items-center justify-center bg-[#000000]">
          <p className="text-white text-sm">Loading 3D model...</p>
        </div>
      )}
      
      {status === 'error' && (
        <ErrorDisplay error={modelError} />
      )}
      
      {status === 'fallback' && (
        <div className="relative">
          <div 
            ref={threeContainerRef}
            className="w-full h-full bg-[#000000]"
            style={{ width: '100%', height: '270px' }}
          />
          
          {/* Add QR code for AR viewing when in fallback mode */}
          {modelUrl && <ModelQRDisplay modelUrl={modelUrl} projectName={projectData?.name} />}
          
          {/* Add capture button for saving the current view */}
          {!previewImageUrl && <CaptureButton />}
          
          {/* Show info button */}
          <InfoButton />
          
          {/* Show non-interactive message about iOS compatibility */}
          {!isIOSDevice && modelUrl && modelUrl.toLowerCase().endsWith('.usdz') && (
            <div className="absolute top-2 left-2 right-2 bg-black bg-opacity-70 text-white text-xs p-2 rounded">
              This model is in USDZ format, best viewed directly on iOS devices
            </div>
          )}
        </div>
      )}
      
      {status === 'success' && processedUrl && (
        <div className="relative">
          {/* For iOS and USDZ, use specific settings */}
          {isIOSDevice && modelType === 'usdz' ? (
            <>
              <model-viewer
                src=""
                ios-src={processedUrl}
                alt="3D Model"
                camera-controls
                auto-rotate
                ar
                ar-modes="webxr scene-viewer quick-look"
                style={{
                  width: '100%',
                  height: '270px',
                  backgroundColor: '#000000'
                }}
                onError={(error) => {
                  console.error('Model viewer error:', error);
                  setModelError(`Model viewer error: ${error.detail?.sourceError?.message || 'Failed to display model'}`);
                  setStatus('fallback');
                }}
              ></model-viewer>
              <ARButton url={processedUrl} />
              <InfoButton />
            </>
          ) : (
            <>
              {/* For other formats, use standard model-viewer */}
              <model-viewer
                src={processedUrl}
                alt="3D Model"
                camera-controls
                auto-rotate
                ar={isIOSDevice}
                ar-modes={isIOSDevice ? "webxr scene-viewer quick-look" : undefined}
                scale="1 1 1"
                format={modelType}
                interaction-prompt="auto"
                shadow-intensity="1"
                style={{
                  width: '100%',
                  height: '270px',
                  backgroundColor: '#000000'
                }}
                onLoad={() => console.log("Model loaded successfully")}
                onError={(error) => {
                  console.error('Model viewer error:', error);
                  setModelError(`Model viewer error: ${error.detail?.sourceError?.message || 'Failed to display model'}`);
                  setStatus('fallback');
                }}
              ></model-viewer>
              
              {/* Show QR code for non-iOS devices when model is USDZ */}
              {!isIOSDevice && modelUrl && modelUrl.toLowerCase().endsWith('.usdz') && (
                <ModelQRDisplay modelUrl={modelUrl} projectName={projectData?.name} />
              )}
              
              {/* Add capture button */}
              <CaptureButton />
              
              {/* Show info button */}
              <InfoButton />
            </>
          )}
        </div>
      )}
      
      {/* Show model info overlay when enabled */}
      {showModelInfo && <ModelInfoOverlay />}
    </div>
  );
}

function RoomMeasurementInterface({ projectData, onUpdatePreview }) {
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
        <div className="p-4 md:w-[583px] md:h-[370px] max-w-sm rounded-3xl bg-white">
          <table className="w-full h-full font-SFProDisplay">
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
  const [modelFormat, setModelFormat] = useState(null);
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
            // Get file reference
            const fileRef = storageRef(storage, projectData.usdFileUrl);
            
            // First, check metadata to get file format (if available)
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
          name: projectData.name || 'Unnamed Project',
          description: projectData.description || '',
          category: projectData.category || '',
          certainty: projectData.certainty || '',
          leftWallWidth: projectData.leftWallWidth || '',
          rightWallWidth: projectData.rightWallWidth || '',
          wallHeight: projectData.wallHeight || '',
          surfaceArea: projectData.surfaceArea || '',
          windows: projectData.windows || '',
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
        ) : error ? (
          <div className="p-4 bg-red-500 text-white rounded-lg">
            {error}
          </div>
        ) : (
          <RoomMeasurementInterface 
            projectData={projectData} 
            onUpdatePreview={handlePreviewUpdate}
          />
        )}
      </div>
    </div>
  );
}

export default ProjectDetails;