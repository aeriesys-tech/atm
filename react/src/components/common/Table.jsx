import React, { useState } from 'react';
import Pagination from '../general/Pagination';
import Modal from './Modal';
import editicon from '../../../src/assets/icons/edit.svg';
import deleteicon from '../../../src/assets/icons/trash.svg';
import eyeicon from '../../../src/assets/icons/Component 26.svg'
function Table({
  headers = [],
  rows = [],
  paginationProps = {},
  sortBy,
  order,
  onSortChange,
  onEdit,
  onToggleStatus,
  onDelete,
  onView
}) {
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
                    style={{
                      cursor: header.sortable ? 'pointer' : 'default',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span className="d-inline-flex align-items-center gap-1">
                      {header.label}
                      {header.sortable && header.key && (
                        isSorted ? (
                          <i
                            className={`fas ${order === 'asc' ? 'fa-angle-up' : 'fa-angle-down'} text-dark`}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: '10px',
                              color: '#ccc',
                              display: 'flex',
                              flexDirection: 'column',
                              lineHeight: '10px'
                            }}
                          >
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
                      {header.key === 'status' ? (
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
                      ) : header.key === 'action' ? (
                        <span className="d-flex gap-2 justify-content-center">
                          {onView ? (
                            // Only show View icon when onView is passed
                            <a
                              onClick={(e) => {
                                e.preventDefault();
                                onView?.(row);
                                handleViewClick(row);
                              }}
                              title="View"
                            >
                              <img src={eyeicon} alt="View" style={{ cursor: 'pointer', width: '28px' }} />
                            </a>
                          ) : (
                            <>
                              {/* Edit Icon */}
                              {row.status ? (
                                <a
                                  onClick={(e) => {
                                    e.preventDefault();
                                    onEdit(row);
                                  }}
                                  title="Edit"
                                >
                                  <img src={editicon} alt="Edit" style={{ cursor: 'pointer' }} />
                                </a>
                              ) : (
                                <img
                                  src={editicon}
                                  alt="Edit Disabled"
                                  style={{ opacity: 0.5, cursor: 'not-allowed' }}
                                  title="Inactive roles cannot be edited"
                                />
                              )}

                              {/* Delete Icon */}
                              <a
                                onClick={(e) => {
                                  e.preventDefault();
                                  onDelete(row);
                                }}
                                title="Delete"
                              >
                                <img src={deleteicon} alt="Delete" />
                              </a>
                            </>
                          )}
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
        <Pagination {...paginationProps} totalItems={paginationProps.totalItems} />
        {isModalOpen && selectedRow && (
          <Modal
            onClose={handleCloseModal}
            title="View Notification"
            fields={[
              { label: 'User ID', name: 'user_id' },
              { label: 'Module Name', name: 'module_name' },
              { label: 'Notification', name: 'notification' },
              { label: 'Date Time', name: 'date_time' },
              // { label: 'Timestamp', name: 'timestamp' },
            ]}
            values={selectedRow}
            displayOnly={true}
          />

        )}
      </div>

      {/* Optional View Modal */}

    </div>
  );
}

export default Table;
