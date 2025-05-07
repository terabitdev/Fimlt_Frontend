import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  LogOut, 
} from 'lucide-react';

function SideBar() {
  return (
    <>
      {/* Sidebar */}
      <div className="w-64 bg-[#111111] rounded-[10px] p-4 m-4 flex flex-col">
      
          <div className="flex items-center justify-center gap-1 mb-5">
            <img className="w-[65px] h-[65px]" src="/assets/logo.png" />
            <div className="text-white font-SfProDisplay font-[400] text-3xl ml-2">
              FIMIT
            </div>
          </div>
        
        
        <div className="text-white text-[16px] font-[400] font-DMSansRegular mb-4">Main Menu</div>
        
        <Link to="/dashboard">
        <div className="text-white text-[16px] font-[500] font-DMSansRegular p-3 rounded flex items-center mb-2 hover:bg-gray-800">
          <Home className="mr-3" />
          <span>Home</span>
        </div>
        </Link>

        <Link to="/users-management">
        <div className="text-white text-[16px] font-[500] font-DMSansRegular p-3 rounded flex items-center mb-2 hover:bg-gray-800">
          <Users className="mr-3" />
          <span>Users Management</span>
        </div>
        </Link>
        
        <div className="text-white text-[16px] font-[400] font-DMSansRegular p-3 rounded flex items-center mb-2 hover:bg-gray-800">
          <FileText className="mr-3" />
          <span>Floors Plan</span>
        </div>
        
        <div className="mt-auto text-white text-[16px] font-[400] font-DMSansRegular p-3 rounded flex items-center hover:bg-gray-800">
          <LogOut className="mr-3" />
          <span>Logout</span>
        </div>
      </div>
      </>
  )
}

export default SideBar