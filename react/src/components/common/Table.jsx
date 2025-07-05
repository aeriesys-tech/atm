import React from 'react'

function Table({ headers = [], rows = [] }) {
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
                        {rows.map((name, index) => (
                            <tr key={index}>
                                <td>{name}</td>
                                <td>{name}</td>
                                <td>{name}</td>
                                <td>{name}</td>
                                <td>{name}</td>
                                <td>
                                    <div className="action-icons ps-2">
                                        <a className="align-content-center" href="#">
                                            <img src="/src/assets/icons/visible 1.svg" alt="View" />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
        </div>
    )
}

export default Table
