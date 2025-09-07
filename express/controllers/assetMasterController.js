const { query } = require('express');
const AssetMaster = require('../models/assetMaster');
const Asset = require('../models/asset');
const mongoose = require("mongoose");
// const Equipment = require('../models/equipment');
const Template = require('../models/template');
// const TemplateAttribute = require('../models/templateAttribute');
const AssetConfiguration = require('../models/assetConfiguration');
const { logApiResponse } = require('../utils/responseService');
const templateData = require('../models/templateData');
const templateMaster = require('../models/templateMaster');



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

// const addAssetMaster = async (req, res) => {
// 	try {
// 		const { asset_id, template_id, data } = req.body;
// 		let results = [];
// 		let existingIds = [];

// 		// Upsert AssetMasters
// 		for (let item of data) {
// 			const updated = await AssetMaster.findOneAndUpdate(
// 				{
// 					asset_id,
// 					template_id,
// 					template_master_id: item.template_master_id
// 				},
// 				{
// 					$setOnInsert: {
// 						document_code: item.document_code,
// 						node: item.node,
// 						leaf_node: true,
// 						asset_master_code: item.document_code
// 					}
// 				},
// 				{ new: true, upsert: true }
// 			);

// 			results.push(updated);
// 			existingIds.push(item.template_master_id);
// 		}

// 		// Ensure AssetConfiguration exists
// 		await AssetConfiguration.findOneAndUpdate(
// 			{ asset_id, template_id },
// 			{ $setOnInsert: { order: null, row_limit: null } },
// 			{ new: true, upsert: true }
// 		);

// 		// Delete docs not in payload
// 		if (existingIds.length > 0) {
// 			await AssetMaster.deleteMany({
// 				asset_id,
// 				template_id,
// 				template_master_id: { $nin: existingIds }
// 			});
// 		}

// 		await logApiResponse(req, 'Assets processed successfully', 200, { added_updated: results });
// 		res.status(200).send({
// 			message: 'Assets processed successfully',
// 			added_updated: results
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


// ---------changed structure

