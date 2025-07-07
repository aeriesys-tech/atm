import React from 'react';

function Dropdown({ options = [], label = "Select Option" }) {
    return (

        <div class="dropdown">
            <select
                style={{ padding: "10px" }}
                className="btn-bg1 d-flex gap-btwn status"
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
