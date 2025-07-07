import React, { useState } from 'react';
import Modal from './Modal';

function Table({ headers = [], rows = [] }) {
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
                            {headers.map((header, index) => (
                                <th key={index} className="col">
                                    {header.label}
                                    {header.sortable && (
                                        <div className='float-end'>
                                            <i className="fas fa-angle-up icon-up" />
                                            <i className="fas fa-angle-down icon-down" />
                                        </div>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((rowData, index) => (
                            <tr key={index}>
                                <td>{rowData}</td>
                                <td>{rowData}</td>
                                <td>{rowData}</td>
                                <td>{rowData}</td>
                                <td>{rowData}</td>
                                <td>
                                    <div className="action-icons ps-2">
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleViewClick(rowData);
                                            }}
                                        >
                                            <img
                                                src="/src/assets/icons/visible 1.svg"
                                                alt="View"
                                                style={{ cursor: "pointer" }}
                                            />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <Modal
                    onClose={handleCloseModal}
                    title="View Master"
                    labels={[
                        {
                            label: 'Master Field 1',
                            name: 'value',
                        },
                        {
                            label: 'Master Field 2',
                            name: 'value',
                        }
                    ]}
                    values={{ rowData: selectedRow }}
                    errors={{}}
                    onChange={() => { }}
                />
            )}
        </div>
    );
}

export default Table;
