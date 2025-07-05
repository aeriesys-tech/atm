import React from 'react';

function ActionButton({ type = 'button', onClick, children, disabled = false, className = '', style = {} }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`signin-form-button ${className}`}
      style={style}
    >
      {children}
    </button>
  );
}

export default ActionButton;
