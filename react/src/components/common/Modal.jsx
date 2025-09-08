import React, { useEffect } from 'react';
import Button from '../common/Button';
import InputField from '../common/InputField';
import Dropdown from '../common/Dropdown';
import closeIcon from "../../assets/icons/close.svg"
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
    onSuccess = () => {},
    displayOnly = false
}) {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(values, setErrors, onSuccess);
    };

 useEffect(() => {
    if (Object.keys(values || {}).length === 0) {
        setValues({});
        setErrors({});
    }
}, [values]);

    const formatDisplayValue = (value) => {
        if (!value) return "-";

        const date = new Date(value);
        if (!isNaN(date)) return date.toLocaleString();

        if (typeof value === "string" && value.includes("\n")) {
            return value.split("\n").map((line, idx) => (
                <div key={idx} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {line}
                </div>
            ));
        }

        return value.toString();
    };

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
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
            }}>
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
                            src={closeIcon}
                            width="28px"
                            height="28px"
                            alt="Close"
                        />
                    </a>
                </div>

                <form onSubmit={handleSubmit}>
                    <div
                        className="addunit-form"
                        style={{
                            display: "grid",
                            gridTemplateColumns: displayOnly ? "1fr" : (fields.length > 3 ? "1fr 1fr" : "1fr"),
                            gap: "12px"
                        }}
                    >
                        {displayOnly ? (
                            fields.map((field, idx) => (
                                <div key={idx} className="mb-3">
                                    <label style={{ fontWeight: 'bold' }}>{field.label}:</label>
                                    <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                        {formatDisplayValue(values[field.name])}
                                    </div>
                                </div>
                            ))
                        ) : (
                            fields.map((field, idx) => (
                                <div key={idx} className="">
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
                                            disabled={displayOnly || field.disabled}
                                        />
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="addunit-card-footer mt-2 d-flex gap-2">
                        <Button
                            name={displayOnly ? "CLOSE" : "DISCARD"}
                            className="discard-btn"
                            onClick={onClose}
                        />
                        {!displayOnly && (
                            <Button
                                name={submitButtonLabel}
                                type="submit"
                                className="update-btn"
                            />
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Modal;
