// components/Textarea.js
import React from 'react';

const Textarea = ({ label, value, onChange, placeholder, rows = 1, name, id }) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id || name}
          className="block font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <textarea
        id={id || name}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
      />
    </div>
  );
};

export default Textarea;
