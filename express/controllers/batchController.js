const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const Batch = require('../models/batch');
const Variable = require('../models/variable');
const { responseService, logApiResponse } = require('../utils/responseService');


const createBatch = async (req, res) => {
	const { no_of_tags, no_of_attributes, data, master, batch_type } = req.body;

	try {
		const lastBatch = await Batch.findOne().sort({ batch_no: -1 }).lean();
		const nextBatchNo = lastBatch ? lastBatch.batch_no + 1 : 1;

		// const fileName = req.file ? req.file.originalname : null;
		const fileName = req.file ? req.file.filename : null;

		const newBatch = new Batch({
			batch_no: nextBatchNo,
			no_of_tags,
			no_of_attributes,
			data,
			master,
			batch_type,
			file: fileName,
			user_id: "6870f12f8f0cb7fa8e74a472"
		});

		await newBatch.save();

		return responseService.success(req, res, "Batch created successfully", newBatch, 201);
	} catch (error) {
		console.error("Failed to create batch:", error);
		return responseService.error(req, res, "Internal Server Error", {
			message: "An unexpected error occurred"
		}, 500);
	}
};


const updateBatch = async (req, res) => {
	const { batch_id, no_of_tags, no_of_attributes, data, master, batch_type } = req.body;

	try {
		const batch = await Batch.findById(batch_id);
		if (!batch) {
			return responseService.error(req, res, "Batch not found", {
				message: "Batch not found"
			}, 404);
		}
		if (no_of_tags !== undefined) batch.no_of_tags = no_of_tags;
		if (no_of_attributes !== undefined) batch.no_of_attributes = no_of_attributes;
		if (data !== undefined) batch.data = data;
		if (master !== undefined) batch.master = master;
		if (batch_type) batch.batch_type = batch_type;

		if (req.file) {
			batch.file = req.file.filename;
		}

		await batch.save();

		return responseService.success(req, res, "Batch updated successfully", batch);
	} catch (error) {
		console.error("Failed to update batch:", error);
		return responseService.error(req, res, "Internal Server Error", {
			message: "An unexpected error occurred"
		}, 500);
	}
};


const deleteBatch = async (req, res) => {
	const { batch_id } = req.body;

	if (!batch_id || !mongoose.Types.ObjectId.isValid(batch_id)) {
		return responseService.error(req, res, "Validation Error", {
			batch_id: "Invalid or missing Batch ID"
		}, 400);
	}

	try {
		const batch = await Batch.findById(batch_id);
		if (!batch) {
			return responseService.error(req, res, "Batch not found", {
				message: "Batch not found"
			}, 404);
		}

		// await Batch.findByIdAndDelete(id);
		await batch.deleteOne(); // Trigger cascading delete

		return responseService.success(req, res, "Batch deleted successfully");
	} catch (error) {
		console.error("Failed to delete batch:", error);
		return responseService.error(req, res, "Internal Server Error", {
			message: "An unexpected error occurred"
		}, 500);
	}
};


const viewBatch = async (req, res) => {
	const { batch_id } = req.body;

	if (!batch_id || !mongoose.Types.ObjectId.isValid(batch_id)) {
		return responseService.error(req, res, "Validation Error", {
			batch_id: "Invalid or missing Batch ID"
		}, 400);
	}

	try {
		const batch = await Batch.findById(batch_id);
		if (!batch) {
			return responseService.error(req, res, "Batch not found", {
				message: "Batch not found"
			}, 404);
		}

		// Fetch associated variables
		const variables = await Variable.find({ batch_id });

		// If no variables found, return error
		if (!variables || variables.length === 0) {
			return responseService.error(req, res, "No variables found in this batch", {
				message: "Cannot view batch without any variables"
			}, 400);
		}

		let fileContent = null;

		// if the batch has a file and is a 'direct' upload, read the file
		if (batch.batch_type === 'direct' && batch.file) {
			const uploadsDir = path.join(__dirname, '..', 'uploads');
			const files = fs.readdirSync(uploadsDir);
			// const matchedFile = files.find(file => file.endsWith(`-${batch.file}`));
			const matchedFile = files.find(file => file === batch.file);

			if (matchedFile) {
				const filePath = path.join(uploadsDir, matchedFile);
				const ext = path.extname(filePath).toLowerCase();

				if (ext === '.xlsx' || ext === '.xls') {
					const workbook = xlsx.readFile(filePath);
					const sheetName = workbook.SheetNames[0];
					const worksheet = workbook.Sheets[sheetName];
					fileContent = xlsx.utils.sheet_to_json(worksheet);
				} else {
					fileContent = fs.readFileSync(filePath, 'utf-8');
				}
			}
		}

		return responseService.success(req, res, "Batch fetched successfully", {
			...batch.toObject(),
			variables,
			file_content: fileContent
		});
	} catch (error) {
		console.error("Failed to fetch batch:", error);
		return responseService.error(req, res, "Internal Server Error", {
			message: "An unexpected error occurred"
		}, 500);
	}
};


