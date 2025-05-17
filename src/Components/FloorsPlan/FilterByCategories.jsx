import React, { useState, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

const FilterByCategories = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch unique categories from Firebase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const projectsRef = collection(db, "projects");
        const querySnapshot = await getDocs(projectsRef);
        
        // Use a Set to automatically handle duplicates
        const uniqueCategories = new Set();
        
        // Add each category from the projects
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.category && typeof data.category === 'string' && data.category.trim() !== '') {
            uniqueCategories.add(data.category.trim());
          }
        });
        
        // Convert Set to Array and sort alphabetically
        const categoriesArray = Array.from(uniqueCategories).sort();
        
        // If no categories found, use some defaults
        if (categoriesArray.length === 0) {
          setAvailableCategories([
            "Office",
            "Building",
            "Showroom",
            "Hospital",
            "Rooms",
            "Kitchen"
          ]);
        } else {
          setAvailableCategories(categoriesArray);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        // Fallback to default categories on error
        setAvailableCategories([
          "Office",
          "Building",
          "Showroom",
          "Hospital",
          "Rooms",
          "Kitchen"
        ]);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      const updated = selectedCategories.filter(c => c !== category);
      setSelectedCategories(updated);
      
      // Call the parent component's onFilterChange
      if (onFilterChange) {
        onFilterChange(updated);
      }
    } else {
      const updated = [...selectedCategories, category];
      setSelectedCategories(updated);
      
      // Call the parent component's onFilterChange
      if (onFilterChange) {
        onFilterChange(updated);
      }
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative w-full max-w-[150px] md:max-w-[202px]">
      {/* Filter Button */}
      <button 
        onClick={toggleDropdown}
        className="w-full flex items-center justify-center gap-4 px-1 py-2 bg-white rounded-md border border-[#DDDDDD]"
      >
        <div className="flex flex-col space-y-1">
            <img src='/assets/filter.svg' className="text-[#090D00]" alt="Filter icon" />
        </div>
        <span className="text-sm md:text-[16px] font-medium font-DMSansRegular text-[#090D00]">
          {loading ? "Loading..." : "Filter By Categories"}
          {!loading && selectedCategories.length > 0 && ` (${selectedCategories.length})`}
        </span>
      </button>

      {/* Categories Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 p-4 bg-white rounded-lg shadow-lg z-10">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1E3A5F]"></div>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {availableCategories.length > 0 ? (
                  availableCategories.map((category) => (
                    <div key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="mr-2 h-4 w-4 accent-[#1E3A5F]"
                      />
                      <label 
                        htmlFor={`category-${category}`}
                        className={`text-sm font-normal font-SFProDisplay text-left w-full rounded px-2 cursor-pointer ${
                          selectedCategories.includes(category) ? "text-[#1E3A5F] font-medium" : "text-[#0D0D12]"
                        }`}
                      >
                        {category}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-2">No categories found</p>
                )}
              </div>
              
              {/* Clear and Apply buttons */}
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    if (onFilterChange) onFilterChange([]);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-sm bg-[#1E3A5F] text-white px-3 py-1 rounded"
                >
                  Apply
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterByCategories;