import { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { FiChevronRight } from "react-icons/fi";

const Dropdown = ({
  label = "",
  labelText = "",
  options = [],
  onSelect,
  onChange,
  value,
  width = "100%",
  placeholder = "Select...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState(label);
  const dropdownRef = useRef();
  const buttonRef = useRef();
  const [dropdownStyles, setDropdownStyles] = useState({});

  const isControlled = value !== undefined;
  const selected = isControlled ? value : internalSelected;

  const handleSelect = (option) => {
    if (!isControlled) {
      setInternalSelected(option);
    }

    onSelect?.(option);
    onChange?.(option);
    setIsOpen(false);
  };

  // Toggle dropdown and calculate position before rendering
  const toggleDropdown = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyles({
        position: "absolute",
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        zIndex: 9999,
      });
    }
    setIsOpen((prev) => !prev);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="relative inline-block" style={{ width }}>
        {labelText && (
          <label className="block font-medium text-gray-700 mb-1">
            {labelText}
          </label>
        )}

        <div ref={buttonRef}>
          <button
            type="button"
            className="w-full flex justify-between items-center px-2 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 hover:border-gray-400"
            onClick={toggleDropdown}
          >
            <span className={selected ? "" : "text-gray-400"}>
              {selected || placeholder}
            </span>
            <FiChevronRight
              className={`ml-2 transform transition-transform duration-200 ${
                isOpen ? "rotate-90" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {isOpen &&
        ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyles}
            className="bg-white border border-gray-200 rounded-md shadow-md max-h-60 overflow-auto"
          >
            {options.map((option, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(option)}
                className={`px-4 py-2 cursor-pointer text-gray-700 hover:bg-[#8A0000] hover:text-white ${
                  selected === option ? "bg-gray-100" : ""
                }`}
              >
                {option}
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};

export default Dropdown;
