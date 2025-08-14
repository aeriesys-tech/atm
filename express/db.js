const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/user');
const RoleGroup = require('./models/roleGroup');
const Role = require('./models/role');
const Department = require('./models/department');
const ParameterType = require('./models/parameterType');
const TemplateType = require('./models/templateType');
const TemplateParameterType = require('./models/templateParameterType'); // <-- ensure this is imported

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('MongoDB connected successfully');
    seedUser();
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

const seedUser = async () => {
    try {
        const roleGroup = await RoleGroup.findOneAndUpdate(
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

        const role = await Role.findOneAndUpdate(
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

        const department = await Department.findOneAndUpdate(
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

        const password = await bcrypt.hash("1qaz2wsx", 10);
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
                password: password,
                mobile_no: "9535342875",
                role_id: role._id,
                department_id: department._id,
                avatar: "https://via.placeholder.com/150"
            },
            { new: true, upsert: true }
        );

        // Parameter Types
        const linageParameter = await ParameterType.findOneAndUpdate(
            { parameter_type_code: "LP_001" },
            {
                parameter_type_code: "LP_001",
                parameter_type_name: "Lineage Parameter",
                order: 1,
                icon: 'adjust(1)1'
            },
            { new: true, upsert: true }
        );

        const equipmentParameter = await ParameterType.findOneAndUpdate(
            { parameter_type_code: "EP_002" },
            {
                parameter_type_code: "EP_002",
                parameter_type_name: "Equipment Parameter",
                order: 2,
                icon: 'tag(2)1'
            },
            { new: true, upsert: true }
        );

        const variableParameter = await ParameterType.findOneAndUpdate(
            { parameter_type_code: "VP_003" },
            {
                parameter_type_code: "VP_003",
                parameter_type_name: "Variable Parameter",
                order: 3,
                icon: 'flag1'
            },
            { new: true, upsert: true }
        );

        const modelParameter = await ParameterType.findOneAndUpdate(
            { parameter_type_code: "MP_004" },
            {
                parameter_type_code: "MP_004",
                parameter_type_name: "Model Parameter",
                order: 4,
                icon: '3d1'
            },
            { new: true, upsert: true }
        );

        const dataSourceParameter = await ParameterType.findOneAndUpdate(
            { parameter_type_code: "DS_005" },
            {
                parameter_type_code: "DS_005",
                parameter_type_name: "Data Source Parameter",
                order: 5,
                icon: 'big-data1'
            },
            { new: true, upsert: true }
        );

        const generalParameter = await ParameterType.findOneAndUpdate(
            { parameter_type_code: "GP_006" },
            {
                parameter_type_code: "GP_006",
                parameter_type_name: "General Parameter",
                order: 6,
                icon: 'verified1'
            },
            { new: true, upsert: true }
        );

        // Template Types and Parameters
        const templates = [
            {
                code: "LT_001",
                name: "Lineage Template",
                icon: "IconSet",
                order: 1,
                parameterTypes: [linageParameter]
            },
            {
                code: "AT_002",
                name: "Asset Template",
                icon: "bag1",
                order: 2,
                parameterTypes: [equipmentParameter, variableParameter]
            },
            {
                code: "MT_003",
                name: "Model Template",
                icon: "box(4)1",
                order: 3,
                parameterTypes: [modelParameter]
            },
            {
                code: "DS_004",
                name: "Data Source Template",
                icon: "graph(1)1",
                order: 4,
                parameterTypes: [variableParameter, modelParameter, dataSourceParameter, generalParameter]
            },
            {
                code: "UT_005",
                name: "Use Case Template",
                icon: "work-schedule1",
                order: 5,
                parameterTypes: [variableParameter, modelParameter, dataSourceParameter, generalParameter]
            }
        ];

        for (const tpl of templates) {
            const templateType = await TemplateType.findOneAndUpdate(
                {
                    $or: [
                        { template_type_code: tpl.code },
                        { template_type_name: tpl.name }
                    ]
                },
                {
                    template_type_code: tpl.code,
                    template_type_name: tpl.name,
                    order: tpl.order,
                    icon: tpl.icon
                },
                { new: true, upsert: true }
            );

            for (const param of tpl.parameterTypes) {
                await TemplateParameterType.findOneAndUpdate(
                    {
                        template_type_id: templateType._id,
                        parameter_type_id: param._id
                    },
                    {
                        template_type_id: templateType._id,
                        parameter_type_id: param._id
                    },
                    { new: true, upsert: true }
                );
            }
        }

        console.log('✅ Seeding completed successfully.');
        process.exit();
    } catch (error) {
        console.error('❌ Error during seed process:', error);
        process.exit(1);
    }
};
