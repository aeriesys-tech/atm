import React from 'react';

function Dropdown({ options = [], label = "", name, value, onChange, error,disabled = false, }) {
    return (
        <div>
            {name && (
                <label htmlFor={name} className="signin-form-label">
                    {label}
                </label>
            )}
            <select
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
               className={`form-select btn-bg1 d-flex gap-btwn status ${error ? "is-invalid" : ""}`}

            >
                <option value="">Select {label}</option>
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
