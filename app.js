const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');


// 1.This tells your server it's okay to accept requests from your new domain
app.use(cors({
    origin: 'https://hussain.js.org'
}));

// 2. Define the Port (This was missing!)
const port = process.env.PORT || 3001;

// 3. Connect to MongoDB using the URI from environment variables
const mongoUri = process.env.MONGO_URI || 'mongodb://mongodb-service:27017/resume_db';

mongoose.connect(mongoUri)
  .then(() => console.log("Connected to MongoDB!"))
  .catch(err => console.error("DB Connection Error:", err));

// 4. Define a simple Schema for tracking visits
const VisitSchema = new mongoose.Schema({ count: Number });
const Visit = mongoose.model('Visit', VisitSchema);

// 5. Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} to ${req.url}`);
    next();
});

// 6. Main Route
app.get('/api/stats', async (req, res) => {
    try {
        let visitData = await Visit.findOne() || new Visit({ count: 0 });
        visitData.count++;
        await visitData.save();

        // Send JSON so the GitHub frontend can "read" the numbers
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
// 7. Start Server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
