const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { logApiResponse } = require('../utils/responseService');
const allowedExtensions = ['.png', '.jpg', '.jpeg'];
const { sendEmail } = require('../utils/mailService'); // Adjust path accordingly


const User = require('../models/User');
const Otp = require('../models/otp')
const PasswordResetToken = require('../models/passwordResetToken');
const Role = require('../models/Role');

const MAX_FAILED_ATTEMPTS = 5; // Lockout after 5 failed attempts
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes lockout period



const loginUser = async (req, res) => {
	const { email, password } = req.body;
	let validationErrors = {};

	if (!email) {
		validationErrors.email = "Email is required";
	} else if (!/.+\@.+\..+/.test(email)) {
		validationErrors.email = "Please provide a valid email address";
	}
	if (!password) {
		validationErrors.password = "Password is required";
	}

	if (Object.keys(validationErrors).length > 0) {
		await logApiResponse(req, "Validation Error", 400, { errors: validationErrors });
		return res.status(400).json({ message: "Validation Error", errors: validationErrors });
	}

	try {
		const user = await User.findOne({ email: email, status: true });

		if (!user) {
			const errorMsg = { email: "No user found with this exact email address or user is inactive" };
			await logApiResponse(req, "Validation Error", 400, { errors: errorMsg });
			return res.status(400).json({ message: "Validation Error", errors: errorMsg });
		}

		if (user.lock_until && user.lock_until > Date.now()) {
			const minutes = Math.ceil((user.lock_until - Date.now()) / 60000);
			return res.status(400).json({
				message: "Account is locked.",
				errors: { email: `Account is locked. Try again in ${minutes} minutes.` }
			});
		}

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			user.failed_login_attempts += 1;
			if (user.failed_login_attempts >= MAX_FAILED_ATTEMPTS) {
				const lockMultiplier = Math.pow(2, user.failed_login_attempts - MAX_FAILED_ATTEMPTS);
				user.lock_until = new Date(Date.now() + LOCK_TIME * lockMultiplier);
			}
			await user.save();
			await logApiResponse(req, "Validation Error", 400, { errors: { password: "Invalid password" } });
			return res.status(400).json({ message: "Validation Error", errors: { password: "Invalid password" } });
		}

		user.failed_login_attempts = 0;
		user.lock_until = null;
		await user.save();

		// Generate OTP (Use secure random OTP in production)
		const otp = '123456';
		const hashedOtp = await bcrypt.hash(otp, 10);

		const existingOtpEntry = await Otp.findOne({ email: user.email });
		if (existingOtpEntry) {
			existingOtpEntry.otp = hashedOtp;
			await existingOtpEntry.save();
		} else {
			const newOtpEntry = new Otp({ email: user.email, otp: hashedOtp });
			await newOtpEntry.save();
		}

		// Send OTP using reusable helper
		// await sendEmail({
		// 	to: user.email,
		// 	subject: 'Your OTP Code',
		// 	text: `Your One-Time Password (OTP) code is: ${otp}. Please use this code to complete your verification process.`,
		// });

		const { password: _, ...userData } = user.toObject();

		await logApiResponse(req, "Login successful, OTP sent to email", 200, { otpSent: true, user: userData });
		return res.json({ message: 'Login successful, OTP sent to email', otpSent: true });

	} catch (error) {
		console.error('Login error:', error);
		await logApiResponse(req, "Internal Server Error", 500, { errors: { message: "An unexpected error occurred" } });
		return res.status(500).json({ message: "Internal Server Error", errors: { message: "An unexpected error occurred" } });
	}
};


