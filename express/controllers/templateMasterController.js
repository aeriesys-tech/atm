const mongoose = require('mongoose');
const TemplateMaster = require('../models/templateMaster');
const TemplateData = require('../models/templateData')

const createTemplateMaster = async (req, res) => {
    try {
        const { id: template_id, templateNodeData, structure } = req.body;

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
            const parts = document_code.split('-');
            if (parts.length < 3) continue;

            let master = null;
            let cluster = null;
            let adi = null;

            for (const part of parts) {
                if (!master) {
                    master = masterTests.find(m => m.master_test?.name === part);
                    if (master) continue;
                }
                if (!cluster && clusters.length) {
                    cluster = clusters.find(c => c.Cluster?.gh === part);
                    if (cluster) continue;
                }
                if (!adi) {
                    adi = adis.find(a => a.adi?.adi === part);
                    if (adi) continue;
                }
            }
            if (!master || !adi || (clusters.length && !cluster)) {
                console.warn(`Skipping invalid document_code: ${document_code}`, {
                    masterFound: !!master,
                    clusterFound: !!cluster,
                    adiFound: !!adi
                });
                continue;
            }

            recordsToInsert.push({
                template_id,
                master_test: master.master_test._id,
                cluster: cluster ? cluster.Cluster._id : null,
                adi: adi.adi._id,
                document_code,
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            });
        }

        if (!recordsToInsert.length) {
            return res.status(400).json({ message: 'No valid document_code combinations found.' });
        }

        await TemplateMaster.insertMany(recordsToInsert);

        await TemplateData.findOneAndUpdate(
            { template_id },
            { $set: { structure, updated_at: new Date() } },
            { upsert: true, new: true }
        );

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

const getTemplatesByTemplateIDLeaf = async (req, res) => {
    try {
        const { template_id } = req.body;
        const templates = await TemplateMaster.find({
            template_id,
            leaf_node: true
        });
        if (!templates.length) {
            await logApiResponse(req, 'No templates found for the provided template ID', 404, {});
            return res.status(404).send({ message: 'No templates found for the provided template ID' });
        }
        const groups = templates.reduce((acc, template) => {
            const key = template.heading_name ? template.heading_name : template.master_name;
            if (!acc[key]) {
                acc[key] = {
                    master_name: key,
                    templates: []
                };
            }
            acc[key].templates.push(template);
            return acc;
        }, {});
        const groupsArray = Object.values(groups);

        await logApiResponse(req, 'Templates retrieved successfully', 200, groupsArray);
        res.status(200).send({
            message: 'Templates retrieved successfully',
            groups: groupsArray
        });
    } catch (error) {
        console.error('Failed to retrieve templates:', error);
        await logApiResponse(req, 'Failed to retrieve templates', 500, { message: 'Failed to retrieve templates', error: error.toString() });
        res.status(500).send({
            message: 'Failed to retrieve templates',
            error: error.toString()
        });
    }
};

module.exports = { createTemplateMaster, getTemplatesByTemplateIDLeaf };
