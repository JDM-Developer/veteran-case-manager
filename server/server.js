const express = require("express");
const mongoose = require("mongoose");
const Case = require('./models/case');
const cors = require("cors");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

connectDB();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "Access token required."
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({
      error: "Invalid or expired token."
    });
  }
};

app.get("/", (req, res) => {
    res.send("Veteran Case Manager API is running");

});


app.get("/api/cases", authenticateToken, async (req,res) =>{
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

app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required."
      });
    }

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
    return res.status(409).json({
        error: "Email is already registered."
    });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: email,
      password: hashedPassword
    });

    res.status(201).json({
      id: user._id,
      email: user.email
    });

  } catch (error) {
    res.status(500).json({
      error: "Unable to register user."
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required."
      });
    }

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password."
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Invalid email or password."
      });
    }

    res.json({
      message: "Login successful.",
      token: token,
      id: user._id,
      email: user.email
    });

  } catch (error) {
    res.status(500).json({
      error: "Unable to log in."
    });
  }
});



app.listen(5000, () => {
    console.log("Server running on port 5000")
});