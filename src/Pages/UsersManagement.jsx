import React from 'react';
import { Eye } from 'lucide-react';
import SideBar from '../Components/SideBar';
import TopBar from '../Components/TopBar';
import {Plus} from 'lucide-react';
import { Link } from 'react-router';

const RecentFloorScansTable = () => {
    // Mock data matching the image
    const scansData = [
      { id: 1, name: 'Aleza Jhon', email: 'abc@gmail.com', role: 'User', projects: '5 Projects' },
      { id: 2, name: 'Thor Frek', email: 'abc@gmail.com', role: 'admin', projects: '3 Projects' },
      { id: 3, name: 'Sawvi Liza', email: 'abc@gmail.com', role: 'User', projects: '4 Projects' },
      { id: 4, name: 'Aleza Jhon', email: 'abc@gmail.com', role: 'User', projects: '2 Projects' },
      { id: 5, name: 'Aleza Jhon', email: 'abc@gmail.com', role: 'User', projects: '3Projects' },
      { id: 6, name: 'Aleza Jhon', email: 'abc@gmail.com', role: 'User', projects: '5 Projects' },
      { id: 7, name: 'Aleza Jhon', email: 'abc@gmail.com', role: 'User', projects: '7 Projects' },
      { id: 8, name: 'Aleza Jhon', email: 'abc@gmail.com', role: 'User', projects: '7 Projects' },
      { id: 9, name: 'Aleza Jhon', email: 'abc@gmail.com', role: 'User', projects: '7 Projects' },
      { id: 10, name: 'Aleza Jhon', email: 'abc@gmail.com', role: 'User', projects: '7 Projects' },
    ];
  
    return (
      <div className="w-full md:max-w-5xl  max-w-[22rem]   bg-white  rounded-lg">
        <div className="p-6">
          <h2 className="text-[27px] font-[600] font-OutfitBold text-[#1A1C21]">Recent Floor Scans Table</h2>
        </div>
        
        <div className=" max-w-xs md:max-w-5xl  overflow-x-auto">
          <table className="w-full  divide-y divide-gray-200">
            <thead className='text-[12px] font-[600] font-OutfitBold text-black'>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-900 border-t border-b border-gray-200">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-900 border-t border-b border-gray-200">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-900 border-t border-b border-gray-200">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-900 border-t border-b border-gray-200">
                  Projects
                </th>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-900 border-t border-b border-gray-200">
                  View
                </th>
              </tr>
            </thead>
            <tbody className="bg-white font-PublicSansMedium ">
              {scansData.map((scan) => (
                <tr key={scan.id}>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-[#1A1C21]">
                    {scan.name}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-[#1A1C21]">
                    {scan.email}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-[#1A1C21]">
                    {scan.role}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-[#1A1C21]">
                    {scan.projects}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap ">
                    <Link to={`/user-details`}>
                      <button className="inline-flex items-center bg-[#1E3A5F] justify-center p-2 bg-navy-800 text-white rounded-md">
                        <Eye size={20} />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };


function UsersManagement() {
  return (
    <div className="flex min-h-screen h-full bg-black text-white">
      {/* Sidebar */}
        <SideBar />
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Top Bar */}
        <TopBar />
        {/* Welcome */}
        <div className="flex justify-between font-DMSansRegular items-center mb-6">
          <h1 className="text-3xl font-[500]">Users Page</h1>
          <button className="bg-[#1E3A5F] text-white py-2 px-4 rounded-md flex items-center">
            <Plus size={20} className="mr-2" />
            Add Category
          </button>
        </div>
        {/* Floor Scans Table */}
        <RecentFloorScansTable />
      </div>
    </div>
  )
}

export default UsersManagement