import { useState } from 'react';
import SideBar from '../SideBar'
import TopBar from '../TopBar'
import {Plus} from 'lucide-react';
import { Link } from 'react-router-dom';
import React from 'react';


 function FacilityDashboard() {
    const [userData, setUserData] = useState({
      name: "Alexa Jhon",
      email: "abc@gmail.com",
      role: "User"
    });
  
    const facilities = [
      { id: 1, name: "Main Office", description: "Finance Department Layout", image: "/img2" },
      { id: 2, name: "ICU Wing", description: "City Hospital", image: "/img1" },
      { id: 3, name: "Ground Layout", description: "Green Mall", image: "/img2" },
      { id: 4, name: "Basement", description: "Arena Tower", image: "/img1" },
    ];
  
    return (
      <div className="min-h-screen bg-[#1E3A5F] rounded-xl">
        {/* User Profile Section */}
        <div className="p-4 pb-6 border-b border-white flex justify-between items-start">
          <div>
            <h2 className="text-white font-[600] font-ManropeSemiBold mb-1">Name: <span className='font-[400]'> {userData.name}</span></h2>
            <p className="text-white font-[600] font-ManropeSemiBold mb-1">Email: <span className='font-[400]'> {userData.email}</span></p>
            <p className="text-white font-[600] font-ManropeSemiBold">Role: <span className='font-[400]'> {userData.role}</span></p>
          </div>
          <div className="flex gap-2 font-Urbanist">
            <button className="bg-[#1E3A5F] border border-white text-white px-3 py-1 rounded-lg text-sm">
              Edit
            </button>
            <button className="bg-[#FB0000] border border-[#FB0000] text-white px-3 py-1 rounded-lg text-sm">
              Delete
            </button>
          </div>
        </div>

        {/* Facilities Grid */}
        <div className="p- grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-4 mt-6">
          {facilities.map((facility) => (
            <div
              key={facility.id}
              className="bg-[#202022] rounded-lg overflow-hidden shadow-lg"
            >
              <div className="p-4 flex gap-5">
                <div className=" w-[147px] h-[100px]  ">
                    <img
                        src={`/assets/${facility.image}.png`}
                        alt={facility.name}
                        className="w-full h-full object-cover rounded-xl"
                    />
                </div>
                <div className="flex flex-col gap-2 justify-center font-SFProDisplay  ">
                  <h3 className="text-white leading-3 font-medium  ">{facility.name}</h3>
                  <p className="text-white text-xs">
                    {facility.description}
                  </p>
                    <Link to={`/project-details`}>
                    <button className="w-32 bg-white text-[#0D0D12] rounded-full px-2 py-2 text-xs font-medium">
                      View
                    </button>
                    </Link>
         
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

function UserDetails() {
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
          <h1 className="text-2xl md:text-3xl font-[500]">Users Details</h1>
        </div>  
        <FacilityDashboard />
      </div>
   
    </div>
    </>
  )
}

export default UserDetails