const validateOtp = async (req, res) => {
	const { email, otp } = req.body;

	let validationErrors = {};
	if (!email) {
		validationErrors.email = "Email is required";
	} else if (!/.+\@.+\..+/.test(email)) {
		validationErrors.email = "Please provide a valid email address";
	}
	if (!otp) {
		validationErrors.otp = "OTP is required";
	}

	if (Object.keys(validationErrors).length > 0) {
		await logApiResponse(req, "Validation Error", 400, validationErrors);
		return res.status(400).json({
			message: "Validation Error",
			errors: validationErrors
		});
	}

	try {
		const otpEntry = await Otp.findOne({ email });
		if (!otpEntry) {

			await logApiResponse(req, "Validation Error", 400, { errors: { otp: "Invalid OTP" } });
			return res.status(400).json({
				message: "Validation Error",
				errors: { otp: "Invalid OTP" }
			});
		}

		const isMatch = await bcrypt.compare(otp, otpEntry.otp);
		if (!isMatch) {
			await logApiResponse(req, "Validation Error", 400, { errors: { otp: "Invalid OTP" } });
			return res.status(400).json({
				message: "Validation Error",
				errors: { otp: "Invalid OTP" }
			});
		}

		const user = await User.findOne({ email });
		if (!user) {
			await logApiResponse(req, "User not found", 404, { errors: { email: "User not found" } });
			return res.status(404).json({
				message: "User not found",
				errors: { email: "User not found" }
			});
		}

		// Include 'description' in the populated fields
		// const role = await Role.findById(user.role_id).populate({
		// 	path: 'abilities.ability_id',
		// 	select: 'ability description' // Adjust this line to fetch 'ability' and 'description'
		// });
		// const role = await Role.findById(user.role_id).populate({
		// 	path: 'abilities.ability_id',
		// 	select: 'ability description' // Adjust this line to fetch 'ability' and 'description'
		// });
		const role = await Role.findById(user.role_id);

		if (!role) {
			await logApiResponse(req, "Role not found", 404, { errors: { role_id: "Role not found with this ID" } });
			return res.status(404).json({
				message: "Role not found",
				errors: { role_id: "Role not found with this ID" }
			});
		}
		const token = jwt.sign({
			id: user._id,
			email: user.email,
			name: user.name
		}, process.env.JWT_SECRET, { expiresIn: '1d' });

		user.jwt_token = token;
		await user.save();

		const { password, ...userData } = user.toObject();
		await logApiResponse(req, "OTP is valid, JWT generated", 200, {
			token: token,
			user: userData,
			role: {
				id: role._id,
				name: role.role_name, // Assuming 'role_name' is the field for the role's name
				// abilities: role.abilities
				// 	.filter(ability => ability.ability_id) // Ensure ability_id is not null
				// 	.map(ability => ({
				// 		ability: ability.ability_id.ability,
				// 		description: ability.ability_id.description // Include description
				// 	}))
			}
		});
		return res.json({
			message: 'OTP is valid, JWT generated',
			token: token,
			user: userData,
			role: {
				id: role._id,
				name: role.role_name, // Assuming 'role_name' is the field for the role's name
				// abilities: role.abilities
				// 	.filter(ability => ability.ability_id) // Ensure ability_id is not null
				// 	.map(ability => ({
				// 		ability: ability.ability_id.ability,
				// 		description: ability.ability_id.description // Include description
				// 	}))
			}
		});

	} catch (error) {
		console.error('Server error:', error);
		await logApiResponse(req, "Internal Server Error", 500, { errors: { message: "An unexpected error occurred" } });
		return res.status(500).json({
			message: "Internal Server Error",
			errors: { message: "An unexpected error occurred" }
		});
	}
};



