// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const assetMasterSchema = new Schema({
//     asset_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Asset',
//     },
//     template_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Template',
//     },
//     template_master_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true,
//         ref: 'TemplateMaster'
//     },
//     // document_id: {
//     //     type: mongoose.Schema.Types.ObjectId,
//     //     required: true
//     // },
//     document_code: {
//         type: String,
//         required: true
//     },
//     node: {
//         type: Schema.Types.Mixed
//     },
//     leaf_node: {
//         type: Boolean,
//         default: false,
//         index: true
//     },
//     asset_master_code: {
//         type: String,
//     },
//     asset_header_code: {
//         type: String,
//     }
// }, {
//     versionKey: false,
//     timestamps: true
// });

// module.exports = mongoose.model('AssetMaster', assetMasterSchema);


const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assetMasterSchema = new Schema({
    asset_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset',
        required: true
    },
    template_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
        required: true
    },
    template_master_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TemplateMaster',
        required: true
    },
    document_code: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    deleted_at: {
        type: Date,
        default: null
    }
}, {
    versionKey: false,
    collection: 'asset_master',
    strict: false
});

module.exports = mongoose.model('AssetMaster', assetMasterSchema);

