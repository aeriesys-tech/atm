
const Equipment = require('../models/equipment');
const { logApiResponse } = require('../utils/responseService');
const { Op } = require("sequelize");
const redisClient = require("../config/redisConfig");
const assetAttribute = require('../models/assetAttribute');
const assetClassAttribute = require('../models/assetClassAttribute');

const paginatedEquipments = async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'equipment_code',
        order = 'asc',
        search = '',
        status
    } = req.query;

    // ✅ Only allow safe fields for sorting
    const allowedSortFields = ['equipment_code', 'equipment_name'];
    const cleanSortBy = String(sortBy).trim();
    const safeSortBy = allowedSortFields.includes(cleanSortBy) ? cleanSortBy : '_id';

    const sort = { [safeSortBy]: order === 'desc' ? -1 : 1 };
    const match = {
        $and: [
            search ? {
                $or: [
                    { equipment_name: new RegExp(search, 'i') },
                    { equipment_code: new RegExp(search, 'i') },
                    { 'category.category_name': new RegExp(search, 'i') }
                ]
            } : {},
            (status === 'true' || status === 'false') ? { status: status === 'true' } : {}
        ]
    };

    try {
        const pipeline = [
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
            { $match: match },
            { $sort: sort },
            { $skip: (page - 1) * Number(limit) },
            { $limit: Number(limit) }
        ];
        const countPipeline = [
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
            { $match: match },
            { $count: 'total' }
        ];
        const [equipments, countResult] = await Promise.all([
            Equipment.aggregate(pipeline),
            Equipment.aggregate(countPipeline)
        ]);

        const totalItems = countResult[0]?.total || 0;

        const responseData = {
            totalPages: Math.ceil(totalItems / limit),
            currentPage: Number(page),
            equipments,
            totalItems
        };

        await logApiResponse(req, "Paginated equipments retrieved successfully", 200, responseData);
        res.status(200).json(responseData);

    } catch (error) {
        console.error("Error retrieving paginated equipments:", error);
        await logApiResponse(req, "Failed to retrieve paginated equipments", 500, { error: error.message });
        res.status(500).json({
            message: "Failed to retrieve paginated equipments",
            error: error.message
        });
    }
};


const downloadExcel = async (req, res) => {
    try {
        const { asset_id } = req.body;
        console.log(asset_id);


        const assetClassAttributes = await assetClassAttribute.findOne({ asset_id: asset_id });

        if (!assetClassAttributes) {
            return res.status(404).json({
                message: "Asset class attributes not found for the given asset_id"
            });
        }

        const assetAttributeIds = assetClassAttributes.asset_attribute_ids.map(attr => attr.id);
        const fieldDefinitions = await assetAttribute.find({ _id: { $in: assetAttributeIds } }).select('field_name display_name');

        const searchQuery = { asset_id: asset_id };


        const equipments = await Equipment.find(searchQuery);

        // Create a mapping of asset attribute IDs to their order
        const orderMapping = assetClassAttributes.asset_attribute_ids.reduce((acc, curr) => {
            acc[curr.id.toString()] = curr.order;
            return acc;
        }, {});

        // Sort the field definitions based on the order from AssetClassAttribute
        const sortedAssetAttributes = fieldDefinitions
            .map(field => ({
                field_name: field.field_name,
                display_name: field.display_name,
                order: orderMapping[field._id.toString()] || Infinity
            }))
            .sort((a, b) => a.order - b.order)
            .map(({ field_name, display_name }) => ({ field_name, display_name }));

        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Equipments');

        // Add headers based on the sorted asset attributes
        const headers = sortedAssetAttributes.map(attr => attr.display_name);
        worksheet.columns = headers.map(header => ({ header, width: 30 }));

        // Add rows to the worksheet using the equipment data
        equipments.forEach(equipment => {
            const row = sortedAssetAttributes.map(attr => equipment[attr.field_name] || ''); // Ensure it handles missing fields
            worksheet.addRow(row);
        });

        // Set response headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=data.xlsx');

        // Write the workbook to a stream
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error generating Excel file:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    paginatedEquipments, downloadExcel
}

