import axios from "axios";

const authWrapper = async (endpoint, data, rawResponse = false) => {
  const token = sessionStorage.getItem("token");
  const isFormData = data instanceof FormData;

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }), // only if token exists
    ...(isFormData ? {} : { "Content-Type": "application/json" }) // only for JSON
  };

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_API_URL}/api${endpoint}`,
      data,
      { headers }
    );

    return rawResponse ? response : response.data;
  } catch (error) {
    const errorMessage = error.response?.data || "Something went wrong";
    error.message = errorMessage;
    throw error;
  }
};

export default authWrapper;
