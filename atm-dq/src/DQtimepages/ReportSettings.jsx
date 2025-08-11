import { useState, useEffect, useRef } from "react";
import MainLayout from "../components/MainLayout";
import Linechart from "../Highcharts/Linechart";
import Roundedchart from "../Highcharts/Roundedchart";
import { TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti";
import Pagination from "../pagination/Pagination";

function ReportSetting() {
  const [dropdowns, setDropdowns] = useState([
    { open: false, selected: "List of Tags" },
    { open: false, selected: "Sampling Interval", temp: "" },
    { open: false, selected: "Select Rules" },
    { open: false, selected: "Select Parameter" },
    { open: false, selected: "Select Parameter" },
  ]);

  const dropdownOptions = [
    ["Option 1", "Option 2", "Option 3"],
    ["SS", "MM", "HH"],
    ["Option 1", "Option 2", "Option 3"],
    ["Option 1", "Option 2", "Option 3"],
    ["Option 1", "Option 2", "Option 3"],
  ];

  const dropdownRefs = [useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    function handleClickOutside(event) {
      dropdownRefs.forEach((ref, index) => {
        if (ref.current && !ref.current.contains(event.target)) {
          setDropdowns((prev) =>
            prev.map((d, i) => (i === index ? { ...d, open: false } : d))
          );
        }
      });
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (index) => {
    setDropdowns((prev) =>
      prev.map((d, i) =>
        i === index
          ? { ...d, open: !d.open, temp: d.selected }
          : { ...d, open: false }
      )
    );
  };

  const handleRadioChange = (index, value) => {
    setDropdowns((prev) =>
      prev.map((d, i) => (i === index ? { ...d, temp: value } : d))
    );
  };

  const handleButtonSelect = (index, value) => {
    setDropdowns((prev) =>
      prev.map((d, i) =>
        i === index ? { ...d, selected: value, open: false } : d
      )
    );
  };

  const renderDropdown = (index) => (
    <div
      key={index}
      className="relative inline-block text-left bg-white w-full mb-2 rounded-lg mt-1"
      ref={dropdownRefs[index]}
    >
      <button
        onClick={() => handleToggle(index)}
        className="w-full inline-flex justify-between border-gray-200 px-4 py-2 text-[13px] font-medium border rounded-lg focus:outline-none"
      >
        {dropdowns[index].selected}
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

      {dropdowns[index].open && (
        <div className="absolute z-90 mt-2 w-full origin-top-right rounded-lg shadow-lg border border-gray-200 bg-white">
          <div className="py-2 px-3 space-y-2" role="menu">
            {index === 1 ? (
              <>
                {dropdownOptions[index].map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center space-x-2 text-sm cursor-pointer py-1"
                  >
                    <input
                      type="radio"
                      name="dropdown-2-options"
                      value={opt}
                      checked={dropdowns[index].temp === opt}
                      onChange={() => handleRadioChange(index, opt)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </>
            ) : (
              dropdownOptions[index].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleButtonSelect(index, opt)}
                  className="block w-full text-left px-4 py-1 text-[13px] text-gray-700 hover:bg-gray-100"
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row w-full gap-2">
        <div className="w-full md:w-[25%]">
          <span className="text-lg font-semibold">Input</span>
          <div className="bg-gray-100 p-4 mt-2 rounded-lg">
            {[0, 1].map((index) => renderDropdown(index))}

            <div className="items-center gap-1">
              <span className="text-[13px] text-gray-700">Sampling Value</span>
              <input
                type="text"
                className="mt-1 bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg w-full p-2 focus:outline-none"
                placeholder="Enter value"
                required
              />
            </div>

            <div className="items-center gap-1 mt-2">
              <span className="text-[13px] text-gray-700">From</span>
              <input
                type="date"
                className="mt-1 bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg w-full p-2 focus:outline-none"
                required
              />
            </div>

            <div className="items-center gap-1 mt-2">
              <span className="text-[13px] text-gray-700">To</span>
              <input
                type="date"
                className="mt-1 bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg w-full p-2 focus:outline-none"
                required
              />
            </div>

            {[2, 3, 4].map((index) => {
              let label = "DQ Rules"; // default

              if (index === 3) label = "Select Parameter"; // 🟢 custom label
              if (index === 4) label = "Graphic Components"; // 🟢 custom label

              return (
                <div className="mt-2" key={index}>
                  <span className="text-[13px] text-gray-700">{label}</span>
                  {renderDropdown(index)}
                </div>
              );
            })}

            <div className="mt-2">
              <button className="cursor-pointer w-full bg-blue-700 text-white border-gray-200 px-4 py-2 text-[13px] font-medium border rounded-lg focus:outline-none">
                Submit
              </button>
            </div>
          </div>
        </div>

        <div className="w-full md:w-[75%]">
          <span className="text-lg font-semibold">Output</span>
          <div className="bg-gray-100 p-4 mt-2 rounded-lg">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <div className="max-h-[57vh] overflow-y-auto">
                  <table className="min-w-full table-fixed">
                    <thead className="sticky top-0 z-10 bg-[#F1F3FF]">
                      <tr className="text-gray-700">
                        <th className="jobtablehead">
                          <div className="flex justify-between items-center">
                            <span>VARIABLE</span>
                            <div>
                              <TiArrowSortedUp className="w-3 h-3 cursor-pointer" />
                              <TiArrowSortedDown className="w-3 h-3 cursor-pointer" />
                            </div>
                          </div>
                        </th>
                        <th className="jobtablehead">
                          <div className="flex justify-between items-center">
                            <span> COUNT</span>
                            <div>
                              <TiArrowSortedUp className="w-3 h-3 cursor-pointer" />
                              <TiArrowSortedDown className="w-3 h-3 cursor-pointer" />
                            </div>
                          </div>
                        </th>
                        <th className="jobtablehead">
                          <div className="flex justify-between items-center">
                            <span> %HEATH</span>
                            <div>
                              <TiArrowSortedUp className="w-3 h-3 cursor-pointer" />
                              <TiArrowSortedDown className="w-3 h-3 cursor-pointer" />
                            </div>
                          </div>
                        </th>
                        <th className="jobtablehead">
                          <div className="flex justify-between items-center">
                            <span> AVERAGE</span>
                            <div>
                              <TiArrowSortedUp className="w-3 h-3 cursor-pointer" />
                              <TiArrowSortedDown className="w-3 h-3 cursor-pointer" />
                            </div>
                          </div>
                        </th>
                        <th className="jobtablehead">
                          <div className="flex justify-between items-center">
                            <span> MIN</span>
                            <div>
                              <TiArrowSortedUp className="w-3 h-3 cursor-pointer" />
                              <TiArrowSortedDown className="w-3 h-3 cursor-pointer" />
                            </div>
                          </div>
                        </th>
                        <th className="jobtablehead">
                          <div className="flex justify-between items-center">
                            <span> MAX</span>
                            <div>
                              <TiArrowSortedUp className="w-3 h-3 cursor-pointer" />
                              <TiArrowSortedDown className="w-3 h-3 cursor-pointer" />
                            </div>
                          </div>
                        </th>
                        <th className="jobtablehead">
                          <div className="flex justify-between items-center">
                            <span> STDEV</span>
                            <div>
                              <TiArrowSortedUp className="w-3 h-3 cursor-pointer" />
                              <TiArrowSortedDown className="w-3 h-3 cursor-pointer" />
                            </div>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[...Array(20)].map((_, idx) => (
                        <tr key={idx}>
                          <td className="jobtabledata">
                            #20462
                          </td>
                          <td className="jobtabledata">
                            492
                          </td>
                          <td className="jobtabledata">
                            647
                          </td>
                          <td className="jobtabledata">
                            826
                          </td>
                          <td className="jobtabledata">
                            185
                          </td>
                          <td className="jobtabledata">
                            536
                          </td>
                          <td className="jobtabledata">
                            447
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
               <Pagination/>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
              <div>
                <Roundedchart />
              </div>
              <div>
                <Linechart />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default ReportSetting;
