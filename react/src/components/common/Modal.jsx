import React, { useEffect } from 'react';
import Button from '../common/Button';
import InputField from '../common/InputField';
import Dropdown from '../common/Dropdown';

function Modal({
    onClose,
    onSubmit,
    fields = [],
    onChange,
    values = {},
    setValues = () => {},
    errors = {},
    setErrors = () => {},
    title,
    submitButtonLabel = "SUBMIT",
    onSuccess = () => {}
}) {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(values, setErrors, onSuccess);
    };

    // ✅ Clear values & errors when modal mounts
   useEffect(() => {
    if (!values?.id) { // only reset if adding new
        setValues({});
        setErrors({});
    }
}, []);


    return (
        <div className="modal-overlay" onClick={onClose}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 9999,
                overflowY: "auto",
                paddingTop: "60px",
            }}
        >
            <div
                className="addunit-card"
                style={{
                    width: "60%",
                    marginTop: "100px",
                    maxHeight: "calc(100vh - 120px)",
                    background: "#fff",
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden"
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="addunit-header d-flex justify-content-between align-items-center">
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

                <form onSubmit={handleSubmit}>
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
                            name={submitButtonLabel}
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

