import { useState, useEffect, useRef } from "react";
import MainLayout from "../components/MainLayout";
import { MdDelete, MdOutlineDriveFolderUpload } from "react-icons/md";
import { AiFillEdit } from "react-icons/ai";
import { FaEye } from "react-icons/fa6";
import { TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti";
import Pagination from "../pagination/Pagination";

function DBConfig() {
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Select Source DB");
  const dropdownRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClicks = (option) => {
    setSelectedOption(option);
    setOpen(false);
  };

  //-----------------------------------------------dropdown-2---------------------------------

  const [opens, setOpens] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState("Select Source DB");
  const dropdownRefs = useRef(); // ✅ Fixed: renamed to match usage below

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRefs.current &&
        !dropdownRefs.current.contains(event.target)
      ) {
        setOpens(false); // ✅ Fixed: changed from setOpen to setOpens
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClick = (option) => {
    setSelectedOptions(option);
    setOpens(false); // ✅ Fixed: changed from setOpen to setOpens
  };

  return (
    <>
      <MainLayout>
        <div>
          <div className="border border-gray-200 rounded-lg mt-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-6 sm:grid-cols-2 gap-2">
              {/* Dropdown Section */}
              <div
                className="relative inline-block text-left"
                ref={dropdownRef}
              >
                <button
                  onClick={() => setOpen(!open)}
                  className="inline-flex justify-between border-gray-200 w-56 px-4 py-2 text-[13px] font-medium border rounded-lg focus:outline-none"
                >
                  {selectedOption || "Options"}
                  <svg
                    className="w-5 h-5 ml-2 -mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {open && (
                  <div className="absolute z-90 mt-2 w-56 origin-top-right rounded-md shadow-lg border border-gray-200 bg-white">
                    <div className="py-1" role="menu">
                      <button
                        onClick={() => handleOptionClicks("DATA SOURCE 1")}
                        className="block w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100"
                      >
                        DATA SOURCE 1
                      </button>
                      <button
                        onClick={() => handleOptionClicks("DATA SOURCE 2")}
                        className="block w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100"
                      >
                        DATA SOURCE 2
                      </button>
                      <button
                        onClick={() => handleOptionClicks("DATA SOURCE 3")}
                        className="block w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100"
                      >
                        DATA SOURCE 3
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Conditional Content Rendering Below */}
            <div className="mt-4 rounded-lg bg-gray-50">


             
              {selectedOption === "DATA SOURCE 1" && (
                <div className="flex flex-col">
                  {/* Top Content */}

                  {/* Table Container */}
                  <div className="flex-1 overflow-hidden">
                    <div className="border border-gray-200 rounded-lg flex flex-col">
                      {/* Scrollable Table */}
                      <div className="overflow-y-auto max-h-[55vh]">
                        <table className="min-w-full table-fixed">
                          <thead className=" sticky top-0 z-10 bg-[#5D616C]">
                            <tr>
                              <th className="tablehead rounded-tl-lg">
                                <div className="flex justify-between items-center">
                                  <span> URL</span>
                                  <div>
                                    <TiArrowSortedUp className="w-3 h-3 cursor-pointer" />
                                    <TiArrowSortedDown className="w-3 h-3 cursor-pointer" />
                                  </div>
                                </div>
                              </th>
                              <th className="tablehead">
                                <div className="flex justify-between items-center">
                                  <span> LOGIN_ID</span>
                                  <div>
                                    <TiArrowSortedUp className="w-3 h-3 cursor-pointer" />
                                    <TiArrowSortedDown className="w-3 h-3 cursor-pointer" />
                                  </div>
                                </div>
                              </th>
                              <th className="tablehead">
                                <div className="flex justify-between items-center">
                                  <span> PASSWORD</span>
                                  <div>
                                    <TiArrowSortedUp className="w-3 h-3 cursor-pointer" />
                                    <TiArrowSortedDown className="w-3 h-3 cursor-pointer" />
                                  </div>
                                </div>
                              </th>
                              <th className="tablehead bg-[#5D616C] rounded-tr-lg">
                                <div className="flex justify-between items-center">
                                  <span> ACTIONS</span>
                                  <div>
                                    <TiArrowSortedUp className="w-3 h-3 cursor-pointer" />
                                    <TiArrowSortedDown className="w-3 h-3 cursor-pointer" />
                                  </div>
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {[...Array(20)].map((_, idx) => (
                              <tr key={idx}>
                                <td className="tabledata">#20462</td>
                                <td className="tabledata">14</td>
                                <td className="tabledata">7456</td>
                                <td className="tabledata space-x-2">
                  <button className="px-1 py-1 ">
                    <FaEye className="w-4 h-4" />
                  </button>
                  <button className="px-1 py-1">
                    <AiFillEdit className="w-4 h-4" />
                  </button>
                  <button className="px-1 py-1">
                    <MdDelete className="w-4 h-4" />
                  </button>
                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <Pagination />
                    </div>
                  </div>
                </div>
              )}
             

            </div>
          </div>

          <div className="border border-gray-200 rounded-lg mt-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-6 sm:grid-cols-2 gap-2">
              {/* Dropdown Section */}
              <div
                className="relative inline-block text-left"
                ref={dropdownRefs}
              >
                <button
                  onClick={() => setOpens(!opens)}
                  className="inline-flex justify-between border-gray-200 w-56 px-4 py-2 text-[13px] font-medium border rounded-lg focus:outline-none"
                >
                  {selectedOptions || "Options"}
                  <svg
                    className="w-5 h-5 ml-2 -mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {opens && (
                  <div className="absolute z-90 mt-2 w-56 origin-top-right rounded-md shadow-lg border border-gray-200 bg-white">
                    <div className="py-1" role="menu">
                      <button
                        onClick={() => handleOptionClick("DATA SOURCE 1")}
                        className="block w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100"
                      >
                        DATA SOURCE 1
                      </button>
                      <button
                        onClick={() => handleOptionClick("DATA SOURCE 2")}
                        className="block w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100"
                      >
                        DATA SOURCE 2
                      </button>
                      <button
                        onClick={() => handleOptionClick("DATA SOURCE 3")}
                        className="block w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100"
                      >
                        DATA SOURCE 3
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Conditional Content Rendering Below */}
            <div className="mt-4 rounded-lg bg-gray-50">
              {selectedOptions === "DATA SOURCE 2" && (
                <div className="flex flex-col">
                  {/* Top Content */}

                  {/* Table Container */}
                  <div className="flex-1 overflow-hidden">
                    <div className="border border-gray-200 rounded-lg flex flex-col">
                      {/* Scrollable Table */}
                      <div className="overflow-y-auto max-h-[55vh]">
                        <table className="min-w-full table-fixed">
                          <thead className=" sticky top-0 z-10 bg-[#5D616C]">
                            <tr>
                              <th className="tablehead rounded-tl-lg">
                                <div className="flex justify-between items-center">
                                  <span> URL</span>
                                  <div>
                                    <TiArrowSortedUp className="w-3 h-3 cursor-pointer" />
                                    <TiArrowSortedDown className="w-3 h-3 cursor-pointer" />
                                  </div>
                                </div>
                              </th>
                              <th className="tablehead">
                                <div className="flex justify-between items-center">
                                  <span> LOGIN_ID</span>
                                  <div>
                                    <TiArrowSortedUp className="w-3 h-3 cursor-pointer" />
                                    <TiArrowSortedDown className="w-3 h-3 cursor-pointer" />
                                  </div>
                                </div>
                              </th>
                              <th className="tablehead">
                                <div className="flex justify-between items-center">
                                  <span> PASSWORD</span>
                                  <div>
                                    <TiArrowSortedUp className="w-3 h-3 cursor-pointer" />
                                    <TiArrowSortedDown className="w-3 h-3 cursor-pointer" />
                                  </div>
                                </div>
                              </th>
                              <th className="tablehead bg-[#5D616C] rounded-tr-lg">
                                <div className="flex justify-between items-center">
                                  <span> ACTIONS</span>
                                  <div>
                                    <TiArrowSortedUp className="w-3 h-3 cursor-pointer" />
                                    <TiArrowSortedDown className="w-3 h-3 cursor-pointer" />
                                  </div>
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {[...Array(5)].map((_, idx) => (
                              <tr key={idx}>
                                <td className="tabledata">
                                  https://google.com
                                </td>
                                <td className="tabledata">
                                  KJLSADSH_7456
                                </td>
                                <td className="tabledata">
                                  7456
                                </td>
                                <td className="tabledata space-x-2">
                                  <button className="px-1 py-1">
                                    <AiFillEdit className="w-4 h-4" />
                                  </button>
                                  <button className="px-1 py-1">
                                    <MdDelete className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>

                            ))}
                          </tbody>
                        </table>
                        <Pagination />
                      </div>

                    </div>
                  </div>
                </div>
              )}

        
           

            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
}

export default DBConfig;
