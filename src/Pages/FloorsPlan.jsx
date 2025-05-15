import React from 'react'
import { Eye } from 'lucide-react';
import SideBar from '../Components/SideBar';
import TopBar from '../Components/TopBar';
import {Plus} from 'lucide-react';
import { Link } from 'react-router';
import FilterByCategories from '../Components/FloorsPlan/FilterByCategories';

const RecentFloorScansTable = () => {
    // Mock data matching the image
    const scansData = [
      {
        id: 1,
        projectname: "Office–2nd Floor",
        scannedby: "Marvin McKinney",
        date: "23 Mar, 10:30 AM",
        room: "8 Rooms",
      },
      {
        id: 2,
        projectname: "Office–3rd Floor",
        scannedby: "Ralph Edwards",
        date: "23 Mar, 10:30 AM",
        room: "8 Rooms",
      },
      {
        id: 3,
        projectname: "Office–4th Floor",
        scannedby: "Theresa Webb",
        date: "23 Mar, 10:30 AM",
        room: "8 Rooms",
      },
      {
        id: 4,
        projectname: "Office–5th Floor",
        scannedby: "Cameron Williamson",
        date: "23 Mar, 10:30 AM",
        room: "8 Rooms",
      },
      {
        id: 5,
        projectname: "Office–6th Floor",
        scannedby: "Jane Cooper",
        date: "23 Mar, 10:30 AM",
        room: "8 Rooms",
      },
      {
        id: 6,
        projectname: "Office–7th Floor",
        scannedby: "Albert Flores",
        date: "23 Mar, 10:30 AM",
        room: "8 Rooms",
      },
    ];
  
    return (
      <div className="w-full md:max-w-5xl xl:max-w-7xl  max-w-[22rem]  bg-white rounded-lg ">
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-xl md:text-[27px] font-[600] font-OutfitBold text-[#1A1C21]">Recent Floor Scans Table</h2>
          <FilterByCategories />
        </div>
        
        <div className="w-full overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className='text-[12px] font-[600] font-OutfitBold text-black'>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-900 border-t border-b border-gray-200">
                  Project Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-900 border-t border-b border-gray-200">
                  Scanned By
                </th>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-900 border-t border-b border-gray-200">
                   Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-900 border-t border-b border-gray-200">
                   Rooms
                </th>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-900 border-t border-b border-gray-200">
                  View
                </th>
              </tr>
            </thead>
            <tbody className=" font-PublicSansMedium ">
              {scansData.map((scan) => (
                <tr key={scan.id}>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-[#1A1C21]">
                    {scan.projectname}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-[#1A1C21]">
                    {scan.scannedby}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-[#1A1C21]">
                    {scan.date}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-[#1A1C21]">
                    {scan.room}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap ">
                    <Link to={`/project-details-floors-plan`}>
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

function FloorsPlan() {
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
          <h1 className="text-3xl font-[500]">Floors Plan</h1>
        </div>
        {/* Floor Scans Table */}
        <RecentFloorScansTable />
      </div>
    </div>
  )
}

export default FloorsPlan