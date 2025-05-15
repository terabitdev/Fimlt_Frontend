

import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { db } from '../firebase'; // Adjust the path based on your file structure
import { collection, addDoc, deleteDoc, doc, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore';

const AddCategories = ({ isOpen, onClose }) => {
  // State for categories and inputs
  const [categories, setCategories] = useState([]);
  const [showMainInput, setShowMainInput] = useState(false);
  const [showSubInput, setShowSubInput] = useState(false);
  const [newMainCategory, setNewMainCategory] = useState('');
  const [newSubCategory, setNewSubCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch categories from Firebase on component mount
  useEffect(() => {
    if (!isOpen) return;

    // Set up real-time listener for categories
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const categoriesData = [];
      snapshot.forEach((doc) => {
        categoriesData.push({ id: doc.id, ...doc.data() });
      });
      setCategories(categoriesData);
      setLoading(false);
    });

    // Cleanup function
    return () => unsubscribe();
  }, [isOpen]);

  // Remove a category from Firebase
  const removeCategory = async (id) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      // The onSnapshot listener will automatically update the local state
    } catch (error) {
      console.error('Error removing category:', error);
      alert('Failed to remove category. Please try again.');
    }
  };

  // Add a new main category to Firebase
  const addMainCategory = async () => {
    if (newMainCategory.trim() !== '') {
      try {
        await addDoc(collection(db, 'categories'), {
          name: newMainCategory.trim(),
          type: 'main',
          createdAt: serverTimestamp()
        });
        setNewMainCategory('');
        setShowMainInput(false);
      } catch (error) {
        console.error('Error adding main category:', error);
        alert('Failed to add category. Please try again.');
      }
    }
  };

  // Add a new sub category to Firebase
  const addSubCategory = async () => {
    if (newSubCategory.trim() !== '') {
      try {
        await addDoc(collection(db, 'categories'), {
          name: newSubCategory.trim(),
          type: 'sub',
          createdAt: serverTimestamp()
        });
        setNewSubCategory('');
        setShowSubInput(false);
      } catch (error) {
        console.error('Error adding sub category:', error);
        alert('Failed to add sub category. Please try again.');
      }
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

  if (!isOpen) return null;

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
                {categories.filter(cat => cat.type === 'main').map((category) => (
                  <div key={category.id} className="flex items-center">
                    <button 
                      onClick={() => removeCategory(category.id)}
                      className="bg-[#FF0909] text-white w-3 h-3 rounded-full flex items-center justify-center mb-4 mr-2 hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                    <span className="text-[22px] font-[400] font-SFProDisplay mr-2">{category.name},</span>
                  </div>
                ))}
                {categories.filter(cat => cat.type === 'main').length === 0 && (
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
                {categories.filter(cat => cat.type === 'sub').map((category) => (
                  <div key={category.id} className="flex items-center">
                    <button 
                      onClick={() => removeCategory(category.id)}
                      className="bg-[#FF0909] text-white w-3 h-3 rounded-full flex items-center justify-center mb-4 mr-2 hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                    <span className="text-[22px] font-[400] font-SFProDisplay mr-2">{category.name},</span>
                  </div>
                ))}
                {categories.filter(cat => cat.type === 'sub').length === 0 && (
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