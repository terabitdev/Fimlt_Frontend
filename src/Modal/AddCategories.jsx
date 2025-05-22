import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { db } from '../firebase'; // Adjust the path based on your file structure
import { collection, doc, getDoc, setDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth'; 
import { auth } from '../firebase'; // Import auth from your firebase config

const AddCategories = ({ isOpen, onClose }) => {
  // State for categories and inputs
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [showMainInput, setShowMainInput] = useState(false);
  const [showSubInput, setShowSubInput] = useState(false);
  const [newMainCategory, setNewMainCategory] = useState('');
  const [newSubCategory, setNewSubCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [docId, setDocId] = useState(null);
  const [adminCode, setAdminCode] = useState(null);

  // Get current user
  const [user, authLoading] = useAuthState(auth);

  // Function to fetch admin code from current user's document
  const fetchUserAdminCode = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.adminCode) {
          return userData.adminCode;
        } else {
          throw new Error('Admin code not found in user document');
        }
      } else {
        throw new Error('User document not found');
      }
    } catch (error) {
      console.error('Error fetching user admin code:', error);
      throw error;
    }
  };

  // Fetch or create categories document with admin code from user account
  useEffect(() => {
    if (!isOpen || authLoading) return;

    const findOrCreateDoc = async () => {
      try {
        // First, fetch the admin code from current user's document
        const fetchedAdminCode = await fetchUserAdminCode();
        setAdminCode(fetchedAdminCode);
        
        // Check if document with the fetched admin code ID exists
        const docRef = doc(db, 'categories', fetchedAdminCode);
        const docSnapshot = await getDoc(docRef);
        
        if (docSnapshot.exists()) {
          // Document exists, use it
          setDocId(fetchedAdminCode);
          
          // Set up real-time listener for this document
          const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
              const data = docSnapshot.data();
              setCategories(data.categories || []);
              setSubCategories(data.subCategories || []);
            }
            setLoading(false);
          });
          
          return unsubscribe;
        } else {
          // Create new document with admin code ID
          await setDoc(docRef, {
            categories: [],
            subCategories: []
          });
          
          setDocId(fetchedAdminCode);
          setCategories([]);
          setSubCategories([]);
          setLoading(false);
          
          // Set up listener for the new document
          const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
              const data = docSnapshot.data();
              setCategories(data.categories || []);
              setSubCategories(data.subCategories || []);
            }
          });
          
          return unsubscribe;
        }
      } catch (error) {
        console.error('Error finding/creating categories document:', error);
        setLoading(false);
        alert('Failed to load admin configuration. Please ensure you have admin privileges and try again.');
      }
    };

    const unsubscribePromise = findOrCreateDoc();
    
    // Cleanup function
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, [isOpen, user, authLoading]);

  // Remove a category from the array
  const removeCategory = async (categoryName, type) => {
    if (!docId) return;
    
    try {
      const fieldName = type === 'main' ? 'categories' : 'subCategories';
      await updateDoc(doc(db, 'categories', docId), {
        [fieldName]: arrayRemove(categoryName)
      });
    } catch (error) {
      console.error('Error removing category:', error);
      alert('Failed to remove category. Please try again.');
    }
  };

  // Add a new main category to the array
  const addMainCategory = async () => {
    if (!docId || newMainCategory.trim() === '') return;
    
    const trimmedCategory = newMainCategory.trim();
    
    // Check if category already exists
    if (categories.includes(trimmedCategory)) {
      alert('This category already exists!');
      return;
    }

    try {
      await updateDoc(doc(db, 'categories', docId), {
        categories: arrayUnion(trimmedCategory)
      });
      setNewMainCategory('');
      setShowMainInput(false);
    } catch (error) {
      console.error('Error adding main category:', error);
      alert('Failed to add category. Please try again.');
    }
  };

  // Add a new sub category to the array
  const addSubCategory = async () => {
    if (!docId || newSubCategory.trim() === '') return;
    
    const trimmedSubCategory = newSubCategory.trim();
    
    // Check if sub category already exists
    if (subCategories.includes(trimmedSubCategory)) {
      alert('This sub category already exists!');
      return;
    }

    try {
      await updateDoc(doc(db, 'categories', docId), {
        subCategories: arrayUnion(trimmedSubCategory)
      });
      setNewSubCategory('');
      setShowSubInput(false);
    } catch (error) {
      console.error('Error adding sub category:', error);
      alert('Failed to add sub category. Please try again.');
    }
  };

  // Handle key press on input fields
  const handleKeyPress = (e, type) => {
    if (e.key === 'Enter') {
      if (type === 'main') {
        addMainCategory();
      } else {
        addSubCategory();
      }
    }
  };

  // Handle escape key to cancel input
  const handleEscapeKey = (e, type) => {
    if (e.key === 'Escape') {
      if (type === 'main') {
        setNewMainCategory('');
        setShowMainInput(false);
      } else {
        setNewSubCategory('');
        setShowSubInput(false);
      }
    }
  };

  // Don't render if modal is closed
  if (!isOpen) return null;

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="bg-[#1E3A5F] text-white rounded-3xl p-8 w-full max-w-2xl relative z-10">
          <div className="text-center">
            <p className="text-lg">Authenticating...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
        <div className="bg-[#1E3A5F] text-white rounded-3xl p-8 w-full max-w-2xl relative z-10">
          <div className="text-center">
            <p className="text-lg text-red-400">Please log in to access admin features.</p>
            <button 
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-white text-[#1E3A5F] rounded-lg hover:opacity-80"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      
      {/* Modal content */}
      <div className="bg-[#1E3A5F] text-white rounded-3xl p-8 w-full max-w-2xl relative z-10">
        <h2 className="text-[32px] font-bold font-OutfitBold text-center mb-16">Add Categories</h2>
        
        {loading ? (
          <div className="text-center">
            <p className="text-lg">Loading categories...</p>
          </div>
        ) : (
          <>
            {/* Main Categories Section */}
            <div className="mb-8 ml-20">
              <h3 className="text-[20px] font-[500] mb-4">Main Categories</h3>
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center">
                    <button 
                      onClick={() => removeCategory(category, 'main')}
                      className="bg-[#FF0909] text-white w-3 h-3 rounded-full flex items-center justify-center mb-4 mr-2 hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                    <span className="text-[22px] font-[400] font-SFProDisplay mr-2">{category},</span>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-gray-400 italic">No main categories yet</p>
                )}
              </div>
              
              {showMainInput ? (
                <div className="max-w-md">
                  <input
                    type="text"
                    value={newMainCategory}
                    onChange={(e) => setNewMainCategory(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'main')}
                    onKeyDown={(e) => handleEscapeKey(e, 'main')}
                    placeholder="Write New Category"
                    className="w-full bg-transparent border border-white shadow-[0px_2px_0px_0px_#2A2A2C] rounded-lg px-6 py-4 text-xl placeholder-gray-400 outline-none"
                    autoFocus
                  />
                </div>
              ) : (
                <button 
                  onClick={() => setShowMainInput(true)}
                  className="flex items-center font-DMSansRegular gap-4 text-[19px] font-[500] text-white mb-8 hover:opacity-80 transition-opacity"
                >
                  <span className="bg-white text-[#1E3A5F] w-[19px] h-[19px] rounded-full flex items-center justify-center">
                    <Plus size={24} />
                  </span>
                  Add More
                </button>
              )}
            </div>
            
            <div className="max-w-md h-px bg-white ml-20 my-8"></div>
            
            {/* Sub Categories Section */}
            <div className='ml-20'>
              <h3 className="text-[20px] font-[500] mb-4">Sub Categories</h3>
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {subCategories.map((subCategory, index) => (
                  <div key={index} className="flex items-center">
                    <button 
                      onClick={() => removeCategory(subCategory, 'sub')}
                      className="bg-[#FF0909] text-white w-3 h-3 rounded-full flex items-center justify-center mb-4 mr-2 hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                    <span className="text-[22px] font-[400] font-SFProDisplay mr-2">{subCategory},</span>
                  </div>
                ))}
                {subCategories.length === 0 && (
                  <p className="text-gray-400 italic">No sub categories yet</p>
                )}
              </div>
              
              {showSubInput ? (
                <div className="max-w-md">
                  <input
                    type="text"
                    value={newSubCategory}
                    onChange={(e) => setNewSubCategory(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'sub')}
                    onKeyDown={(e) => handleEscapeKey(e, 'sub')}
                    placeholder="Write New Sub Category"
                    className="w-full bg-transparent border border-white shadow-[0px_2px_0px_0px_#2A2A2C] rounded-lg px-6 py-4 text-xl placeholder-gray-400 outline-none"
                    autoFocus
                  />
                </div>
              ) : (
                <button 
                  onClick={() => setShowSubInput(true)}
                  className="flex items-center font-DMSansRegular gap-4 text-[19px] font-[500] text-white hover:opacity-80 transition-opacity"
                >
                  <span className="bg-white text-[#1E3A5F] w-[19px] h-[19px] rounded-full flex items-center justify-center">
                    <Plus size={24} />
                  </span>
                  Add More
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddCategories;