



import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
import ModelViewer from '../UserManagement/ModelViewer'; // Import your ModelViewer component

export default function ProjectCard({ project }) {
  const [status, setStatus] = useState('loading');
  const [modelUrl, setModelUrl] = useState(null);
  const [modelFormat, setModelFormat] = useState(null);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  // Detect iOS device on component mount
  useEffect(() => {
    const checkIsIOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    };
    
    setIsIOSDevice(checkIsIOS());
  }, []);

  // Process the model URL
  useEffect(() => {
    const fetchModelUrl = async () => {
      if (!project?.usdFileUrl) {
        console.log('No model URL provided for project:', project?.id);
        setStatus('no-model');
        return;
      }

      try {
        setStatus('loading');
        console.log('Processing model URL for project:', project.id);

        // Get download URL from Firebase Storage
        const storage = getStorage();
        const fileRef = storageRef(storage, project.usdFileUrl);
        const downloadUrl = await getDownloadURL(fileRef);
        
        console.log('Retrieved model URL:', downloadUrl);
        
        // Determine model format
        let format = null;
        if (project.usdFileUrl.toLowerCase().includes('.usdz')) {
          format = 'model/vnd.usdz+zip';
        } else if (project.usdFileUrl.toLowerCase().includes('.glb')) {
          format = 'model/gltf-binary';
        } else if (project.usdFileUrl.toLowerCase().includes('.gltf')) {
          format = 'model/gltf+json';
        }

        setModelUrl(downloadUrl);
        setModelFormat(format);
        setStatus('success');

      } catch (err) {
        console.error('Error fetching model URL:', err);
        setStatus('error');
      }
    };

    fetchModelUrl();
  }, [project?.usdFileUrl, project?.id]);

  // Render loading state
  const renderLoading = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#000000] rounded-xl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
        <p className="text-white text-xs">Loading...</p>
      </div>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#000000] rounded-xl">
      <div className="text-center">
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
          <span className="text-white text-xs">!</span>
        </div>
        <p className="text-white text-xs">Failed to load</p>
      </div>
    </div>
  );

  // Render no model state
  const renderNoModel = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#000000] rounded-xl">
      <div className="text-center">
        <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mx-auto mb-2">
          <span className="text-white text-xs">📋</span>
        </div>
        <p className="text-white text-xs">No 3D Model</p>
      </div>
    </div>
  );

  // Render placeholder/fallback image
  const renderFallback = () => (
    <div className="absolute inset-0 bg-[#000000] rounded-xl overflow-hidden">
      {project.imageUrl ? (
        <img
          src={project.imageUrl}
          alt={project.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-xs">🏗️</span>
            </div>
            <p className="text-white text-xs">Project</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-[#202022] rounded-lg overflow-hidden shadow-lg">
      <div className="p-4 flex gap-5">
        {/* 3D Model Container */}
        <div className="w-[147px] h-[100px] relative group">
          {status === 'loading' && renderLoading()}
          
          {status === 'error' && renderError()}
          
          {status === 'no-model' && renderNoModel()}
          
          {status === 'success' && modelUrl && (
            <div 
              className="w-full h-full bg-black rounded-xl overflow-hidden"
              style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div 
                className="w-full h-full"
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ModelViewer 
                  modelUrl={modelUrl}
                  projectData={{
                    modelFormat: modelFormat,
                    name: project.name,
                    id: project.id
                  }}
                  onUpdatePreview={() => {}} // No preview update needed for card view
                />
              </div>
            </div>
          )}
          
          {/* Fallback to image if model fails to load */}
          {status === 'fallback' && renderFallback()}
          
          {/* 3D Model indicator overlay */}
          {status === 'success' && modelUrl && (
            <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
              3D
            </div>
          )}
        </div>
        
        {/* Project Info */}
        <div className="flex flex-col gap-2 justify-center font-SFProDisplay">
          <h3 className="text-white leading-3 font-medium">
            {project.name || 'Unnamed Project'}
          </h3>
          <p className="text-white text-xs">
            {project.description || project.category || 'No description'}
          </p>
          
          {/* Status indicator */}
          {status === 'success' && (
            <p className="text-green-400 text-xs">3D Model Available</p>
          )}
          
          <Link to={`/project-details/${project.id}`}>
            <button className="w-32 bg-white text-[#0D0D12] rounded-full px-2 py-2 text-xs font-medium hover:bg-gray-100 transition-colors">
              View
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}