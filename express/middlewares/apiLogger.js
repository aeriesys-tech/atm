const ApiLog = require("../models/apiLog");

const apiLogger = async (req, res, next) => {
	next();
};

module.exports = apiLogger;
