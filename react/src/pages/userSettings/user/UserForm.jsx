import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axiosWrapper from "../../../../services/AxiosWrapper";
import InputField from "../../../components/common/InputField";
import Dropdown from "../../../components/common/Dropdown";
import passicon from "../../../assets/icons/Component 26.svg";
import backIcon from "../../../assets/icons/arrow-Vector.svg";
import { toast } from "react-toastify";
const UserForm = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = mode === "edit";
  const location = useLocation();
  const { user: passedUser } = location.state || {};
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    mobile_no: "",
    role_id: "",
    department_id: "",
    avatar: null,
  });
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Fetch dropdown options and user data if in edit mode
  useEffect(() => {
    fetchRoles();
    fetchDepartments();

    if (isEditMode && id) {
      if (passedUser) {
        // Use passed user data directly
        setForm({
          name: passedUser.name || "",
          username: passedUser.username || "",
          email: passedUser.email || "",
          password: "",
          mobile_no: passedUser.mobile_no || "",
          role_id: passedUser.role_id || "",
          department_id: passedUser.department_id || "",
          avatar: null,
        });
      } else {
        // Fallback to API call if user is not passed via state
        fetchUserById(id);
      }
    }
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await axiosWrapper("api/v1/roles/getRoles", {
        method: "POST",
      });
      setRoles(res.roles || []);
    } catch (e) {
      // console.error("Failed to fetch roles");
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axiosWrapper("api/v1/departments/getDepartments", {
        method: "POST",
      });
      setDepartments(res.departments || []);
    } catch (e) {
      // console.error("Failed to fetch departments");
    }
  };

  const fetchUserById = async (id) => {
    try {
      const res = await axiosWrapper(`api/v1/users/getUser/${id}`, {
        method: "POST",
      });
      const data = res.data;
      setForm({
        name: data.name || "",
        username: data.username || "",
        email: data.email || "",
        password: "",
        mobile_no: data.mobile_no || "",
        role_id: data.role_id || "",
        department_id: data.department_id || "",
        avatar: null,
      });
    } catch (err) {
      // console.error("Failed to fetch user:", err);
    }
  };

  const handleChange = (e) => {
    const { name, type, value, files } = e.target;
    const newValue = type === "file" ? files[0] : value;
    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (let key in form) {
      if (form[key]) formData.append(key, form[key]);
    }
    if (isEditMode) {
      formData.append("id", id);
    }

    try {
      const url = isEditMode
        ? "api/v1/users/updateUser"
        : "api/v1/users/createUser";

      const response = await axiosWrapper(url, {
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(response?.message || "Users successfully", {
        autoClose: 3000,
      });

      navigate("/users");
    } catch (err) {
      const apiErrors = err?.response?.data?.errors || {};
      setErrors(apiErrors);
      toast.error(err?.response?.data?.message);
    }
  };

  return (
    <div className="">
      <div className="pt-4 pb-1">
        <div className="d-flex align-items-center gap-2">
          {" "}
          <img
            src={backIcon}
            alt="Back"
            style={{
              width: 34,
              cursor: "pointer",
              transform: "rotate(180deg)",
            }}
            onClick={() => navigate("/users")}
            title="Go back"
          />
          <h5>{isEditMode ? "Edit User" : "Add User"}</h5>
        </div>

        <nav className="breadcrumb show-breadcrumb" aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="#">Admin</a>
            </li>
            <li className="breadcrumb-item">
              <a href="#">Users</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {isEditMode ? "Edit User" : "Add User"}
            </li>
          </ol>
        </nav>
      </div>
      {/* <!-- <h5 class="mb-4">Add Equipments</h5> --> */}

      <div>
        <div class="addEuipment-header mb-5">
          <h4>{isEditMode ? "Update User" : "Add User"}</h4>
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="row m-2">
            <div className="col-md-6">
              <InputField
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter name"
                isRequired={true}
                error={errors.name}
              />
            </div>

            <div className="col-md-6">
              <InputField
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username"
                isRequired={true}
                error={errors.username}
              />
            </div>

            <div className="col-md-6">
              <InputField
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
                isRequired={true}
                error={errors.email}
              />
            </div>

            <div className="col-md-6">
              <InputField
                label="Mobile No"
                name="mobile_no"
                value={form.mobile_no}
                onChange={handleChange}
                placeholder="Enter mobile number"
                isRequired={true}
                isNumeric={true}
                maxLength={10}
                error={errors.mobile_no}
              />
            </div>

            {!isEditMode && (
              <div className="col-md-6">
                <div style={{ marginBottom: 16, position: "relative" }}>
                  <InputField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    error={errors.password}
                    suffix={
                      <img
                        className="password-icon"
                        src={passicon}
                        alt="toggle password"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowPassword((prev) => !prev)}
                      />
                    }
                  />
                </div>
              </div>
            )}

            <div className="col-md-6">
              {/* <label className="signin-form-label">Role<span style={{ color: 'red' }}> *</span></label> */}
              <Dropdown
                name="role_id"
                value={form.role_id}
                onChange={handleChange}
                label=" Role"
                options={roles.map((role) => ({
                  label: role.role_name, // 🟢 using role_name from your response
                  value: role._id,
                }))}
                error={errors.role_id}
              />
            </div>

            <div className="col-md-6">
              <Dropdown
                name="department_id"
                value={form.department_id}
                onChange={handleChange}
                label="Department"
                options={departments.map((dept) => ({
                  label: dept.department_name,
                  value: dept._id,
                }))}
                error={errors.department_id}
              />
            </div>

            <div className={`col-md-6 ${isEditMode ? "mt-3" : ""}`}>
              <InputField
                label="Avatar"
                type="file"
                name="avatar"
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="mt-4 ms-4 d-flex gap-2">
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="btn btn-secondary"
            >
              Discard
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditMode ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
