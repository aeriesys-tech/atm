const DataSourceConfiguration = require('../models/dataSourceConfiguration');
const { logApiResponse } = require('../utils/responseService');
const { Op } = require("sequelize");
const redisClient = require("../config/redisConfig");
const { createNotification } = require('../utils/notification');
const bcrypt = require('bcrypt');

const paginatedDataSourceConfigurations = async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'data_source',
        order = 'asc',
        search = '',
        status
    } = req.body;

    const allowedSortFields = ['_id', 'data_source'];
    const cleanSortBy = String(sortBy).trim();
    const safeSortBy = allowedSortFields.includes(cleanSortBy) ? cleanSortBy : '_id';

    const sort = {
        [safeSortBy]: order === 'desc' ? -1 : 1
    };

    const searchQuery = {
        $and: [
            search ? {
                $or: [
                    { data_source: new RegExp(search, 'i') },
                ]
            } : {},
            (status === 'true' || status === 'false') ? { status: status === 'true' } : {}
        ]
    };

    try {
        const dataSourceConfigurations = await DataSourceConfiguration.find(searchQuery)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const count = await DataSourceConfiguration.countDocuments(searchQuery);

        await logApiResponse(req, "Paginated Data Source Configuration retrieved successfully", 200, {
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            dataSourceConfigurations,
            totalItems: count
        });

        res.status(200).json({
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            dataSourceConfigurations,
            totalItems: count
        });
    } catch (error) {
        console.error("Error retrieving paginated data Source Configurations:", error);
        await logApiResponse(req, "Failed to retrieve paginated data Source Configurations", 500, { error: error.message });
        res.status(500).json({
            message: "Failed to retrieve paginated data Source Configurations",
            error: error.message
        });
    }
};


const createDataSourceConfiguration = async (req, res) => {
    try {
        const { data_source, description, username, password, host, port_no, database_name, table_name, token, org, bucket, url } = req.body;

        const existingConfig = await DataSourceConfiguration.findOne({
            data_source: data_source?.trim(),
            deleted_at: null
        });

        if (existingConfig) {
            let errors = { data_source: "Data Source already exists" };
            await logApiResponse(req, "Duplicate Data Source Configuration", 400, errors);
            return res.status(400).json({ message: "Duplicate Data Source Configuration", errors });
        }
        const hashedUsername = username ? await bcrypt.hash(username, 10) : null;
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
        const hashedHost = host ? await bcrypt.hash(host, 10) : null;
        const hashedPortNo = port_no ? await bcrypt.hash(port_no, 10) : null;
        const hashedDatabaseName = database_name ? await bcrypt.hash(database_name, 10) : null;
        const hashedTableName = table_name ? await bcrypt.hash(table_name, 10) : null;
        const hashedToken = token ? await bcrypt.hash(token, 10) : null;
        const hashedOrg = org ? await bcrypt.hash(org, 10) : null;
        const hashedBucket = bucket ? await bcrypt.hash(bucket, 10) : null;
        const hashedUrl = url ? await bcrypt.hash(url, 10) : null;

        const newDataSourceConfiguration = await DataSourceConfiguration.create({
            data_source: data_source?.trim(),
            description: description?.trim(),
            username: hashedUsername,
            password: hashedPassword,
            host: hashedHost,
            port_no: hashedPortNo,
            database_name: hashedDatabaseName,
            table_name: hashedTableName,
            token: hashedToken,
            org: hashedOrg,
            bucket: hashedBucket,
            url: hashedUrl
        });

        await redisClient.del('data_source_configurations');

        const message = `Data Source Configuration "${newDataSourceConfiguration.data_source}" created successfully`;
        await logApiResponse(req, message, 201, newDataSourceConfiguration);

        return res.status(201).json({
            message,
            data: newDataSourceConfiguration
        });

    } catch (error) {
        await logApiResponse(req, "Failed to create Data Source Configuration", 500, { error: error.message });
        return res.status(500).json({ message: "Failed to create Data Source Configuration", error: error.message });
    }
};

const updateDataSourceConfiguration = async (req, res) => {
    try {
        const {
            id,
            data_source,
            description,
            username,
            password,
            host,
            port_no,
            database_name,
            table_name,
            token,
            org,
            bucket,
            status,
            deleted_at
        } = req.body;
        const existingConfig = await DataSourceConfiguration.findById(id);
        if (!existingConfig) {
            const errors = { id: "Data Source Configuration not found" };
            await logApiResponse(req, "Data Source Configuration not found", 404, errors);
            return res.status(404).json({ message: "Data Source Configuration not found", errors });
        }

        // 2️⃣ Duplicate check (soft delete aware)
        const duplicateDataSource = await DataSourceConfiguration.findOne({
            data_source: data_source?.trim(),
            deleted_at: null,
            _id: { $ne: id }
        });

        const errors = {};
        if (duplicateDataSource) errors.data_source = "Data Source already exists";

        if (Object.keys(errors).length > 0) {
            await logApiResponse(req, "Validation Error", 400, errors);
            return res.status(400).json({ message: "Validation Error", errors });
        }
        const updateData = {
            data_source: data_source?.trim() ?? existingConfig.data_source,
            description: description?.trim() ?? existingConfig.description,
            status: typeof status === "boolean" ? status : existingConfig.status,
            deleted_at: deleted_at ?? existingConfig.deleted_at,
            updated_at: Date.now()
        };
        if (username !== undefined) {
            updateData.username = username ? await bcrypt.hash(username, 10) : null;
        }
        if (password !== undefined) {
            updateData.password = password ? await bcrypt.hash(password, 10) : null;
        }
        if (host !== undefined) {
            updateData.host = host ? await bcrypt.hash(host, 10) : null;
        }
        if (port_no !== undefined) {
            updateData.port_no = port_no ? await bcrypt.hash(port_no, 10) : null;
        }
        if (database_name !== undefined) {
            updateData.database_name = database_name ? await bcrypt.hash(database_name, 10) : null;
        }
        if (table_name !== undefined) {
            updateData.table_name = table_name ? await bcrypt.hash(table_name, 10) : null;
        }
        if (token !== undefined) {
            updateData.token = token ? await bcrypt.hash(token, 10) : null;
        }
        if (org !== undefined) {
            updateData.org = org ? await bcrypt.hash(org, 10) : null;
        }
        if (bucket !== undefined) {
            updateData.bucket = bucket ? await bcrypt.hash(bucket, 10) : null;
        }
        await DataSourceConfiguration.findByIdAndUpdate(id, updateData);

        const updatedConfig = await DataSourceConfiguration.findById(id);

        const message = `Data Source Configuration  updated successfully`;
        await logApiResponse(req, "Data Source Configuration updated successfully", 200, updatedConfig);

        return res.status(200).json({ message: "Data Source Configuration updated successfully", data: updatedConfig });

    } catch (error) {
        await logApiResponse(req, "Failed to update Data Source Configuration", 500, { error: error.message });
        return res.status(500).json({ message: "Failed to update Data Source Configuration", error: error.message });
    }
};


