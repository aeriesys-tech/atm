import React from 'react'

function Pagination() {
    return (
        <>

            <div className="d-flex bg-white align-items-center justify-content-between table-head px-2">
                <div className="align-content-center">
                    <button
                        type="button"
                        className="pagination-btn dropdown-toggle"
                        data-bs-toggle="dropdown"
                    >
                        5
                    </button>
                    <ul className="dropdown-menu option-width">
                        <li>
                            <a className="dropdown-item" href="#">
                                5
                            </a>
                        </li>
                        <li>
                            <a className="dropdown-item" href="#">
                                10
                            </a>
                        </li>
                        <li>
                            <a className="dropdown-item" href="#">
                                15
                            </a>
                        </li>
                        <li>
                            <a className="dropdown-item" href="#">
                                20
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="tfoot align-content-center">
                    <div className="pagination-resuls align-content-center text-secondary">
                        <h2 className="m-0">Showing 1 to 5 of 6 results</h2>
                    </div>
                </div>
                <div className="pagination ">
                    <a href="#">
                        Previous
                    </a>
                    <a href="#">
                        1
                    </a>
                    <a className="active" href="#">
                        2
                    </a>
                    <a href="#">
                        3
                    </a>
                    <a href="#">
                        4
                    </a>
                    <a href="#">
                        Next
                    </a>
                </div>
            </div>












        </>
    )
}

export default Pagination