const resendOtp = async (req, res) => {
	const { email } = req.body;

	// Validation errors container
	let validationErrors = {};

	// Validate required fields
	if (!email) {
		validationErrors.email = "Email is required";
	} else if (!/.+\@.+\..+/.test(email)) {
		validationErrors.email = "Please provide a valid email address";
	}

	// If there are validation errors, return them
	if (Object.keys(validationErrors).length > 0) {
		await logApiResponse(req, "Validation Error", 400, validationErrors);
		return res.status(400).json({
			message: "Validation Error",
			errors: validationErrors
		});
	}

	try {
		// Check for existing OTP entry
		const otpEntry = await Otp.findOne({ email });
		if (!otpEntry) {
			await logApiResponse(req, "Validation Error", 404, { errors: { email: "No OTP request found for this email" } });
			return res.status(404).json({
				message: "Validation Error",
				errors: { email: "No OTP request found for this email" }
			});
		}

		// Generate a new OTP
		const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

		// Hash the new OTP before storing
		const hashedOtp = await bcrypt.hash(newOtp, 10);

		// Update the existing OTP entry
		otpEntry.otp = hashedOtp;
		otpEntry.resetTokenExpiry = new Date(Date.now() + 3600000); // Extend expiry for another hour
		await otpEntry.save();

		// Setup email transporter
		const transporter = nodemailer.createTransport({
			service: 'gmail', // or your email service
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});

		// Send the new OTP via email
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: email,
			subject: 'Your Resent OTP',
			text: `Here is your new OTP: ${newOtp}. It will expire in 5 minutes.`,
		};

		await transporter.sendMail(mailOptions);
		await logApiResponse(req, "A new OTP has been sent to your email", 200, "A new OTP has been sent to your email");
		return res.json({ message: 'A new OTP has been sent to your email' });
	} catch (error) {
		console.error('Error resending OTP:', error);
		await logApiResponse(req, "Internal Server Error", 500, { errors: { message: "An unexpected error occurred" } });
		return res.status(500).json({
			message: "Internal Server Error",
			errors: { message: "An unexpected error occurred" }
		});
	}
};

const updatePassword = async (req, res) => {
	const { email, currentPassword, newPassword, confirmPassword } = req.body;
	const userId = req.user.id;
	let validationErrors = {};

	if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
		validationErrors.userId = "User ID is required and must be valid";
	}

	if (!currentPassword) {
		validationErrors.currentPassword = "Current password is required";
	}
	if (!newPassword) {
		validationErrors.newPassword = "New password is required";
	}
	else {
		const passwordError = validatePassword(newPassword);
		if (passwordError) validationErrors.newPassword = passwordError;
	}
	if (!confirmPassword) {
		validationErrors.confirmPassword = "Confirm password is required";
	}
	if (newPassword !== confirmPassword) {
		validationErrors.passwordMatch = "New password and confirm password do not match";
	}

	// If there are validation errors, return them
	if (Object.keys(validationErrors).length > 0) {
		return res.status(400).json({
			message: "Validation Error",
			errors: validationErrors
		});
	}

	try {
		// Find the user by userId
		const user = await User.findById(userId);

		if (!user) {
			await logApiResponse(req, "Validation Error", 404, { errors: { email: "User not found" } });
			return res.status(404).json({
				message: "Validation Error",
				errors: { email: "User not found" }
			});
		}

		// Compare the current password with the stored hashed password
		const isMatch = await bcrypt.compare(currentPassword, user.password);

		if (!isMatch) {
			await logApiResponse(req, "Validation Error", 400, { errors: { currentPassword: "Current password is incorrect" } });
			return res.status(400).json({
				message: "Validation Error",
				errors: { currentPassword: "Current password is incorrect" }
			});
		}

		// Hash the new password before storing it
		user.password = await bcrypt.hash(newPassword, 10);
		await user.save();
		await logApiResponse(req, "Password updated successfully", 200, user);
		return res.json({ message: 'Password updated successfully' });

	} catch (error) {
		console.error('Error updating password:', error);
		await logApiResponse(req, "Internal Server Error", 500, { message: "An unexpected error occurred" });
		return res.status(500).json({
			message: "Internal Server Error",
			errors: {
				message: "An unexpected error occurred"
			}
		});
	}
};

const validatePassword = (password) => {
	const minLength = 8;
	const uppercaseRegex = /[A-Z]/;
	const lowercaseRegex = /[a-z]/;
	const numberRegex = /[0-9]/;
	const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
	if (password.length < minLength) {
		return "Password must be at least 8 characters long.";
	}
	if (!uppercaseRegex.test(password)) {
		return "Password must contain at least one uppercase letter.";
	}
	if (!lowercaseRegex.test(password)) {
		return "Password must contain at least one lowercase letter.";
	}
	if (!numberRegex.test(password)) {
		return "Password must contain at least one numeric digit.";
	}
	if (!specialCharRegex.test(password)) {
		return "Password must contain at least one special character.";
	}
	return "";
};

