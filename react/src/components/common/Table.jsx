import React, { useState } from 'react';
import Modal from './Modal';
import Pagination from '../general/Pagination';

function Table({ headers = [], rows = [], paginationProps = {}, sortBy, order, onSortChange }) {

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
                            rows.map((rowData, index) => (
                                <tr key={index}>
                                    {rowData.map((cell, cellIndex) => (
                                        <td key={cellIndex}>{cell}</td>
                                    ))}
                                    <td>
                                        <span className="align-content-center">
                                            <a href="#"><img src="../../../src/assets/icons/edit.svg" /></a>
                                        </span>
                                        <span className="align-content-center trash-px">
                                            <a href="#"><img src="../../../src/assets/icons/trash.svg" /></a>
                                        </span>
                                        <span className="align-content-center" style={{ paddingTop: 6 }}>
                                            <label className="switch switch1">
                                                <input type="checkbox" />
                                                <span className="slider slider1 round" />
                                            </label>
                                        </span>
                                    </td>
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
                <Pagination {...paginationProps} />
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
