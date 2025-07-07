import React from 'react';

function Button({ name, onClick, icon, className = "btn-bg", type = "button" }) {
    return (
        <button type={type} className={className} onClick={onClick}>
            {icon && <span className={icon}></span>}
            {name}
            <span className="arrow-white">
                <img src="assets/icons/majesticons_arrow-right.svg" alt="" />
            </span>
        </button>
    );
}

export default Button;
