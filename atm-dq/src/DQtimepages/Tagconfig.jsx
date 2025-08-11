import { useState, useEffect, useRef } from "react";
import MainLayout from "../components/MainLayout";
import { MdDelete, MdOutlineDriveFolderUpload } from "react-icons/md";
import { AiFillEdit } from "react-icons/ai";
import { FaEye } from "react-icons/fa6";
import { TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti";
import Pagination from "../pagination/Pagination";
import authWrapper from "../../utils/AxiosWrapper";
import { LuDownload } from "react-icons/lu";
import Loader from "../components/LoaderAndSpinner/Loader";
import { toast } from "react-toastify";

function Tagconfig() {
  const [batches, setBatches] = useState([]);
  const [file, setFile] = useState(null); // Already assumed in your comment

  


  const [showTable, setShowTable] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("ATM");
  const dropdownRef = useRef();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);


  const [variableList, setVariableList] = useState([]);
  const [selectedVariableIds, setSelectedVariableIds] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [batchIdForVariables, setBatchIdForVariables] = useState(null);
  const [loading, setLoading] = useState(false);




  // Controls whether the Add/View modal is visible
  const [showAddModal, setShowAddModal] = useState(false);

  // Controls whether the modal is in "view" mode
  const [isViewing, setIsViewing] = useState(false);

  // Controls whether the modal is in "edit" mode
  const [isEditing, setIsEditing] = useState(false);

  // Holds table data fetched for the selected batch when viewing
  const [viewingFileContent, setViewingFileContent] = useState([]);

  // Holds form values for Add/Edit batch
  const [formBatch, setFormBatch] = useState({
    no_of_tags: "",
    no_of_attributes: "",
    upload_type: "atm",
    data: "",
    master: "",
    file: '',
  });

  // Holds form validation errors
  const [errors, setErrors] = useState({});

  // Holds previously fetched batch data in edit mode
  const [editBatchData, setEditBatchData] = useState(null);

  // (Optional) if you want to handle modal open/close separately from showAddModal



  

  const [editRowId, setEditRowId] = useState(null);
  const [formValues, setFormValues] = useState({});

// const handleEditClick = (row) => {
//   setEditRowId(row._id); // consistent use of _id
//   setFormValues({ ...row }); // populate form
// };

const handleEditClick = (row) => {

  setEditRowId(row._id); // consistent use of _id
  setFormValues({
    _id: row._id,
    batch_id: row.batch_id || "",
    variable_code: row.variable_code || "",
    variable_description: row.variable_description || "",
    uom: row.uom || "",
    ds_tag_id: row.ds_tag_id || "",
    ds_tag_code: row.ds_tag_code || "",
    flatline_length: row.flatline_length || "",
    lcl: row.lcl || "",
    ucl: row.ucl || "",
    min: row.min || "",
    max: row.max || "",
    status: row.status ?? false,
    created_at: row.created_at || "",
    updated_at: row.updated_at || ""
  });
};



// const handleInputChange = (e, field, val) => {
//   const value = val !== undefined ? val : e.target.value;
//   setFormValues(prev => ({
//     ...prev,
//     [field]: value
//   }));
// };
const handleInputChange = (e, field, val) => {
  const value = val !== undefined ? val : e.target.value;
  setFormValues(prev => ({
    ...prev,
    [field]: value
  }));
};




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
  //-------------------------------Choose file-----------------------------------------
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("No file chosen");

  const handleIconClick = () => {
    fileInputRef.current.click();
  };



  //-------------------------------------------------------------------------------------------
  const [opens, setOpens] = useState(false);
  const [selected, setSelected] = useState("select");
  const dropdownRefs = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelects = (option) => {
    setSelected(option);
    setOpen(false);
  };


useEffect(() => {
  fetchBatches(page, limit, sortBy, order, search);
}, []);


   const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("_id");
  const [order, setOrder] = useState("desc");
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);


const fetchBatches = (
  pageParam = page,
  limitParam = limit,
  sortParam = sortBy,
  orderParam = order,
  searchParam = search
) => {
  setLoading(true);

  authWrapper("/v1/batch/paginateBatches", {
    page: pageParam,
    limit: limitParam,
    sortBy: sortParam,
    order: orderParam,
    search: searchParam,
  })
   .then((res) => {
       
  const fetchedBatches = Array.isArray(res?.data?.data) ? res.data.data : [];
  setData(fetchedBatches);

  const pagination = res?.data?.pagination || {};
  setTotal(pagination.totalItems || 0);
  setPage(pagination.page || 1);
  setLimit(pagination.limit || limit);
  setShowTable(true);
  
})

    .catch((error) => {
      console.error("❌ Failed to fetch batches:", error.message);
    })
    .finally(() => {
      setLoading(false);
    });
};


