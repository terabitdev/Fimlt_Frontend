
import React, { useState } from 'react';
import SideBar from '../SideBar';
import TopBar from '../TopBar';
import { Plus } from 'lucide-react';
import { CiEdit } from "react-icons/ci";


function RoomMeasurementInterface() {
  // Initial room details data
  const initialRoomDetails = [
    { category: "Category", value: "Room" },
    { category: "Certainty", value: "High" },
    { category: "Left Wall Width", value: "5.37 meters" },
    { category: "Right Wall Width", value: "6.47 meters" },
    { category: "Wall Height", value: "6.13 meters" },
    { category: "Surface Area", value: "32.94 m²" },
    { category: "Window", value: "5 ft x 4 ft" },
  ];

  // State for room details and editing
  const [roomDetails, setRoomDetails] = useState(initialRoomDetails);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Handle starting to edit a field
  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditValue(roomDetails[index].value);
  };

  // Handle input change
  const handleInputChange = (e) => {
    setEditValue(e.target.value);
  };

  // Handle saving the edited value
  const handleSave = (index) => {
    const updatedDetails = [...roomDetails];
    updatedDetails[index] = { ...updatedDetails[index], value: editValue };
    setRoomDetails(updatedDetails);
    setEditingIndex(null);
  };

  // Handle key press (Enter to save, Escape to cancel)
  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      handleSave(index);
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
    }
  };

  return (
    <div className="min-h-screen max-w-[22rem] md:max-w-5xl xl:max-w-7xl   bg-[#1E3A5F] rounded-xl">
      {/* User Profile Section */}
      <div className="p-4 border-b border-white flex items-center justify-between">
        <div className="flex flex-col font-monrope">
          <h1 className="font-[700] text-[31px] text-white">Main Office</h1>
          <h3 className="font-[500] text-[20px] text-white">
            Finance Department Layout
          </h3>
        </div>

        <div className="flex items-center justify-center gap-3 font-Urbanist h-12">
          <button className="bg-[#1E3A5F] border border-white text-white px-3 py-1 rounded-lg text-sm">
            Edit
          </button>
          <button className="bg-[#FB0000] border border-[#FB0000] text-white px-3 py-1 rounded-lg text-sm">
            Delete
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-5 max-w-[61rem] mt-10 md:mt-20 mx-auto">
        {/* Room Preview Image */}
        <div className="flex flex-col gap-5 md:w-[405px] md:h-[270px] max-w-sm">
          <img
            src="/assets/img2.png"
            alt="Room Preview"
            className="w-full h-full"
          />
          <button className="w-full bg-white text-[#1E3A5F] rounded-full px-2 py-3 font-SFProDisplay text-[16px] font-medium">
            Save Edits
          </button>
        </div>

        {/* Room Details Table */}
        <div className="p-4 md:w-[583px]  max-w-sm rounded-3xl bg-white">
          <div className="w-full font-SFProDisplay">
            {roomDetails.map((detail, index) => (
              <div key={index} className="flex items-center justify-between py-1 ">
                <div className="text-xl font-[400] text-[#090D00]">
                  {detail.category}
                </div>
                <div className="flex items-center">
                  {editingIndex === index ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={handleInputChange}
                      onBlur={() => handleSave(index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="border border-[#090D00] rounded-sm px-1 py-1 text-right w-40 mr-2 text-lg font-medium"
                      autoFocus
                    />
                  ) : (
                    <div className="border border-[#090D00] text-black rounded-sm px-1 py-1 text-right w-40 mr-2 text-lg font-medium">
                      {detail.value}
                    </div>
                  )}
                  <button
                    onClick={() => handleEditClick(index)}
                    className="p-2 "
                    aria-label={`Edit ${detail.category}`}
                  >
                    <CiEdit size={25} className="text-[#090D00] underline" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditDetails() {
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
            <h1 className="text-3xl font-[500]">Edit Details</h1>
          </div>

          {/* Project Details */}
          <RoomMeasurementInterface />
        </div>
      </div>
    </>
  );
}

export default EditDetails;