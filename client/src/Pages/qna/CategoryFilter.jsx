import React from 'react';

const CATEGORIES = [
  { value: "all", label: "All Topics", icon: "🌟" },
  { value: "agriculture", label: "Agriculture", icon: "🌾" },
  { value: "dairy", label: "Dairy", icon: "🥛" },
  { value: "schemes", label: "Government Schemes", icon: "🏛️" },
];

const CategoryFilter = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {CATEGORIES.map(cat => (
        <button
          key={cat.value}
          className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
            selectedCategory === cat.value 
              ? 'bg-green-600 text-white border-green-600 shadow-sm' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => setSelectedCategory(cat.value)}
        >
          <span className="mr-2 text-base">{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;