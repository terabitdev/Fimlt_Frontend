

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  LogOut,
  ChevronRight,
  X
} from 'lucide-react';

function SideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation(); // Hook to get the current route location
  
  // Function to check if the current path matches a given path
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Check if the screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Toggle drawer
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  // Close drawer (for when a link is clicked)
  const closeDrawer = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Navigation items
  const navItems = [
    { path: '/dashboard', name: 'Home', icon: <Home className="mr-3" /> },
    { path: '/users-management', name: 'Users Management', icon: <Users className="mr-3" /> },
    { path: '/floors-plan', name: 'Floors Plan', icon: <FileText className="mr-3" /> }
  ];

  // Sidebar content
  const sidebarContent = (
    <>
      <div className="flex items-center justify-center gap-1 mb-5">
        <img className="w-[65px] h-[65px]" src="/assets/logo.png" alt="FIMIT Logo" />
        <div className="text-white font-SfProDisplay font-[400] text-3xl ml-2">
          FIMIT
        </div>
      </div>
      
      <div className="text-white text-[16px] font-[400] font-DMSansRegular mb-4">Main Menu</div>
      
      {navItems.map((item) => (
        <Link key={item.path} to={item.path} onClick={closeDrawer}>
          <div 
            className={`text-white text-[16px] font-[500] font-DMSansRegular p-3 rounded flex items-center mb-2 ${
              isActive(item.path) ? 'bg-[#1E3A5F]' : 'hover:bg-gray-800'
            }`}
          >
            {item.icon}
            <span>{item.name}</span>
          </div>
        </Link>
      ))}
      
      <div className="mt-auto text-white text-[16px] font-[400] font-DMSansRegular p-3 rounded flex items-center hover:bg-gray-800 cursor-pointer">
        <LogOut className="mr-3" />
        <span>Logout</span>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button - only visible on mobile */}
      {isMobile && (
        <button 
          onClick={toggleDrawer}
          className="fixed top-6 left-0  z-50  text-white rounded-r-lg "
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} className='relative left-64 top-2' /> : <ChevronRight size={24} />}
        </button>
      )}

      {/* Overlay - only visible on mobile when drawer is open */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleDrawer}
        ></div>
      )}

      {/* Sidebar - desktop: always visible, mobile: drawer that slides in */}
      <div 
        className={`
          ${isMobile ? 'fixed left-0 top-0 bottom-0 z-40' : 'relative'} 
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
          transition-transform duration-100 ease-in-out
          w-64 bg-[#111111] rounded-[10px] p-4 m-6 md:m-4 flex flex-col min-h-[calc(100vh-3rem)]
        `}
      >
        {sidebarContent}
      </div>
    </>
  );
}

export default SideBar;