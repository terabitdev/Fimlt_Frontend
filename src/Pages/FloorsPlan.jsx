import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import SideBar from '../Components/SideBar';
import TopBar from '../Components/TopBar';
import { Link } from 'react-router-dom';
import FilterByCategories from '../Components/FloorsPlan/FilterByCategories';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const RecentFloorScansTable = () => {
  const [scansData, setScansData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Format the date helper function
  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = (hours % 12 || 12).toString();
    
    return `${day} ${month}, ${formattedHours}:${minutes} ${ampm}`;
  };

  // Fetch data from Firebase
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        // Create a reference to get all projects
        const projectsRef = collection(db, "projects");
        
        // Get all documents
        const querySnapshot = await getDocs(projectsRef);
        
        // Also get users to match with project creators
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        
        // Create a map of user UIDs to names for quick lookup
        const userMap = {};
        usersSnapshot.forEach((userDoc) => {
          const userData = userDoc.data();
          // Use the uid field from the user document as the key
          if (userData.uid) {
            userMap[userData.uid] = userData.name || "Unknown User";
          }
        });
        
        const projects = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Get the date (if available)
          const date = data.creationDate ? 
            new Date(data.creationDate) : 
            new Date();
          
          const formattedDate = formatDate(date);
          
          // Get the user who scanned the project using creatorID field
          const creatorID = data.creatorID;
          let scannedBy = "Unknown User";
          
          // Check if we have this user in our map
          if (creatorID && userMap[creatorID]) {
            scannedBy = userMap[creatorID];
          }
          
          // Count rooms from roomData array
          const roomCount = Array.isArray(data.roomData) ? data.roomData.length : 0;
          
          projects.push({
            id: doc.id,
            projectname: data.name || "Unnamed Project",
            scannedBy: scannedBy,
            date: formattedDate,
            room: `${roomCount} Rooms`,
            category: data.category || "Unknown"
          });
        });
        
        setScansData(projects);
        setFilteredData(projects);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects");
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Handle filter changes
  const handleFilterChange = (categories) => {
    setSelectedCategories(categories);
    
    if (categories.length === 0) {
      // If no categories selected, show all data
      setFilteredData(scansData);
    } else {
      // Filter data based on selected categories
      const filtered = scansData.filter(scan => 
        categories.some(cat => 
          scan.category.toLowerCase().includes(cat.toLowerCase())
        )
      );
      setFilteredData(filtered);
    }
  };

  if (loading) {
    return (
      <div className="w-full md:max-w-5xl xl:max-w-7xl max-w-[22rem] bg-white rounded-lg p-6">
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full md:max-w-5xl xl:max-w-7xl max-w-[22rem] bg-white rounded-lg p-6">
        <div className="flex justify-center items-center h-48">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:max-w-5xl xl:max-w-7xl max-w-[22rem] bg-white rounded-lg">
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-xl md:text-[27px] font-[600] font-OutfitBold text-[#1A1C21]">Recent Floor Scans Table</h2>
        <FilterByCategories onFilterChange={handleFilterChange} />
      </div>
      
      <div className="w-full overflow-x-auto">
        {filteredData.length > 0 ? (
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
            <tbody className="font-PublicSansMedium">
              {filteredData.map((scan) => (
                <tr key={scan.id}>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-[#1A1C21]">
                    {scan.projectname}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-[#1A1C21]">
                    {scan.scannedBy}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-[#1A1C21]">
                    {scan.date}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-[#1A1C21]">
                    {scan.room}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <Link to={`/project-details-floors-plan/${scan.id}`}>
                      <button className="inline-flex items-center bg-[#1E3A5F] justify-center p-2 bg-navy-800 text-white rounded-md">
                        <Eye size={20} />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex justify-center items-center h-48">
            <p className="text-gray-500 text-lg">
              {selectedCategories.length > 0 
                ? "No projects found with the selected categories" 
                : "No projects found"}
            </p>
          </div>
        )}
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
  );
}

export default FloorsPlan;