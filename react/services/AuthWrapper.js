import axios from 'axios';

const authWrapper = async (endpoint, data, rawResponse = false) => {
	const headers = {
		'Content-Type': 'application/json',
	};

	try {
		const response = await axios.post(
			`${import.meta.env.VITE_BASE_API_URL}/${endpoint}`,
			data,
			{ headers }
		);

		return rawResponse ? response : response.data;
	} catch (error) {
		// 👇 Extract proper error message from backend response
		const responseData = error?.response?.data;
		let message = 'Something went wrong';

		if (responseData?.errors?.otp) {
			message = responseData.errors.otp;
		} else if (responseData?.message) {
			message = responseData.message;
		}

		throw new Error(message); // 👈 Clean error thrown back to OTP page
	}
};

export default authWrapper;
