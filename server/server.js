const express = require("express");
const mongoose = require("mongoose");
const Case = require('./models/Case');
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

app.get("/", (req, res) => {
    res.send("Veteran Case Manager API is running");

});


app.get("/api/cases", async (req,res) =>{
    const cases = await Case.find();
    res.json(cases);
})
app.get("/api/cases/:id", async(req,res) => {
    const foundCase = await Case.findById(req.params.id);

    if (!foundCase) {
        return res.status(404).json({error: "Case not found"})
    }

    res.json(foundCase);

});
app.post("/api/cases", async (req, res) => {
    try {
        const newCase = await Case.create(req.body);
        res.status(201).json(newCase);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
});
app.patch("/api/cases/:id", async (req,res) => {
    const updatedCase = await Case.findByIdAndUpdate(
        req.params.id,
        req.body,
        { returnDocument: "after", runValidators: true }
    );

    if (!updatedCase) {
        return res.status(404).json({error: "Case not found"});
    }

    res.json(updatedCase);
});
app.delete("/api/cases/:id", async(req,res) => {
    const deletedCase = await Case.findByIdAndDelete(req.params.id);

    if(!deletedCase) {
        return res.status(404).json({ error: "Case not found"});
    }

    res.json(deletedCase);
});
app.listen(5000, () => {
    console.log("Server running on port 5000")
});