const updateProfile = async (req, res) => {
	const { name, email, mobile_no } = req.body;
	const file = req.file;  // Multer provides the file information here
	const userId = req.user.id;
	let validationErrors = {};

	// Validate userId
	if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
		validationErrors.userId = "User ID is required and must be valid";
	}

	// Validate email if provided
	if (email && !/.+\@.+\..+/.test(email)) {
		validationErrors.email = "Please provide a valid email address";
	}

	// Validate mobile_no if provided
	if (mobile_no && !/^\d{10}$/.test(mobile_no)) {
		validationErrors.mobile_no = "Mobile number must be exactly 10 digits";
	}

	// Validate avatar file extension if provided
	if (file) {
		const extension = path.extname(file.originalname).toLowerCase();
		const allowedExtensions = ['.png', '.jpg', '.jpeg'];
		if (!allowedExtensions.includes(extension)) {
			validationErrors.avatar = "Invalid avatar format. Only PNG, JPG, and JPEG are allowed";
		}
	}

	// If there are validation errors, return them
	if (Object.keys(validationErrors).length > 0) {
		await logApiResponse(req, "Validation Error", 500, validationErrors);
		return res.status(400).json({
			message: "Validation Error",
			errors: validationErrors
		});
	}

	try {
		const user = await User.findById(userId);

		if (!user) {
			await logApiResponse(req, "User not found", 404, { errors: { userId: "User not found" } });
			return res.status(404).json({
				message: "User not found",
				errors: { userId: "User not found" }
			});
		}

		// Check for duplicate email and mobile number
		if (email || mobile_no) {
			const conditions = { _id: { $ne: userId } };
			if (email) conditions.email = email;
			if (mobile_no) conditions.mobile_no = mobile_no;

			const existingUser = await User.findOne(conditions);
			if (existingUser) {
				if (email && existingUser.email === email) validationErrors.email = "User with this email already exists";
				if (mobile_no && existingUser.mobile_no === mobile_no) validationErrors.mobile_no = "User with this mobile number already exists";
			}
		}

		if (Object.keys(validationErrors).length > 0) {
			await logApiResponse(req, "Duplicate Key Error", 409, validationErrors);
			return res.status(409).json({
				message: "Duplicate Key Error",
				errors: validationErrors
			});
		}

		// Update fields
		user.name = name || user.name;
		user.email = email || user.email;
		user.mobile_no = mobile_no || user.mobile_no;
		user.avatar = file ? file.path : user.avatar;

		await user.save();

		const { password, ...updatedUser } = user.toObject();
		await logApiResponse(req, "Profile updated successfully", 200, { user: updatedUser });
		return res.json({ message: 'Profile updated successfully', user: updatedUser });

	} catch (error) {
		console.error('Error updating profile:', error);
		await logApiResponse(req, "Internal Server Error", 500, { message: "An unexpected error occurred" });
		return res.status(500).json({
			message: "Internal Server Error",
			errors: {
				message: "An unexpected error occurred"
			}
		});
	}
};


const me = async (req, res) => {
	try {
		// Assuming that user is already authenticated and available in `req.user`
		const user = req.user;


		if (user) {
			// Generate JWT token
			const token = jwt.sign(
				{ id: user._id, email: user.email, name: user.name },
				process.env.JWT_SECRET,
				{ expiresIn: '1h' } // Set token expiration time
			);

			// Respond with user data and token
			await logApiResponse(req, "User information fetched successful", 200, user);
			return res.status(200).json({
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					mobile_no: user.mobile_no,
					role_id: user.role_id,
					department_id: user.department_id,
					avatar: user.avatar
				},
				// token: token
			});
		} else {
			await logApiResponse(req, "User not authenticated", 401, "User not authenticated");
			return res.status(401).json({ message: 'User not authenticated' });
		}

	} catch (error) {
		console.error('Error fetching user data:', error);
		await logApiResponse(req, "Server error", 500, { error: error.message });
		return res.status(500).json({ message: 'Server error', error: error.message });
	}
};

