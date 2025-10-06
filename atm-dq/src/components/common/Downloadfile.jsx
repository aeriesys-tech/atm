import React from "react";
import { FiDownload } from "react-icons/fi"; // Import download icon

function Downloadfile({text}) {
  // You can change the file path and file name as needed
  const fileUrl = "/files/sample.pdf"; // Put your file in the public/files/ folder
  const fileName = "MyDocument.pdf";

  return (
    <div className=" max-w-xs">
      <a
        href={fileUrl}
        download={fileName}
        className="inline-flex items-center border border-dashed gap-2 px-4 py-1.5 bg-white text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
      >
        <FiDownload className="w-5 h-5 text-[#8A0000]" />
       {text}
      </a>
    </div>
  );
}

export default Downloadfile;
