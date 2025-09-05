const { query } = require('express');
const AssetMaster = require('../models/assetMaster');
const Asset = require('../models/asset');
const mongoose = require("mongoose");
// const Equipment = require('../models/equipment');
const Template = require('../models/template');
// const TemplateAttribute = require('../models/templateAttribute');
const AssetConfiguration = require('../models/assetConfiguration');
const { logApiResponse } = require('../utils/responseService');



// const addAssetMaster = async (req, res) => {
// 	try {
// 		const { asset_id, template_id, data } = req.body;
// 		let results = [];
// 		let existingIds = [];

// 		// Find and create/update entries
// 		for (let item of data) {
// 			const exists = await AssetMaster.findOne({
// 				asset_id: asset_id,
// 				template_id: template_id,
// 				// template_master_id: item.template_master_id
// 			});

// 			if (!exists) {
// 				const newAsset = await AssetMaster.create({
// 					asset_id: asset_id,
// 					template_id: template_id,
// 					// template_master_id: item.template_master_id,
// 					document_code: item.document_code,
// 					node: item.node,
// 					leaf_node: true,
// 					asset_master_code: item.document_code
// 				});
// 				results.push(newAsset);
// 			}
// 			// existingIds.push(item.template_master_id);
// 		}
// 		const existingConfiguration = await AssetConfiguration.findOne({ asset_id, template_id });

// 		// Update or create AssetConfiguration entry
// 		const configurationResult = await AssetConfiguration.findOneAndUpdate(
// 			{ asset_id, template_id },
// 			// Set order and row_limit to null only if it doesn't exist
// 			existingConfiguration ? {} : { order: null, row_limit: null },
// 			{ new: true, upsert: true, setDefaultsOnInsert: true }
// 		);

// 		// Delete entries that no longer exist in the new data
// 		await AssetMaster.deleteMany({
// 			asset_id: asset_id,
// 			template_id: template_id,
// 			// template_master_id: { $nin: existingIds }
// 		});

// 		await logApiResponse(req, 'Assets processed successfully', 200, { added_updated: results });
// 		res.status(200).send({
// 			message: 'Assets processed successfully',
// 			added_updated: results,
// 		});
// 	} catch (error) {
// 		console.error("Failed to process assets:", error);
// 		await logApiResponse(req, 'Failed to process assets', 500, { error: error.toString() });
// 		res.status(500).send({
// 			message: 'Failed to process assets',
// 			error: error.toString()
// 		});
// 	}
// };

const addAssetMaster = async (req, res) => {
	try {
		const { asset_id, template_id, data } = req.body;
		let results = [];
		let existingIds = [];

		// Find and create/update entries
		for (let item of data) {
			const exists = await AssetMaster.findOne({
				asset_id,
				template_id,
				template_master_id: item.template_master_id
			});

			if (!exists) {
				const newAsset = await AssetMaster.create({
					asset_id,
					template_id,
					template_master_id: item.template_master_id,
					document_code: item.document_code,
					node: item.node,
					leaf_node: true,
					asset_master_code: item.document_code
				});
				results.push(newAsset);
			}
			existingIds.push(item.template_master_id);
		}

		// Ensure AssetConfiguration exists
		const existingConfiguration = await AssetConfiguration.findOne({ asset_id, template_id });
		await AssetConfiguration.findOneAndUpdate(
			{ asset_id, template_id },
			existingConfiguration ? {} : { order: null, row_limit: null },
			{ new: true, upsert: true, setDefaultsOnInsert: true }
		);

		// Delete entries that are not in new data
		await AssetMaster.deleteMany({
			asset_id,
			template_id,
			template_master_id: { $nin: existingIds }
		});

		await logApiResponse(req, 'Assets processed successfully', 200, { added_updated: results });
		res.status(200).send({
			message: 'Assets processed successfully',
			added_updated: results,
		});
	} catch (error) {
		console.error("Failed to process assets:", error);
		await logApiResponse(req, 'Failed to process assets', 500, { error: error.toString() });
		res.status(500).send({
			message: 'Failed to process assets',
			error: error.toString()
		});
	}
};