const forgotPassword = async (req, res) => {
	const { email } = req.body;

	let validationErrors = {};

	// Validate email
	if (!email) {
		validationErrors.email = "Email is required";
	} else if (!/.+\@.+\..+/.test(email)) {
		validationErrors.email = "Please provide a valid email address";
	}

	// If there are validation errors, return them
	if (Object.keys(validationErrors).length > 0) {
		await logApiResponse(req, "Validation Error", 400, validationErrors);
		return res.status(400).json({
			message: "Validation Error",
			errors: validationErrors
		});
	}

	try {
		// Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			await logApiResponse(req, "User not found", 404, "User not found");
			return res.status(404).json({ message: 'User not found' });
		}

		// Generate a random OTP
		const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
		const otpExpiry = Date.now() + 300000;

		// Hash the OTP before storing it
		const hashedOtp = await bcrypt.hash(otp.toString(), 10);

		// Save the hashed OTP and expiry date to the PasswordResetToken collection
		const passwordResetEntry = new PasswordResetToken({
			email: email,
			otp: hashedOtp,
			resetTokenExpiry: new Date(otpExpiry),
			resetToken: null // Not used in this scenario
		});

		await passwordResetEntry.save();

		// Set up the email transport
		const transporter = nodemailer.createTransport({
			service: 'gmail', // or any other email service
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});

		// Send OTP email
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: email,
			subject: 'Password Reset OTP',
			text: `You have requested to reset your password. Please use the following OTP to proceed. Your OTP: ${otp}. It will expire in 5 minutes.`,
		};

		await transporter.sendMail(mailOptions);
		await logApiResponse(req, "Password reset OTP sent via email", 200, passwordResetEntry);
		return res.json({ message: 'Password reset OTP sent via email' });

	} catch (error) {
		console.error('Error sending password reset OTP:', error);
		await logApiResponse(req, "Server error", 500, { error: error.message });
		return res.status(500).json({ message: 'Server error', error: error.message });
	}
};

const resetPassword = async (req, res) => {
	const { email, otp, newPassword, confirmPassword } = req.body;

	let validationErrors = {};

	// Validate required fields
	if (!email) {
		validationErrors.email = "Email is required";
	} else if (!/.+\@.+\..+/.test(email)) {
		validationErrors.email = "Please provide a valid email address";
	}
	if (!otp) {
		validationErrors.otp = "OTP is required";
	}
	if (!newPassword) {
		validationErrors.newPassword = "New password is required";
	}
	if (!confirmPassword) {
		validationErrors.confirmPassword = "Confirm password is required";
	}
	if (newPassword !== confirmPassword) {
		validationErrors.confirmPassword = "New password and confirm password do not match";
	}

	// If there are validation errors, return them
	if (Object.keys(validationErrors).length > 0) {
		await logApiResponse(req, "Validation Error", 400, validationErrors);
		return res.status(400).json({
			message: "Validation Error",
			errors: validationErrors
		});
	}

	try {

		const otpEntry = await PasswordResetToken.findOne({ email });
		if (!otpEntry) {

			await logApiResponse(req, "Validation Error", 400, { errors: { otp: "Invalid or expired OTP" } });
			return res.status(400).json({
				message: "Validation Error",
				errors: { otp: "Invalid or expired OTP" }
			});
		}


		if (new Date(otpEntry.resetTokenExpiry) < new Date()) {

			await logApiResponse(req, "Validation Error", 400, { errors: { otp: "OTP has expired" } });
			return res.status(400).json({
				message: "Validation Error",
				errors: { otp: "OTP has expired" }
			});
		}


		const isOtpValid = await bcrypt.compare(otp, otpEntry.otp);
		if (!isOtpValid) {

			await logApiResponse(req, "Validation Error", 400, { errors: { otp: "Invalid OTP" } });
			return res.status(400).json({
				message: "Validation Error",
				errors: { otp: "Invalid OTP" }
			});
		}


		const user = await User.findOne({ email });
		if (!user) {

			await logApiResponse(req, "Validation Error", 404, { errors: { email: "User not found" } });
			return res.status(404).json({
				message: "Validation Error",
				errors: { email: "User not found" }
			});
		}


		const hashedPassword = await bcrypt.hash(newPassword, 10);
		user.password = hashedPassword;
		await user.save();


		await PasswordResetToken.deleteOne({ email });


		await logApiResponse(req, "Password has been successfully reset", 200, "Password has been successfully reset");
		return res.json({ message: 'Password has been successfully reset' });

	} catch (error) {
		console.error('Error resetting password:', error);
		await logApiResponse(req, "Server error", 500, { error: error.message });
		return res.status(500).json({ message: 'Server error', error: error.message });
	}
};

