const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/user');
const RoleGroup = require('./models/RoleGroup');
const Role = require("./models/Role");
const Department = require("./models/department");
const ParameterType = require("./models/parameterType");

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
                email: "bharatesh@aeriesys.com",
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

        const linageParameter = await ParameterType.create({
            parameter_type_code: "LP_001",
            parameter_type_name: "Lineage Parameter",
            order: 1,
            icon: 'adjust(1)1'
        });

        const equipmentParameter = await ParameterType.create({
            parameter_type_code: "EP_002",
            parameter_type_name: "Equipment Parameter",
            order: 2,
            icon: 'tag(2)1'
        });

        const variableParameter = await ParameterType.create({
            parameter_type_code: "VP_003",
            parameter_type_name: "Variable Parameter",
            order: 3,
            icon: 'flag1'
        });

        const modelParameter = await ParameterType.create({
            parameter_type_code: "MP_004",
            parameter_type_name: "Model Parameter",
            order: 4,
            icon: '3d1'
        });

        const dataSourceParameter = await ParameterType.create({
            parameter_type_code: "DS_005",
            parameter_type_name: "Data Source Parameter",
            order: 5,
            icon: 'big-data1'
        });

        const generalParameter = await ParameterType.create({
            parameter_type_code: "GP_006",
            parameter_type_name: "General Parameter",
            order: 6,
            icon: 'verified1'
        });


        console.log(" Seed data inserted or updated successfully.");
    } catch (error) {
        console.error("Error during seed process:", error);
        process.exit(1);
    }
};


