
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import JSZip from 'jszip';
import * as THREE from 'three';

export default function ProjectCard({ project }) {
  const [status, setStatus] = useState('loading');
  const [processedUrl, setProcessedUrl] = useState(null);
  const [modelType, setModelType] = useState('auto');
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const threeContainerRef = useRef(null);
  const rendererRef = useRef(null);
  const roomModelRef = useRef(null);
  const [modelId, setModelId] = useState(null);

  // Detect iOS device on component mount
  useEffect(() => {
    const checkIsIOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    };
    
    setIsIOSDevice(checkIsIOS());
  }, []);

  // Clean up Three.js resources on unmount
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

  // Initialize the model ID based on the project ID
  useEffect(() => {
    if (project?.id) {
      // Create unique ID for the model based on project ID
      // This ensures different projects show different models
      setModelId(project.id);
    }
  }, [project]);

  // Initialize Three.js scene when in fallback mode
  useEffect(() => {
    if (status === 'fallback' && threeContainerRef.current) {
      if (previewImageUrl) {
        // If we have a preview image, use that instead of 3D
        showPreviewImage();
      } else {
        // Otherwise create a 3D visualization using project data
        createProjectSpecificModel();
      }
    }
  }, [status, previewImageUrl, modelId]);

  // Process the model URL
  useEffect(() => {
    if (!project.usdFileUrl) {
      console.error('No model URL provided for project:', project.id);
      setStatus('error');
      return;
    }

    console.log('Processing model URL:', project.usdFileUrl);

    // Reset model to ensure we load the correct one
    if (roomModelRef.current) {
      roomModelRef.current = null;
    }

    // For iOS devices, we can use USDZ directly
    if (isIOSDevice && project.usdFileUrl.toLowerCase().endsWith('.usdz')) {
      console.log('iOS device detected, using USDZ directly');
      setProcessedUrl(project.usdFileUrl);
      setModelType('usdz');
      setStatus('success');
    } else {
      // For other devices, process the model file
      processModelFile(project.usdFileUrl);
    }
  }, [project.usdFileUrl, isIOSDevice]);

  // Display a preview image extracted from USDZ
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
    label.style.bottom = '4px';
    label.style.right = '4px';
    label.style.backgroundColor = 'rgba(0,0,0,0.7)';
    label.style.color = 'white';
    label.style.padding = '2px 4px';
    label.style.borderRadius = '4px';
    label.style.fontSize = '10px';
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

  // Create a model based on the specific project data
  const createProjectSpecificModel = () => {
    if (!threeContainerRef.current) return;
    
    // Clear any existing content
    threeContainerRef.current.innerHTML = '';
    
    // Set up scene with black background (like in screenshot)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Materials
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xcccccc, // Medium gray to match screenshot
      roughness: 0.1,
      metalness: 0.1,
      side: THREE.DoubleSide // Render both sides
    });
    
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff, // White floor
      roughness: 0.1,
      metalness: 0.0,
      side: THREE.DoubleSide
    });
    
    // Generate a "random" but consistent layout based on projectId
    const generateLayoutFromId = (id) => {
      // Generate a seedable random number from string
      const generateSeed = (str) => {
        let seed = 0;
        for (let i = 0; i < str.length; i++) {
          seed = ((seed << 5) - seed) + str.charCodeAt(i);
          seed = seed & seed; // Convert to 32bit integer
        }
        return Math.abs(seed);
      };
      
      // Use let instead of const for the seed
      let seedValue = generateSeed(id || 'default');
      
      // Simple random function using the seed
      const seededRandom = () => {
        // Use the mutable seedValue
        const x = Math.sin(seedValue) * 10000;
        // Increment seedValue for next call
        seedValue = (seedValue * 9301 + 49297) % 233280;
        return x - Math.floor(x);
      };
      
      // Use the seeded random to create different layouts
      // Get values between 0.5 and 1.5 to create variations
      const baseWidth = 2.5 * (0.5 + seededRandom());
      const baseDepth = 2.5 * (0.5 + seededRandom());
      const baseHeight = 1.5 * (0.8 + seededRandom() * 0.4);
      
      // Determine if it's a single or double floor model
      const isDoubleFloor = seededRandom() > 0.3; // 70% chance of double floor like in screenshot
      
      return {
        width: baseWidth,
        depth: baseDepth,
        height: baseHeight,
        isDoubleFloor
      };
    };
    
    // Create hexagonal model as shown in the screenshot
    const createHexagonalMultiLevelModel = (params) => {
      const model = new THREE.Group();
      const { width, depth, height, isDoubleFloor } = params;
      
      // Create hexagonal shape points - matches the image very closely
      const createFloorShape = () => {
        const shape = new THREE.Shape();
        
        // Start from bottom left and move clockwise
        shape.moveTo(-width/2, -depth/2);         // Bottom left
        shape.lineTo(width/2, -depth/2);          // Bottom right
        shape.lineTo(width/2 + width*0.15, 0);    // Right point
        shape.lineTo(width/2, depth/2);           // Top right
        shape.lineTo(-width/2, depth/2);          // Top left
        shape.lineTo(-width/2 - width*0.15, 0);   // Left point
        shape.lineTo(-width/2, -depth/2);         // Back to start
        
        return shape;
      };
      
      // Create the main floor
      const floorShape = createFloorShape();
      const floorGeometry = new THREE.ShapeGeometry(floorShape);
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -height/2;
      model.add(floor);
      
      // Create the outer walls
      const wallHeightVal = height * 0.9; // Slightly lower than full height
      const extrudeSettings = {
        steps: 1,
        depth: wallHeightVal,
        bevelEnabled: false
      };
      
      const outerWalls = new THREE.Mesh(
        new THREE.ExtrudeGeometry(floorShape, extrudeSettings),
        wallMaterial
      );
      outerWalls.position.y = -height/2;
      model.add(outerWalls);
      
      // Add second floor if needed
      if (isDoubleFloor) {
        // Create second floor at half height
        const secondFloor = floor.clone();
        secondFloor.position.y = 0;
        model.add(secondFloor);
        
        // Add divider wall in middle (horizontal)
        const dividerWall = new THREE.Mesh(
          new THREE.BoxGeometry(width*0.8, height*0.1, depth*0.8),
          wallMaterial
        );
        dividerWall.position.y = 0;
        model.add(dividerWall);
        
        // Create openings/windows on both floors
        createWindowsAndOpenings(model, width, depth, height, true);
      } else {
        // Single floor - just add windows and openings
        createWindowsAndOpenings(model, width, depth, height, false);
      }
      
      return model;
    };
    
    // Create windows and openings to match the screenshot
    const createWindowsAndOpenings = (model, width, depth, height, isDoubleFloor) => {
      // Add main window/opening at the front (bottom of screenshot)
      const frontOpening = new THREE.Mesh(
        new THREE.BoxGeometry(width*0.6, height*0.4, depth*0.1),
        wallMaterial
      );
      frontOpening.position.set(0, -height*0.3, depth/2);
      model.add(frontOpening);
      
      // Add windows on sides
      const leftWindow = new THREE.Mesh(
        new THREE.BoxGeometry(width*0.1, height*0.3, depth*0.4),
        wallMaterial
      );
      leftWindow.position.set(-width/2, 0, 0);
      model.add(leftWindow);
      
      // Add back windows (top of screenshot)
      const backWindowLeft = new THREE.Mesh(
        new THREE.BoxGeometry(width*0.3, height*0.3, depth*0.1),
        wallMaterial
      );
      backWindowLeft.position.set(-width*0.25, 0, -depth/2);
      model.add(backWindowLeft);
      
      const backWindowRight = new THREE.Mesh(
        new THREE.BoxGeometry(width*0.3, height*0.3, depth*0.1),
        wallMaterial
      );
      backWindowRight.position.set(width*0.25, 0, -depth/2);
      model.add(backWindowRight);
      
      // Add interior features
      if (isDoubleFloor) {
        // Add stairs or other interior element in corner
        const stairs = new THREE.Mesh(
          new THREE.BoxGeometry(width*0.2, height*0.8, depth*0.2),
          wallMaterial
        );
        stairs.position.set(-width*0.3, -height*0.1, -depth*0.3);
        model.add(stairs);
      } else {
        // Add interior wall/divider
        const interiorWall = new THREE.Mesh(
          new THREE.BoxGeometry(width*0.8, height*0.6, depth*0.05),
          wallMaterial
        );
        interiorWall.position.set(0, -height*0.2, 0);
        model.add(interiorWall);
      }
      
      return model;
    };
    
    // Generate layout parameters based on project ID
    const layoutParams = generateLayoutFromId(modelId);
    
    // Create the model
    const roomModel = createHexagonalMultiLevelModel(layoutParams);
    roomModelRef.current = roomModel;
    
    // Position the model to match the screenshot angle
    roomModel.rotation.x = Math.PI / 20; // Slight tilt
    roomModel.rotation.y = Math.PI / 8;  // Rotation to match screenshot
    
    // Add the model to the scene
    scene.add(roomModel);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      45, 
      threeContainerRef.current.clientWidth / threeContainerRef.current.clientHeight, 
      0.1, 
      1000
    );
    
    // Position camera to match screenshot view - adjusted for smaller size
    camera.position.set(3, 2, 3);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(
      threeContainerRef.current.clientWidth, 
      threeContainerRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    threeContainerRef.current.appendChild(renderer.domElement);
    
    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.5;
    controls.maxDistance = 5;
    
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
    
    try {
      console.log('Processing file URL:', fileUrl);
      
      // Get the file extension from URL
      const fileExtension = fileUrl.split('?')[0].split('.').pop().toLowerCase();
      console.log('File extension:', fileExtension);
      
      // For USDZ files, try to use them directly first
      if (fileExtension === 'usdz') {
        console.log('USDZ file detected, attempting to use directly with model-viewer');
        setProcessedUrl(fileUrl);
        setModelType('usdz');
        setStatus('success');
        return;
      }
      
      // For other formats, fetch the file to determine content type
      const response = await fetch(fileUrl);
      const contentType = response.headers.get('content-type');
      console.log('Content type:', contentType);
      
      // Check if it's a supported format for model-viewer
      if (contentType && (
          contentType.includes('model/gltf') || 
          contentType.includes('model/gltf-binary') ||
          contentType.includes('application/octet-stream')
        )) {
        // It's a compatible format
        setProcessedUrl(fileUrl);
        setModelType(contentType.includes('gltf-binary') ? 'glb' : 'gltf');
        setStatus('success');
        return;
      }
      
      // If it's a USDZ file based on content type
      if (contentType && (
          contentType.includes('model/vnd.usdz+zip') || 
          contentType.includes('application/zip')
        )) {
        
        // Try to use it directly with model-viewer
        console.log('USDZ file detected via content-type, attempting to use directly');
        setProcessedUrl(fileUrl);
        setModelType('usdz');
        setStatus('success');
        
        // Also try to extract preview image as fallback
        try {
          const arrayBuffer = await response.arrayBuffer();
          await extractPreviewFromUSDZ(arrayBuffer);
        } catch (err) {
          console.warn('Failed to extract preview image:', err);
          // Continue with direct display attempt
        }
        
        return;
      }
      
      // If we get here, try to extract content or fall back to placeholder
      if (contentType && contentType.includes('application/octet-stream') || 
          contentType && contentType.includes('application/zip')) {
        try {
          const arrayBuffer = await response.arrayBuffer();
          await extractPreviewFromUSDZ(arrayBuffer);
        } catch (err) {
          console.warn('Failed to extract content:', err);
        }
      }
      
      // If all attempts fail, use the 3D visualization fallback
      setStatus('fallback');
      
    } catch (err) {
      console.error('Error processing model file:', err);
      setStatus('fallback');
    }
  };

  // Extract preview image from USDZ file
  const extractPreviewFromUSDZ = async (arrayBuffer) => {
    try {
      // Load the zip file
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
        // Use image from USDZ as preview
        const imageData = await contents.files[imageFile].async('blob');
        const imageURL = URL.createObjectURL(imageData);
        console.log('Found preview image in USDZ:', imageFile);
        setPreviewImageUrl(imageURL);
      }
      
      // Look for GLB file in the USDZ package (rare but possible)
      const glbFile = Object.keys(contents.files).find(filename => 
        filename.toLowerCase().endsWith('.glb') && !contents.files[filename].dir
      );
      
      if (glbFile) {
        // Extract GLB file
        const fileData = await contents.files[glbFile].async('blob');
        const fileURL = URL.createObjectURL(fileData);
        setProcessedUrl(fileURL);
        setModelType('glb');
        setStatus('success');
        return true;
      }
      
      return false;
    } catch (err) {
      console.warn('Error extracting from USDZ:', err);
      return false;
    }
  };

  return (
    <div className="bg-[#202022] rounded-lg overflow-hidden shadow-lg">
      <div className="p-4 flex gap-5">
        <div className="w-[147px] h-[100px] relative group">
          {status === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#000000] rounded-xl">
              <p className="text-white text-xs">Loading...</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#000000] rounded-xl">
              <p className="text-white text-xs">Failed to load model</p>
            </div>
          )}
          
          {status === 'fallback' && (
            <div 
              ref={threeContainerRef}
              className="w-full h-full bg-[#000000] rounded-xl"
              style={{ width: '100%', height: '100%' }}
            />
          )}
          
          {status === 'success' && processedUrl && (
            <model-viewer
              src={modelType !== 'usdz' ? processedUrl : ''}
              ios-src={modelType === 'usdz' ? processedUrl : ''}
              alt={project.name}
              ar={isIOSDevice}
              ar-modes={isIOSDevice ? "webxr scene-viewer quick-look" : undefined}
              auto-rotate
              camera-controls
              interaction-prompt="none"
              format={modelType}
              style={{
                width: '147px',
                height: '100px',
                borderRadius: '0.5rem',
                backgroundColor: '#000000'
              }}
              onError={(error) => {
                console.error('Model viewer error:', error);
                setStatus('fallback');
              }}
            ></model-viewer>
          )}
        </div>
        <div className="flex flex-col gap-2 justify-center font-SFProDisplay">
          <h3 className="text-white leading-3 font-medium">
            {project.name || 'Unnamed Project'}
          </h3>
          <p className="text-white text-xs">
            {project.description || 'No description'}
          </p>
          <Link to={`/project-details/${project.id}`}>
            <button className="w-32 bg-white text-[#0D0D12] rounded-full px-2 py-2 text-xs font-medium">
              View
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}




