

import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { USDZLoader } from 'three-usdz-loader';
import '@google/model-viewer';

function ModelViewer({ modelUrl, projectData, onUpdatePreview }) {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState('Initializing...');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isUSDZ, setIsUSDZ] = useState(false);
  const [viewerMode, setViewerMode] = useState('detecting');
  const [containerReady, setContainerReady] = useState(false);
  
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

  // Loading indicator component
  function LoadingIndicator() {
    return (
      <div 
        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-10 cursor-pointer"
        onClick={() => {
          console.log('Loading indicator clicked - hiding loader');
          setIsLoading(false);
        }}
        title="Click to hide loading indicator"
      >
        <div className="text-center max-w-xs">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-sm font-medium mb-2">
            {isUSDZ ? 'Loading USDZ Model' : 'Loading 3D Model'}
          </p>
          <p className="text-gray-300 text-xs mb-3">
            {loadingStage}
          </p>
          {isUSDZ && loadingProgress > 0 && (
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          )}
          {isUSDZ && (
            <div>
              <p className="text-gray-400 text-xs mb-2">
                Large files may take time to process
              </p>
              {loadingProgress >= 95 && (
                <p className="text-yellow-400 text-xs">
                  Click anywhere to continue if model is visible
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error display component
  function ErrorDisplay() {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#000000] p-4">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">!</span>
          </div>
          <p className="text-white text-sm mb-2">Failed to load 3D model</p>
          <p className="text-red-400 text-xs text-center mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Simple fallback for USDZ when Three.js fails
  function SimpleFallback() {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#000000] p-4">
        <div className="text-center max-w-xs">
          <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-lg">3D</span>
          </div>
          <p className="text-white text-sm mb-2">USDZ Model</p>
          <p className="text-gray-400 text-xs mb-4">
            This model is best viewed on iOS devices
          </p>
          <a 
            href={modelUrl} 
            download 
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Download Model
          </a>
        </div>
      </div>
    );
  }
  
  // Detect iOS device
  useEffect(() => {
    const checkIsIOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    };
    
    setIsIOSDevice(checkIsIOS());
  }, []);
  
  // Check if container is ready
  useEffect(() => {
    if (containerRef.current) {
      console.log('Container is ready:', containerRef.current);
      setContainerReady(true);
    }
  });

  // Determine viewer mode
  useEffect(() => {
    if (!modelUrl) {
      setError('No model URL provided');
      setViewerMode('error');
      setIsLoading(false);
      return;
    }
    
    // Reset state
    setError(null);
    setIsLoading(true);
    setLoadingStage('Detecting file type...');
    setLoadingProgress(0);
    setContainerReady(false);
    
    // Check if it's a USDZ file
    const isUSDZFile = modelUrl.toLowerCase().includes('.usdz') || 
                       projectData?.modelFormat === 'model/vnd.usdz+zip';
    setIsUSDZ(isUSDZFile);
    
    // Determine which viewer to use
    if (isUSDZFile) {
      if (isIOSDevice) {
        console.log('USDZ file on iOS device - using model-viewer');
        setViewerMode('modelviewer');
        setIsLoading(false);
      } else {
        console.log('USDZ file on non-iOS device - will use Three.js when container is ready');
        setViewerMode('threejs');
      }
    } else {
      console.log('Non-USDZ file - using model-viewer');
      setViewerMode('modelviewer');
      setIsLoading(false);
    }
  }, [modelUrl, isIOSDevice, projectData?.modelFormat]);

  // Initialize USDZ when container is ready
  useEffect(() => {
    if (viewerMode === 'threejs' && containerReady && isUSDZ && !usdzLoaderRef.current) {
      console.log('Container ready, initializing USDZ loader...');
      setLoadingStage('Initializing USDZ loader...');
      
      const initUSDZ = async () => {
        try {
          console.log('Starting USDZ initialization...');
          setLoadingStage('Loading WASM modules...');
          
          const loader = new USDZLoader('/wasm');
          usdzLoaderRef.current = loader;
          
          console.log('Waiting for USDZ module...');
          const module = await loader.waitForModuleLoadingCompleted();
          
          if (!module) {
            throw new Error('WASM module failed to load. Check if files exist in /public/wasm/');
          }
          
          console.log('USDZ module ready, initializing scene...');
          await initThreeJSScene();
          
        } catch (err) {
          console.error('USDZ initialization failed:', err);
          setError(`USDZ Error: ${err.message}`);
          setViewerMode('fallback');
          setIsLoading(false);
        }
      };
      
      // Add a safety timeout to hide loading if something goes wrong
      const safetyTimeout = setTimeout(() => {
        if (isLoading) {
          console.warn('Safety timeout reached - hiding loader');
          setIsLoading(false);
        }
      }, 30000); // 30 second safety timeout
      
      initUSDZ().finally(() => {
        clearTimeout(safetyTimeout);
      });
    }
  }, [viewerMode, containerReady, isUSDZ]);

  // Initialize Three.js scene
  const initThreeJSScene = async () => {
    if (!containerRef.current) {
      throw new Error('Container not available for scene initialization');
    }
    
    try {
      console.log('Initializing Three.js scene...');
      cleanupThreeJSScene();
      
      const width = containerRef.current.clientWidth || 400;
      const height = containerRef.current.clientHeight || 300;
      
      // Create scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      sceneRef.current = scene;

      // Create camera
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;
      cameraRef.current = camera;

      // Create renderer
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        preserveDrawingBuffer: true
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Create controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controlsRef.current = controls;

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      // Start animation
      startAnimation();
      
      // Load model
      await loadUSDZModel();
      
    } catch (err) {
      console.error('Scene initialization failed:', err);
      throw err;
    }
  };

  // Load USDZ model
  const loadUSDZModel = async () => {
    try {
      setLoadingStage('Downloading USDZ file...');
      setLoadingProgress(10);
      
      const response = await fetch(modelUrl);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }
      
      setLoadingProgress(40);
      const blob = await response.blob();
      const file = new File([blob], "model.usdz", { type: "application/octet-stream" });
      
      setLoadingStage('Loading 3D model...');
      setLoadingProgress(70);
      
      const modelGroup = new THREE.Group();
      sceneRef.current.add(modelGroup);
      
      const usdzInstance = await usdzLoaderRef.current.loadFile(file, modelGroup);
      usdzInstanceRef.current = usdzInstance;
      
      setLoadingProgress(90);
      setLoadingStage('Positioning camera...');
      
      // Position camera
      const box = new THREE.Box3().setFromObject(modelGroup);
      if (!box.isEmpty()) {
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        modelGroup.position.sub(center);
        
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const fov = cameraRef.current.fov * (Math.PI / 180);
          let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
          cameraDistance *= 1.5;
          
          cameraRef.current.position.z = cameraDistance;
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.update();
        }
      }
      
      setLoadingStage('Rendering model...');
      setLoadingProgress(95);
      
      // Wait for model to be properly rendered
      await waitForModelRender(modelGroup);
      
      setLoadingProgress(100);
      
      // Generate preview
      if (onUpdatePreview && rendererRef.current) {
        setTimeout(() => {
          try {
            const canvas = rendererRef.current.domElement;
            const previewUrl = canvas.toDataURL('image/png', 0.8);
            onUpdatePreview(previewUrl);
            console.log('Preview generated successfully');
          } catch (err) {
            console.warn('Preview generation failed:', err);
          }
        }, 500);
      }
      
      // Hide loading with a smooth transition
      setTimeout(() => {
        setIsLoading(false);
        console.log('USDZ model fully loaded and rendered');
      }, 800);
      
    } catch (err) {
      console.error('Model loading failed:', err);
      throw err;
    }
  };

  // Wait for model to render properly
  const waitForModelRender = (modelGroup) => {
    return new Promise((resolve) => {
      let renderAttempts = 0;
      const maxRenderAttempts = 30; // 3 seconds max
      
      const checkRender = () => {
        renderAttempts++;
        
        // Force a render
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        
        // Check if model has visible content
        const hasVisibleMeshes = modelGroup.children.some(child => {
          return child.geometry && 
                 child.geometry.attributes.position && 
                 child.geometry.attributes.position.count > 0;
        });
        
        if (hasVisibleMeshes) {
          console.log(`Model render confirmed after ${renderAttempts} attempts`);
          // Give it a bit more time to ensure everything is rendered
          setTimeout(resolve, 300);
        } else if (renderAttempts >= maxRenderAttempts) {
          console.log('Model render timeout - proceeding anyway');
          resolve();
        } else {
          setTimeout(checkRender, 100);
        }
      };
      
      // Start checking after a short delay
      setTimeout(checkRender, 200);
    });
  };

  // Animation loop
  const animate = () => {
    animationFrameRef.current = requestAnimationFrame(animate);
    
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

  const startAnimation = () => {
    if (!animationFrameRef.current) {
      animate();
    }
  };

  // Cleanup
  const cleanupThreeJSScene = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (usdzInstanceRef.current) {
      usdzInstanceRef.current.clear();
      usdzInstanceRef.current = null;
    }
    
    if (rendererRef.current && containerRef.current) {
      try {
        containerRef.current.removeChild(rendererRef.current.domElement);
      } catch (e) {
        // Element might already be removed
      }
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    
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
  };

  useEffect(() => {
    return () => {
      cleanupThreeJSScene();
    };
  }, []);

  // Model-viewer handlers
  const handleModelViewerError = (event) => {
    console.error('Model-viewer error:', event.detail);
    setError(`Model viewer error: ${event.detail.type || 'Unknown error'}`);
    setIsLoading(false);
  };

  const handleModelLoad = () => {
    console.log('Model loaded with model-viewer');
    setIsLoading(false);
  };

  // Render logic
  if (viewerMode === 'error' || error) {
    return <ErrorDisplay />;
  }
  
  if (viewerMode === 'fallback') {
    return <SimpleFallback />;
  }
  
  if (viewerMode === 'threejs') {
    return (
      <div 
        className="relative w-full h-full bg-black" 
        ref={containerRef}
        style={{ minWidth: '300px', minHeight: '200px' }}
      >
        {isLoading && <LoadingIndicator />}
      </div>
    );
  }
  
  if (viewerMode === 'modelviewer') {
    return (
      <div className="relative w-full h-full" ref={containerRef}>
        <model-viewer
          src={isUSDZ ? undefined : modelUrl}
          ios-src={isUSDZ ? modelUrl : undefined}
          alt="3D Model"
          camera-controls
          auto-rotate
          shadow-intensity="1"
          loading="eager"
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#000000'
          }}
          onLoad={handleModelLoad}
          onError={isUSDZ ? undefined : handleModelViewerError}
        ></model-viewer>
        
        {isLoading && <LoadingIndicator />}
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full bg-black">
      <LoadingIndicator />
    </div>
  );
}

export default ModelViewer;