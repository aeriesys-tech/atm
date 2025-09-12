import React from 'react';

function Breadcrumb({ title = '', items = [] }) {
    return (
        <nav className="breadcrumb-nav show-breadcrumb" aria-label="breadcrumb">
            <h5>{title}</h5>
            <ol className="breadcrumb template-breadcrumb">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li
                            key={index}
                            className="breadcrumb-item"
                        >
                                
                            <a href={item.href || '#'  } onClick={(e) => e.preventDefault()} >{item.label}</a>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

export default Breadcrumb;
