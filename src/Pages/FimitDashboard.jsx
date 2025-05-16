
import { useState, useEffect } from 'react';
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
import { auth, db } from '../firebase'; // Adjust the path based on your file structure
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, Timestamp } from 'firebase/firestore';

export default function FimitDashboard() {
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  
  // Dashboard data states
  const [adminData, setAdminData] = useState({
    name: '',
    adminCode: ''
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFloorsScanned: 0,
    scansThisWeek: 0
  });
  const [monthlyUserData, setMonthlyUserData] = useState({});
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fetch admin data and stats on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchAdminData(user.uid);
        await fetchDashboardStats(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // Update chart data when selected month changes
  useEffect(() => {
    updateChartData();
  }, [selectedMonth, monthlyUserData]);

  // Fetch admin data from Firestore
  const fetchAdminData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setAdminData({
          name: data.name || 'Admin',
          adminCode: data.adminCode || ''
        });
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async (uid) => {
    try {
      setLoading(true);
      
      // Get admin's data first to get adminCode
      const adminDoc = await getDoc(doc(db, 'users', uid));
      if (!adminDoc.exists()) return;
      
      const adminCode = adminDoc.data().adminCode;
      
      // Fetch users associated with this admin
      const usersQuery = query(
        collection(db, 'users'),
        where('refralCode', '==', adminCode),
        where('type', '==', 'User')
      );
      const usersSnapshot = await getDocs(usersQuery);
      const totalUsers = usersSnapshot.size;
      
      // Get user IDs for floor scan queries
      const userIds = [];
      const monthlyUsers = {};
      
      usersSnapshot.forEach((doc) => {
        userIds.push(doc.id);
        
        // Track users by month for the chart
        const userData = doc.data();
        if (userData.creationDate) {
          // Parse the date string to get month and year
          const date = new Date(userData.creationDate);
          const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          monthlyUsers[monthYear] = (monthlyUsers[monthYear] || 0) + 1;
        }
      });
      
      setMonthlyUserData(monthlyUsers);
      
      // Fetch floor scans for all associated users
      let totalScans = 0;
      let weeklyScans = 0;
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      // Query floor scans (assuming there's a projects collection)
      if (userIds.length > 0) {
        // Process in batches if there are many users (Firestore 'in' query limit is 10)
        const batchSize = 10;
        for (let i = 0; i < userIds.length; i += batchSize) {
          const batch = userIds.slice(i, i + batchSize);
          const scansQuery = query(
            collection(db, 'projects'),
            where('userId', 'in', batch)
          );
          
          const scansSnapshot = await getDocs(scansQuery);
          scansSnapshot.forEach((doc) => {
            totalScans++;
            const scanData = doc.data();
            if (scanData.timestamp) {
              const scanDate = scanData.timestamp.toDate();
              if (scanDate >= oneWeekAgo) {
                weeklyScans++;
              }
            }
          });
        }
      }
      
      setStats({
        totalUsers,
        totalFloorsScanned: totalScans,
        scansThisWeek: weeklyScans
      });
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update chart data based on selected month and year
  const updateChartData = () => {
    const currentYear = new Date().getFullYear();
    const selectedMonthIndex = months.indexOf(selectedMonth);
    
    // Generate chart data for the selected month and 5 months before
    const newChartData = [];
    
    for (let i = 5; i >= 0; i--) {
      let monthIndex = selectedMonthIndex - i;
      let year = currentYear;
      
      // Handle year wraparound
      if (monthIndex < 0) {
        monthIndex += 12;
        year -= 1;
      }
      
      const monthName = months[monthIndex].slice(0, 3);
      const monthYear = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}`;
      const value = monthlyUserData[monthYear] || 0;
      
      newChartData.push({
        month: monthName,
        value: value,
        percentage: 0 // Will calculate this after we have all values
      });
    }
    
    // Calculate percentages
    const maxValue = Math.max(...newChartData.map(d => d.value), 1);
    newChartData.forEach(data => {
      data.percentage = (data.value / maxValue) * 100;
    });
    
    setChartData(newChartData);
  };

  // Generate SVG path for the chart line
  const generatePath = () => {
    if (chartData.length === 0) return '';
    
    const points = chartData.map((data, index) => {
      const x = (index / (chartData.length - 1)) * 100;
      const y = 100 - data.percentage;
      return `${x},${y}`;
    });
    
    // Create a smooth curve through the points
    let path = `M${points[0]}`;
    for (let i = 1; i < points.length; i++) {
      const [x0, y0] = points[i - 1].split(',').map(Number);
      const [x1, y1] = points[i].split(',').map(Number);
      const cx = (x0 + x1) / 2;
      const cy0 = y0;
      const cy1 = y1;
      path += ` C${cx},${cy0} ${cx},${cy1} ${x1},${y1}`;
    }
    
    return path;
  };

  // Generate area path (path + bottom closure)
  const generateAreaPath = () => {
    const linePath = generatePath();
    if (!linePath) return '';
    return `${linePath} L100,100 L0,100 Z`;
  };

  // Calculate the month with highest growth
  const getGrowthPercentage = () => {
    if (chartData.length < 2) return 0;
    const currentMonth = chartData[chartData.length - 1].value;
    const previousMonth = chartData[chartData.length - 2].value;
    if (previousMonth === 0) return currentMonth > 0 ? 100 : 0;
    return Math.round(((currentMonth - previousMonth) / previousMonth) * 100);
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
          <h1 className="text-2xl md:text-3xl font-[500]">
            Welcome, {adminData.name || 'Loading...'}!
          </h1>
          <button 
            onClick={openCategoriesModal}
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
            <div className="text-[32px] text-black font-[500]">
              {loading ? '...' : stats.totalUsers.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-white flex flex-col gap-8 font-poppins p-4 rounded-lg">
            <div className="flex justify-between">
              <div className="flex items-center">
                <div className="bg-[#1E3A5F] p-2 rounded-md mr-3">
                  <img src="/assets/scanned.svg" alt="" />
                </div>
                <span className='text-black'>Total Floors Scanned</span>
              </div>
              <Info size={20} className="text-black" />
            </div>
            <div className="text-[32px] text-black font-[500]">
              {loading ? '...' : stats.totalFloorsScanned.toLocaleString()}
            </div>
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
            <div className="text-[32px] text-black font-[500]">
              {loading ? '...' : stats.scansThisWeek.toLocaleString()}
            </div>
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
              <div className="relative">
                <button 
                  onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                  className="border border-[#D9D9D9] rounded-lg px-4 py-2 flex items-center gap-2 text-black"
                >
                  {selectedMonth}
                  <ChevronDown size={16} className='text-black' />
                </button>
                
                {showMonthDropdown && (
                  <div className="absolute right-0 mt-2 w-48 max-h-48 overflow-y-auto  bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {months.map((month) => (
                      <button
                        key={month}
                        onClick={() => {
                          setSelectedMonth(month);
                          setShowMonthDropdown(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-black hover:bg-gray-100"
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-lg text-black font-semibold mb-6">
            {getGrowthPercentage()}% Growth
          </div>
          
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
              <svg className="w-full h-full" preserveAspectRatio="none">
                {chartData.length > 0 && (
                  <>
                    <path 
                      d={generateAreaPath()}
                      fill="url(#blue-gradient)" 
                      opacity="0.6"
                    />
                    
                    <path 
                      d={generatePath()}
                      stroke="#2c4b7c" 
                      strokeWidth="3" 
                      fill="none" 
                    />
                  </>
                )}
                
                <defs>
                  <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b3c4e6" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#e9edf7" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Data points */}
              {chartData.map((point, index) => {
                const x = (index / (chartData.length - 1)) * 100;
                const y = 100 - point.percentage;
                return (
                  <div
                    key={index}
                    className="absolute transform -translate-x-1/2"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <div className="w-3 h-3 bg-white rounded-full border-2 border-[#1E3A5F]"></div>
                  </div>
                );
              })}
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