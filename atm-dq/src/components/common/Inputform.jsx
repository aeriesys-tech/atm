import React from "react";

function TextBox({
  label,
  type = "text",
  name,
  value,
  placeholder,
  onChange,
  onKeyDown, // <-- Add this
  icon,
  required = false,
  error = "",
  width = "w-full", // Add a default width class
}) {
  return (
    <div className={width}>
      {label && (
        <label
          htmlFor={name}
          className="block font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      <div
        className={`flex items-center rounded-md px-3 py-1.5 focus-within:ring-1 focus-within:ring-[#8a0000] focus-within:border-[#8a0000] ${
          error ? "border-red-500" : "border-gray-300"
        } border`}
      >
        {icon && <span className="text-gray-400 mr-2">{icon}</span>}
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown} // <-- Forward onKeyDown here
          placeholder={placeholder}
          required={required}
          className="w-full outline-none bg-transparent text-gray-800 placeholder-gray-400"
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default TextBox;
