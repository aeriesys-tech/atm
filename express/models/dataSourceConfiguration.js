const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dataSourceConfigurationSchema = new Schema({
    data_source: {
        type: String,
        required: [true, 'Data source is required'],
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        index: true
    },
    username: {
        type: String,
        nullable: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        nullable: true,
        trim: true,
        index: true
    },
    host: {
        type: String,
        nullable: true,
        trim: true,
        index: true
    },
    port_no: {
        type: String,
        nullable: true,
        trim: true,
        index: true
    },
    database_name: {
        type: String,
        nullable: true,
        trim: true,
        index: true
    },
    table_name: {
        type: String,
        nullable: true,
        trim: true,
        index: true
    },
    token: {
        type: String,
        nullable: true,
        trim: true,
        index: true
    },
    org: {
        type: String,
        nullable: true,
        trim: true,
        index: true
    },
    bucket: {
        type: String,
        nullable: true,
        trim: true,
        index: true
    },
    url: {
        type: String,
        nullable: true,
        trim: true,
        index: true
    },
    deleted_at: {
        type: Date,
        default: null
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Partial indexes to support Cosmos DB sorting & soft delete
dataSourceConfigurationSchema.index(
    { data_source: 1 },
    { unique: true, partialFilterExpression: { deleted_at: null } }
);

// Explicitly specify collection name
module.exports = mongoose.model('DataSourceConfiguration', dataSourceConfigurationSchema, 'datasourceconfigurations');
