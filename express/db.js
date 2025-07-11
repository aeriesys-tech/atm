const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/user');
const RoleGroup = require('./models/RoleGroup');
const Role = require("./models/Role");
const Department = require("./models/department");

mongoose.connect(process.env.MONGODB_URI, {
}).then(() => {
    console.log('MongoDB connected successfully');
    seedUser();
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

const seedUser = async () => {
    try {
        let roleGroup, role, department, user;
        roleGroup = await RoleGroup.findOneAndUpdate(
            {
                $or: [
                    { role_group_code: "HQ" },
                    { role_group_name: "HQ" }
                ]
            },
            {
                role_group_code: "HQ",
                role_group_name: "HQ"
            },
            { new: true, upsert: true }
        );
        role = await Role.findOneAndUpdate(
            {
                $or: [
                    { role_code: "Admin" },
                    { role_name: "Admin" }
                ]
            },
            {
                role_group_id: roleGroup._id,
                role_code: "Admin",
                role_name: "Admin"
            },
            { new: true, upsert: true }
        );
        department = await Department.findOneAndUpdate(
            {
                $or: [
                    { department_code: "IT" },
                    { department_name: "IT" }
                ]
            },
            {
                department_code: "IT",
                department_name: "IT"
            },
            { new: true, upsert: true }
        );
        const plainPassword = process.env.DEFAULT_USER_PASSWORD || 'admin123';
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        await User.findOneAndUpdate(
            {
                $or: [
                    { username: "bharatesh" },
                    { email: "bharatesh@aeriesys.com" }
                ]
            },
            {
                name: "Bharatesh",
                username: "bharatesh",
                email: "richa@aeriesys.com",
                password: hashedPassword,
                mobile_no: "9535342875",
                role_id: role._id,
                department_id: department._id,
                avatar: "https://via.placeholder.com/150"
            },
            { new: true, upsert: true }
        );

        await User.findOneAndUpdate(
            {
                $or: [
                    { username: "richa" },
                    { email: "richa@aeriesys.com" }
                ]
            },
            {
                name: "Richa",
                username: "richa",
                email: "richa@aeriesys.com",
                password: hashedPassword,
                mobile_no: "9482834174",
                role_id: role._id,
                department_id: department._id,
                avatar: "https://via.placeholder.com/150"
            },
            { new: true, upsert: true }
        );


        console.log(" Seed data inserted or updated successfully.");
    } catch (error) {
        console.error("Error during seed process:", error);
        process.exit(1);
    }
};


