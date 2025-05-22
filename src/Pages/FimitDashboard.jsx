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
} from "lucide-react";
import { auth, db } from "../firebase"; // Adjust the path based on your file structure
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

export default function FimitDashboard() {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Set current month as default
  const getCurrentMonth = () => months[new Date().getMonth()];

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  // Add current user state
  const [currentUser, setCurrentUser] = useState(null);

  // Dashboard data states
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
  const [selectedPointIndex, setSelectedPointIndex] = useState(2); // Default to center (0-based index, middle of 6 points)

  // Fetch admin data and stats on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user); // Store the current user
        await fetchAdminData(user.uid);
        await fetchDashboardStats(user.uid);
      } else {
        setCurrentUser(null);
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
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setAdminData({
          name: data.name || "Admin",
          adminCode: data.adminCode || "",
        });
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  // Clean version of fetchDashboardStats function
  const fetchDashboardStats = async (uid) => {
    try {
      setLoading(true);

      // Get admin's data first to get adminCode
      const adminDoc = await getDoc(doc(db, "users", uid));
      if (!adminDoc.exists()) return;

      const adminCode = adminDoc.data().adminCode;

      // Fetch users associated with this admin
      const usersQuery = query(
        collection(db, "users"),
        where("adminCode", "==", adminCode),
        where("type", "==", "User")
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
          // Correctly handle Firebase timestamp
          let creationDate;

          // Check if it's a Firebase timestamp (has toDate method)
          if (userData.creationDate.toDate) {
            creationDate = userData.creationDate.toDate();
          } else {
            // Fallback to parsing string date if not a timestamp
            creationDate = new Date(userData.creationDate);
          }

          const monthYear = `${creationDate.getFullYear()}-${(
            creationDate.getMonth() + 1
          )
            .toString()
            .padStart(2, "0")}`;
          monthlyUsers[monthYear] = (monthlyUsers[monthYear] || 0) + 1;
        }
      });

      setMonthlyUserData(monthlyUsers);

      // Fetch floor scans for all associated users
      let totalScans = 0;
      let weeklyScans = 0;

      // Calculate start of current week (Monday)
      const now = new Date();
      const startOfWeek = new Date(now);
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days to Monday
      startOfWeek.setDate(now.getDate() - daysFromMonday);
      startOfWeek.setHours(0, 0, 0, 0); // Start of the day

      // Query floor scans for all associated users
      if (userIds.length > 0) {
        // Process in batches since Firestore 'in' query limit is 10
        const batchSize = 10;

        for (let i = 0; i < userIds.length; i += batchSize) {
          const batch = userIds.slice(i, i + batchSize);

          const scansQuery = query(
            collection(db, "projects"),
            where("creatorID", "in", batch)
          );

          const scansSnapshot = await getDocs(scansQuery);

          scansSnapshot.forEach((docSnap) => {
            totalScans++;
            const scanData = docSnap.data();

            // Handle different possible timestamp field names
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

              // Check if scan is from this week
              if (scanDate >= startOfWeek) {
                weeklyScans++;
              }
            }
          });
        }
      }

      setStats({
        totalUsers,
        totalFloorsScanned: totalScans,
        scansThisWeek: weeklyScans,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Clean useEffect for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchAdminData(user.uid);
        await fetchDashboardStats(user.uid);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Update chart data with selected month in center
  const updateChartData = () => {
    const currentYear = new Date().getFullYear();
    const selectedMonthIndex = months.indexOf(selectedMonth);

    // Generate chart data with selected month in center (2 months before, selected month, 3 months after)
    const newChartData = [];

    // Add 2 months before selected month
    for (let i = 2; i >= 1; i--) {
      let monthIndex = selectedMonthIndex - i;
      let year = currentYear;

      // Handle year wraparound
      if (monthIndex < 0) {
        monthIndex += 12;
        year -= 1;
      }

      const monthName = months[monthIndex].slice(0, 3);
      const monthYear = `${year}-${(monthIndex + 1)
        .toString()
        .padStart(2, "0")}`;
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

    // Add selected month in the center
    const selectedMonthYear = `${currentYear}-${(selectedMonthIndex + 1)
      .toString()
      .padStart(2, "0")}`;
    const selectedMonthValue = monthlyUserData[selectedMonthYear] || 0;

    newChartData.push({
      month: selectedMonth.slice(0, 3),
      fullMonth: selectedMonth,
      value: selectedMonthValue,
      percentage: 0,
      isSelected: true,
      monthYear: selectedMonthYear,
    });

    // Add 3 months after selected month
    for (let i = 1; i <= 3; i++) {
      let monthIndex = (selectedMonthIndex + i) % 12;
      let year = currentYear;

      // Handle year wraparound
      if (monthIndex < selectedMonthIndex) {
        year += 1;
      }

      const monthName = months[monthIndex].slice(0, 3);
      const monthYear = `${year}-${(monthIndex + 1)
        .toString()
        .padStart(2, "0")}`;
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

    // Calculate percentages
    const maxValue = Math.max(...newChartData.map((d) => d.value), 1);
    newChartData.forEach((data) => {
      data.percentage = (data.value / maxValue) * 100;
    });

    // Set the selected point index to the center point (2)
    setSelectedPointIndex(2);
    setChartData(newChartData);
  };

  // Calculate growth percentage based on selected month compared to previous month
  const getGrowthPercentage = () => {
    if (chartData.length < 3) return 0; // Need at least selected month and one before

    // Find the selected month (should be at index 2)
    const selectedIndex = chartData.findIndex((data) => data.isSelected);
    if (selectedIndex < 0 || selectedIndex === 0) return 0;

    const currentMonth = chartData[selectedIndex].value;
    const previousMonth = chartData[selectedIndex - 1].value;

    if (previousMonth === 0) return currentMonth > 0 ? 100 : 0;
    return Math.round(((currentMonth - previousMonth) / previousMonth) * 100);
  };

  // Handle month selection from dropdown
  const handleMonthSelection = (month) => {
    setSelectedMonth(month);
    setShowMonthDropdown(false);
  };

  // Open and close modal handlers
  const openCategoriesModal = () => {
    console.log("Opening categories modal..."); // Debug log
    setIsModalOpen(true);
  };

  const closeCategoriesModal = () => {
    console.log("Closing categories modal..."); // Debug log
    setIsModalOpen(false);
  };

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
          <div className="bg-white flex flex-col gap-8 font-poppins p-4 rounded-lg">
            <div className="flex justify-between">
              <div className="flex items-center">
                <div className="bg-[#1E3A5F] p-2 rounded-md mr-3">
                  <Users size={20} />
                </div>
                <span className="text-black">Total Users</span>
              </div>
              <Info size={20} className="text-black" />
            </div>
            <div className="text-[32px] text-black font-[500]">
              {loading ? "..." : stats.totalUsers.toLocaleString()}
            </div>
          </div>

          <div className="bg-white flex flex-col gap-8 font-poppins p-4 rounded-lg">
            <div className="flex justify-between">
              <div className="flex items-center">
                <div className="bg-[#1E3A5F] p-2 rounded-md mr-3">
                  <img src="/assets/scanned.svg" alt="" />
                </div>
                <span className="text-black">Total Floors Scanned</span>
              </div>
              <Info size={20} className="text-black" />
            </div>
            <div className="text-[32px] text-black font-[500]">
              {loading ? "..." : stats.totalFloorsScanned.toLocaleString()}
            </div>
          </div>

          <div className="bg-white flex flex-col gap-8 font-poppins p-4 rounded-lg">
            <div className="flex justify-between">
              <div className="flex items-center">
                <div className="bg-[#1E3A5F] p-2 rounded-md mr-3">
                  <FileText size={20} />
                </div>
                <span className="text-black">Scans This Week</span>
              </div>
              <Info size={20} className="text-black" />
            </div>
            <div className="text-[32px] text-black font-[500]">
              {loading ? "..." : stats.scansThisWeek.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Graph Card - Redesigned */}
        <div className="bg-white p-6 rounded-lg font-DMSansRegular shadow-sm">
          {/* Header */}
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
              <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <MoreHorizontal size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Growth Percentage */}
          <div className="mb-6">
            <span className="text-lg text-gray-900 font-semibold">
              {getGrowthPercentage()}% Growth
            </span>
          </div>

          {/* Chart Container */}
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
                    <linearGradient
                      id="areaGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#1E3A5F" stopOpacity={0.3} />
                      <stop
                        offset="100%"
                        stopColor="#1E3A5F"
                        stopOpacity={0.05}
                      />
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

                  {/* Highlighted dot on selected month */}
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

        {/* Add Categories Modal - Fixed with adminId prop */}
        <AddCategories
          isOpen={isModalOpen}
          onClose={closeCategoriesModal}
          adminId={currentUser?.uid} // Pass the current user's UID as adminId
        />
      </div>
    </div>
  );
}
