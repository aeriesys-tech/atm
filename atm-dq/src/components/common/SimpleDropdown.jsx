import { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { FiChevronRight } from "react-icons/fi";

const SimpleDropdown = ({
  label = "",
  labelText = "",
  options = [],
  onSelect,
  onChange,
  value,
  width = "100%",
  placeholder = "Select Data Sources",
  isMulti = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState(
    isMulti ? [] : label
  );
  const dropdownRef = useRef();
  const buttonRef = useRef();
  const [dropdownStyles, setDropdownStyles] = useState({});

  const isControlled = value !== undefined;
  const selected = isControlled ? value : internalSelected;

  const handleSelect = (option) => {
    let newValue;

    if (isMulti) {
      const selectedSet = new Set(selected);
      if (selectedSet.has(option)) {
        selectedSet.delete(option);
      } else {
        selectedSet.add(option);
      }
      newValue = Array.from(selectedSet);
    } else {
      newValue = option;
    }

    if (!isControlled) {
      setInternalSelected(newValue);
    }

    onSelect?.(newValue);
    onChange?.(newValue);

    // Close dropdown after selection (for both single and multi-select)
    setIsOpen(false);
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
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Position dropdown absolutely
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyles({
        position: "absolute",
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, [isOpen]);

  // Helper for display
  const renderSelectedText = () => {
    if (isMulti) {
      if (!selected || selected.length === 0) return placeholder;
      return selected.join(", ");
    }
    return selected || placeholder;
  };

  const isOptionSelected = (option) => {
    if (isMulti) return selected.includes(option);
    return selected === option;
  };

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
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <span
              className={
                renderSelectedText() === placeholder ? "text-gray-400" : ""
              }
            >
              {renderSelectedText()}
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
                  isOptionSelected(option) ? "bg-gray-100" : ""
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

export default SimpleDropdown;