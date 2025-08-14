const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const abilitiesSchema = new Schema({
    ability: {
        type: String,
        required: true,
        index: true,
    },
    description: {
        type: String,
        required: true,
        index: true,
    },
    module_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Modules'
    },
}, {
    versionKey: false
});

module.exports = mongoose.model('Ability', abilitiesSchema);
