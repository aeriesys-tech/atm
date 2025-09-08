import React, { useEffect, useState } from 'react';
import search2 from "../../../src/assets/icons/search2.svg";
import Button from '../common/Button';
import Search from '../common/Search';
import Dropdown from '../common/Dropdown';
import Modal from '../common/Modal'

function Navbar({
  modalTitle = "Add Master",
  modalFields = [],
  onSubmit,
  onFilterChange,
  searchValue,
  onSearchChange,
}) {
  const [showModal, setShowModal] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // Log formErrors changes
  useEffect(() => {
    console.log("formErrors updated:", formErrors);
  }, [formErrors]);

  // Log when Navbar renders
  console.log("Navbar rendered");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field being edited
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (values, setErrors, onSuccess) => {
    console.log("Navbar handleSubmit called with values:", values);
    if (onSubmit) {
      onSubmit(values, setErrors, () => {
        console.log("onSuccess called, closing modal");
        setShowModal(false);
        setFormValues({});
        setFormErrors({});
      });
    }
  };

  return (
    <>
      <div className="navbar-3 mt-0 d-flex justify-content-between">
        <div className="d-flex gap-4">
          <div className="search-container">
            <img src={search2} alt="Search" />
            <Search value={searchValue} onChange={onSearchChange} />
          </div>
        </div>

        <div className="d-flex gap-3">
          <Dropdown
            label="All"
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
            onChange={(e) => onFilterChange?.(e.target.value)}
          />
          <Button name={modalTitle} onClick={() => setShowModal(true)} />
        </div>
      </div>

      {showModal && (
        <Modal
          title={modalTitle}
          fields={modalFields}
          onChange={handleInputChange}
          values={formValues}
          setValues={setFormValues}
          errors={formErrors}
          setErrors={setFormErrors}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
          submitButtonLabel="ADD"
        />
      )}
    </>
  );
}



export default Navbar;
