const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;

//**remember never to name module as model.exports, took way too long to diagnose issue