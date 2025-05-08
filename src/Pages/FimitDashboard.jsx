

import { useState } from 'react';
import SideBar from '../Components/SideBar';
import TopBar from '../Components/TopBar';
import AddCategories from '../Modal/AddCategories';
import { 
  MoreHorizontal, 
  Users, 
  FileText, 
  Info,
  Plus,
  ChevronDown
} from 'lucide-react';

export default function FimitDashboard() {
  const [selectedMonth, setSelectedMonth] = useState('Month');
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  
  // Chart data points (representing the curve)
  const chartData = [
    { month: 'Jan', value: 62 },
    { month: 'Feb', value: 48 },
    { month: 'Mar', value: 60 },
    { month: 'Apr', value: 75 },
    { month: 'May', value: 55 },
    { month: 'Jun', value: 62 }
  ];
  
  // Generate SVG path for the chart line - smoother curve that matches image exactly
  const generatePath = () => {
    // Custom path that matches the image exactly
    return "M0,38 C16.6667,50 33.3333,62 50,48 C66.6667,34 83.3333,20 100,38";
  };
  
  // Generate area path (path + bottom closure)
  const generateAreaPath = () => {
    const linePath = generatePath();
    return `${linePath} L100,100 L0,100 Z`;
  };

  // Open and close modal handlers
  const openCategoriesModal = () => setIsModalOpen(true);
  const closeCategoriesModal = () => setIsModalOpen(false);

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
          <h1 className=" text-2xl md:text-3xl font-[500]">Welcome, Zaid!</h1>
          <button 
            onClick={openCategoriesModal} // Use click handler to open modal
            className="bg-[#1E3A5F] text-white py-2 px-4 rounded-md flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Category
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white flex flex-col gap-8 font-poppins p-4 rounded-lg">
            <div className="flex justify-between">
              <div className="flex items-center">
                <div className="bg-[#1E3A5F] p-2 rounded-md mr-3">
                  <Users size={20} />
                </div>
                <span className='text-black'>Total Users</span>
              </div>
              <Info size={20} className="text-black" />
            </div>
            <div className="text-[32px] text-black font-[500]">4,150</div>
          </div>
          
          <div className="bg-white flex flex-col gap-8 font-poppins p-4 rounded-lg">
            <div className="flex justify-between ">
              <div className="flex items-center">
                <div className="bg-[#1E3A5F] p-2 rounded-md mr-3">
                  <img src="/assets/scanned.svg" alt="" />
                </div>
                <span className='text-black'>Total Floors Scanned</span>
              </div>
              <Info size={20} className="text-black" />
            </div>
            <div className="text-[32px] text-black font-[500]">2,120</div>
          </div>
          
          <div className="bg-white flex flex-col gap-8 font-poppins p-4 rounded-lg">
            <div className="flex justify-between">
              <div className="flex items-center">
                <div className="bg-[#1E3A5F] p-2 rounded-md mr-3">
                  <FileText size={20} />
                </div>
                <span className='text-black'>Scans This Week</span>
              </div>
              <Info size={20} className="text-black" />
            </div>
            <div className="text-[32px] text-black font-[500]">3,189</div>
          </div>
        </div>
        
        {/* Graph Card */}
        <div className="bg-white p-6 rounded-lg font-DMSansRegular">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[24px] text-black font-[500]">New Users</h2>
            <div className="flex flex-col items-end gap-2">
            <button className="text-black">
                <MoreHorizontal size={20} />
              </button>
              <button className="border border-[#D9D9D9] rounded-lg px-4 py-2 flex items-center gap-2 text-black">
                {selectedMonth}
                <ChevronDown size={16} className='text-black' />
              </button>
              
            </div>
          </div>
          
          <div className="text-lg text-black font-semibold mb-6">70%</div>
          
          <div className="h-64 relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-gray-500 text-sm pr-2">
              <div>100%</div>
              <div>80%</div>
              <div>60%</div>
              <div>30%</div>
              <div>10%</div>
            </div>
            
            {/* Chart area */}
            <div className="absolute left-12 right-0 top-5 bottom-6 overflow-hidden">
              {/* Chart SVG */}
              <svg className="w-full h-full" preserveAspectRatio="none">
                {/* Area under curve */}
                <path 
                  d={generateAreaPath()}
                  fill="url(#blue-gradient)" 
                  opacity="0.6"
                />
                
                {/* Line on top */}
                <path 
                  d={generatePath()}
                  stroke="#2c4b7c" 
                  strokeWidth="3" 
                  fill="none" 
                />
                
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b3c4e6" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#e9edf7" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* February data point indicator */}
              <div className="absolute left-[20%] top-5 bottom-0 flex items-center justify-center pointer-events-none">
                <div className="h-full w-6 bg-gradient-to-b from-[#1E3A5F] to-transparent opacity-70 rounded-full"></div>
                <div className="absolute left-[12px] top-2 w-4 h-4 bg-white rounded-full border-2 border-white shadow-md transform -translate-x-1/2"></div>
              </div>
            </div>
            
            {/* X-axis labels */}
            <div className="absolute left-12 right-0 bottom-0 flex justify-between text-gray-500 text-sm">
              {chartData.map((point) => (
                <div key={point.month}>{point.month}</div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Add Categories Modal */}
        <AddCategories 
          isOpen={isModalOpen} 
          onClose={closeCategoriesModal} 
        />
      </div>
    </div>
  );
}