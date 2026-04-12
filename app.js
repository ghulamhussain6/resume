const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const client = require('prom-client');

const app = express();

// 1. Initialize Prometheus Metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// 2. Define a custom Gauge for visitors
const visitorGauge = new client.Gauge({
    name: 'resume_app_total_visitors',
    help: 'Total visitor count from MongoDB'
});
register.registerMetric(visitorGauge);

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

// 3. Updated Metrics Route to fetch DB count before responding
app.get('/metrics', async (req, res) => {
    try {
        // Fetch the current count from DB and update the Prometheus gauge
        const visitData = await Visit.findOne();
        if (visitData) {
            visitorGauge.set(visitData.count);
        }
        
        res.setHeader('Content-Type', register.contentType);
        res.send(await register.metrics());
    } catch (err) {
        console.error("Error updating metrics:", err);
        res.status(500).send(err);
    }
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