const getAssetMaster = async (req, res) => {
	try {
		const { asset_id, template_id } = req.body;

		if (!asset_id || !template_id) {
			const message = "Both asset_id and template_id must be provided";
			await logApiResponse(req, message, 400, {});
			return res.status(400).send({ message });
		}

		// Ensure valid ObjectIds (Cosmos requires this)
		if (!mongoose.Types.ObjectId.isValid(asset_id) || !mongoose.Types.ObjectId.isValid(template_id)) {
			const message = "Invalid asset_id or template_id format";
			await logApiResponse(req, message, 400, {});
			return res.status(400).send({ message });
		}

		let query = {
			// asset_id: new mongoose.Types.ObjectId(asset_id),
			template_id: new mongoose.Types.ObjectId(template_id),
		};

		// Fetch from Cosmos
		const assetMasters = await AssetMaster.find(query)
			.populate("template_id")
			.lean(); // lean() improves Cosmos performance

		if (!assetMasters || assetMasters.length === 0) {
			const message = "No assets found with the provided criteria";
			await logApiResponse(req, message, 404, {});
			return res.status(404).send({ message });
		}

		// Sorting: Do this in JS (since it's custom string logic)
		const sortedAssets = assetMasters.sort((a, b) => {
			const aIsLeafNode = a.asset_master_code?.includes("-");
			const bIsLeafNode = b.asset_master_code?.includes("-");
			return bIsLeafNode - aIsLeafNode;
		});

		const message = "Assets retrieved successfully";
		await logApiResponse(req, message, 200, { data: sortedAssets });

		res.status(200).send({
			message,
			data: sortedAssets,
		});
	} catch (error) {
		const errorMessage = "Failed to retrieve assets";
		console.error(errorMessage, error);
		await logApiResponse(req, errorMessage, 500, { error: error.toString() });
		res.status(500).send({
			message: errorMessage,
			error: error.toString(),
		});
	}
};


const getTemplatesByTemplateID = async (req, res) => {
	try {
		// Extract template_id from the URL parameters
		const { template_id } = req.params;

		// Fetch templates from the database matching the given template_id
		const templates = await TemplateMaster.find({ template_id });

		if (templates.length === 0) {
			const message = 'No templates found for the provided template ID';
			await logApiResponse(req, message, 404, {});
			return res.status(404).send({ message });
		}

		const message = 'Templates retrieved successfully';
		await logApiResponse(req, message, 200, { data: templates });
		res.status(200).send({
			message,
			data: templates
		});
	} catch (error) {
		const errorMessage = 'Failed to retrieve templates';
		console.error(errorMessage, error);
		await logApiResponse(req, errorMessage, 500, { error: error.toString() });
		res.status(500).send({
			message: errorMessage,
			error: error.toString()
		});
	}
};

const getAssetClassMaster = async (req, res) => {
	try {
		const { asset_id } = req.params;

		if (!asset_id) {
			const message = 'asset_id must be provided';
			await logApiResponse(req, message, 400, {});
			return res.status(400).send({ message });
		}

		const templates = await AssetMaster.distinct('template_id');

		let assetMastersPromises = templates.map(async (template_id) => {
			return AssetMaster.find({ template_id }).populate('template_master_id');
		});

		let assetMasters = await Promise.all(assetMastersPromises);

		const message = 'Assets retrieved successfully';
		await logApiResponse(req, message, 200, { data: assetMasters });
		res.status(200).send({
			message,
			data: assetMasters
		});
	} catch (error) {
		const errorMessage = 'Failed to retrieve assets';
		console.error(errorMessage, error);
		await logApiResponse(req, errorMessage, 500, { error: error.toString() });
		res.status(500).send({
			message: errorMessage,
			error: error.toString()
		});
	}
};

const getAssetTemplates = async (req, res) => {
	try {
		const templateIds = await AssetMaster.distinct('template_id');

		const templates = await Template.find({ _id: { $in: templateIds } });

		const message = 'Templates retrieved successfully';
		await logApiResponse(req, message, 200, { templates });
		res.status(200).json(templates);
	} catch (error) {
		const errorMessage = 'Error fetching assets';
		console.error(errorMessage, error);
		await logApiResponse(req, errorMessage, 500, { error: error.toString() });
		res.status(500).json({ message: 'Server error', error: error.toString() });
	}
};


const getTemplateAssets = async (req, res) => {
	try {
		const { template_id } = req.params;

		if (!template_id) {
			const message = 'Template ID is required';
			await logApiResponse(req, message, 400);
			return res.status(400).json({ message });
		}
		const asset_masters = await AssetMaster.find({
			template_id: template_id,
			leaf_node: true
		});
		const message = 'Templates retrieved successfully';
		await logApiResponse(req, message, 200, { asset_masters });
		res.status(200).json({
			message,
			data: asset_masters
		});
	} catch (error) {
		const errorMessage = 'Error fetching assets';
		console.error(errorMessage, error);
		await logApiResponse(req, errorMessage, 500, { error: error.toString() });
		res.status(500).json({ message: errorMessage, error: error.toString() });
	}
};

const getAssetEquipments = async (req, res) => {
	try {
		const { asset_id } = req.params;

		if (!asset_id) {
			const message = 'Asset ID is required';
			await logApiResponse(req, message, 400);
			return res.status(400).json({ message });
		}

		const equipments = await Equipment.find({
			asset_id
		});
		const message = 'Equipments retrieved successfully';
		await logApiResponse(req, message, 200, { equipments });
		res.status(200).json({
			message,
			data: equipments
		});
	} catch (error) {
		const errorMessage = 'Error fetching equipments';
		console.error(errorMessage, error);
		await logApiResponse(req, errorMessage, 500, { error: error.toString() });
		res.status(500).json({ message: errorMessage, error: error.toString() });
	}
};



