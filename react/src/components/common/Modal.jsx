import React from 'react';
import Button from '../common/Button';
import InputField from '../common/InputField';
import Dropdown from '../common/Dropdown';

function Modal({
    onClose,
    onSubmit,
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
                style={{ width: "50%", transition: "width 0.3s" }}
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
                    <form onSubmit={onSubmit}>
                        <div className="addunit-form">
                            {fields.map((field, index) => (
                                <div key={index} className="mb-3">
                                    {field.type === "dropdown" ? (
                                        <Dropdown
                                            label={field.label}
                                            options={field.options || []}
                                            value={values[field.name] || ''}
                                            name={field.name}
                                            onChange={onChange}
                                            error={errors[field.name]}
                                        />
                                    ) : (
                                        <InputField
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
                                name="ADD"
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