const getDataSourceConfigurations = async (req, res) => {
    try {
        const data_source_configurations = await DataSourceConfiguration.find({ status: true });
        await logApiResponse(req, "Data Source Configurations retrieved successfully", 200, data_source_configurations);
        res.status(200).json({ message: "Data Source Configurations retrieved successfully", data_source_configurations: data_source_configurations });
    } catch (error) {
        await logApiResponse(req, "Failed to retrieve Data Source Configurations", 500, { error: error.message });
        res.status(500).json({ message: "Failed to retrieve Data Source Configurations", error: error.message });
    }
};


const getDataSourceConfiguration = async (req, res) => {
    const { id } = req.body;
    try {
        const data_source_configuration = await DataSourceConfiguration.findById(id);
        if (!data_source_configuration) {
            await logApiResponse(req, "Data Source Configuration not found", 404, {});
            return res.status(404).json({ message: "Data Source Configuration not found" });
        }
        await logApiResponse(req, "Data Source Configuration retrieved successfully", 200, data_source_configuration);
        res.status(200).json({ message: "Data Source Configuration retrieved successfully", data: data_source_configuration });
    } catch (error) {
        await logApiResponse(req, "Failed to retrieve Data Source Configuration", 500, { error: error.message });
        res.status(500).json({ message: "Failed to retrieve Data Source Configuration", error: error.message });
    }
};


const deleteDataSourceConfiguration = async (req, res) => {
    try {
        const { id, ids } = req.body;

        const toggleSoftDelete = async (_id) => {
            const data_source_configuration = await DataSourceConfiguration.findById(_id);
            if (!data_source_configuration) throw new Error(`Data Source Configuration with ID ${_id} not found`);

            const wasDeleted = !!data_source_configuration.deleted_at;
            data_source_configuration.deleted_at = wasDeleted ? null : new Date();
            data_source_configuration.status = !data_source_configuration.deleted_at;
            data_source_configuration.updated_at = new Date();

            const updatedDataSourceConfiguration = await DataSourceConfiguration.save();
            const action = wasDeleted ? 'activated' : 'inactivated';
            const message = `Role Group "${updatedDataSourceConfiguration.data_source}" has been ${action} successfully`;

            return { updatedDataSourceConfiguration, message };
        };

        if (Array.isArray(ids)) {
            const results = await Promise.all(ids.map(toggleSoftDelete));
            const updatedDataSourceConfigurations = results.map(r => r.updatedDataSourceConfiguration);

            // Optional: You could also batch notification creation here if needed
            await logApiResponse(req, 'Data Source Configurations updated successfully', 200, updatedDataSourceConfigurations);
            return res.status(200).json({ message: 'Data Source Configurations updated successfully', data: updatedDataSourceConfigurations });
        }

        if (id) {
            const { updatedDataSourceConfiguration, message } = await toggleSoftDelete(id);


            await logApiResponse(req, message, 200, updatedDataSourceConfiguration);

            return res.status(200).json({ message, data: updatedDataSourceConfiguration });
        }

        await logApiResponse(req, 'No ID or IDs provided', 400, {});
        return res.status(400).json({ message: 'No ID or IDs provided' });

    } catch (error) {
        await logApiResponse(req, "Data Source Configuration delete/restore failed", 500, { error: error.message });
        return res.status(500).json({ message: "Data Source Configuration delete/restore failed", error: error.message });
    }
};


const destroyDataSourceConfiguration = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return logApiResponse(req, 'Data Source Configuration  ID is required', 400, false, null, res);
        }

        const data_source_configuration = await DataSourceConfiguration.findById(id).lean();
        if (!data_source_configuration) {
            return logApiResponse(req, 'Data Source Configuration not found', 404, false, null, res);
        }

        await DataSourceConfiguration.deleteOne({ _id: id });

        const message = `Data Source Configuration "${data_source_configuration.data_source}" permanently deleted`;
        await logApiResponse(req, message, 200, true, null, res);

        return res.status(200).json({ message });
    } catch (error) {
        await logApiResponse(req, "Failed to delete Data Source Configuration", 500, { error: error.message });
        return res.status(500).json({ message: "Failed to Data Source Configuration", error: error.message });
    }
};



module.exports = {
    paginatedDataSourceConfigurations,
    createDataSourceConfiguration,
    updateDataSourceConfiguration,
    getDataSourceConfigurations,
    getDataSourceConfiguration,
    deleteDataSourceConfiguration,
    destroyDataSourceConfiguration

}