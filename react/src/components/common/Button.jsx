import React from 'react';

function Button({ name, onClick, icon, className = "btn-bg", type = "button", disabled = false }) {
    return (
        <button
            type={type}
            className={className}
            disabled={disabled}
            onClick={onClick}
        >
            {icon && <span className='me-2'><img src={icon} alt="" /></span>}
            {name}
            {type !== "submit" && ( // Only show arrow for non-submit buttons
                <span className="arrow-white">
                    <img src="assets/icons/majesticons_arrow-right.svg" alt="" />
                </span>
            )}
        </button>
    );
}

export default Button;
