import React from "react";
import { FiSearch } from "react-icons/fi";

const SearchBar = ({
  placeholder = "Search...",
  className = "",
  width = "",
  style = {},
  bgColor = "bg-white",
  onChange,
  value,
}) => {
  const isTailwindWidth = width.startsWith("w-") || width === "w-full";

  return (
    <div
      className={`relative ${isTailwindWidth ? width : ""} ${className}`}
      style={!isTailwindWidth ? { width, ...style } : style}
    >
      <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
        <FiSearch className="w-5 h-5" />
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full pl-10 pr-4 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8a0000] focus:border-[#8a0000] ${bgColor}`}
      />
    </div>
  );
};

export default SearchBar;
