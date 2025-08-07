const mongoose = require('mongoose');
const TemplateMaster = require('../models/templateMaster'); // Your model

const createTemplateMaster = async (req, res) => {
    try {
        const { id: template_id, templateNodeData } = req.body;

        if (!template_id || !mongoose.Types.ObjectId.isValid(template_id)) {
            return res.status(400).json({ message: 'Invalid or missing template_id' });
        }

        const masterTests = templateNodeData.master_test || [];
        const clusters = templateNodeData.Cluster || [];
        const adis = templateNodeData.adi || [];
        const documentCodes = templateNodeData.document_code || [];

        if (!documentCodes.length) {
            return res.status(400).json({ message: 'document_code array is required' });
        }

        const recordsToInsert = [];

        for (const document_code of documentCodes) {
            // Format: masterName-clusterName-adiName
            const parts = document_code.split('-');
            if (parts.length < 3) continue;

            const [masterName, clusterName, ...adiParts] = parts;
            const adiName = adiParts.join('-'); // handle hyphenated adi

            // Find matching objects
            const master = masterTests.find(m => m.master_test?.name === masterName);
            const cluster = clusters.find(c => c.Cluster?.gh === clusterName);
            const adi = adis.find(a => a.adi?.adi === adiName);

            if (!master || !cluster || !adi) {
                console.warn(`Skipping invalid document_code: ${document_code}`);
                continue;
            }

            // Push record with static key-based document_code
            recordsToInsert.push({
                template_id,
                master_test: master.master_test._id,
                cluster: cluster.Cluster._id,
                adi: adi.adi._id,
                document_code: 'master_test-Cluster-adi',
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            });
        }

        if (!recordsToInsert.length) {
            return res.status(400).json({ message: 'No valid document_code combinations found.' });
        }

        await TemplateMaster.insertMany(recordsToInsert);

        return res.status(201).json({
            message: 'Records created successfully',
            count: recordsToInsert.length,
            data: recordsToInsert
        });

    } catch (error) {
        console.error('Error in createTemplateMaster:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};



module.exports = { createTemplateMaster };