const resendForgotPasswordOtp = async (req, res) => {
	const { email } = req.body;

	let validationErrors = {};

	// Validate email
	if (!email) {
		validationErrors.email = "Email is required";
	} else if (!/.+\@.+\..+/.test(email)) {
		validationErrors.email = "Please provide a valid email address";
	}

	// If there are validation errors, return them
	if (Object.keys(validationErrors).length > 0) {
		await logApiResponse(req, "Validation Error", 400, validationErrors);
		return res.status(400).json({
			message: "Validation Error",
			errors: validationErrors
		});
	}

	try {
		// Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			await logApiResponse(req, "User not found", 404, user);
			return res.status(404).json({ message: 'User not found' });
		}

		// Generate a new OTP
		const newOtp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
		const otpExpiry = Date.now() + 3600000; // OTP expires in 1 hour

		// Hash the new OTP before storing it
		const hashedOtp = await bcrypt.hash(newOtp.toString(), 10);

		// Check if there's already an OTP entry, update or create new
		let passwordResetEntry = await PasswordResetToken.findOne({ email });
		if (passwordResetEntry) {
			// Update existing entry
			passwordResetEntry.otp = hashedOtp;
			passwordResetEntry.resetTokenExpiry = new Date(otpExpiry);
		} else {
			// Create new entry if not exist
			passwordResetEntry = new PasswordResetToken({
				email: email,
				otp: hashedOtp,
				resetTokenExpiry: new Date(otpExpiry),
				resetToken: null // Not used in this scenario
			});
		}
		await passwordResetEntry.save();

		// Set up the email transport
		const transporter = nodemailer.createTransport({
			service: 'gmail', // or any other email service
			auth: {
				user: process.env.EMAIL_USER, // Use environment variables for email credentials
				pass: process.env.EMAIL_PASS,
			},
		});

		// Send the new OTP via email
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: email,
			subject: 'Your New Password Reset OTP',
			text: `You requested a new password reset OTP. Your new OTP is: ${newOtp}. It will expire in 1 hour.`,
		};

		await transporter.sendMail(mailOptions);

		return res.json({ message: 'A new password reset OTP has been sent to your email.' });
	} catch (error) {
		console.error('Error resending password reset OTP:', error);
		await logApiResponse(req, "Server error", 500, { error: error.message });
		return res.status(500).json({ message: 'Server error', error: error.message });
	}
};
const logout = async (req, res) => {
	try {
		// Set the jwtToken field to null or an empty string
		req.user.jwt_token = null;
		await req.user.save();
		await logApiResponse(req, "Logged out successfully", 200, "Logged out successfully");
		res.status(200).json({ message: 'Logged out successfully' });
	} catch (error) {
		console.error('Logout error:', error);
		await logApiResponse(req, "Internal Server error", 500, { errors: { message: "An unexpected error occurred during logout" } });
		res.status(500).json({
			message: "Internal Server Error",
			errors: { message: "An unexpected error occurred during logout" }
		});
	}
};

module.exports = {
	loginUser,
	validateOtp,
	resendOtp,
	updatePassword,
	updateProfile,
	me,
	forgotPassword,
	resetPassword,
	resendForgotPasswordOtp,
	logout,
	validatePassword
}
