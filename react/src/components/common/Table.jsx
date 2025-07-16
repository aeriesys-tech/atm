import React, { useState } from 'react';
import Pagination from '../general/Pagination';
import Modal from './Modal';
import editicon from '../../../src/assets/icons/edit.svg'
import deleteicon from '../../../src/assets/icons/trash.svg'
function Table({ headers = [], rows = [], paginationProps = {}, sortBy, order, onSortChange, onEdit, onToggleStatus, onDelete }) {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState('');

  const handleViewClick = (rowData) => {
    setSelectedRow(rowData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRow('');
  };

  return (
    <div className="asset-table">
      <div className="table-responsive">
        <table className="table table-striped align-middle table-text">
          <thead className="table-head align-middle">
            <tr>
              {headers.map((header, index) => {
                const isSorted = sortBy === header.key;
                return (
                  <th
                    key={index}
                    className="col"
                    onClick={() => {
                      if (header.sortable && header.key) {
                        const nextOrder = isSorted && order === 'asc' ? 'desc' : 'asc';
                        onSortChange(header.key, nextOrder);
                      }
                    }}
                    style={{ cursor: header.sortable ? 'pointer' : 'default', whiteSpace: 'nowrap' }}
                  >
                    <span className="d-inline-flex align-items-center gap-1">
                      {header.label}
                      {header.sortable && header.key && (
                        isSorted ? (
                          <i className={`fas ${order === 'asc' ? 'fa-angle-up' : 'fa-angle-down'} text-dark`} />
                        ) : (
                          <span style={{ fontSize: '10px', color: '#ccc', display: 'flex', flexDirection: 'column', lineHeight: '10px' }}>
                            <i className="fas fa-angle-up" />
                            <i className="fas fa-angle-down" />
                          </span>
                        )
                      )}
                    </span>
                  </th>
                );
              })}


            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <tr key={index}>
                  {headers.map((header, hIndex) => (
                    <td key={hIndex}>
                      {header.key === "status" ? (
                        <span className="align-content-center" style={{ paddingTop: 6 }}>
                          <label className="switch switch1">
                            <input
                              type="checkbox"
                              checked={row.status}
                              onChange={() => onToggleStatus(row)}
                            />
                            <span className="slider slider1 round" />
                          </label>
                        </span>
                      ) : header.key === "action" ? (
                        <span className="d-flex gap-2 justify-content-center">
                          <a  onClick={(e) => { e.preventDefault(); onEdit(row); }}><img src={editicon} alt="Edit" /></a>
                          <a
                            onClick={(e) => {
                              e.preventDefault();
                              onDelete(row);
                            }}
                          ><img src={deleteicon} alt="Delete" /></a>
                        </span>
                      ) : (
                        row[header.key]
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length + 1} className="text-center text-muted py-3">
                  Data not found
                </td>
              </tr>
            )}
          </tbody>


        </table>

        {/* ✅ Pass dynamic pagination props */}
        <Pagination {...paginationProps} totalItems={paginationProps.totalItems} />
      </div>

      {/* Optional View Modal */}
      {isModalOpen && (
        <Modal
          onClose={handleCloseModal}
          title="View Master"
          labels={[]}
          values={{ rowData: selectedRow }}
          errors={{}}
          onChange={() => { }}
        />
      )}
    </div>
  );
}

export default Table;
