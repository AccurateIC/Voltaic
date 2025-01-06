// src/server.js

import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();

// middleware
app.use(cors);
app.use(express.json());

// basic guard rails
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
});