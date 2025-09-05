const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assetMasterSchema = new Schema({
    asset_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset',
    },
    template_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
    },
    template_master_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'TemplateMaster'
    },
    // document_id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     required: true
    // },
    document_code: {
        type: String,
        required: true
    },
    node: {
        type: Schema.Types.Mixed
    },
    leaf_node: {
        type: Boolean,
        default: false,
        index: true
    },
    asset_master_code: {
        type: String,
    },
    asset_header_code: {
        type: String,
    }
}, {
    versionKey: false,
    timestamps: true
});

module.exports = mongoose.model('AssetMaster', assetMasterSchema);
