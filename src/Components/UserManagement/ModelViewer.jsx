import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { USDZLoader } from 'three-usdz-loader';
import '@google/model-viewer';

function ModelViewer({ modelUrl, projectData, onUpdatePreview }) {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isUSDZ, setIsUSDZ] = useState(false);
  const [useThreeJS, setUseThreeJS] = useState(false);
  
  // Refs for Three.js implementation
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animationFrameRef = useRef(null);
  const usdzLoaderRef = useRef(null);
  const usdzInstanceRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  
  // Detect iOS device
  useEffect(() => {
    const checkIsIOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    };
    
    setIsIOSDevice(checkIsIOS());
  }, []);
  
  // Detect file type and set up model loading
  useEffect(() => {
    if (!modelUrl) {
      setError('No model URL provided');
      setIsLoading(false);
      return;
    }
    
    // Reset state when model URL changes
    setError(null);
    setIsLoading(true);
    
    // Check if it's a USDZ file
    const isUSDZFile = modelUrl.toLowerCase().includes('.usdz') || 
                       projectData?.modelFormat === 'model/vnd.usdz+zip';
    setIsUSDZ(isUSDZFile);
    
    // If it's a USDZ file and not on iOS, use Three.js
    if (isUSDZFile && !isIOSDevice) {
      console.log('USDZ file on non-iOS device - using Three.js viewer');
      setUseThreeJS(true);
      initializeUSDZLoader();
    } else {
      setUseThreeJS(false);
      setIsLoading(false);
    }
  }, [modelUrl, isIOSDevice, projectData?.modelFormat]);

  // Initialize USDZ loader and Three.js scene
  const initializeUSDZLoader = async () => {
    try {
      // Initialize USDZ loader
      const loader = new USDZLoader('/wasm'); // Point to your public/wasm directory
      usdzLoaderRef.current = loader;
      
      // Wait for WASM module to be ready
      await loader.waitForModuleLoadingCompleted();
      
      if (!usdzLoaderRef.current) {
        throw new Error('USDZ loader failed to initialize');
      }
      
      // Initialize Three.js scene
      initThreeJSScene();
      
    } catch (err) {
      console.error("Failed to initialize USDZ loader:", err);
      setError(`Failed to initialize USDZ loader: ${err.message}`);
      setIsLoading(false);
    }
  };

  // Initialize Three.js scene for USDZ files
  const initThreeJSScene = () => {
    if (!containerRef.current || !usdzLoaderRef.current) return;
    
    try {
      // Clean up any existing scene
      cleanupThreeJSScene();
      
      // Create scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      sceneRef.current = scene;

      // Create camera
      const camera = new THREE.PerspectiveCamera(
        75,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 5;
      cameraRef.current = camera;

      // Create renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Add controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controlsRef.current = controls;

      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      scene.add(directionalLight);

      // Start animation loop
      animate();

      // Load the model
      loadModelWithThreeJS();
      
      // Handle window resize
      const handleResize = () => {
        if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
        
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      };

      window.addEventListener('resize', handleResize);
      
    } catch (err) {
      console.error("Failed to initialize Three.js scene:", err);
      setError(`Failed to initialize 3D viewer: ${err.message}`);
      setIsLoading(false);
    }
  };

  // Load the USDZ model using Three.js
  const loadModelWithThreeJS = async () => {
    if (!usdzLoaderRef.current || !sceneRef.current) {
      setError("3D viewer not initialized properly");
      setIsLoading(false);
      return;
    }

    try {
      console.log('Loading USDZ model from URL:', modelUrl);
      
      // Fetch the model file
      const response = await fetch(modelUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream, */*',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch model: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('Downloaded blob size:', blob.size, 'bytes');
      
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      
      // Extract filename from URL or use default
      let fileName = "model.usdz";
      try {
        const url = new URL(modelUrl);
        const pathSegments = url.pathname.split('/');
        const lastSegment = pathSegments[pathSegments.length - 1];
        if (lastSegment && lastSegment.includes('.usdz')) {
          fileName = decodeURIComponent(lastSegment.split('?')[0]);
        }
      } catch (e) {
        console.warn('Could not extract filename from URL, using default');
      }
      
      const file = new File([blob], fileName, { type: "application/octet-stream" });
      
      // Create a group to hold the model
      const modelGroup = new THREE.Group();
      sceneRef.current.add(modelGroup);
      
      // Load the USDZ file
      console.log('Loading USDZ file with loader...');
      const usdzInstance = await usdzLoaderRef.current.loadFile(file, modelGroup);
      usdzInstanceRef.current = usdzInstance;
      
      console.log('USDZ model loaded successfully');
      
      // Auto-center and adjust camera to fit the model
      const box = new THREE.Box3().setFromObject(modelGroup);
      if (!box.isEmpty()) {
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Center the model
        modelGroup.position.sub(center);
        
        // Adjust camera
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const fov = cameraRef.current.fov * (Math.PI / 180);
          let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
          
          // Add some padding
          cameraDistance *= 1.5;
          
          cameraRef.current.position.z = cameraDistance;
          if (controlsRef.current) {
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
          }
        }
      }
      
      // Generate preview if callback provided
      if (onUpdatePreview && rendererRef.current) {
        setTimeout(() => {
          try {
            const canvas = rendererRef.current.domElement;
            const previewUrl = canvas.toDataURL('image/png');
            onUpdatePreview(previewUrl);
          } catch (err) {
            console.warn('Could not generate preview:', err);
          }
        }, 1000); // Wait for model to render
      }
      
      setIsLoading(false);
      
    } catch (err) {
      console.error("Failed to load USDZ file:", err);
      setError(`Failed to load 3D model: ${err.message}`);
      setIsLoading(false);
    }
  };

  // Animation loop
  const animate = () => {
    animationFrameRef.current = requestAnimationFrame(animate);
    
    // Update animations if the model has them
    if (usdzInstanceRef.current) {
      const elapsedTime = clockRef.current.getElapsedTime();
      usdzInstanceRef.current.update(elapsedTime);
    }
    
    if (controlsRef.current) {
      controlsRef.current.update();
    }
    
    if (sceneRef.current && cameraRef.current && rendererRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  // Clean up Three.js resources
  const cleanupThreeJSScene = () => {
    // Stop animation loop
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Clean up USDZ instance
    if (usdzInstanceRef.current) {
      usdzInstanceRef.current.clear();
      usdzInstanceRef.current = null;
    }
    
    // Remove renderer from DOM
    if (rendererRef.current && rendererRef.current.domElement && containerRef.current) {
      try {
        containerRef.current.removeChild(rendererRef.current.domElement);
      } catch (e) {
        // Element might already be removed
      }
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    
    // Dispose of scene resources
    if (sceneRef.current) {
      sceneRef.current.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      sceneRef.current.clear();
      sceneRef.current = null;
    }
    
    // Remove event listeners
    window.removeEventListener('resize', () => {});
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupThreeJSScene();
    };
  }, []);

  // Handle errors from the model-viewer
  const handleModelViewerError = (event) => {
    console.error('Model-viewer error:', event.detail);
    setError(`Failed to load model: ${event.detail.type || 'Unknown error'}`);
    setIsLoading(false);
  };

  // Handle when model is loaded successfully
  const handleModelLoad = () => {
    console.log('Model loaded successfully');
    setIsLoading(false);
    
    // Generate preview for model-viewer if callback provided
    if (onUpdatePreview) {
      // For model-viewer, we can try to get a screenshot
      setTimeout(() => {
        try {
          const modelViewer = containerRef.current?.querySelector('model-viewer');
          if (modelViewer && modelViewer.toDataURL) {
            const previewUrl = modelViewer.toDataURL('image/png');
            onUpdatePreview(previewUrl);
          }
        } catch (err) {
          console.warn('Could not generate preview from model-viewer:', err);
        }
      }, 2000);
    }
  };

  // Loading indicator
  const LoadingIndicator = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-sm">
          {isUSDZ ? 'Loading USDZ model...' : 'Loading 3D model...'}
        </p>
      </div>
    </div>
  );

  // Error display
  const ErrorDisplay = () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#000000] p-4">
      <p className="text-white text-sm mb-2">Failed to load 3D model</p>
      <p className="text-red-400 text-xs text-center mb-4">{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
      >
        Retry
      </button>
    </div>
  );

  // Simple USDZ fallback viewer (used when three.js initialization fails)
  const SimpleUSDZViewer = () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#000000] p-4">
      <p className="text-white text-sm mb-4">USDZ Model</p>
      <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
        <span className="text-white text-xs">3D</span>
      </div>
      <p className="text-white text-xs text-center">
        USDZ files are best viewed on iOS devices.
        <br />
        <a 
          href={modelUrl} 
          download 
          className="text-blue-400 hover:underline mt-2 inline-block"
        >
          Download model
        </a>
      </p>
    </div>
  );

  // Determine what to render
  if (error) {
    return <ErrorDisplay />;
  }
  
  // For USDZ files on non-iOS that need Three.js rendering
  if (isUSDZ && !isIOSDevice && useThreeJS) {
    return (
      <div className="relative w-full h-full" ref={containerRef}>
        {isLoading && <LoadingIndicator />}
      </div>
    );
  }
  
  // For USDZ files on non-iOS where Three.js failed to initialize
  if (isUSDZ && !isIOSDevice && !useThreeJS) {
    return <SimpleUSDZViewer />;
  }
  
  // Otherwise use model-viewer with appropriate settings
  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <model-viewer
        src={isUSDZ ? "" : modelUrl}   // For USDZ, leave src empty
        ios-src={isUSDZ ? modelUrl : ""} // Only set ios-src for USDZ files
        alt="3D Model"
        camera-controls
        auto-rotate
        shadow-intensity="1"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#000000'
        }}
        onLoad={handleModelLoad}
        onError={handleModelViewerError}
      ></model-viewer>
      
      {isLoading && <LoadingIndicator />}
    </div>
  );
}

export default ModelViewer;