const getAssetClassMasters = async (req, res) => {
	try {
		// Extract asset_id from the URL path parameters
		const { asset_id } = req.params;

		// Build the query object based on provided asset_id
		let query = {
			asset_id: asset_id
		};

		// Fetch asset masters from the database using the constructed query
		const assetMasters = await AssetMaster.find(query).populate('template_master_id');

		// Check if any assets were found
		if (assetMasters.length === 0) {
			const message = 'No assets found with the provided criteria';
			await logApiResponse(req, message, 404, {});
			return res.status(404).send({
				message
			});
		}

		const message = 'Assets retrieved successfully';
		await logApiResponse(req, message, 200, { assetMasters });
		res.status(200).send({
			message,
			data: assetMasters
		});
	} catch (error) {
		const errorMessage = 'Failed to retrieve assets';
		console.error(errorMessage, error);
		await logApiResponse(req, errorMessage, 500, { error: error.toString() });
		res.status(500).send({
			message: errorMessage,
			error: error.toString()
		});
	}
};
const getAssetTemplatesWithAttributes = async (req, res) => {
	try {
		const { asset_id } = req.body;
		const ObjectId = mongoose.Types.ObjectId;

		// 1️⃣ Fetch distinct template IDs linked to asset
		const templateIds = await AssetMaster.distinct("template_id", { asset_id });
		console.log("Fetched Template IDs from AssetMaster:", templateIds);

		// 2️⃣ Fetch asset document
		const asset = await Asset.findOne({ _id: new ObjectId(asset_id) }).lean();
		if (!asset) {
			const message = "Asset not found";
			await logApiResponse(req, message, 404, { asset_id });
			return res.status(404).json({ message });
		}

		// 3️⃣ Parse structure safely
		let structure = [];
		try {
			const parsed = JSON.parse(asset.structure || "[]");
			structure = Array.isArray(parsed) ? parsed : [];
		} catch (err) {
			structure = [];
		}
		console.log("structureeee", structure);

		// 4️⃣ Recursive extraction of all node IDs
		const extractNodeIds = (structure) => {
			const ids = [];

			const traverse = (item) => {
				if (Array.isArray(item)) {
					item.forEach(traverse);
				} else if (item && typeof item === "object") {
					if (Array.isArray(item.nodes)) {
						item.nodes.forEach(node => {
							if (node && node.id) ids.push(node.id);
						});
					}
					// Continue traversing all object values
					Object.values(item).forEach(traverse);
				}
			};

			traverse(structure);
			return ids;
		};

		const nodeIds = extractNodeIds(structure);
		console.log("Extracted Node IDs:", nodeIds);
		console.log("Template Idsssssssss:", templateIds);


		// 5️⃣ Filter templateIds to keep only those present in structure
		const templates = await Template.find({
			_id: { $in: templateIds },
			// document_code: { $in: nodeIds } // 🔹 adjust field if needed
		}).lean();

		const validTemplateIds = templates.map(t => t._id);
		console.log("Valid Template IDs:", validTemplateIds);

		if (validTemplateIds.length === 0) {
			const message = "No valid templates found for asset";
			await logApiResponse(req, message, 200, []);
			return res.status(200).json([]);
		}

		// 6️⃣ Fetch asset configurations
		const assetConfigurations = await AssetConfiguration.find({ asset_id }).lean();

		const templatesMap = templates.reduce((map, template) => {
			map[template._id.toString()] = template;
			return map;
		}, {});
		console.log("Templates Map:", templatesMap);

		// 7️⃣ Merge templates with configurations
		const allTemplates = validTemplateIds.map(templateId => {
			const config = assetConfigurations.find(
				c => c.template_id.toString() === templateId.toString()
			);
			const template = templatesMap[templateId.toString()];
			return {
				...template,
				rowlimit: config?.row_limit || null,
				order: config?.order ?? Number.MAX_SAFE_INTEGER
			};
		});

		// 8️⃣ Sort by order
		const sortedTemplates = allTemplates.sort((a, b) => a.order - b.order);

		// 9️⃣ Fetch attributes for each template
		// const templatesWithAttributes = await Promise.all(
		// 	sortedTemplates.map(async template => {
		// 		const attributes = await TemplateAttribute.find({
		// 			template_id: template._id,
		// 			asset_id
		// 		}).lean();
		// 		return { ...template, attributes };
		// 	})
		// );

		const message = "Templates with attributes retrieved successfully";
		console.log(message, sortedTemplates);

		await logApiResponse(req, message, 200, sortedTemplates);
		res.status(200).json(sortedTemplates);

	} catch (error) {
		const errorMessage = "Error fetching assets";
		console.error(errorMessage, error);
		await logApiResponse(req, errorMessage, 500, { error: error.message });
		res.status(500).json({ message: errorMessage, error: error.message });
	}
};




module.exports = {
	addAssetMaster,
	getAssetMaster,
	getTemplatesByTemplateID,
	getAssetClassMaster,
	getAssetTemplates,
	getAssetClassMasters,
	getAssetTemplatesWithAttributes,
	getTemplateAssets,
	getAssetEquipments
};