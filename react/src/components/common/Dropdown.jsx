import React from 'react';

function Dropdown({ options = [], label = "Select Option" }) {
    return (
        <div className="dropdown">
            <select
                style={{ padding: "10px", width: "250px" }}
                className="select-unit textarea"
            >
                <option value="">{label}</option>
                {options.map((option, index) => (
                    <option key={index} value={option.value || option}>
                        {option.label || option}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default Dropdown;
