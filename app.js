const express = require('express');
const mongoose = require('mongoose');
const app = express();

// 1. Define the Port (This was missing!)
const port = process.env.PORT || 3001;

// 2. Connect to MongoDB using the URI from environment variables
const mongoUri = process.env.MONGO_URI || 'mongodb://mongodb-service:27017/resume_db';

mongoose.connect(mongoUri)
  .then(() => console.log("Connected to MongoDB!"))
  .catch(err => console.error("DB Connection Error:", err));

// 3. Define a simple Schema for tracking visits
const VisitSchema = new mongoose.Schema({ count: Number });
const Visit = mongoose.model('Visit', VisitSchema);

// 4. Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} to ${req.url}`);
    next();
});

// 5. Main Route
app.get('/', async (req, res) => {
    try {
        // Increment the visit counter in the DB
        let visitData = await Visit.findOne();
        if (!visitData) {
            visitData = new Visit({ count: 1 });
        } else {
            visitData.count++;
        }
        await visitData.save();

        res.send(`
            <html>
                <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h1>🚀 Cloud-Native DevOps Engineer</h1>
                    <p>Status: <span style="color: green;"><strong>Connected to MongoDB</strong></span></p>
                    <div style="font-size: 2em; margin: 20px; color: #27ae60;">
                        Total Visitors: ${visitData.count}
                    </div>
                    <p>Data is persisting in a Docker Volume.</p>
                </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send("Database Error");
    }
});

// 6. Start Server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
