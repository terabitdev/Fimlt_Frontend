import { useState } from 'react';
import SideBar from '../SideBar'
import TopBar from '../TopBar'
import {Plus} from 'lucide-react';
import { Link } from 'react-router-dom';

function RoomMeasurementInterface() {
    const roomDetails = [
      { category: "Certainty", value: "High" },
      { category: "Left Wall Width", value: "5.37 meters" },
      { category: "Right Wall Width", value: "6.47 meters" },
      { category: "Wall Height", value: "6.13 meters" },
      { category: "Surface Area", value: "32.94 m²" },
      { category: "Window", value: "5 ft × 4 ft" },
    ];
 
  
    return (
      <div className="min-h-screen max-w-[22rem] md:max-w-5xl  bg-[#1E3A5F] rounded-xl">

         {/* User Profile Section */}
         <div className="p-4  border-b border-white flex items-center justify-between ">

            <div className='flex flex-col font-monrope' >
                <h1 className='font-[700] text-2xl md:text-[31px]'>Main Office</h1>
                <h3 className='font-[500] text-sm md:text-[20px]'>Finance Department Layout</h3>
            </div>
        
          <div className="flex items-center justify-center gap-3 font-Urbanist h-12 ">
            <Link to="/edit-details">
            <button className="bg-[#1E3A5F] border border-white text-white px-3 py-1 rounded-lg text-sm">
              Edit
            </button>
            </Link>
            <button className="bg-[#FB0000] border border-[#FB0000] text-white px-3 py-1 rounded-lg text-sm">
              Delete
            </button>
          </div>
        </div>

        <div className='flex flex-col md:flex-row justify-between gap-5 max-w-[61rem] mt-10 md:mt-20 mx-auto'>

        
          {/* Room Preview Image */}
          <div className="md:w-[405px] md:h-[270px] max-w-sm ">
            <img
              src="/assets/img2.png"
              alt="Room Preview"
              className="w-full h-full  "
            />
          </div>
  
          {/* Room Details Table */}
          <div className="p-4 md:w-[583px] md:h-[370px] max-w-sm rounded-3xl bg-white">
            <table className=" w-full h-full font-SFProDisplay">
              <thead>
                <tr>
                  <th className="text-left py-1 px-2 font-[400] text-[#090D00]">Category</th>
                  <th className="text-right py-1 px-2 font-medium text-[#090D00]">Room</th>
                </tr>
              </thead>
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
  return (
    <>
    <div className="flex min-h-screen h-full bg-black text-white">
   <SideBar />
    {/* Main Content */}
    <div className="flex-1 p-6">
       {/* Top Bar */}
       <TopBar />
       {/* Welcome */}
       <div className="flex justify-between font-DMSansRegular items-center mb-6">
         <h1 className="text-2xl md:text-3xl font-[500]">Project Details</h1>
         <button className="bg-[#1E3A5F] text-white py-2 px-4 rounded-md flex items-center">
           <Plus size={20} className="mr-2" />
           Add Category
         </button>
       </div>  
           
        {/* Project Details */}
        <RoomMeasurementInterface />
     </div>
  
   </div>
   </>
  )
}

export default ProjectDetails