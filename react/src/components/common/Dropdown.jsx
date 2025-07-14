import React from 'react';

function Dropdown({ options = [], label = "Select Option", name, value, onChange, error }) {
    return (
        <div >
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="form-select btn-bg1 d-flex gap-btwn status"
                style={{ padding: "10px" }}
            >
                <option value="">{label}</option>
                {options.map((option, index) => (
                    <option key={index} value={option.value || option}>
                        {option.label || option}
                    </option>
                ))}
            </select>
            {error && <small className="text-danger">{error}</small>}
        </div>
    );
}

export default Dropdown;
