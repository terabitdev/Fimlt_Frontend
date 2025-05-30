

import { useState, useEffect } from "react";
import SideBar from "../Components/SideBar";
import TopBar from "../Components/TopBar";
import AddCategories from "../Modal/AddCategories";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import {
  MoreHorizontal,
  Users,
  FileText,
  Info,
  Plus,
  ChevronDown,
  X,
} from "lucide-react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";

export default function FimitDashboard() {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const getCurrentMonth = () => months[new Date().getMonth()];

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [adminData, setAdminData] = useState({
    name: "",
    adminCode: "",
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFloorsScanned: 0,
    scansThisWeek: 0,
  });
  const [monthlyUserData, setMonthlyUserData] = useState({});
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPointIndex, setSelectedPointIndex] = useState(2);

  // Tooltip state
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Store unsubscribe functions for cleanup
  const [unsubscribeFunctions, setUnsubscribeFunctions] = useState([]);

  // Tooltip data
  const tooltipData = {
    totalUsers: {
      title: "Total Users",
      description: "Total number of active users registered under your admin account. This includes all users who have signed up with your admin code and have access to the system.",
      details: [
        "Includes only users with 'User' type",
        "Users must be associated with your admin code",
        "Count updates in real-time as new users register"
      ]
    },
    totalFloorsScanned: {
      title: "Total Floors Scanned",
      description: "Total number of floor scanning projects completed by all users under your admin account. Each project represents a complete floor scan session.",
      details: [
        "Counts all completed scanning projects",
        "Includes scans from all users in your organization",
        "Updates automatically when new scans are completed"
      ]
    },
    scansThisWeek: {
      title: "Scans This Week",
      description: "Number of floor scanning projects completed from Monday of the current week until now. This metric helps track weekly activity and productivity.",
      details: [
        "Week starts on Monday at 12:00 AM",
        "Includes scans from all users in your team",
        "Resets every Monday for the new week"
      ]
    }
  };

  // Helper function to clean up listeners
  const cleanupListeners = (listeners) => {
    listeners.forEach(listener => {
      if (typeof listener === 'function') {
        listener();
      } else if (listener && typeof listener.unsubscribe === 'function') {
        listener.unsubscribe();
      }
    });
  };

  // Fetch admin data (one-time fetch as this rarely changes)
  const fetchAdminData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setAdminData({
          name: data.name || "Admin",
          adminCode: data.adminCode || "",
        });
        
        setupRealtimeListeners(uid, data.adminCode);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  // Setup real-time listeners for users and projects
  const setupRealtimeListeners = (uid, adminCode) => {
    const unsubscribes = [];

    try {
      setLoading(true);

      const usersQuery = query(
        collection(db, "users"),
        where("adminCode", "==", adminCode),
        where("type", "==", "User")
      );

      const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
        const totalUsers = snapshot.size;
        const monthlyUsers = {};
        const userIds = [];

        snapshot.forEach((doc) => {
          userIds.push(doc.id);
          
          const userData = doc.data();
          if (userData.creationDate) {
            let creationDate;
            
            if (userData.creationDate.toDate) {
              creationDate = userData.creationDate.toDate();
            } else {
              creationDate = new Date(userData.creationDate);
            }

            const monthYear = `${creationDate.getFullYear()}-${(
              creationDate.getMonth() + 1
            ).toString().padStart(2, "0")}`;
            monthlyUsers[monthYear] = (monthlyUsers[monthYear] || 0) + 1;
          }
        });

        setMonthlyUserData(monthlyUsers);
        
        setStats(prevStats => ({
          ...prevStats,
          totalUsers
        }));

        if (userIds.length > 0) {
          setupProjectsListener(userIds);
        } else {
          setStats(prevStats => ({
            ...prevStats,
            totalFloorsScanned: 0,
            scansThisWeek: 0
          }));
          setLoading(false);
        }
      });

      const wrappedUsersUnsubscribe = {
        unsubscribe: unsubscribeUsers,
        listenerType: 'users'
      };
      
      unsubscribes.push(wrappedUsersUnsubscribe);
      setUnsubscribeFunctions(unsubscribes);

    } catch (error) {
      console.error("Error setting up real-time listeners:", error);
      setLoading(false);
    }
  };

  // Setup real-time listener for projects
  const setupProjectsListener = (userIds) => {
    const existingUnsubscribes = unsubscribeFunctions.filter(listener => {
      if (typeof listener === 'function') {
        return true;
      }
      return listener.listenerType !== 'projects';
    });
    
    const batchSize = 10;
    const projectUnsubscribes = [];

    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      
      const projectsQuery = query(
        collection(db, "projects"),
        where("creatorID", "in", batch)
      );

      const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
        let totalScans = 0;
        let weeklyScans = 0;

        const now = new Date();
        const startOfWeek = new Date(now);
        const dayOfWeek = now.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(now.getDate() - daysFromMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        snapshot.forEach((docSnap) => {
          totalScans++;
          const scanData = docSnap.data();
          
          let scanTimestamp = scanData.creationDate;
          if (scanTimestamp) {
            let scanDate;
            
            if (scanTimestamp.toDate) {
              scanDate = scanTimestamp.toDate();
            } else if (scanTimestamp.seconds) {
              scanDate = new Date(scanTimestamp.seconds * 1000);
            } else {
              scanDate = new Date(scanTimestamp);
            }

            if (scanDate >= startOfWeek) {
              weeklyScans++;
            }
          }
        });

        setStats(prevStats => ({
          ...prevStats,
          totalFloorsScanned: totalScans,
          scansThisWeek: weeklyScans
        }));

        setLoading(false);
      });

      const wrappedUnsubscribe = {
        unsubscribe: unsubscribeProjects,
        listenerType: 'projects'
      };
      
      projectUnsubscribes.push(wrappedUnsubscribe);
    }

    setUnsubscribeFunctions([...existingUnsubscribes, ...projectUnsubscribes]);
  };

  // Auth state change effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchAdminData(user.uid);
      } else {
        setCurrentUser(null);
        cleanupListeners(unsubscribeFunctions);
        setUnsubscribeFunctions([]);
      }
    });

    return () => {
      unsubscribe();
      cleanupListeners(unsubscribeFunctions);
    };
  }, []);

  useEffect(() => {
    return () => {
      cleanupListeners(unsubscribeFunctions);
    };
  }, [unsubscribeFunctions]);

  useEffect(() => {
    updateChartData();
  }, [selectedMonth, monthlyUserData]);

  // Update chart data with selected month in center
  const updateChartData = () => {
    const currentYear = new Date().getFullYear();
    const selectedMonthIndex = months.indexOf(selectedMonth);

    const newChartData = [];

    for (let i = 2; i >= 1; i--) {
      let monthIndex = selectedMonthIndex - i;
      let year = currentYear;

      if (monthIndex < 0) {
        monthIndex += 12;
        year -= 1;
      }

      const monthName = months[monthIndex].slice(0, 3);
      const monthYear = `${year}-${(monthIndex + 1).toString().padStart(2, "0")}`;
      const value = monthlyUserData[monthYear] || 0;

      newChartData.push({
        month: monthName,
        fullMonth: months[monthIndex],
        value: value,
        percentage: 0,
        isSelected: false,
        monthYear: monthYear,
      });
    }

    const selectedMonthYear = `${currentYear}-${(selectedMonthIndex + 1).toString().padStart(2, "0")}`;
    const selectedMonthValue = monthlyUserData[selectedMonthYear] || 0;

    newChartData.push({
      month: selectedMonth.slice(0, 3),
      fullMonth: selectedMonth,
      value: selectedMonthValue,
      percentage: 0,
      isSelected: true,
      monthYear: selectedMonthYear,
    });

    for (let i = 1; i <= 3; i++) {
      let monthIndex = (selectedMonthIndex + i) % 12;
      let year = currentYear;

      if (monthIndex < selectedMonthIndex) {
        year += 1;
      }

      const monthName = months[monthIndex].slice(0, 3);
      const monthYear = `${year}-${(monthIndex + 1).toString().padStart(2, "0")}`;
      const value = monthlyUserData[monthYear] || 0;

      newChartData.push({
        month: monthName,
        fullMonth: months[monthIndex],
        value: value,
        percentage: 0,
        isSelected: false,
        monthYear: monthYear,
      });
    }

    const maxValue = Math.max(...newChartData.map((d) => d.value), 1);
    newChartData.forEach((data) => {
      data.percentage = (data.value / maxValue) * 100;
    });

    setSelectedPointIndex(2);
    setChartData(newChartData);
  };

  // Calculate growth percentage
  const getGrowthPercentage = () => {
    if (chartData.length < 3) return 0;

    const selectedIndex = chartData.findIndex((data) => data.isSelected);
    if (selectedIndex < 0 || selectedIndex === 0) return 0;

    const currentMonth = chartData[selectedIndex].value;
    const previousMonth = chartData[selectedIndex - 1].value;

    if (previousMonth === 0) return currentMonth > 0 ? 100 : 0;
    return Math.round(((currentMonth - previousMonth) / previousMonth) * 100);
  };

  // Handle month selection
  const handleMonthSelection = (month) => {
    setSelectedMonth(month);
    setShowMonthDropdown(false);
  };

  // Modal handlers
  const openCategoriesModal = () => {
    setIsModalOpen(true);
  };

  const closeCategoriesModal = () => {
    setIsModalOpen(false);
  };

  // Tooltip handlers
  const handleTooltipClick = (tooltipType) => {
    setActiveTooltip(activeTooltip === tooltipType ? null : tooltipType);
  };

  const closeTooltip = () => {
    setActiveTooltip(null);
  };

  // Tooltip component
  const Tooltip = ({ type, data }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={closeTooltip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="pr-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {data.title}
          </h3>
          
          <p className="text-gray-700 mb-4 leading-relaxed">
            {data.description}
          </p>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 text-sm">Key Points:</h4>
            <ul className="space-y-1">
              {data.details.map((detail, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="text-[#1E3A5F] mr-2">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

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
            Welcome, {adminData.name || "Loading..."}!
          </h1>
          <button
            onClick={openCategoriesModal}
            className="bg-[#1E3A5F] text-white py-2 px-4 rounded-md flex items-center hover:bg-[#2A4F7F] transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Category
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Total Users Card */}
          <div className="bg-white flex flex-col gap-8 font-poppins p-4 rounded-lg">
            <div className="flex justify-between">
              <div className="flex items-center">
                <div className="bg-[#1E3A5F] p-2 rounded-md mr-3">
                  <Users size={20} />
                </div>
                <span className="text-black">Total Users</span>
              </div>
              <button
                onClick={() => handleTooltipClick('totalUsers')}
                className="text-black hover:text-[#1E3A5F] transition-colors"
              >
                <Info size={20} />
              </button>
            </div>
            <div className="text-[32px] text-black font-[500]">
              {loading ? "..." : stats.totalUsers.toLocaleString()}
            </div>
          </div>

          {/* Total Floors Scanned Card */}
          <div className="bg-white flex flex-col gap-8 font-poppins p-4 rounded-lg">
            <div className="flex justify-between">
              <div className="flex items-center">
                <div className="bg-[#1E3A5F] p-2 rounded-md mr-3">
                  <img src="/assets/scanned.svg" alt="" />
                </div>
                <span className="text-black">Total Floors Scanned</span>
              </div>
              <button
                onClick={() => handleTooltipClick('totalFloorsScanned')}
                className="text-black hover:text-[#1E3A5F] transition-colors"
              >
                <Info size={20} />
              </button>
            </div>
            <div className="text-[32px] text-black font-[500]">
              {loading ? "..." : stats.totalFloorsScanned.toLocaleString()}
            </div>
          </div>

          {/* Scans This Week Card */}
          <div className="bg-white flex flex-col gap-8 font-poppins p-4 rounded-lg">
            <div className="flex justify-between">
              <div className="flex items-center">
                <div className="bg-[#1E3A5F] p-2 rounded-md mr-3">
                  <FileText size={20} />
                </div>
                <span className="text-black">Scans This Week</span>
              </div>
              <button
                onClick={() => handleTooltipClick('scansThisWeek')}
                className="text-black hover:text-[#1E3A5F] transition-colors"
              >
                <Info size={20} />
              </button>
            </div>
            <div className="text-[32px] text-black font-[500]">
              {loading ? "..." : stats.scansThisWeek.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Graph Card */}
        <div className="bg-white p-6 rounded-lg font-DMSansRegular shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">New Users</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span>{selectedMonth}</span>
                  <ChevronDown size={16} />
                </button>

                {showMonthDropdown && (
                  <div className="absolute right-0 mt-2 w-48 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {months.map((month) => (
                      <button
                        key={month}
                        onClick={() => handleMonthSelection(month)}
                        className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${
                          month === selectedMonth
                            ? "bg-gray-100 text-[#1E3A5F] font-semibold"
                            : "text-black"
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <MoreHorizontal size={20} className="text-gray-600" />
              </button> */}
            </div>
          </div>

          <div className="mb-6">
            <span className="text-lg text-gray-900 font-semibold">
              {getGrowthPercentage()}% Growth
            </span>
          </div>

          <div className="h-80 w-full">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading chart data...</div>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1E3A5F" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#1E3A5F" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 14, fill: "#9ca3af" }}
                    dy={10}
                  />

                  <YAxis
                    domain={[0, 100]}
                    ticks={[20, 40, 60, 80, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 14, fill: "#9ca3af" }}
                    tickFormatter={(value) => `${value}%`}
                    dx={-10}
                  />

                  <Area
                    type="monotone"
                    dataKey="percentage"
                    stroke="#1E3A5F"
                    strokeWidth={3}
                    fill="url(#areaGradient)"
                    dot={false}
                  />

                  {chartData.map(
                    (point, index) =>
                      point.isSelected && (
                        <ReferenceDot
                          key={index}
                          x={point.month}
                          y={point.percentage}
                          r={6}
                          fill="#1E3A5F"
                          stroke="#ffffff"
                          strokeWidth={3}
                        />
                      )
                  )}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">No data available</div>
              </div>
            )}
          </div>
        </div>

        {/* Tooltips */}
        {activeTooltip && (
          <Tooltip
            type={activeTooltip}
            data={tooltipData[activeTooltip]}
          />
        )}

        <AddCategories
          isOpen={isModalOpen}
          onClose={closeCategoriesModal}
          adminId={currentUser?.uid}
        />
      </div>
    </div>
  );
}