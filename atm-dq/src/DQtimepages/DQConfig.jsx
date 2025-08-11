import { useState, useEffect, useRef } from "react";
import MainLayout from "../components/MainLayout";
import { MdDelete, MdOutlineDriveFolderUpload } from "react-icons/md";
import { AiFillEdit } from "react-icons/ai";
import { FaEye } from "react-icons/fa6";
import { TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti";
import Pagination from "../pagination/Pagination";

function DQConfig() {
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Select DQ Rule");
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
  return (
    <>
      <MainLayout>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-5 sm:grid-cols-2 gap-2">
            {/* Dropdown Section */}
            <div className="relative inline-block text-left" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="w-full inline-flex justify-between border-gray-200 px-4 py-2 text-[13px] font-medium border rounded-lg focus:outline-none"
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
                    <div className="flex items-center px-4 hover:bg-gray-100">
                      <input
                        id="ripple-on"
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer rounded border border-slate-300 shadow  transition-all      checked:border-slate-800 checked:bg-slate-800"
                      />
                      <button
                        onClick={() => handleOptionClicks("%GOOD")}
                        className="w-full text-left px-2 py-2 text-[13px] text-gray-700 hover:bg-gray-100"
                      >
                        %GOOD
                      </button>
                    </div>

                    <div className="flex items-center px-4 hover:bg-gray-100">
                      <input
                        id="ripple-on"
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer rounded border border-slate-300 shadow  transition-all      checked:border-slate-800 checked:bg-slate-800"
                      />
                      <button
                        onClick={() => handleOptionClicks("Outlier")}
                        className="w-full text-left px-2 py-2 text-[13px] text-gray-700 hover:bg-gray-100"
                      >
                        Outlier
                      </button>
                    </div>

                    <div className="flex items-center px-4 hover:bg-gray-100">
                      <input
                        id="ripple-on"
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer rounded border border-slate-300 shadow  transition-all      checked:border-slate-800 checked:bg-slate-800"
                      />
                      <button
                        onClick={() => handleOptionClicks("Saturation index")}
                        className="w-full text-left px-2 py-2 text-[13px] text-gray-700 hover:bg-gray-100"
                      >
                        Saturation index
                      </button>
                    </div>

                    <div className="flex items-center px-4 hover:bg-gray-100">
                      <input
                        id="ripple-on"
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer rounded border border-slate-300 shadow  transition-all      checked:border-slate-800 checked:bg-slate-800"
                      />
                      <button
                        onClick={() => handleOptionClicks("Stagnation index")}
                        className="w-full text-left px-2 py-2 text-[13px] text-gray-700 hover:bg-gray-100"
                      >
                        Stagnation index
                      </button>
                    </div>

                    <div className="flex items-center px-4 hover:bg-gray-100">
                      <input
                        id="ripple-on"
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer rounded border border-slate-300 shadow  transition-all      checked:border-slate-800 checked:bg-slate-800"
                      />
                      <button
                        onClick={() => handleOptionClicks("Flateline")}
                        className="w-full text-left px-2 py-2 text-[13px] text-gray-700 hover:bg-gray-100"
                      >
                        Flateline
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[13px] text-gray-700">PAR&nbsp;NAME:</span>
              <input
                type="text"
                id="first_name"
                className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg  w-full p-2 focus:outline-none"
                placeholder="Enter value"
                required
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[13px] text-gray-700">Uom:</span>
              <input
                type="text"
                id="first_name"
                className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg  w-full p-2 focus:outline-none"
                placeholder="Enter value"
                required
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[13px] text-gray-700">
                Cutoff&nbsp;Value:
              </span>
              <input
                type="text"
                id="first_name"
                className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg  w-full p-2 focus:outline-none"
                placeholder="Enter value"
                required
              />
            </div>
            <div className="flex">
              <button className="w-full bg-blue-700 text-white border-gray-200 px-4 py-2 text-[13px] font-medium border rounded-lg focus:outline-none">
                ADD
              </button>
            </div>
          </div>

          {/* Conditional Content Rendering Below */}
          <div className="mt-4 rounded-lg bg-gray-50">
            
              <div className="flex flex-col">
    <div className="border border-gray-200 rounded-lg flex flex-col">
      {/* Table Container */}
      <div className="overflow-y-auto max-h-[55vh]">
        <table className="min-w-full table-fixed">
          <thead className="sticky top-0 z-10 bg-[#5D616C]">
            <tr>
              <th className="tablehead rounded-tl-lg">
                <div className="flex justify-between items-center">
                  <span> TAGS LIST</span>
                  <div>
                    <TiArrowSortedUp className="w-3 h-3 cursor-pointer" />
                    <TiArrowSortedDown className="w-3 h-3 cursor-pointer" />
                  </div>
                </div>
              </th>
              <th className="tablehead">
                <div className="flex justify-between items-center">
                  <span> NO.OF.TAGS</span>
                  <div>
                    <TiArrowSortedUp className="w-3 h-3 cursor-pointer" />
                    <TiArrowSortedDown className="w-3 h-3 cursor-pointer" />
                  </div>
                </div>
              </th>
              <th className="tablehead">
                <div className="flex justify-between items-center">
                  <span> NO.OF.ATTRIBUTES</span>
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
                <td className="tabledata">#20462</td>
                <td className="tabledata">14</td>
                <td className="tabledata">7456</td>
                <td className="tabledata space-x-2">
                  <button className="px-1 py-1 bg-green-600 text-white text-lg rounded cursor-pointer hover:bg-green-700">
                    <FaEye />
                  </button>
                  <button className="px-1 py-1 bg-blue-600 text-white text-lg rounded cursor-pointer hover:bg-blue-700">
                    <AiFillEdit />
                  </button>
                  <button className="px-1 py-1 bg-red-600 text-white text-lg rounded cursor-pointer hover:bg-red-700">
                    <MdDelete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Below Table */}
      <Pagination />
    </div>
  </div>
            
          </div>
        </div>
      </MainLayout>
    </>
  );
}

export default DQConfig;
