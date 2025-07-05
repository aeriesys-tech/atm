// src/components/popups/Modal.jsx

import React from 'react';
import Button from '../common/Button'; // update path as needed

function Modal({ onClose, fields = [] }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="addunit-card"
                style={{ width: "25%", transition: "width 0.3s" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="addunit-header">
                    <h4>Add Role</h4>
                    <a onClick={onClose} style={{ cursor: "pointer" }}>
                        <img
                            src="src/assets/icons/close.svg"
                            width="28px"
                            height="28px"
                            alt="Close"
                        />
                    </a>
                </div>
                <form>
                    <div className="addunit-form">
                        {fields.map((field, index) => (
                            <div className="d-flex flex-column" key={index}>
                                <label htmlFor={field.name} className="addunit-form-text">
                                    {field.label}
                                </label>
                                {field.type === 'textarea' ? (
                                    <textarea
                                        id={field.name}
                                        name={field.name}
                                        placeholder={field.placeholder}
                                        rows={4}
                                    />
                                ) : (
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        id={field.name}
                                        placeholder={field.placeholder}
                                        required={field.required}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="addunit-card-footer d-flex gap-2">
                        <Button
                            name="DISCARD"
                            className="discard-btn"
                            onClick={onClose}
                        />
                        <Button
                            name="UPDATE"
                            type="submit"
                            className="update-btn"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Modal;
