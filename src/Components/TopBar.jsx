

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Edit2, ChevronDown } from 'lucide-react';
import { auth, db } from '../firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  updateDoc, 
  where, 
  getDocs,
  query
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import NotificationBell from './NotificationBell'; // Import the new component

function TopBar({ onSearch, searchType = 'users' }) {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    adminCode: '',
    uid: ''
  });
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: ''
  });
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const profileRef = useRef(null);
  const modalRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Handle clicks outside profile dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target) && !modalRef.current?.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize edit data when user data changes
  useEffect(() => {
    if (userData) {
      setEditData({
        name: userData.name || '',
        email: userData.email || ''
      });
    }
  }, [userData]);

  // Search users function
  const searchUsers = useCallback(async (adminCode, term) => {
    if (!term.trim() || !adminCode) {
      // If search term is empty or no admin code, return empty results or reset search
      if (onSearch) onSearch(null); // Null indicates to reset to original data
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      // Create a case-insensitive search
      const lowercaseTerm = term.toLowerCase();
      
      // Query for users with matching refralCode (as per your original component)
      const usersRef = collection(db, 'users');
      const usersQuery = query(
        usersRef, 
        where('adminCode', '==', adminCode),
        where('type', '==', 'User')
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const users = [];
      
      // Process each user and filter based on search term
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const userName = (userData.name || '').toLowerCase();
        const userEmail = (userData.email || '').toLowerCase();
        
        // Only include users that match the search term
        if (userName.includes(lowercaseTerm) || userEmail.includes(lowercaseTerm)) {
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
      }
      
      // Pass search results back to parent component
      if (onSearch) onSearch(users);
    } catch (error) {
      console.error('Error searching users:', error);
      if (onSearch) onSearch([]); // Empty array on error
    } finally {
      setIsSearching(false);
    }
  }, [onSearch]);

  // Search projects function - simpler as it just passes the term
  const searchProjects = useCallback(async (term) => {
    if (!term.trim()) {
      // If search term is empty, return null to reset to original data
      if (onSearch) onSearch('');
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Simply pass the search term to the parent component
    // The actual filtering will happen in the RecentFloorScansTable
    if (onSearch) {
      onSearch(term);
    }
    
    setIsSearching(false);
  }, [onSearch]);

  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce((adminCode, term) => {
      if (searchType === 'users') {
        searchUsers(adminCode, term);
      } else {
        searchProjects(term);
      }
    }, 300),
    [searchUsers, searchProjects, searchType]
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(userData.adminCode, term);
  };

  // Handle keyboard shortcut for search (Ctrl+F)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('search-input').focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user document from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              name: data.name || 'User',
              email: data.email || user.email,
              adminCode: data.adminCode || 'N/A',
              uid: user.uid
            });
          } else {
            // Fallback to auth email if Firestore document doesn't exist
            setUserData({
              name: 'User',
              email: user.email,
              adminCode: 'N/A',
              uid: user.uid
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to auth data
          setUserData({
            name: 'User',
            email: user.email,
            adminCode: 'N/A',
            uid: user.uid
          });
        }
      } else {
        // No user is signed in
        setUserData({
          name: '',
          email: '',
          adminCode: '',
          uid: ''
        });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Toggle the profile dropdown
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Open edit modal
  const openEditModal = () => {
    setShowEditModal(true);
    setShowProfileDropdown(false);
    setEditError('');
    setEditSuccess('');
  };

  // Close edit modal
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditError('');
    setEditSuccess('');
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit form submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsEditLoading(true);
    setEditError('');
    setEditSuccess('');

    try {
      if (userData.uid) {
        // Update user document in Firestore
        await updateDoc(doc(db, 'users', userData.uid), {
          name: editData.name,
          email: editData.email
        });

        // Update local user data
        setUserData(prev => ({
          ...prev,
          name: editData.name,
          email: editData.email
        }));

        setEditSuccess('Profile updated successfully!');
        setTimeout(() => {
          closeEditModal();
        }, 2000);
      } else {
        setEditError('User not found. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setEditError('Failed to update profile. Please try again.');
    } finally {
      setIsEditLoading(false);
    }
  };

  // Get the appropriate placeholder text based on searchType
  const getPlaceholderText = () => {
    return searchType === 'users' 
      ? "Search users by name or email"
      : "Search projects by name";
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <input 
            id="search-input"
            type="text" 
            placeholder={getPlaceholderText()}
            className="w-full py-4 px-4 rounded-md bg-[#F5F5F5] text-[#8C8C8C] placeholder-[#8C8C8C] placeholder:text-[18px] font-DMSansRegular"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <div className="absolute right-3 top-[10px] flex">
            <div className="flex gap-4 border rounded-[8px] border-[#D9D9D9] bg-white px-2 py-1">
              <img src="/assets/search.svg" alt="Search icon" />
              <div className="text-black font-DMSansRegular font-semibold">F</div>
            </div>
            {isSearching && (
              <div className="absolute right-12 top-1">
                <div className="w-5 h-5 border-t-2 border-blue-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        {/* Notification Bell Component */}
        <NotificationBell 
          adminCode={userData.adminCode} 
          userData={userData} 
        />
        
        {/* Profile Section */}
        <div className="relative" ref={profileRef}>
          <div 
            className="flex flex-col md:flex-row md:items-center items-end cursor-pointer "
            onClick={toggleProfileDropdown}
          >
            <div className="h-10 w-10 bg-white rounded-md md:mr-3 flex items-center justify-center">
              {/* User avatar with initial */}
              {userData.name && (
                <div className="h-full w-full flex items-center justify-center text-gray-700 font-semibold rounded-md">
                  {userData.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className='font-DMSansRegular flex items-center'>
              <div>
                <div className="text-white text-end md:text-left font-[500] text-[16px]">
                  {userData.name || 'Loading...'}
                </div>
                <div className="text-white font-[400] text-[12px]">
                  {userData.email || 'Loading...'}
                </div>
                <div className="text-white font-[600] text-end md:text-left text-[12px] mt-1">
                  Admin Code: {userData.adminCode || 'Loading...'}
                </div>
              </div>
              <ChevronDown size={16} className="text-white ml-2" />
            </div>
          </div>
          
          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-60 bg-[#111111] rounded-md shadow-lg z-50 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-white">My Profile</h3>
              </div>
              <div className="p-2">
                <button 
                  onClick={openEditModal}
                  className="w-full text-left px-4 py-2 rounded-md hover:bg-[#312f2f] flex items-center"
                >
                  <Edit2 size={16} className="mr-2 text-white" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div 
            ref={modalRef}
            className="bg-[#1E3A5F] rounded-lg shadow-xl max-w-md w-full mx-4"
          >
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Edit Profile</h3>
              <button
                onClick={closeEditModal}
                className="text-white hover:text-gray-400 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-5 ">
              {editError && (
                <div className="mb-4 text-red-500 bg-red-100 p-3 rounded-md">
                  {editError}
                </div>
              )}
              
              {editSuccess && (
                <div className="mb-4 text-green-500 bg-green-100 p-3 rounded-md">
                  {editSuccess}
                </div>
              )}
              
              <div className="mb-4">
                <label 
                  htmlFor="name" 
                  className="block text-white font-medium mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-white shadow-lg rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label 
                  htmlFor="email" 
                  className="block text-white font-medium mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={editData.email}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-white shadow-lg rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2  text-white rounded-md border border-white bg-[#FB0000] mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2  text-white rounded-md border border-white flex items-center"
                  disabled={isEditLoading}
                >
                  {isEditLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TopBar;