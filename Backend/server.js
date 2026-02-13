import express from 'express';
import "dotenv/config";
import cors from 'cors';
import mongoose from 'mongoose';
import chatRoutes from './routes/chat.js'; // Ensure this file exists in /routes/chat.js

const app = express();
const PORT = 8000;

// Middleware
app.use(express.json());
app.use(cors());
app.use("/api", chatRoutes);

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing in .env file");
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to Database!");
    } catch (err) {
        console.error("Failed to connect to DB:", err.message);
        process.exit(1); // Stop server if DB fails
    }
}

app.post("/test", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required." });
    }

    // Safety Check for API Key
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Server Error: Gemini API Key is missing." });
    }

    const MODEL_NAME = "gemini-2.5-flash"; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await response.json();

        // Handle Gemini API Errors
        if (data.error) {
            console.error("Gemini API Error:", data.error);
            return res.status(500).json(data.error);
        }

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const reply = data.candidates[0].content.parts[0].text;
            res.json({ reply: reply }); 

        } else {
            console.log("No text in response:", data);
            res.status(500).json({ error: "No valid response from AI." });
        }

    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();