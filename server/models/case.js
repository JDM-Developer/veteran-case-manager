const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({
    veteranName: {
        type: String,
        required: true
    },
    claimType: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }

});

const Case = mongoose.model("Case", caseSchema);

module.exports = Case;