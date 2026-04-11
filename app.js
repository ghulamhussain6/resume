const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const client = require('prom-client'); // 1. Import the Prometheus client

const app = express();

// 2. Initialize Prometheus Metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register }); // Collects CPU, Memory, and Event Loop data automatically

app.use(cors({
    origin: 'https://hussain.js.org'
}));

const port = process.env.PORT || 3001;
const mongoUri = process.env.MONGO_URI || 'mongodb://mongodb-service:27017/resume_db';

mongoose.connect(mongoUri)
    .then(() => console.log("Connected to MongoDB!"))
    .catch(err => console.error("DB Connection Error:", err));

const VisitSchema = new mongoose.Schema({ count: Number });
const Visit = mongoose.model('Visit', VisitSchema);

// 3. Prometheus Metrics Route (This fixes the 404)
app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
});

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} to ${req.url}`);
    next();
});

app.get('/api/stats', async (req, res) => {
    try {
        let visitData = await Visit.findOne() || new Visit({ count: 0 });
        visitData.count++;
        await visitData.save();

        res.json({
            success: true,
            visitors: visitData.count,
            status: "Connected to MongoDB",
            infrastructure: process.env.INFRA_LABEL || "Development Mode"
        });
    } catch (err) {
        res.status(500).json({ success: false, error: "Database Error" });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
