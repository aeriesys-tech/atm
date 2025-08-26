import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/general/LoaderAndSpinner/Loader";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import logoutIcon from "../assets/icons/logout-1.svg"
import InputField from "../components/common/InputField";
import dummyProfile from "../assets/profile.jpg"
import { useDispatch } from "react-redux";
import { clearAllStorage } from "../../services/TokenService";
import { setUser } from "../redux/user/UserSlice";
const ProfileSettings = () => {
    const [formData, setFormData] = useState({
        avatar: "",
        name: "",
        email: "",
        mobile: "",
        roleId: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState({});
    const [roles, setRoles] = useState([]);
    const [displayName, setDisplayName] = useState("");
    const [loading, setLoading] = useState(false);
    const [logoutModal, setLogoutModal] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // Mock API base URL (adjust as per your environment)
    const BASE_API_URL = "http://192.168.0.189:8080";

    // Fetch user profile and roles on mount
    useEffect(() => {
        const fetchProfileAndRoles = async () => {
            try {
                setLoading(true);
                // Mock API call for user profile
                const profileResponse = await axiosWrapper("api/v1/profile", { method: "GET" });
                const profile = profileResponse.data || {};
                setFormData({
                    avatar: profile.avatar || "",
                    name: profile.name || "",
                    email: profile.email || "",
                    mobile: profile.mobile || "",
                    roleId: profile.roleId || "",
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
                setDisplayName(profile.name || "User");

                // Mock API call for roles
                const rolesResponse = await axiosWrapper("api/v1/roles", { method: "GET" });
                setRoles(rolesResponse.roles || []);
            } catch (error) {
                console.error("Error fetching profile/roles:", error.message || error);
                setErrors({ general: "Failed to load profile data" });
            } finally {
                setLoading(false);
            }
        };
        fetchProfileAndRoles();
    }, []);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setErrorMessage((prev) => ({ ...prev, [name]: "" }));
    };

    // Handle file change for profile picture
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, avatar: file }));
            setErrors((prev) => ({ ...prev, avatar: "" }));
        }
    };

    // Validate profile update form
    const validateProfileForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = "Full name is required";
        }
        if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
            newErrors.mobile = "Phone number must be 10 digits";
        }
        return newErrors;
    };

    // Handle profile update submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateProfileForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setLoading(true);
            const formDataToSend = new FormData();
            formDataToSend.append("name", formData.name);
            formDataToSend.append("mobile", formData.mobile);
            if (formData.avatar instanceof File) {
                formDataToSend.append("avatar", formData.avatar);
            }

            // Mock API call for profile update
            await axiosWrapper("api/v1/profile", {
                method: "PUT",
                data: formDataToSend,
                headers: { "Content-Type": "multipart/form-data" },
            });
            setDisplayName(formData.name);
            setErrors({});
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error.message || error);
            setErrors({ general: error?.response?.data?.message || "Failed to update profile" });
        } finally {
            setLoading(false);
        }
    };

    // Validate password change form
    const validatePasswordForm = () => {
        const newErrors = {};
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!formData.currentPassword) {
            newErrors.currentPassword = "Current password is required";
        }
        if (!formData.newPassword) {
            newErrors.newPassword = "New password is required";
        } else if (!passwordRegex.test(formData.newPassword)) {
            newErrors.newPassword =
                "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character";
        }
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Confirm password is required";
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.passwordMatch = "Passwords do not match";
        }
        return newErrors;
    };

    // Handle password change submission
    const handleChangePassword = async (e) => {
        e.preventDefault();
        const validationErrors = validatePasswordForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrorMessage(validationErrors);
            return;
        }

        try {
            setLoading(true);
            // Mock API call for password change
            await axiosWrapper("api/v1/change-password", {
                method: "POST",
                data: {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                },
            });
            setFormData((prev) => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            }));
            setErrorMessage({});
            alert("Password changed successfully!");
        } catch (error) {
            console.error("Error changing password:", error.message || error);
            setErrorMessage({ general: error?.response?.data?.message || "Failed to change password" });
        } finally {
            setLoading(false);
        }
    };

    // Handle logout confirmation
    const handleLogout = () => {
        dispatch(setUser({ user: null, token: null, _persist: null }));
        clearAllStorage();
        navigate("/");
    };

    return (
        < >
            {loading && (
                <div className="loader-overlay d-flex justify-content-center align-items-center">
                    <Loader />
                </div>
            )}
            <h5 className="pt-3 pb-4 m-0">Profile Settings</h5>
            <div className="profileSetting-name pt-3 py-2 px-5 mb-3 d-flex justify-content-between align-content-center">
                <div className="d-flex gap-3">
                    <img
                        className="profileSetting-pic"
                        src={
                            formData.avatar instanceof File
                                ? URL.createObjectURL(formData.avatar)
                                : formData.avatar
                                    ? `${BASE_API_URL}/${formData.avatar}`
                                    : dummyProfile
                        }
                        alt="ProfileImage"
                        style={{ width: "60px", height: "60px", borderRadius: "50%" }}
                    />

                    <div>
                        <h5 className="m-0">{displayName}</h5>
                        <p className="small-body m-0">
                            {roles.length > 0 ? (
                                roles.find((role) => role._id === formData.roleId)?.role_name || "N/A"
                            ) : (
                                "Role"
                            )}
                        </p>
                    </div>
                </div>
                <div className="logout">
                    <span onClick={() => setLogoutModal(true)} style={{ cursor: "pointer" }}>
                        <img src={logoutIcon} alt="Logout" />
                    </span>
                </div>
            </div>

            {/* Profile Update Section */}
            <div className="addEuipment">
                <div className="addEuipment-header">
                    <h4>Update Profile</h4>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="addEuipment-form">
                        <div className="row">
                            <div className="col d-flex flex-column addEuipment-form-col">
                                <InputField
                                    label="Full Name"
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Full name"
                                    isRequired={true}
                                    error={errors.name}
                                />
                            </div>
                            <div className="col d-flex flex-column addEuipment-form-col">
                                <InputField
                                    label="Email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    disabled={true}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col d-flex flex-column addEuipment-form-col">
                                <InputField
                                    label="Phone Number"
                                    name="mobile"
                                    id="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    placeholder="Phone Number"
                                    isNumeric={true}
                                    maxLength={10}
                                    error={errors.mobile}
                                />
                            </div>
                            <div className="col d-flex flex-column addEuipment-form-col">
                                <InputField
                                    label="Profile Picture"
                                    name="profilePic"
                                    id="profilePic"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    error={errors.avatar}
                                />
                            </div>
                        </div>
                        <div className="addEuipment-form-submit d-flex justify-content">
                            <Button
                                name="Save Changes"
                                type="submit"
                                className="button-darkBlue btn-bg"
                                style={{ width: "300px" }}
                            />
                        </div>
                    </div>
                </form>
            </div>
            <br />

            {/* Password Change Section */}
            <div className="addEuipment">
                <div className="addEuipment-header">
                    <h4>Change Password</h4>
                </div>
                <form onSubmit={handleChangePassword}>
                    <div className="addEuipment-form">
                        <div className="row mb-4">
                            <small className="text-center">
                                Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character
                            </small>
                        </div>
                        <div className="row">
                            <div className="col d-flex flex-column addEuipment-form-col">
                                <InputField
                                    label="Current Password"
                                    name="currentPassword"
                                    id="currentPassword"
                                    type="password"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    placeholder="Current Password"
                                    isRequired={true}
                                    error={errorMessage.currentPassword}
                                />
                            </div>
                            <div className="col d-flex flex-column addEuipment-form-col">
                                <InputField
                                    label="New Password"
                                    name="newPassword"
                                    id="newPassword"
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="New Password"
                                    isRequired={true}
                                    error={errorMessage.newPassword}
                                />
                            </div>
                            <div className="col d-flex flex-column addEuipment-form-col">
                                <InputField
                                    label="Confirm Password"
                                    name="confirmPassword"
                                    id="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm Password"
                                    isRequired={true}
                                    error={errorMessage.confirmPassword}
                                />
                            </div>
                            {errorMessage.passwordMatch && (
                                <div className="mb-2" style={{ color: "#dc3545", marginTop: "-10px" }}>
                                    {errorMessage.passwordMatch}
                                </div>
                            )}
                        </div>
                        <div className="addEuipment-form-submit d-flex justify-content">
                            <Button
                                name="Change Password"
                                type="submit"
                                className="button-darkBlue btn-bg"
                                style={{ width: "300px" }}
                            />
                        </div>
                    </div>
                </form>
            </div>

            {/* Logout Confirmation Modal */}
            {logoutModal && (
                <Modal
                    title="Confirm Logout"
                    onClose={() => setLogoutModal(false)}
                    onSubmit={() => handleLogout()}
                    fields={[
                        {
                            label: "Are you sure you want to log out?",
                            type: "text",
                            name: "confirm",
                            disabled: true,
                        },
                    ]}
                    values={{ confirm: "Click 'Logout' to proceed or 'Cancel' to stay." }}
                    submitButtonLabel="Logout"
                />
            )}
        </>
    );
};
export default ProfileSettings