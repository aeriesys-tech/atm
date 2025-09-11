import React, { useState, useRef, useEffect } from 'react';

function Dropdown({
  options = [],
  label = "",
  name,
  value,
  onChange,
  error,
  disabled = false,
  searchable = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update label when value changes externally
  useEffect(() => {
    const selected = options.find(
      (opt) => opt.value === value || opt === value
    );
    setSelectedLabel(selected?.label || selected || "");
  }, [value, options]);

   const filteredOptions = searchable
    ? options.filter((opt) =>
        (opt.label || opt)
          .toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    : options;

  return (
    <div style={{ position: "relative", marginBottom: "1rem" }} ref={dropdownRef}>
      {name && (
        <label htmlFor={name} className="signin-form-label">
          {label}
        </label>
      )}

      {/* Dropdown trigger */}
      <div
        className={`form-select btn-bg1 d-flex justify-content-between align-items-center ${
          error ? "is-invalid" : ""
        }`}
        style={{
          height: "40px",
          width: "100%",
          minWidth:"200px",
          borderRadius: "12px",
          cursor: disabled ? "not-allowed" : "pointer",
          padding: "10px",
          backgroundColor: disabled ? "#f5f5f5" : "white",
        }}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
      >
        <span className={selectedLabel ? "text-dark" : "text-muted"}>
          {selectedLabel || `Select ${label}`}
        </span>
        <span style={{ marginLeft: "auto" }}>
          <i className={`bi bi-caret-${isOpen ? "up" : "down"}-fill`}></i>
        </span>
      </div>

      {/* Dropdown menu */}
      {isOpen && !disabled && (
        <div
          className="dropdown-menu show"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            marginTop: "2px",
            borderRadius: "8px",
            backgroundColor: "white",
            zIndex: 1000,
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Search box */}
          {searchable && (
          <div style={{ padding: "5px" }} onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              ref={searchInputRef}
            />
          </div>
          )}
          {/* Options list with scroll */}
          <div style={{ maxHeight: "150px", overflowY: "auto" }}>
            <ul className="list-unstyled mb-0">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, idx) => (
                  <li
                    key={idx}
                    onClick={() => {
                      const val = option.value || option;
                      const lbl = option.label || option;
                      onChange({ target: { name, value: val } });
                      setSelectedLabel(lbl);
                      setIsOpen(false);
                      setSearchQuery(""); // reset search
                    }}
                    className="px-3 py-2 dropdown-item"
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    {option.label || option}
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-muted">No results found</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {error && <small className="text-danger">{error}</small>}
    </div>
  );
}

export default Dropdown;
