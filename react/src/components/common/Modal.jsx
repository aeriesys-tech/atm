import React from 'react';
import Button from '../common/Button';
import InputField from '../common/InputField';

function Modal({
    onClose,
    fields = [],
    labels = [],
    onChange,
    values = {},
    errors = {},
    title
}) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="addunit-card"
                style={{ width: "25%", transition: "width 0.3s" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="addunit-header">
                    <h4>{title}</h4>
                    <a onClick={onClose} style={{ cursor: "pointer" }}>
                        <img
                            src="src/assets/icons/close.svg"
                            width="28px"
                            height="28px"
                            alt="Close"
                        />
                    </a>
                </div>

                {labels.length > 0 && (
                    <div className="addunit-form">
                        {labels.map((label, index) => (
                            <div key={index} className="mb-3">
                                <label className="form-label"><b>{label.label}</b>: {label.name}</label>
                            </div>
                        ))}
                    </div>
                )}
                {fields.length > 0 && (
                    <form>
                        <div className="addunit-form">
                            {fields.map((field, index) => (
                                <InputField
                                    key={index}
                                    label={field.label}
                                    type={field.type}
                                    name={field.name}
                                    id={field.name}
                                    placeholder={field.placeholder}
                                    value={values[field.name] || ''}
                                    onChange={onChange}
                                    isRequired={field.required}
                                    isNumeric={field.isNumeric}
                                    maxLength={field.maxLength}
                                    error={errors[field.name]}
                                />
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
                )}
            </div>
        </div>
    );
}

export default Modal;
