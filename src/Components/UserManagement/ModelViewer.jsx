import { useState, useEffect, useRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {  QrCode, Camera, Info } from 'lucide-react';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, getDownloadURL, uploadBytes } from 'firebase/storage';
import '@google/model-viewer';



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
      
      // Get room dimensions from roomData if available
      let leftWallWidth = 2.0;
      let rightWallWidth = 2.0;
      let wallHeight = 2.0;
      let hasWindows = false;
      let surfaceArea = 8.0;
      
      // Try to extract dimensions from roomData
      if (projectData?.roomData && Array.isArray(projectData.roomData)) {
        // Log roomData to see its structure
        console.log("Room data for 3D rendering:", projectData.roomData);
        
        // Try to find dimensions in roomData
        // This is a flexible approach that tries several ways to extract data
        projectData.roomData.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            // If item is an object, check for known dimension properties
            if (item.leftWallWidth !== undefined) leftWallWidth = parseFloat(item.leftWallWidth) || leftWallWidth;
            if (item.rightWallWidth !== undefined) rightWallWidth = parseFloat(item.rightWallWidth) || rightWallWidth;
            if (item.wallHeight !== undefined) wallHeight = parseFloat(item.wallHeight) || wallHeight;
            if (item.surfaceArea !== undefined) surfaceArea = parseFloat(item.surfaceArea) || surfaceArea;
            if (item.windows !== undefined) hasWindows = item.windows !== "0" && item.windows !== 0;
            
            // Check for other naming patterns
            if (item.width !== undefined) {
              leftWallWidth = rightWallWidth = parseFloat(item.width) || leftWallWidth;
            }
            if (item.height !== undefined) {
              wallHeight = parseFloat(item.height) || wallHeight;
            }
            if (item.area !== undefined) {
              surfaceArea = parseFloat(item.area) || surfaceArea;
            }
          }
        });
      }
      
      // Define polygon shape based on project data
      const points = [];
      
      // For different room shapes based on category
      const category = projectData?.category?.toLowerCase() || '';
      
      if (category.includes('l-shaped') || category.includes('corner')) {
        // L-shaped room
        points.push(new THREE.Vector2(-leftWallWidth/2, -surfaceArea/leftWallWidth/2));
        points.push(new THREE.Vector2(rightWallWidth/2, -surfaceArea/rightWallWidth/2));
        points.push(new THREE.Vector2(rightWallWidth/2, surfaceArea/rightWallWidth/4));
        points.push(new THREE.Vector2(0, surfaceArea/leftWallWidth/4));
        points.push(new THREE.Vector2(0, surfaceArea/leftWallWidth/2));
        points.push(new THREE.Vector2(-leftWallWidth/2, surfaceArea/rightWallWidth/2));
      } else if (category.includes('pentagon') || surfaceArea > 15) {
        // Pentagonal room for large spaces
        points.push(new THREE.Vector2(-leftWallWidth/2, -surfaceArea/leftWallWidth/2));
        points.push(new THREE.Vector2(rightWallWidth/2, -surfaceArea/rightWallWidth/2));
        points.push(new THREE.Vector2(rightWallWidth/2 + 0.5, 0));
        points.push(new THREE.Vector2(rightWallWidth/4, surfaceArea/rightWallWidth/2));
        points.push(new THREE.Vector2(-leftWallWidth/2, surfaceArea/leftWallWidth/2));
      } else {
        // Default rectangular room
        // Estimate depth based on surface area and wall widths
        const roomDepth = Math.max(2.0, surfaceArea / ((leftWallWidth + rightWallWidth) / 2));
        
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
    let estimatedWallHeight = 2.0;
    let estimatedWallWidth = 2.0;
    
    // Try to get more accurate dimensions from project data
    if (projectData?.roomData && Array.isArray(projectData.roomData)) {
      projectData.roomData.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          if (item.wallHeight !== undefined) estimatedWallHeight = parseFloat(item.wallHeight) || estimatedWallHeight;
          if (item.leftWallWidth !== undefined) estimatedWallWidth = parseFloat(item.leftWallWidth) || estimatedWallWidth;
          if (item.width !== undefined) estimatedWallWidth = parseFloat(item.width) || estimatedWallWidth;
        }
      });
    }
    
    camera.position.set(estimatedWallWidth * 1.5, estimatedWallHeight * 0.8, estimatedWallWidth * 2);
    camera.lookAt(0, -estimatedWallHeight/4, 0);
    
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
    controls.target.set(0, -estimatedWallHeight/4, 0);
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

  // UPDATED: Process and convert model file if needed
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
      
      // Get the file extension from URL
      const fileExtension = fileUrl.split('?')[0].split('.').pop().toLowerCase();
      console.log('File extension from URL:', fileExtension);
      
      // Direct handling for USDZ files from Firebase
      if (fileExtension === 'usdz') {
        console.log('USDZ file detected from extension, fetching...');
        try {
          // Fetch the file with proper CORS handling
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
          
          // Get the binary data
          const arrayBuffer = await response.arrayBuffer();
          
          // Process the USDZ file
          await handleUSDZFile(arrayBuffer, fileUrl);
          return;
        } catch (err) {
          console.error('Error fetching USDZ file:', err);
          setModelError(`USDZ fetching failed: ${err.message}`);
          setStatus('fallback');
          return;
        }
      }
      
      // For other formats, continue with existing logic
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
      
      // If it's a USDZ file based on content type
      if ((contentType && (
          contentType.includes('model/vnd.usdz+zip') || 
          contentType.includes('application/zip') ||
          contentType.includes('application/octet-stream')
        )) && 
        fileExtension === 'usdz') {
        
        console.log('Detected USDZ format via content type, processing');
        
        try {
          // Get the binary data
          const arrayBuffer = await response.arrayBuffer();
          
          // Process USDZ file
          await handleUSDZFile(arrayBuffer, fileUrl);
        } catch (err) {
          console.error('Error processing USDZ:', err);
          setModelError(`USDZ processing failed: ${err.message}`);
          setStatus('fallback');
        }
      } else if ((contentType && contentType.includes('model/vnd.usd')) || 
                ['usd', 'usda', 'usdc'].includes(fileExtension)) {
        // Handle raw USD file
        console.log('Raw USD file detected, trying direct load');
        setProcessedUrl(fileUrl);
        setModelType('auto');
        setStatus('success');
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

  // UPDATED: Handle USDZ file extraction
  const handleUSDZFile = async (arrayBuffer, originalUrl) => {
    try {
      console.log('Handling USDZ file...');
      
      // Create a Blob from the arrayBuffer
      const usdBlob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
      const usdzBlobUrl = URL.createObjectURL(usdBlob);
      
      // For iOS devices, use the USDZ file directly
      if (isIOSDevice) {
        console.log('iOS device detected, using USDZ directly');
        setProcessedUrl(originalUrl); // Use original URL for model-viewer
        setModelType('usdz');
        setStatus('success');
        return;
      }
      
      // For non-iOS devices, we'll still try to use the USDZ with model-viewer
      // This is the key change - attempt to use the USDZ directly instead of immediately falling back
      console.log('Non-iOS device, attempting to use USDZ with model-viewer');
      setProcessedUrl(originalUrl);
      setModelType('usdz');
      setStatus('success');
      
      // Still try to extract preview image for better UX
      try {
        const zip = new JSZip();
        const contents = await zip.loadAsync(arrayBuffer);
        
        console.log('USDZ contents:', Object.keys(contents.files));
        
        // Extract preview image if available
        const imageTypes = ['.png', '.jpg', '.jpeg'];
        const imageFile = Object.keys(contents.files).find(filename => 
          imageTypes.some(ext => filename.toLowerCase().endsWith(ext)) && 
          !contents.files[filename].dir
        );
        
        if (imageFile) {
          const imageData = await contents.files[imageFile].async('blob');
          const imageURL = URL.createObjectURL(imageData);
          console.log('Found preview image in USDZ:', imageFile);
          setPreviewImageUrl(imageURL);
          
          if (!projectData?.previewImageUrl) {
            saveImageToFirebase(imageData);
          }
        }
      } catch (zipErr) {
        console.warn('Error extracting preview from USDZ:', zipErr);
        // Continue with model-viewer approach even if preview extraction fails
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
      
      {/* UPDATED: Rendering for successful model loading */}
      {status === 'success' && processedUrl && (
        <div className="relative">
          <model-viewer
            src={modelType !== 'usdz' ? processedUrl : ''}
            ios-src={modelType === 'usdz' ? processedUrl : ''}
            alt="3D Model"
            camera-controls
            auto-rotate
            ar={isIOSDevice}
            ar-modes={isIOSDevice ? "webxr scene-viewer quick-look" : undefined}
            scale="1 1 1"
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
          {!isIOSDevice && modelType === 'usdz' && (
            <ModelQRDisplay modelUrl={processedUrl} projectName={projectData?.name} />
          )}
          
          {/* Add AR button for iOS devices */}
          {isIOSDevice && modelType === 'usdz' && <ARButton url={processedUrl} />}
          
          {/* Add capture button */}
          <CaptureButton />
          
          {/* Show info button */}
          <InfoButton />
          
          {/* For USDZ on non-iOS, show a small indicator */}
          {!isIOSDevice && modelType === 'usdz' && (
            <div className="absolute top-2 left-2 right-2 bg-black bg-opacity-70 text-white text-xs p-2 rounded">
              USDZ model - scan QR code with iOS device for full AR experience
            </div>
          )}
        </div>
      )}
      
      {/* Show model info overlay when enabled */}
      {showModelInfo && <ModelInfoOverlay />}
    </div>
  );
}

export default ModelViewer;


