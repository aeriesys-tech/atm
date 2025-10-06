import React, { useState } from "react";
import { FiUpload } from "react-icons/fi"; // Upload icon

function Fileinput() {
  const [fileName, setFileName] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      console.log("Selected file:", file);
    }
  };

  return (
    <div className=" max-w-xs">
      <label
        htmlFor="file-input"
        className="flex items-center justify-center gap-2 px-4 py-1.5 border-1 border-dashed border-gray-400 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <FiUpload className="w-5 h-5 text-[#8A0000]" />
        <span className="text-gray-700">
          {fileName ? fileName : "Upload a file"}
        </span>
      </label>

      <input
        type="file"
        id="file-input"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

export default Fileinput;
