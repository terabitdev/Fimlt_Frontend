

import { useState } from 'react';
import { 
  MoreHorizontal, 
  Home, 
  Users, 
  FileText, 
  LogOut, 
  Info,
  Search,
  Bell,
  Plus,
  ChevronDown
} from 'lucide-react';

export default function FimitDashboard() {
  const [selectedMonth, setSelectedMonth] = useState('Month');
  
  // Chart data points (representing the curve)
  const chartData = [
    { month: 'Jan', value: 62 },
    { month: 'Feb', value: 48 },
    { month: 'Mar', value: 60 },
    { month: 'Apr', value: 75 },
    { month: 'May', value: 55 },
    { month: 'Jun', value: 64 }
  ];
  
  // Generate SVG path for the chart line
  const generatePath = () => {
    // Map data to coordinates
    const points = chartData.map((point, index) => {
      const x = (index / (chartData.length - 1)) * 100;
      // Invert the y scale (100 - value) since SVG coordinates increase downward
      const y = 100 - point.value;
      return { x, y };
    });
    
    let path = `M${points[0].x},${points[0].y}`;
    
    // Create curved path using cubic bezier
    for (let i = 0; i < points.length - 1; i++) {
      const x1 = points[i].x + (points[i + 1].x - points[i].x) / 3;
      const y1 = points[i].y;
      const x2 = points[i].x + 2 * (points[i + 1].x - points[i].x) / 3;
      const y2 = points[i + 1].y;
      const x = points[i + 1].x;
      const y = points[i + 1].y;
      
      path += ` C${x1},${y1} ${x2},${y2} ${x},${y}`;
    }
    
    return path;
  };
  
  // Generate area path (path + bottom closure)
  const generateAreaPath = () => {
    const linePath = generatePath();
    return `${linePath} L100,100 L0,100 Z`;
  };

  return (
    <div className="flex min-h-screen h-full bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 bg-[#111111] rounded-[10px] p-4 m-4 flex flex-col">
        <div className="flex items-center mb-8">
          <div className="bg-blue-800 rounded p-2 mr-3">
            <div className="text-white font-bold text-xl">F</div>
          </div>
          <div className="text-white font-bold text-3xl">FIMIT</div>
        </div>
        
        <div className="text-gray-400 mb-4">Main Menu</div>
        
        <div className="bg-blue-900 text-white p-3 rounded flex items-center mb-2">
          <Home className="mr-3" />
          <span>Home</span>
        </div>
        
        <div className="text-white p-3 rounded flex items-center mb-2 hover:bg-gray-800">
          <Users className="mr-3" />
          <span>Users Management</span>
        </div>
        
        <div className="text-white p-3 rounded flex items-center mb-2 hover:bg-gray-800">
          <FileText className="mr-3" />
          <span>Floors Plan</span>
        </div>
        
        <div className="mt-auto text-white p-3 rounded flex items-center hover:bg-gray-800">
          <LogOut className="mr-3" />
          <span>Logout</span>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search here" 
                className="w-full py-2 px-4 rounded-md bg-gray-800 text-white"
              />
              <div className="absolute right-3 top-2 flex">
                <div className="border-r border-gray-600 pr-2 mr-2">
                  <Search size={20} className="text-gray-400" />
                </div>
                <div className="text-gray-400 font-semibold">F</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <button className="p-2 bg-gray-800 rounded-md mr-4">
              <Bell size={20} />
            </button>
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gray-600 rounded-md mr-3"></div>
              <div>
                <div className="text-white font-semibold">Zaid Alrumi</div>
                <div className="text-gray-400 text-sm">Zaidrumione@gmail.com</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Welcome */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Welcome, Zaid!</h1>
          <button className="bg-blue-800 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center">
            <Plus size={20} className="mr-2" />
            Add Category
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-blue-900 p-2 rounded-md mr-3">
                  <Users size={20} />
                </div>
                <span>Total Users</span>
              </div>
              <Info size={20} className="text-gray-400" />
            </div>
            <div className="text-4xl font-bold">4,150</div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-blue-900 p-2 rounded-md mr-3">
                  <FileText size={20} />
                </div>
                <span>Total Floors Scanned</span>
              </div>
              <Info size={20} className="text-gray-400" />
            </div>
            <div className="text-4xl font-bold">2,120</div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-blue-900 p-2 rounded-md mr-3">
                  <FileText size={20} />
                </div>
                <span>Scans This Week</span>
              </div>
              <Info size={20} className="text-gray-400" />
            </div>
            <div className="text-4xl font-bold">3,189</div>
          </div>
        </div>
        
        {/* Graph Card */}
        <div className="bg-white p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl text-black font-semibold">New Users</h2>
            <div className="flex items-center gap-2">
              <button className="border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-2 text-gray-700">
                {selectedMonth}
                <ChevronDown size={16} />
              </button>
              <button className="text-gray-500">
                <MoreHorizontal size={20} />
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
            <div className="absolute left-12 right-0 top-0 bottom-6 overflow-hidden">
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
                  strokeWidth="2" 
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
              <div className="absolute left-[20%] top-0 bottom-0 flex items-center justify-center pointer-events-none">
                <div className="h-full w-1 bg-gradient-to-b from-blue-800 to-transparent opacity-70 rounded-full"></div>
                <div className="absolute top-[52%] w-4 h-4 bg-blue-800 rounded-full border-2 border-white shadow-md transform -translate-x-1/2"></div>
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
      </div>
    </div>
  );
}