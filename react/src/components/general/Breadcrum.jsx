import React from 'react';

function Breadcrum({ parent = '', current = '' }) {
    return (
        <div className="pt-5">
            <h5>{current}</h5>
            <nav className="show-breadcrumb breadcrumb-nav" aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <a href="#" style={{ textDecoration: 'none' }}>
                            {parent}
                        </a>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        {current}
                    </li>
                </ol>
            </nav>
        </div>
    );
}

export default Breadcrum;