const getBatches = async (req, res) => {
	// const { data, master } = req.body;

	try {
		// const query = {};
		// if (data) query.data = data;
		// if (master) query.master = master;

		const batches = await Batch.find().sort({ batch_no: -1 });  // sorted by batch_no ascending
		return responseService.success(req, res, "Batches fetched successfully", batches);
	} catch (error) {
		console.error("Failed to fetch batches:", error);
		return responseService.error(req, res, "Internal Server Error", {
			message: "An unexpected error occurred"
		}, 500);
	}
};


// const uploadExcel = async (req, res) => {
// 	try {
// 		const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
// 		const workbook = xlsx.readFile(filePath);
// 		const sheet = workbook.Sheets[workbook.SheetNames[0]];
// 		const data = xlsx.utils.sheet_to_json(sheet, { defval: "" });
// 		console.log("111111111111");
// 		// Step 1: Extract and filter valid variables
// 		const variableDocs = data
// 			.filter(row => row["Variable Code"] && row["Variable Description"]) // basic validity
// 			.map(row => ({
// 				variable_code: row["Variable Code"],
// 				variable_description: row["Variable Description"],
// 				uom: row["UoM"],
// 				ds_tag_id: row["DS Tag ID"],
// 				ds_tag_code: row["DS Tag Code"],
// 				min: Number(row["Minimum"]),
// 				max: Number(row["Maximum"]),
// 				lcl: Number(row["LCL"]),
// 				ucl: Number(row["UCL"]),
// 				flatline_length: Number(row["Flatline Length"]),
// 				status: false,
// 			}));
// 		console.log("22222222222222");
// 		// Step 2: Don't create anything if no valid variables
// 		if (variableDocs.length === 0) {
// 			fs.unlinkSync(filePath); // optional cleanup
// 			return responseService.error(req, res, "Excel contains no valid variables", {}, 400);
// 		}
// 		console.log("3333333333333333");
// 		// Step 3: Create batch
// 		const lastBatch = await Batch.findOne().sort({ batch_no: -1 }).lean();
// 		const nextBatchNo = lastBatch ? lastBatch.batch_no + 1 : 1;
// 		const existingBatch = await Batch.findOne({ file: req.file.filename });
// 		if (existingBatch) {
// 			console.log("batchExistsssssssssss", existingBatch);
// 		}
// 		console.log("4444444444444444444");
// 		const batch = await Batch.create({
// 			batch_no: nextBatchNo,
// 			no_of_tags: variableDocs.length,
// 			no_of_attributes: 8,
// 			batch_type: 'direct',
// 			file: req.file.filename,
// 			user_id: "6870f12f8f0cb7fa8e74a472",
// 		});

// 		// Step 4: Add batch_id to each variable and save
// 		variableDocs.forEach(v => v.batch_id = batch._id);
// 		const createdVariables = await Variable.insertMany(variableDocs);

// 		return responseService.success(req, res, "Excel uploaded and data saved successfully", {
// 			batch,
// 			total_variables: createdVariables.length,
// 			variables: createdVariables
// 		}, 201);

// 	} catch (error) {
// 		console.error("Excel Upload Error:", error);
// 		return responseService.error(req, res, "Internal Server Error", {
// 			message: "Failed to process Excel file"
// 		}, 500);
// 	}
// };


const uploadExcel = async (req, res) => {
	try {
		const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
		const workbook = xlsx.readFile(filePath);
		const sheet = workbook.Sheets[workbook.SheetNames[0]];
		const data = xlsx.utils.sheet_to_json(sheet, { defval: "" });

		// Required headers
		const requiredHeaders = [
			"Variable Code",
			"Variable Description",
			"UoM",
			"DS Tag ID",
			"DS Tag Code",
			"Minimum",
			"Maximum",
			"LCL",
			"UCL",
			"Flatline Length"
		];

		// Step 1: Validate data for every row
		for (let [index, row] of data.entries()) {
			const missing = requiredHeaders.filter(h => !row[h] && row[h] !== 0);
			if (missing.length > 0) {
				fs.unlinkSync(filePath);
				return responseService.error(
					req,
					res,
					`Missing required values in row ${index + 2}`, // Excel row number (header + 1-based index)
					{ missing },
					400
				);
			}
		}

		// Step 2: Map rows into documents
		const variableDocs = data.map(row => ({
			variable_code: row["Variable Code"],
			variable_description: row["Variable Description"],
			uom: row["UoM"],
			ds_tag_id: row["DS Tag ID"],
			ds_tag_code: row["DS Tag Code"],
			min: Number(row["Minimum"]),
			max: Number(row["Maximum"]),
			lcl: Number(row["LCL"]),
			ucl: Number(row["UCL"]),
			flatline_length: Number(row["Flatline Length"]),
			status: false,
		}));

		// Step 3: Create batch
		const lastBatch = await Batch.findOne().sort({ batch_no: -1 }).lean();
		const nextBatchNo = lastBatch ? lastBatch.batch_no + 1 : 1;

		const batch = await Batch.create({
			batch_no: nextBatchNo,
			no_of_tags: variableDocs.length,
			no_of_attributes: 8,
			batch_type: 'direct',
			file: req.file.originalname,
			user_id: "6870f12f8f0cb7fa8e74a472",
		});

		// Step 4: Insert or update variables
		let created = [];
		let updated = [];

		for (let v of variableDocs) {
			v.batch_id = batch._id;

			const existing = await Variable.findOne({ variable_code: v.variable_code });

			if (existing) {
				await Variable.updateOne({ variable_code: v.variable_code }, { $set: v });
				updated.push(v.variable_code);
			} else {
				const newVar = await Variable.create(v);
				created.push(newVar.variable_code);
			}
		}

		// Step 5: Response
		return responseService.success(req, res, "Excel processed successfully", {
			batch,
			created_count: created.length,
			updated_count: updated.length,
			created_variables: created,
			updated_variables: updated
		}, 201);

	} catch (error) {
		console.error("Excel Upload Error:", error);
		return responseService.error(req, res, "Internal Server Error", {
			message: "Failed to process Excel file"
		}, 500);
	}
};

