import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";

function ChatWindow() {
    // 1. Get 'user' from Context so we can send the User ID
    const { prompt, setPrompt, reply, setReply, currThreadId, prevChats, setPrevChats, setNewChat, user } = useContext(MyContext);
    const [loading, setLoading] = useState(false);

    // --- CHAT FUNCTIONALITY ---
    const getReply = async () => {
        if (!prompt.trim()) return; // Prevent empty messages
        
        setLoading(true);
        setNewChat(false);
        console.log("message", prompt, "threadId", currThreadId);

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                message: prompt,
                threadId: currThreadId || Date.now().toString(),
                userId: user ? user.uid : "guest" // <--- SEND USER ID HERE
            })
        };

        try {
            const response = await fetch("http://localhost:8000/api/chat", options);
            const res = await response.json();
            console.log(res);
            setReply(res.reply);
        } catch(err) {
            console.log(err);
        }
        setLoading(false);
    }

    // Append new chat to prevChats history
    useEffect(() => {
        if (reply) {
            setPrevChats(prev => (
                [...prev, {
                    role: "user", 
                    content: prompt 
                }, {
                    role: "assistant",
                    content: reply
                }]
            ));
            setPrompt(""); // Clear input only after reply is received
        }
    }, [reply]);

    return (
        <div className="chatwindow">
            {/* Cleaned Navbar */}
            <div className="navbar">
                <span>MindSync-GPT <i className="fa-solid fa-chevron-down"></i></span>
            </div>

            <Chat />
            
            {/* Loading Spinner */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '10px' }}>
                <ScaleLoader color="#fff" loading={loading} height={20} />
            </div>

            <div className="chatInput">
                <div className="inputBox">
                    <input 
                        placeholder="Ask anything..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' ? getReply() : ''}
                    />
                    <div id="submit" onClick={getReply}>
                        <i className="fa-solid fa-paper-plane"></i>
                    </div>
                </div>
                <p className="info">
                    MindSync can make mistakes. Check important info. See Cookie Preferences.
                </p>
            </div>
        </div>
    )
}

export default ChatWindow;