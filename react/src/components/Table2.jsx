import React from 'react'

function Table2() {
    return (
        <>
            <div style={{ marginTop: "-10px" }}>
                <div className="table-responsive">
                    <table className="table align-middle table-text">
                        <thead className="table-head align-middle">
                            <tr>
                                <th className="table-check">
                                    <input type="checkbox" />
                                </th>
                                <th>ID</th>
                                <th className="col text-uppercase">
                                    <span>Cluster Code </span>
                                </th>
                                <th className="col text-uppercase">
                                    <span>Cluster Name </span>
                                </th>
                                <th className="col text-uppercase">Status</th>
                                <th className="col-2 text-uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="pl-4">
                            <tr className="">
                                <td className="table-check">
                                    <input type="checkbox" />
                                </td>
                                <td>1</td>
                                <td>N</td>
                                <td>North</td>
                                <td className="col">
                                    <span className="active-status">Active</span>
                                </td>
                                <td className="col">
                                    <button
                                        className="align-content-center me-3"
                                        style={{ border: "none", background: "transparent" }}
                                    >
                                        <img
                                            src="/static/media/edit.918e8787656375feffdd9b83463f56d6.svg"
                                            alt="edit"
                                        />
                                    </button>
                                    <span className="align-content-center switcher">
                                        <label className="switch switch1">
                                            <input type="checkbox" defaultChecked="" />
                                            <span className="slider slider1 round" />
                                        </label>
                                    </span>
                                </td>
                            </tr>
                            <tr className="">
                                <td className="table-check">
                                    <input type="checkbox" />
                                </td>
                                <td>2</td>
                                <td>E</td>
                                <td>East</td>
                                <td className="col">
                                    <span className="active-status">Active</span>
                                </td>
                                <td className="col">
                                    <button
                                        className="align-content-center me-3"
                                        style={{ border: "none", background: "transparent" }}
                                    >
                                        <img
                                            src="/static/media/edit.918e8787656375feffdd9b83463f56d6.svg"
                                            alt="edit"
                                        />
                                    </button>
                                    <span className="align-content-center switcher">
                                        <label className="switch switch1">
                                            <input type="checkbox" defaultChecked="" />
                                            <span className="slider slider1 round" />
                                        </label>
                                    </span>
                                </td>
                            </tr>
                            <tr className="">
                                <td className="table-check">
                                    <input type="checkbox" />
                                </td>
                                <td>3</td>
                                <td>W</td>
                                <td>West</td>
                                <td className="col">
                                    <span className="active-status">Active</span>
                                </td>
                                <td className="col">
                                    <button
                                        className="align-content-center me-3"
                                        style={{ border: "none", background: "transparent" }}
                                    >
                                        <img
                                            src="/static/media/edit.918e8787656375feffdd9b83463f56d6.svg"
                                            alt="edit"
                                        />
                                    </button>
                                    <span className="align-content-center switcher">
                                        <label className="switch switch1">
                                            <input type="checkbox" defaultChecked="" />
                                            <span className="slider slider1 round" />
                                        </label>
                                    </span>
                                </td>
                            </tr>
                            <tr className="">
                                <td className="table-check">
                                    <input type="checkbox" />
                                </td>
                                <td>4</td>
                                <td>S</td>
                                <td>South</td>
                                <td className="col">
                                    <span className="active-status">Active</span>
                                </td>
                                <td className="col">
                                    <button
                                        className="align-content-center me-3"
                                        style={{ border: "none", background: "transparent" }}
                                    >
                                        <img
                                            src="/static/media/edit.918e8787656375feffdd9b83463f56d6.svg"
                                            alt="edit"
                                        />
                                    </button>
                                    <span className="align-content-center switcher">
                                        <label className="switch switch1">
                                            <input type="checkbox" defaultChecked="" />
                                            <span className="slider slider1 round" />
                                        </label>
                                    </span>
                                </td>
                            </tr>
                            <tr className="">
                                <td className="table-check">
                                    <input type="checkbox" />
                                </td>
                                <td>5</td>
                                <td>V</td>
                                <td>Vidharbha</td>
                                <td className="col">
                                    <span className="active-status">Active</span>
                                </td>
                                <td className="col">
                                    <button
                                        className="align-content-center me-3"
                                        style={{ border: "none", background: "transparent" }}
                                    >
                                        <img
                                            src="/static/media/edit.918e8787656375feffdd9b83463f56d6.svg"
                                            alt="edit"
                                        />
                                    </button>
                                    <span className="align-content-center switcher">
                                        <label className="switch switch1">
                                            <input type="checkbox" defaultChecked="" />
                                            <span className="slider slider1 round" />
                                        </label>
                                    </span>
                                </td>
                            </tr>
                            <tr className="">
                                <td className="table-check">
                                    <input type="checkbox" />
                                </td>
                                <td>6</td>
                                <td>H</td>
                                <td>Head Office</td>
                                <td className="col">
                                    <span className="active-status">Active</span>
                                </td>
                                <td className="col">
                                    <button
                                        className="align-content-center me-3"
                                        style={{ border: "none", background: "transparent" }}
                                    >
                                        <img
                                            src="/static/media/edit.918e8787656375feffdd9b83463f56d6.svg"
                                            alt="edit"
                                        />
                                    </button>
                                    <span className="align-content-center switcher">
                                        <label className="switch switch1">
                                            <input type="checkbox" defaultChecked="" />
                                            <span className="slider slider1 round" />
                                        </label>
                                    </span>
                                </td>
                            </tr>
                            <tr className="">
                                <td className="table-check">
                                    <input type="checkbox" />
                                </td>
                                <td>7</td>
                                <td>G</td>
                                <td>General</td>
                                <td className="col">
                                    <span className="active-status">Active</span>
                                </td>
                                <td className="col">
                                    <button
                                        className="align-content-center me-3"
                                        style={{ border: "none", background: "transparent" }}
                                    >
                                        <img
                                            src="/static/media/edit.918e8787656375feffdd9b83463f56d6.svg"
                                            alt="edit"
                                        />
                                    </button>
                                    <span className="align-content-center switcher">
                                        <label className="switch switch1">
                                            <input type="checkbox" defaultChecked="" />
                                            <span className="slider slider1 round" />
                                        </label>
                                    </span>
                                </td>
                            </tr>
                            <tr className="">
                                <td className="table-check">
                                    <input type="checkbox" />
                                </td>
                                <td>8</td>
                                <td>C</td>
                                <td>Central</td>
                                <td className="col">
                                    <span className="active-status">Active</span>
                                </td>
                                <td className="col">
                                    <button
                                        className="align-content-center me-3"
                                        style={{ border: "none", background: "transparent" }}
                                    >
                                        <img
                                            src="/static/media/edit.918e8787656375feffdd9b83463f56d6.svg"
                                            alt="edit"
                                        />
                                    </button>
                                    <span className="align-content-center switcher">
                                        <label className="switch switch1">
                                            <input type="checkbox" defaultChecked="" />
                                            <span className="slider slider1 round" />
                                        </label>
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="pagination-container">
                    <div className="row">
                        <div className="col-md-2 d-flex mt-0">
                            <select className="select-unit">
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                        <div className="col-md-4 mt-2 d-flex justify-content-end">
                            Showing 1 to 8 of 8 results
                        </div>
                        <div className="pagination pagination-controls col-md-6 mt-0 d-flex justify-content-end">
                            <button disabled="" className="mr-2">
                                First
                            </button>
                            <button disabled="" className="mr-2">
                                Previous
                            </button>
                            <button className="mr-2 active">1</button>
                            <button className="mr-2" disabled="">
                                Next
                            </button>
                            <button disabled="">Last</button>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default Table2