const paginateBatches = async (req, res) => {
	try {
		// Support both body and query params
		const {
			page = 1,
			limit = 10,
			sortBy = '_id',
			order = 'desc',
			search = ''
		} = req.body || req.query || {};

		const query = {
			$or: [
				{ data: { $regex: search, $options: 'i' } },
				{ master: { $regex: search, $options: 'i' } },
				{ batch_type: { $regex: search, $options: 'i' } },
				{ file: { $regex: search, $options: 'i' } }
			]
		};

		const total = await Batch.countDocuments(query);
		const batches = await Batch.find(query)
			.sort({ [sortBy]: order === 'asc' ? 1 : -1 })
			.skip((Number(page) - 1) * Number(limit))
			.limit(Number(limit));

		return responseService.success(
			req,
			res,
			"Batches fetched successfully",
			{
				data: batches,
				pagination: {
					page: Number(page),
					totalItems: total,
					totalPages: Math.ceil(total / Number(limit))
				}
			},
			200
		);
	} catch (error) {
		console.error("Error in paginateBatches:", error);
		return responseService.error(
			req,
			res,
			"Internal Server Error",
			{ message: "Something went wrong" },
			500
		);
	}
};


module.exports = {
	createBatch,
	updateBatch,
	deleteBatch,
	viewBatch,
	getBatches,
	uploadExcel,
	paginateBatches
};


// const uploadExcel = async (req, res) => {
//     // if (!req.file) {
//     //     return responseService.error(req, res, "Excel file is required", {}, 400);
//     // }

//     try {
//         // Read Excel File
//         const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
//         const workbook = xlsx.readFile(filePath);
//         const sheet = workbook.Sheets[workbook.SheetNames[0]];
//         const data = xlsx.utils.sheet_to_json(sheet, { defval: "" }); // keep empty cells as ""

//         if (data.length === 0) {
//             return responseService.error(req, res, "Excel file is empty", {}, 400);
//         }

//         // Get next batch number
//         const lastBatch = await Batch.findOne().sort({ batch_no: -1 }).lean();
//         const nextBatchNo = lastBatch ? lastBatch.batch_no + 1 : 1;

//         const no_of_tags = data.length;
//         const no_of_attributes = 8;

//         const batch = await Batch.create({
//             batch_no: nextBatchNo,
//             no_of_tags,
//             no_of_attributes,
//             batch_type: 'direct',
//             file: req.file.filename,
//             user_id: "6870f12f8f0cb7fa8e74a472",
//         });

//         const variableDocs = data.map(row => ({
//             batch_id: batch._id,
//             variable_code: row["Variable Code"],
//             variable_description: row["Variable Description"],
//             uom: row["UoM"],
//             ds_tag_id: row["DS Tag ID"],
//             ds_tag_code: row["DS Tag Code"],
//             min: Number(row["Minimum"]),
//             max: Number(row["Maximum"]),
//             lcl: Number(row["LCL"]),
//             ucl: Number(row["UCL"]),
//             flatline_length: Number(row["Flatline Length"]),
//             status: false, // default status
//         }));

//         const createdVariables = await Variable.insertMany(variableDocs);

//         return responseService.success(req, res, "Excel uploaded and data saved successfully", {
//             batch,
//             total_variables: createdVariables.length,
//             variables: createdVariables
//         }, 201);

//     } catch (error) {
//         console.error("Excel Upload Error:", error);
//         return responseService.error(req, res, "Internal Server Error", {
//             message: "Failed to process Excel file"
//         }, 500);
//     }
// };