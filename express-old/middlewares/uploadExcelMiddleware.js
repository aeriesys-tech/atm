const fs = require('fs');
const multer = require('multer');
const path = require('path');

const uploadDir = path.join(__dirname, '../uploads');

// Ensure the uploads folder exists
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
	}
});

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
		file.mimetype === "text/csv"
	) {
		cb(null, true);
	} else {
		cb(new Error('Invalid file type, only Excel and CSV files are allowed!'), false);
	}
};

const uploadExcelMiddleware = multer({ storage: fileStorage, fileFilter });

module.exports = uploadExcelMiddleware;
