import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

const AddCategories = ({ isOpen, onClose }) => {
  // State for categories and inputs
  const [categories, setCategories] = useState([
    { id: 1, name: 'Office', type: 'main' },
    { id: 2, name: 'Building', type: 'main' },
    { id: 3, name: 'Showroom', type: 'main' },
    { id: 4, name: 'Hospital', type: 'main' },
    { id: 5, name: 'Rooms', type: 'sub' },
    { id: 6, name: 'Bath', type: 'sub' },
    { id: 7, name: 'Balcony', type: 'sub' },
    { id: 8, name: 'Roof', type: 'sub' },
  ]);

  const [showMainInput, setShowMainInput] = useState(false);
  const [showSubInput, setShowSubInput] = useState(false);
  const [newMainCategory, setNewMainCategory] = useState('');
  const [newSubCategory, setNewSubCategory] = useState('');

  // Remove a category
  const removeCategory = (id) => {
    setCategories(categories.filter(category => category.id !== id));
  };

  // Add a new main category
  const addMainCategory = () => {
    if (newMainCategory.trim() !== '') {
      const newId = Math.max(...categories.map(cat => cat.id), 0) + 1;
      setCategories([...categories, { id: newId, name: newMainCategory, type: 'main' }]);
      setNewMainCategory('');
      setShowMainInput(false);
    }
  };

  // Add a new sub category
  const addSubCategory = () => {
    if (newSubCategory.trim() !== '') {
      const newId = Math.max(...categories.map(cat => cat.id), 0) + 1;
      setCategories([...categories, { id: newId, name: newSubCategory, type: 'sub' }]);
      setNewSubCategory('');
      setShowSubInput(false);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      
      {/* Modal content */}
      <div className="bg-[#1E3A5F]  text-white rounded-3xl p-8 w-full max-w-2xl relative z-10">
        <h2 className="text-[32px] font-bold font-OutfitBold text-center mb-16">Add Categories</h2>
        
        {/* Main Categories Section */}
        <div className="mb-8 ml-20">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {categories.filter(cat => cat.type === 'main').map((category) => (
              <div key={category.id} className="flex items-center">
                <button 
                  onClick={() => removeCategory(category.id)}
                  className="bg-[#FF0909] text-white w-3 h-3 rounded-full flex items-center justify-center mb-4 mr-2"
                >
                  <X size={12} />
                </button>
                <span className="text-[22px] font-[400] font-SFProDisplay mr-2">{category.name},</span>
              </div>
            ))}
          </div>
          
          {showMainInput ? (
            <div className="max-w-md">
              <input
                type="text"
                value={newMainCategory}
                onChange={(e) => setNewMainCategory(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'main')}
                placeholder="Write New Category"
                className="w-full bg-transparent border border-white shadow-[0px_2px_0px_0px_#2A2A2C] rounded-lg px-6 py-4 text-xl placeholder-gray-400 outline-none"
                autoFocus
              />
            </div>
          ) : (
            <button 
              onClick={() => setShowMainInput(true)}
              className="flex items-center font-DMSansRegular gap-4 text-[19px] font-[500] text-white mb-8"
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
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {categories.filter(cat => cat.type === 'sub').map((category) => (
              <div key={category.id} className="flex items-center">
                <button 
                  onClick={() => removeCategory(category.id)}
                  className="bg-[#FF0909] text-white w-3 h-3 rounded-full flex items-center justify-center mb-4 mr-2"
                >
                  <X size={12} />
                </button>
                <span className="text-[22px] font-[400] font-SFProDisplay mr-2">{category.name},</span>
              </div>
            ))}
          </div>
          
          {showSubInput ? (
            <div className="max-w-md">
              <input
                type="text"
                value={newSubCategory}
                onChange={(e) => setNewSubCategory(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'sub')}
                placeholder="Write New Sub Category"
                className="w-full bg-transparent border border-white shadow-[0px_2px_0px_0px_#2A2A2C] rounded-lg px-6 py-4 text-xl placeholder-gray-400 outline-none"
                autoFocus
              />
            </div>
          ) : (
            <button 
              onClick={() => setShowSubInput(true)}
              className="flex items-center font-DMSansRegular gap-4 text-[19px] font-[500] text-white"
            >
              <span className="bg-white text-[#1E3A5F] w-[19px] h-[19px] rounded-full flex items-center justify-center">
                <Plus size={24} />
              </span>
              Add More
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCategories;