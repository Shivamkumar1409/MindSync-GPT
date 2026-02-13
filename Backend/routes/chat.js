import express from "express";
import Thread from "../models/Thread.js";
import getGeminiResponse from "../utils/gemini.js";

const router = express.Router();

// --- Test Route ---
router.post("/test", async (req, res) => {
    try {
        const thread = new Thread({
            threadId: "abc",
            userId: "test-user", 
            title: "Testing New Thread"
        });

        const response = await thread.save();
        res.send(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to save in DB" });
    }
});

// --- Get All Threads (Filtered by User) ---
router.get("/thread", async (req, res) => {
    // 1. Get userId from Query String (e.g., /api/thread?userId=123)
    const userId = req.query.userId;

    try {
        // 2. Filter: Only find threads that match this userId (or 'guest')
        const threads = await Thread.find({ userId: userId || "guest" }).sort({ updatedAt: -1 });
        res.json(threads);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch threads" });
    }
})

// --- Get Single Thread Messages ---
router.get("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;

    try {
        const thread = await Thread.findOne({threadId});
        if (!thread) {
            return res.status(404).json({ error: "Thread not found"});
        }
        res.json(thread.messages);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch chat" });
    }
});

// --- Delete Thread ---
router.delete("/thread/:threadId", async (req, res) => {
    const {threadId} = req.params;
    try {
        const deletedThread = await Thread.findOneAndDelete({threadId});

        if(!deletedThread) {
            return res.status(404).json({error: "Thread not found"});
        }

        res.status(200).json({success : "Thread deleted successfully"});

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to delete thread" });
    }
});

// --- Chat Route (Saves User ID) ---
router.post("/chat", async (req, res) => {
    // 3. Destructure userId from the request body
    const {threadId, message, userId} = req.body;

    if(!threadId || !message) {
        return res.status(400).json({error: "missing required fields"});
    }

    // Default to "guest" if no user is logged in
    const activeUserId = userId || "guest";

    try {
        let thread = await Thread.findOne({threadId});

        if(!thread) {
            // Create a new thread in Db WITH the userId
            thread = new Thread({
                threadId,
                userId: activeUserId, // <--- SAVING THE ID HERE
                title: message,
                messages: [{role: "user", content: message}]
            });
        } else {
            thread.messages.push({role: "user", content: message});
        }

        const assistentReply = await getGeminiResponse(message);
        
        thread.messages.push({role: "assistant", content: assistentReply});

        thread.updatedAt = Date.now();
        await thread.save();

        res.json({reply: assistentReply});
        
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "something went wrong"});
    }
});

export default router;