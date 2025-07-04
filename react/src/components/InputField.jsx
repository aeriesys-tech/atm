import React from 'react';

function InputField({
  label,
  type = 'text',
  name,
  id,
  value,
  onChange,
  placeholder,
  className = '',
  suffix,
  containerStyle = {},
  isRequired = false,
  isNumeric = false,
  maxLength,
  error = ''
}) {
  // Restrict numeric-only input
  const handleInputChange = (e) => {
    if (isNumeric) {
      const val = e.target.value;
      if (!/^\d*$/.test(val)) return; // allow only digits
    }
    onChange(e);
  };

  return (
    <div className="d-flex flex-column" style={{ marginBottom: 16, position: 'relative', ...containerStyle }}>
      <label htmlFor={id || name} className="signin-form-label">
        {label}{isRequired && <span style={{ color: 'red' }}> *</span>}
      </label>
      <input
        type={type}
        id={id || name}
        name={name}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`signin-form-input ${error ? 'is-invalid' : ''} ${className}`}
        maxLength={maxLength}
        required={isRequired}
      />
      {suffix && <div className="suffix-icon">{suffix}</div>}
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}

export default InputField;