const deleteBatch = async (batchId) => {
  try {
    authWrapper("/v1/batch/deleteBatch", {
      batch_id: batchId,
    });
  toast.success("Batch Deleted sucessfully");
    if (response.data.success) {
      
      return true;
    }   
  } catch (error) {
    console.error("Error deleting batch:", error);
    
    return false;
  }
};







  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log(file, "addeddd");

    setFile(file); // you already have this
    setFileName(file?.name || "");
  };

  const handleFileUpload = (type, file) => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);



    authWrapper("/v1/batch/uploadExcel", formData, {

    })
      .then((response) => {
        alert("File uploaded and variables saved successfully!");
        setFile(null);
        setFileName("Upload Your file here");
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
        fetchBatches();
      })
      .catch((error) => {
        console.error("Upload failed:", error);
        toast.error("Something went wrong while uploading.");
      })
      .finally(() => {

      });
  };


  // 🔹 Function to fetch variables
  const fetchVariables = (batch) => {
    console.log("batchhhhhhhhhh",batch)
    
  

    setLoading(true);

    authWrapper("/v1/variable/paginateBatchVariables", {
      batch_id: batch._id,
      page,
      limit: 10,
    })
      .then((res) => {
        const fetchedVariables = res.data.data || [];
        setVariableList(fetchedVariables);


        const activeIds = fetchedVariables
          .filter((v) => v.status)
          .map((v) => v._id);
        setSelectedVariableIds(activeIds);

        setPagination(res.data.data.pagination || { page: 1, totalPages: 1 });
        setBatchIdForVariables(batch._id);
      })
      .catch((err) => {
        console.error("Failed to fetch variables:", err);
        alert("Failed to fetch variables");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 🔹 Example: Automatically fetch when batchId changes
  useEffect(() => {
    if (batchIdForVariables) {
      fetchVariables(1, batchIdForVariables);
    }
  }, [batchIdForVariables]);

  const downloadFile = () => {
    window.location.href = "/static/ATM_DQ_DirectUploadTemplate.xlsx"; // relative to public folder
  };

  const handleViewBatch = (batchId) => {
    setLoading(true);

    authWrapper("/v1/batch/viewBatch", { batch_id: batchId })
      .then((response) => {
       
        const fileContent = response?.data?.file_content || [];
        console.log("File content:", fileContent);

        if (Array.isArray(fileContent) && fileContent.length > 0) {
          setViewingFileContent(fileContent); // ✅ storing the file content array
          setShowAddModal(true);
          setIsViewing(true);
        } else {
          alert("No file content found.");
        }
      })
      .catch((error) => {
        console.error("Error fetching batch:", error);
        alert("Failed to load file content");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  
// const handleSaveClick = (row) => {
//   alert("1111111111111111");
//   console.log("Saving row:", row);

//   setSelectedVariableIds((prev) => {
//     if (!prev.includes(row)) {
//       return [...prev, row]; // store _id as variable_id
//     }
//     return prev;
//   });


// };


// Update button click handler
// const handleUpdateAll = () => {
//   if (selectedVariableIds.length === 0) {
//     alert("No variables selected for update");
//     return;
//   }

//   editVariables(selectedVariableIds);
// };

const handleUpdateAll = async () => {
  if (selectedVariableIds.length === 0) {
    console.warn("No variables selected for update");
    return;
  }

  try {
    const payload = { variable_ids: selectedVariableIds };
    const res = await authWrapper("/v1/variable/updateStatus", payload);

    if (res?.success) {
      // Update UI without refetch
      setVariableList((prev) =>
        prev.map((item) =>
          selectedVariableIds.includes(item._id)
            ? { ...item, status: !item.status }
            : item
        )
      );
      setSelectedVariableIds([]); // clear selection
    } else {
      console.error("Update failed:", res);
    }
  } catch (error) {
    console.error("Error updating variables:", error);
  }
};



const handleSaveClick = (row) => {

  console.log("updated",row)
  // Merge the edited form values into the current row
  const updatedRow = {
    ...row,
    ...formValues, // formValues contains updated DS_Tag_ID, DS_Tag_Code, etc.
  };

  console.log("Saving variable:", updatedRow);

  setLoading(true);
  authWrapper("/v1/variable/updateVariableDetails", updatedRow) // send the merged object
    .then((response) => {
      console.log("Variables updated successfully:", response.data);
    })
    .catch((error) => {
      console.error("Error updating variables:", error);
    })
    .finally(() => {
      setLoading(false);
    });
};

  

//   const editVariables = ( variableIds) => {
//   setLoading(true);

//   authWrapper("/v1/variable/editVariables", {
//     variable_ids: variableIds,
//   })
//   .then((response) => {
//     console.log("Variables updated successfully:", response.data);
//     return response.data; // Return data for further use
//   })
//   .catch((error) => {
//     console.error("Error updating variables:", error);
//     throw error; // Rethrow if you want the caller to handle it
//   })
//   .finally(() => {
//     setLoading(false); // Always stop loading
//   });
// };


// const handleBulkStatusUpdate = async () => {
//   try {
//     const payload = { variable_ids: selectedVariableIds };
//     const res = await authWrapper("/v1/variable/updateStatus", payload);

//     if (res?.success) {
//       // Update UI after status change
//       setVariableList((prev) =>
//         prev.map((item) =>
//           selectedVariableIds.includes(item._id)
//             ? { ...item, status: !item.status }
//             : item
//         )
//       );
//       setSelectedVariableIds([]); // clear selection after update
//     } else {
//       console.error("Failed to update status:", res);
//     }
//   } catch (error) {
//     console.error("Error updating status:", error);
//   }
// };





  return (
    <>
    
    <MainLayout>
       {loading && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center  bg-opacity-50">
        <Loader />
      </div>
    )}
      
      <div>
        <div className="flex items-center gap-4">
          {/* Dropdown Section */}
          <div className="relative inline-block text-left " ref={dropdownRef}>
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
                    onClick={() => handleOptionClicks("ATM")}
                    className="block w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100"
                  >
                    ATM
                  </button>
                  <button
                    onClick={() => handleOptionClicks("USE CASE")}
                    className="block w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100"
                  >
                    USE CASE
                  </button>
                  <button
                    onClick={() => handleOptionClicks("DIRECT")}
                    className="block w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100"
                  >
                    DIRECT
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* File Upload Section */}
          {selectedOption === "DIRECT" && (
            <div className="">
              <div className="flex items-center w-full">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                <input
                  type="text"
                  value={fileName}
                  readOnly
                  className="border border-gray-300 rounded-l-lg px-3 py-2 w-64 text-sm text-gray-700"
                />

                <button
                  onClick={handleIconClick}
                  type="button"
                  className="p-2 py-[9px] bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
                >
                  <MdOutlineDriveFolderUpload className="h-5 w-5" />
                </button>

                <button
                  onClick={() => handleFileUpload("DIRECT", file)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded ml-3"
                >
                  Submit
                </button>


                {/* Spacer to push download button to end */}
                <div className="flex-grow ml-3" />

                <div className="col-lg-2 col-md-2 ms-auto">
                  <button
                    className="px-2 py-1 flex items-center gap-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition text-sm"
                    onClick={downloadFile}
                  >
                    <span>download</span>
                    <LuDownload className="w-6 h-6" />
                  </button>


                </div>
              </div>
            </div>
          )}


        </div>
        {/* Conditional Content Rendering Below */}
        <div className="mt-4 rounded-lg bg-gray-50">
          {selectedOption === "ATM" && (
            <div className="flex flex-col">
              <div className="border border-gray-200 rounded-lg flex flex-col">
                {/* Table Container */}
                <div className="overflow-y-auto max-h-[55vh]">
                  <table className="min-w-full table-fixed">
                    <thead className="sticky top-0 z-10 bg-[#5D616C]">
                      <tr>
                        <th className="tablehead rounded-tl-lg ">
                          <span>#ID</span>
                        </th>

                        <th className="tablehead">
                          <div className="flex justify-between items-center">
                            <span>TAMPLATE NAME</span>
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
                            <span> NO.OF.ATTRIBUTES </span>
                            <div>
                              <TiArrowSortedUp className="w-3 h-3 cursor-pointer" />
                              <TiArrowSortedDown className="w-3 h-3 cursor-pointer" />
                            </div>
                          </div>
                        </th>
                        <th className="tablehead bg-[#5D616C] rounded-tr-lg">
                          <div className="flex justify-between items-center">
                            <span> ACTIONS</span>

                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
  {Array.isArray(data) && data.length > 0 ? (
    data.map((batch, idx) => (
      <tr key={batch._id}>
        <td className="tabledata">#{(page - 1) * limit + idx + 1}</td>
        <td className="tabledata">
          {batch.file?.split("-")?.slice(1).join("-") || "N/A"}
        </td>
        <td className="tabledata">{batch.no_of_tags}</td>
        <td className="tabledata">{batch.no_of_attributes}</td>
          <td className="tabledata space-x-2">
                            <button
                              className="px-1 py-1"
                              onClick={() => {
                                handleViewBatch(batch._id); // Fetch data
                                setIsModalOpen2(true);       // Optional if you track a separate modal state
                              }}
                            >
                              <FaEye className="w-4 h-4" />
                            </button>


                            {/* -------------this code------ */}
                            <button className="px-1 py-1"
                              onClick={() => {
                                fetchVariables(batch); // Call function with batch ID
                                setIsModalOpen(true);         // Open modal after fetching
                              }}>
                              <AiFillEdit className="w-4 h-4" />
                            </button>
                            <button className="px-1 py-1"
                             onClick={() => {
                                deleteBatch(batch._id); // Call function with batch ID
                                         // Open modal after fetching
                              }}>
                              <MdDelete className="w-4 h-4" />
                            </button>
                          </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="5" className="text-center py-4">
        No data available
      </td>
    </tr>
  )}
</tbody>

                    {/* <tbody className="divide-y divide-gray-200 bg-white">
                      {data.map((batch, idx) => (
                        <tr key={batch._id}>
                          <td className="tabledata">#{idx + 1}</td>
                          <td className="tabledata">
                            {batch.file?.split("-")?.slice(1).join("-") || "N/A"}
                          </td>
                          <td className="tabledata">{batch.no_of_tags}</td>
                          <td className="tabledata">{batch.no_of_attributes}</td>

                          <td className="tabledata space-x-2">
                            <button
                              className="px-1 py-1"
                              onClick={() => {
                                handleViewBatch(batch._id); // Fetch data
                                setIsModalOpen2(true);       // Optional if you track a separate modal state
                              }}
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            <button className="px-1 py-1"
                              onClick={() => {
                                fetchVariables(1, batch._id); // Call function with batch ID
                                setIsModalOpen(true);         // Open modal after fetching
                              }}>
                              <AiFillEdit className="w-4 h-4" />
                            </button>
                            <button className="px-1 py-1">
                              <MdDelete className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody> */}
                  </table>
                  <Pagination
  currentPage={page}
  totalItems={total}
  itemsPerPage={limit}
  onPageChange={(newPage) => {
    setPage(newPage);
    fetchBatches(newPage, limit, sortBy, order, search);
  }}
/>

                </div>

                {/* Pagination Below Table */}

              </div>
            </div>
          )}

          {selectedOption === "USE CASE" && (
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
          )}

          {selectedOption === "DIRECT" && (
            <div className="flex flex-col">
              <div className="border border-gray-200 rounded-lg flex flex-col">
                {/* Table Container */}
                <div className="overflow-y-auto max-h-[55vh]">
                  <table className="min-w-full table-fixed">
                    <thead className="sticky top-0 z-10 bg-[#5D616C]">
                      <tr>
                        <th className="tablehead rounded-tl-lg ">
                          <span>#ID</span>
                        </th>

                        <th className="tablehead">
                          <div className="flex justify-between items-center">
                            <span>TAMPLATE NAME</span>
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
                            <span> NO.OF.ATTRIBUTES </span>
                            <div>
                              <TiArrowSortedUp className="w-3 h-3 cursor-pointer" />
                              <TiArrowSortedDown className="w-3 h-3 cursor-pointer" />
                            </div>
                          </div>
                        </th>
                        <th className="tablehead bg-[#5D616C] rounded-tr-lg">
                          <div className="flex justify-between items-center">
                            <span> ACTIONS</span>

                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {batches.map((batch, idx) => (
                        <tr key={batch._id}>
                          <td className="tabledata">#{idx + 1}</td>
                          <td className="tabledata">
                            {batch.file?.split("-")?.slice(1).join("-") || "N/A"}
                          </td>
                          <td className="tabledata">{batch.no_of_tags}</td>
                          <td className="tabledata">{batch.no_of_attributes}</td>

                          <td className="tabledata space-x-2">
                            <button
                              className="px-1 py-1">
                              <FaEye className="w-4 h-4" />
                            </button>
                            <button className="px-1 py-1"
                              onClick={() => {
                                fetchVariables(1, batch); // Call function with batch ID
                                setIsModalOpen(true);         // Open modal after fetching
                              }}>
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

                {/* Pagination Below Table */}

              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 ">
          <div className="bg-white rounded-lg shadow-lg max-w-7xl w-full p-4 relative">
            {/* Close Button */}
            <div className="flex items-center justify-between bg-gray-500 px-4 py-2 mb-2 rounded-t-lg">
             <button
  onClick={() => {
    setViewingFileContent([]); // clear hook value
    setIsModalOpen2(false);    // close modal
  }}
  className="absolute top-6 right-8 text-white hover:text-red-500"
>
  Close
</button>

              {/* Modal Title */}
              <h2 className="text-xl font-semibold text-white">
                Show Variables
              </h2>
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border border-gray-200">ID</th>
                    <th className="px-4 py-2 border border-gray-200">Variable Code</th>
                    <th className="px-4 py-2 border border-gray-200">Description</th>
                    <th className="px-4 py-2 border border-gray-200">UoM</th>
                    <th className="px-4 py-2 border border-gray-200">DS_Tag_ID</th>
                    <th className="px-4 py-2 border border-gray-200">DS_Tag_Code</th>
                    <th className="px-4 py-2 border border-gray-200">Min</th>
                    <th className="px-4 py-2 border border-gray-200">Max</th>
                    <th className="px-4 py-2 border border-gray-200">LCL</th>
                    <th className="px-4 py-2 border border-gray-200">UCL</th>
                    <th className="px-4 py-2 border border-gray-200">Flatline Length</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingFileContent?.length > 0 ? (
                    viewingFileContent.map((row, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 border border-gray-200">{row["S.No."]}</td>
                        <td className="px-4 py-2 border border-gray-200">{row["Variable Code"]}</td>
                        <td className="px-4 py-2 border border-gray-200">{row["Variable Description"]}</td>
                        <td className="px-4 py-2 border border-gray-200">{row["UoM"]}</td>
                        <td className="px-4 py-2 border border-gray-200">{row["DS Tag ID"]}</td>
                        <td className="px-4 py-2 border border-gray-200">{row["DS Tag Code"]}</td>
                        <td className="px-4 py-2 border border-gray-200">{row["Minimum"]}</td>
                        <td className="px-4 py-2 border border-gray-200">{row["Maximum"]}</td>
                        <td className="px-4 py-2 border border-gray-200">{row["LCL"]}</td>
                        <td className="px-4 py-2 border border-gray-200">{row["UCL"]}</td>
                        <td className="px-4 py-2 border border-gray-200">{row["Flatline Length"]}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="11"
                        className="px-4 py-2 border border-gray-200 text-center text-gray-500"
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

            </div>

          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 ">
          <div className="bg-white rounded-lg shadow-lg  w-full p-4 relative">
            {/* Close Button */}
            <div className="flex items-center justify-between bg-gray-500 px-4 py-2 mb-2 rounded-t-lg">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-8 text-white hover:text-red-500"
              >
                Close
              </button>
              {/* Modal Title */}
              <h2 className="text-xl font-semibold text-white">
                Edit Variables
              </h2>
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
              <div className=" overflow-y-auto max-h-96 border border-gray-200 rounded">
             <table className="min-w-full text-sm text-left border border-gray-200">
      <thead className="bg-gray-100">
        <tr>
          
          <th className="px-4 py-2 border">Variable code</th>
          <th className="px-4 py-2 border">Description</th>
          <th className="px-4 py-2 border">UoM</th>
          <th className="px-4 py-2 border">DS_Tag_ID</th>
          <th className="px-4 py-2 border">DS_Tag_Code</th>
          <th className="px-4 py-2 border">Min</th>
          <th className="px-4 py-2 border">Max</th>
          <th className="px-4 py-2 border">LCL</th>
          <th className="px-4 py-2 border">UCL</th>
          <th className="px-4 py-2 border">Flatline Length</th>
          <th className="px-4 py-2 border">Status</th>
          <th className="px-4 py-2 border">Action</th>
        </tr>
      </thead>
      <tbody>
        {variableList.map((row) => (
          <tr key={row.id}>
            
            <td className="px-4 py-2 border">
              {editRowId === row.id ? (
                <input
                  type="text"
                  value={formValues.variable_code}
                  onChange={(e) => handleInputChange(e, "variable_code", )}

                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                />
              ) : (
                row.variable_code
              )}
            </td>
            <td className="px-4 py-2 border">
              {editRowId === row.id ? (
                <input
                  type="text"
                  value={formValues.variable_description}
                  onChange={(e) => handleInputChange(e, "variable_description",)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                />
              ) : (
                row.variable_description
              )}
            </td>
            <td className="px-4 py-2 border">
              {editRowId === row.id ? (
                <input
                  type="text"
                  value={formValues.uom}
                  onChange={(e) => handleInputChange(e, "uom")}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                />
              ) : (
                row.uom
              )}
            </td>
            <td className="px-4 py-2 border">
              {editRowId === row._id ? (
                <input
                  type="text"
                  value={formValues.ds_tag_id}
                  onChange={(e) => handleInputChange(e, "ds_tag_id",e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                />
              ) : (
                row.ds_tag_id
              )}
            </td>
            <td className="px-4 py-2 border">
              {editRowId === row._id ? (
                <input
                  type="text"
                  value={formValues.ds_tag_code}
                  onChange={(e) => handleInputChange(e, "ds_tag_code",e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                />
              ) : (
                row.ds_tag_code
              )}
            </td>
            <td className="px-4 py-2 border">
              {editRowId === row._id ? (
                <input
                  type="number"
                  value={formValues.min}
                  onChange={(e) => handleInputChange(e, "min",e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                />
              ) : (
                row.min
              )}
            </td>
            <td className="px-4 py-2 border">
              {editRowId === row._id ? (
                <input
                  type="number"
                  value={formValues.max}
                  onChange={(e) => handleInputChange(e, "max",e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                />
              ) : (
                row.max
              )}
            </td>
            <td className="px-4 py-2 border">
              {editRowId === row._id ? (
                <input
                  type="number"
                  value={formValues.lcl}
                  onChange={(e) => handleInputChange(e, "lcl",e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                />
              ) : (
                row.lcl
              )}
            </td>
            <td className="px-4 py-2 border">
              {editRowId === row._id ? (
                <input
                  type="number"
                  value={formValues.ucl}
                  onChange={(e) => handleInputChange(e, "ucl",e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                />
              ) : (
                row.ucl
              )}
            </td>
            <td className="px-4 py-2 border">
              {editRowId === row._id ? (
                <input
                  type="number"
                  value={formValues.flatline_length}
                  onChange={(e) => handleInputChange(e, "flatline_length",e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                />
              ) : (
                row.flatline_length
              )}
            </td>
            <td className="px-4 py-2 border text-center">
{/* <input
  type="checkbox"
  checked={editRowId === row._id ? formValues.status : row.status}
  onChange={(e) => handleInputChange(e, "status", e.target.checked)}
  className="w-4 h-4 accent-blue-500 cursor-pointer"
  // disabled={editRowId !== row._id} // ✅ disabled when NOT editing
/> */}

<input
  type="checkbox"
  checked={selectedVariableIds.includes(row._id)}
  onChange={(e) => {
    if (e.target.checked) {
      setSelectedVariableIds((prev) => [...prev, row._id]);
    } else {
      setSelectedVariableIds((prev) => prev.filter((id) => id !== row._id));
    }
  }}
  className="w-4 h-4 accent-blue-500 cursor-pointer"
/>




            </td>
        <td className="px-4 py-2 border">
  {editRowId === row._id ? (
    <button
      onClick={() => handleSaveClick(row)}
      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
    >
      Save
    </button>
  ) : (
    <button
      onClick={() => handleEditClick(row)}
      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
    >
      Edit
    </button>
  )}
</td>

          </tr>
        ))}
      </tbody>
    </table>
    </div>
            </div>
            
            <div className="mt-4 text-end">
    <button
  onClick={() => {
    handleUpdateAll();
    setIsModalOpen(false);
  }}
  className="bg-red-500 px-4 py-2 rounded-lg text-white hover:bg-red-700 duration-300"
>
  Update
</button>

            </div>
          </div>
        </div>
      )}


    </MainLayout>
    </>
  );
}

export default Tagconfig;
