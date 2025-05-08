import React from 'react'
import {Bell} from 'lucide-react';
function TopBar() {
  return (
    <div className="flex justify-between items-center mb-6">
    <div className="flex-1 max-w-lg">
      <div className="relative">
        <input 
          type="text" 
          placeholder="Search here" 
          className="w-full py-4 px-4 rounded-md bg-[#F5F5F5] text-[#8C8C8C] placeholder-[#8C8C8C]  placeholder:text-[18px] font-DMSansRegular"
        />
        <div className="absolute right-3 top-[10px] flex">
          <div className=" flex gap-4 border rounded-[8px] border-[#D9D9D9] bg-white px-2 py-1  ">
            <img src="/assets/search.svg" />
            <div className="text-black  font-DMSansRegular font-semibold">F</div>
          </div>
          
        </div>
      </div>
    </div>
    
    <div className="flex items-center">
      <button className="p-2 bg-whiterounded-md mr-4">
        <Bell size={20} className='text-black' />
      </button>
      <div className="flex flex-col md:flex-row md:items-center items-end">
        <div className="h-10 w-10 bg-white rounded-md md:mr-3"></div>
        <div className='font-DMSansRegular '>
          <div className="text-white text-end md:text-left font-[500] text-[16px]">Zaid Alrumi</div>
          <div className="text-white  font-[400] text-[12px]">Zaidrumione@gmail.com</div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default TopBar