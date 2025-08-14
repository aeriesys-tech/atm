const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
	name: {
		type: String,
		required: [true, 'Name is required'],
		trim: true,
		maxlength: [50, 'Name must be at most 50 characters long'],
		index: true
	},
	username: {
		type: String,
		trim: true,
		index: true,
		maxlength: [30, 'Username must be at most 30 characters long']
	},
	email: {
		type: String,
		required: [true, 'Email is required'],
		unique: true,
		lowercase: true,
		trim: true,
		index: true,
		match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please fill a valid email address']
	},
	password: {
		type: String,
		required: [true, 'Password is required']
	},
	mobile_no: {
		type: String,
		unique: true,
		index: true,
		required: [true, 'Mobile number is required'],
		validate: {
			validator: function (v) {
				return /^\d{10}$/.test(v);
			},
			message: 'Mobile number must be exactly 10 digits'
		}
	},
	role_id: {
		type: Schema.Types.ObjectId,
		ref: 'Role',
		required: [true, 'Role ID is required']
	},
	department_id: {
		type: Schema.Types.ObjectId,
		ref: 'Department',
		required: [true, 'Department ID is required']
	},
	avatar: {
		type: String
	},
	jwt_token: {
		type: String
	},
	failed_login_attempts: {
		type: Number,
		default: 0
	},
	lock_until: {
		type: Date,
		default: null
	},
	status: {
		type: Boolean,
		required: true,
		default: true
	},
	deleted_at: {
		type: Date,
		default: null
	}
}, {
	versionKey: false,
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	}
});

// Partial indexes to support Cosmos DB + soft delete
userSchema.index(
	{ email: 1 },
	{ unique: true, partialFilterExpression: { deleted_at: null } }
);

userSchema.index(
	{ mobile_no: 1 },
	{ unique: true, partialFilterExpression: { deleted_at: null } }
);

// Hash password method
userSchema.methods.hashPassword = async function (password) {
	return await bcrypt.hash(password, 10);
};

// Explicitly specify collection name
module.exports = mongoose.model('User', userSchema, 'users');
