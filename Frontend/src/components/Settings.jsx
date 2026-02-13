import React, { useContext, useState, useEffect, useRef } from 'react';
import { MyContext } from '../MyContext';
import './Settings.css';

const Settings = ({ onClose }) => {
    const { user, setAllThreads, setPrevChats, setNewChat, theme, toggleTheme } = useContext(MyContext);
    const [clearing, setClearing] = useState(false);
    
    // 1. Create a Reference for the white modal box
    const modalRef = useRef(null);

    // 2. Listen for clicks outside the box
    useEffect(() => {
        const handleClickOutside = (event) => {
            // If the modal exists AND the click was NOT inside it -> Close
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
    
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    const handleClearHistory = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete ALL your chat history? This cannot be undone.");
        if (!confirmDelete) return;

        setClearing(true);
        try {
            const activeUserId = user ? user.uid : "guest";
            await fetch("http://localhost:8000/api/thread", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: activeUserId })
            });

            setAllThreads([]);
            setPrevChats([]);
            setNewChat(true);
            onClose(); 
        } catch (error) {
            console.error("Failed to clear history:", error);
            alert("Error clearing history.");
        }
        setClearing(false);
    };

    return (
        <div className="settings-overlay">
            {/* 3. Attach the Ref to the modal content */}
            <div className="settings-modal" ref={modalRef}>
                <div className="settings-header">
                    <h2>Settings</h2>
                    <button className="close-btn-icon" onClick={onClose}>&times;</button>
                </div>

                <div className="settings-section">
                    <h3>General</h3>
                    <div className="setting-item">
                        <span>Theme</span>
                        <select 
                            className="theme-select" 
                            value={theme} 
                            onChange={toggleTheme}
                        >
                            <option value="dark">Dark</option>
                            <option value="light">Light</option>
                        </select>
                    </div>
                </div>

                <div className="settings-section danger-zone">
                    <h3>Data Controls</h3>
                    <div className="setting-item">
                        <span>Clear all chats</span>
                        <button 
                            className="delete-all-btn" 
                            onClick={handleClearHistory}
                            disabled={clearing}
                        >
                            {clearing ? "Clearing..." : "Delete All"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;