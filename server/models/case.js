const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({
    veteranName: {
        type: String,
        required: true,
        trim: true
    },
    claimType: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        trim: true
    }

});

const Case = mongoose.model("Case", caseSchema);

module.exports = Case;