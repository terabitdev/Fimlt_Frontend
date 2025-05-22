
import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import SideBar from '../Components/SideBar';
import TopBar from '../Components/TopBar';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

// Loading Spinner Component - matching FloorsPlan style
const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div>
    </div>
  );
};

const RecentFloorScansTable = ({ usersData, loading }) => {
  return (
    <div className="w-full md:max-w-5xl xl:max-w-7xl max-w-[22rem] bg-white rounded-lg">
      <div className="p-6">
        <h2 className="text-[27px] font-[600] font-OutfitBold text-[#1A1C21]">Recent Floor Scans Table</h2>
      </div>
      
      <div className="max-w-xs md:max-w-5xl xl:max-w-7xl overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className='text-[12px] font-[600] font-OutfitBold text-black'>
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-900 border-t border-b border-gray-200">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-900 border-t border-b border-gray-200">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-900 border-t border-b border-gray-200">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-900 border-t border-b border-gray-200">
                Projects
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-900 border-t border-b border-gray-200">
                View
              </th>
            </tr>
          </thead>
          <tbody className="bg-white font-PublicSansMedium">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-0">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : usersData.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              usersData.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-[#1A1C21]">
                    {user.name}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-[#1A1C21]">
                    {user.email}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-[#1A1C21]">
                    {user.role}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-[#1A1C21]">
                    {user.projectCount} Projects
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <Link to={`/user-details/${user.id}`}>
                      <button className="inline-flex items-center bg-[#1E3A5F] justify-center p-2 text-white rounded-md hover:bg-[#2d4a73] transition-colors">
                        <Eye size={20} />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function UsersManagement() {
  const [usersData, setUsersData] = useState([]);
  const [filteredUsersData, setFilteredUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminCode, setAdminCode] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchAdminData(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (adminCode) {
      fetchUsersData();
    }
  }, [adminCode]);

  // Fetch admin data to get adminCode
  const fetchAdminData = async (uid) => {
    try {
      const adminDoc = await getDoc(doc(db, 'users', uid));
      if (adminDoc.exists()) {
        const data = adminDoc.data();
        setAdminCode(data.adminCode || '');
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  // Fetch users associated with this admin
  const fetchUsersData = async () => {
    try {
      setLoading(true);
      
      // Query users with matching adminCode (refralCode in your case)
      const usersQuery = query(
        collection(db, 'users'),
        where('refralCode', '==', adminCode),
        where('type', '==', 'User')
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const users = [];
      
      // Process each user
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        
        // Count projects for this user
        const projectsQuery = query(
          collection(db, 'projects'),
          where('creatorID', '==', userDoc.id)
        );
        
        const projectsSnapshot = await getDocs(projectsQuery);
        const projectCount = projectsSnapshot.size;
        
        users.push({
          id: userDoc.id,
          name: userData.name || 'Unknown',
          email: userData.email || '',
          role: userData.type || 'User',
          projectCount: projectCount,
          ...userData
        });    
      }
      
      setUsersData(users);
      setFilteredUsersData(users); // Initialize filtered data with all users
    } catch (error) {
      console.error('Error fetching users data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh data (can be called from other components)
  const refreshUsersData = () => {
    if (adminCode) {
      fetchUsersData();
      setIsSearchActive(false); // Reset search state on refresh
    }
  };

  // Handle search results from TopBar
  const handleSearch = (searchResults) => {
    if (searchResults === null) {
      // Null indicates to reset to original data (when search is cleared)
      setFilteredUsersData(usersData);
      setIsSearchActive(false);
    } else {
      // Update with search results
      setFilteredUsersData(searchResults);
      setIsSearchActive(true);
    }
  };

  return (
    <div className="flex min-h-screen h-full bg-black text-white">
      {/* Sidebar */}
      <SideBar />
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Top Bar with search capability */}
        <TopBar onSearch={handleSearch}  searchType="users"/>
        
        {/* Header */}
        <div className="flex justify-between font-DMSansRegular items-center mb-6">
          <div>
            <h1 className="text-3xl font-[500]">Users Page</h1>
            {isSearchActive && (
              <p className="text-gray-400 mt-1">
                Showing {filteredUsersData.length} {filteredUsersData.length === 1 ? 'result' : 'results'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {isSearchActive && (
              <button 
                onClick={() => {
                  setFilteredUsersData(usersData);
                  setIsSearchActive(false);
                }}
                className="bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
              >
                Clear Search
              </button>
            )}
            <button 
              onClick={refreshUsersData}
              className="bg-[#1E3A5F] text-white py-2 px-4 rounded-md hover:bg-[#2d4a73] transition-colors flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </>
              ) : (
                'Refresh Data'
              )}
            </button>
          </div>
        </div>
        
        {/* Users Table */}
        <RecentFloorScansTable 
          usersData={filteredUsersData} 
          loading={loading} 
        />
      </div>
    </div>
  );
}

export default UsersManagement;