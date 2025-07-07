import React, { useState } from 'react';
import Modal from './Modal';
import Pagination from '../general/Pagination';

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
                                <td>{rowData}</td>
                                <td>{rowData}</td>
                                <td>{rowData}</td>

                                <td>
                                    <span className="align-content-center">
                                        <div id="overlay" />

                                        <a href="#">
                                            <img id="openPopup2" src="../../../src/assets/icons/edit.svg" />
                                        </a>
                                    </span>
                                    <span className="align-content-center trash-px">
                                        <div id="overlay" />
                                        <a href="#">
                                            <img id="openPopup1" src="../../../src/assets/icons/trash.svg" />
                                        </a>
                                    </span>
                                    <span className="align-content-center" style={{ paddingTop: 6 }}>
                                        <label className="switch switch1">
                                            <input type="checkbox" />
                                            <span className="slider slider1 round" />
                                        </label>
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination />
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