const addAssetMaster = async (req, res) => {
	try {
		const { asset_id, template_id, data } = req.body;
		if (!asset_id || !mongoose.Types.ObjectId.isValid(asset_id)) {
			return res.status(400).json({ message: 'Invalid or missing asset_id' });
		}
		if (!template_id || !mongoose.Types.ObjectId.isValid(template_id)) {
			return res.status(400).json({ message: 'Invalid or missing template_id' });
		}
		if (!Array.isArray(data) || !data.length) {
			return res.status(400).json({ message: 'data array is required' });
		}
		await AssetMaster.deleteMany({ asset_id, template_id });
		const recordsToInsert = data.map(item => {
			const record = {
				asset_id,
				template_id,
				template_master_id: item.template_master_id,
				document_code: item.document_code,
				created_at: new Date(),
				updated_at: new Date(),
				deleted_at: null
			};
			if (item.node_ids && typeof item.node_ids === 'object') {
				Object.entries(item.node_ids).forEach(([key, value]) => {
					record[key] = value;
				});
			}
			return record;
		});
		await AssetMaster.insertMany(recordsToInsert);
		await AssetConfiguration.findOneAndUpdate(
			{ asset_id, template_id },
			{ $setOnInsert: { order: null, row_limit: null } },
			{ upsert: true, new: true }
		);
		return res.status(201).json({
			message: 'Asset Masters replaced successfully',
			count: recordsToInsert.length,
			data: recordsToInsert
		});

	} catch (error) {
		console.error('Error in addAssetMaster:', error);
		return res.status(500).json({ message: 'Internal Server Error' });
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

// const getAssetClassMaster = async (req, res) => {
// 	try {
// 		const { asset_id } = req.params;

// 		if (!asset_id) {
// 			const message = 'asset_id must be provided';
// 			await logApiResponse(req, message, 400, {});
// 			return res.status(400).send({ message });
// 		}

// 		const templates = await AssetMaster.distinct('template_id');

// 		let assetMastersPromises = templates.map(async (template_id) => {
// 			return AssetMaster.find({ template_id }).populate('template_master_id');
// 		});

// 		let assetMasters = await Promise.all(assetMastersPromises);

// 		const message = 'Assets retrieved successfully';
// 		await logApiResponse(req, message, 200, { data: assetMasters });
// 		res.status(200).send({
// 			message,
// 			data: assetMasters
// 		});
// 	} catch (error) {
// 		const errorMessage = 'Failed to retrieve assets';
// 		console.error(errorMessage, error);
// 		await logApiResponse(req, errorMessage, 500, { error: error.toString() });
// 		res.status(500).send({
// 			message: errorMessage,
// 			error: error.toString()
// 		});
// 	}
// };
const getAssetClassMaster = async (req, res) => {
	try {
		const { asset_id } = req.body;

		if (!asset_id) {
			const message = "asset_id is required";
			await logApiResponse(req, message, 400, {});
			return res.status(400).send({ message });
		}

		// Build query and convert to ObjectId if valid
		const query = mongoose.Types.ObjectId.isValid(asset_id)
			? { _id: new mongoose.Types.ObjectId(asset_id) }
			: { _id: asset_id };

		// Fetch main asset
		const mainAsset = await Equipment.findOne(query);
		if (!mainAsset) {
			const message = "Asset not found";
			await logApiResponse(req, message, 404, {});
			return res.status(404).send({ message });
		}

		// Fetch related asset masters
		const assetMasters = await AssetMaster.find({ asset_id: mainAsset._id })
			.populate("template_master_id")
			.populate("template_id")
			.lean();

		// Format response
		const formattedAssetMasters = assetMasters.map(am => {
			// Map populate fields to cleaner names
			const templateMaster = am.template_master_id || null;
			const templateData = am.template_id || null;

			// Compute heading_name dynamically
			let heading_name = null;
			if (templateMaster && templateMaster.heading_name) {
				heading_name = templateMaster.heading_name;
			}

			return {
				...am,
				templateMaster,
				templateData,
				heading_name
			};
		});

		const response = {
			asset: mainAsset,
			assetMasters: formattedAssetMasters
		};

		await logApiResponse(req, "Successfully retrieved asset masters", 200, response);
		return res.status(200).send(response);

	} catch (error) {
		console.error("Error fetching asset masters:", error);

		await logApiResponse(req, "Error fetching asset masters", 500, { error: error.message });
		return res.status(500).send({
			message: "Internal Server Error",
			error: error.message
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
		const { asset_id } = req.body;

		if (!asset_id) {
			const message = 'asset_id is required';
			await logApiResponse(req, message, 400, {});
			return res.status(400).send({ message });
		}

		// Build query for Cosmos DB / Mongoose
		const query = mongoose.Types.ObjectId.isValid(asset_id)
			? { _id: new mongoose.Types.ObjectId(asset_id) }
			: { _id: asset_id };

		// Fetch the main asset
		const mainAsset = await Asset.findOne(query).lean();
		if (!mainAsset) {
			const message = 'No asset found with the provided asset_id';
			await logApiResponse(req, message, 404, {});
			return res.status(404).send({ message });
		}

		// Fetch asset masters linked to this asset
		const assetMasters = await AssetMaster.find({ asset_id: mainAsset._id })
			.populate({
				path: 'template_master_id',
				select: 'template_code template_name template_type_id structure status createdAt updatedAt master_test cluster adi'
			})
			.lean();

		if (!assetMasters || assetMasters.length === 0) {
			const message = 'No asset masters found for this asset';
			await logApiResponse(req, message, 404, {});
			return res.status(404).send({ message });
		}

		// Collect unique template_ids for fetching templateData and templateMaster records
		const templateIds = [...new Set(assetMasters.map(a => a.template_id))];

		// Fetch template data
		const templateDataRecords = await templateData.find({
			template_id: { $in: templateIds }
		}).lean();

		// Fetch template master records
		const templateMasterRecords = await templateMaster.find({
			template_id: { $in: templateIds }
		}).lean();

		// Merge asset master, template master, and template data info
		const formattedAssetMasters = assetMasters.map(asset => {
			const templateMasterObj =
				templateMasterRecords.find(
					tm => String(tm.template_id) === String(asset.template_id)
				) || {};

			const templateDataRecord =
				templateDataRecords.find(
					td => String(td.template_id) === String(asset.template_id)
				) || {};

			// Remove nested template_master_id from asset
			const assetObj = { ...asset };
			delete assetObj.template_master_id;

			return {
				...assetObj,
				templateMaster: templateMasterObj,
				templateData: templateDataRecord
			};
		});

		const message = 'Assets retrieved successfully';
		await logApiResponse(req, message, 200, { asset: mainAsset, assetMasters: formattedAssetMasters });

		res.status(200).send({
			message,
			data: {
				asset: mainAsset,
				assetMasters: formattedAssetMasters
			}
		});
	} catch (error) {
		const errorMessage = 'Failed to retrieve assets';
		console.error(errorMessage, error);
		await logApiResponse(req, errorMessage, 500, { error: error.toString() });
		res.status(500).send({ message: errorMessage, error: error.toString() });
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