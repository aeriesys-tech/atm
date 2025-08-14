const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    batch_no: {
        type: Number,
        required: true,
        unique: true,
        trim: true
    },
    no_of_tags: {
        type: Number,
        required: true
    },
    no_of_attributes: {
        type: Number,
        required: true
    },
    data: {
        type: String,
        default: null
    },
    master: {
        type: String,
        default: null
    },
    batch_type: {
        type: String,
        enum: ['atm', 'direct'],
        required: true
    },
    file: {
        type: String,
        default: null
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    collection: 'batches'
});

// Cascading delete: when a Batch is deleted, remove all associated Variables
batchSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    const variable = require('./variable');
    await variable.deleteMany({ batch_id: this._id });
    next();
});

module.exports = mongoose.model('Batch', batchSchema);