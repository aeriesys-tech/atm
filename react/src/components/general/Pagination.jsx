import React, { useState, useRef, useEffect } from 'react';
import ArrowDown from "../../../src/assets/icons/ArrowDown.svg"

function Pagination({
  currentPage = 1,
  totalPages = 1,
  pageSize = 5,
  totalItems = 0,
  onPageChange = () => {},
  onPageSizeChange = () => {},
})
 {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="d-flex bg-white align-items-center justify-content-between table-head px-2" style={{ position: 'relative', zIndex: 1 }}>
      {/* Dropdown Box */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          className="pagination-btn"
          onClick={() => setOpen(!open)}
          style={{
            padding: '8px 16px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            backgroundColor: '#fff',
            cursor: 'pointer',
            minWidth: '60px',
          }}
        >
          {pageSize} <img src={ArrowDown} />
        </button>

        {/* Dropdown Menu */}
        {open && (
          <ul
            style={{
              position: 'absolute',
              bottom: '110%',
              left: 0,
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: '6px',
              listStyle: 'none',
              padding: 0,
              margin: 0,
              zIndex: 1000,
              width: '100%',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            }}
          >
            {[5, 10, 15, 20].map((val) => (
              <li
                key={val}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  backgroundColor: '#fff',
                  color: '#000',
                }}
                onClick={() => {
                 onPageSizeChange(val);
                  setOpen(false);
                }}
              >
                {val}
              </li>
            ))}
          </ul>
        )}
      </div>

     {/* Showing Results */}
<div className="tfoot align-content-center">
  <div className="pagination-resuls align-content-center text-secondary">
    <h2 className="m-0" style={{ fontSize: "14px", fontWeight: "500" }}>
      Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} – 
      {Math.min(currentPage * pageSize, totalItems)} of {totalItems} Total items
    </h2>
  </div>
</div>


      {/* Pagination Controls */}
      <div className="pagination d-flex gap-2 align-items-center">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage > 1) onPageChange(currentPage - 1);
          }}
          style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
        >
          Previous
        </a>

        {getPageNumbers().map((page) => (
          <a
            href="#"
            key={page}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(page);
            }}
            className={page === currentPage ? 'active' : ''}
          >
            {page}
          </a>
        ))}

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage < totalPages) onPageChange(currentPage + 1);
          }}
          style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
        >
          Next
        </a>
      </div>
    </div>
  );
}

export default Pagination;
