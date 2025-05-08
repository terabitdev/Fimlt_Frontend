import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

const FilterByCategories = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const categories = [
    "Office",
    "Building",
    "Showroom",
    "Hospital"
  ];

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Call the parent component's onFilterChange when selections change
  React.useEffect(() => {
    if (onFilterChange) {
      onFilterChange(selectedCategories);
    }
  }, [selectedCategories, onFilterChange]);

  return (
    <div className="relative w-full max-w-[150px] md:max-w-[202px]">
      {/* Filter Button */}
      <button 
        onClick={toggleDropdown}
        className="w-full flex items-center justify-center gap-4 px-1 py-2 bg-white rounded-md  border border-[#DDDDDD]"
      >
        <div className="flex flex-col space-y-1">
            <img src='/assets/filter.svg' className="text-[#090D00]"  />
        </div>
        <span className="text-sm md:text-[16px] font-medium font-DMSansRegular   text-[#090D00]">Filter By Categories</span>
      </button>

      {/* Categories Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 p-4 bg-white rounded-lg shadow-lg z-10">
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category} className="flex items-center">
                <button 
                  onClick={() => toggleCategory(category)}
                  className={`text-sm font-normal font-SFProDisplay text-left w-full   rounded px-2 ${
                    selectedCategories.includes(category) ? "text-[#1E3A5F]" : "text-[#0D0D12]"
                  }`}
                >
                  {category}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterByCategories;