import "./Sidebar.css";
import { useContext, useEffect, useState, useRef } from "react";
import { MyContext } from "./MyContext.jsx";
import { v4 as uuidv4 } from "uuid";
import Login from "./components/Login"; 
import Settings from "./components/Settings"; // <--- 1. ENSURE IMPORT IS HERE

function Sidebar() {
    const {
        allThreads, setAllThreads, currThreadId, setNewChat, 
        setPrompt, setReply, setCurrThreadId, setPrevChats,
        user, logout 
    } = useContext(MyContext);

    const [showLogin, setShowLogin] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showSettings, setShowSettings] = useState(false); // <--- 2. ENSURE STATE IS HERE
    
    // Menu Reference for "Click Outside" logic
    const menuRef = useRef(null);

    // Click Outside Listener
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showMenu && menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMenu]);

    // Fetch Threads
    const getThreads = async () => {
        const activeUserId = user ? user.uid : "guest";
        try {
            const response = await fetch(`http://localhost:8000/api/thread?userId=${activeUserId}`);
            const res = await response.json();
            const filteredData = res.map(thread => ({ 
                threadId: thread.threadId, 
                title: thread.title 
            }));
            setAllThreads(filteredData);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getThreads();
    }, [currThreadId, user]);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv4());
        setPrevChats([]);
    }

    const changeThread = async (newthreadId) => {
        setCurrThreadId(newthreadId);
        try {
            const response = await fetch(`http://localhost:8000/api/thread/${newthreadId}`);
            const res = await response.json();
            setPrevChats(res);
            setNewChat(false);
            setReply(null);
        } catch (err) {
            console.log(err);
        }
    }

    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/thread/${threadId}`, {
                method: "DELETE"
            });
            const res = await response.json();
            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));
            if (threadId === currThreadId) {
                createNewChat();
            }
        } catch (err) {
            console.log(err);
        }
    }

    const handleLogout = async () => {
        await logout();
        setShowMenu(false);
    }

    return (
        <section className="sidebar">
            <button onClick={createNewChat}>
                <img src="src/assets/MindSync.png" alt="logo" className="logo"></img>
                <span><i className="fa-solid fa-pen-to-square"></i></span>
            </button>

            <ul className="history">
                {allThreads.map((thread, idx) => (
                    <li key={idx}
                        onClick={(e) => changeThread(thread.threadId)}
                        className={thread.threadId === currThreadId ? "highlighted" : ""}
                    >
                        {thread.title}
                        <i className="fa-solid fa-trash"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteThread(thread.threadId);
                            }}
                        ></i>
                    </li>
                ))}
            </ul>

            {/* --- MODALS --- */}
            {showLogin && <Login onClose={() => setShowLogin(false)} />}
            
            {/* 3. RENDER THE SETTINGS MODAL HERE */}
            {showSettings && <Settings onClose={() => setShowSettings(false)} />}

            {/* Bottom Profile Section */}
            <div className="bottom-section" ref={menuRef}>
                
                <div 
                    className="profile-item" 
                    onClick={() => user ? setShowMenu(!showMenu) : setShowLogin(true)}
                >
                    {user ? (
                        <>
                            <img 
                                src={user.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                                alt="User" 
                                className="user-avatar"
                            />
                            <span style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user.displayName || "User"}
                            </span>
                        </>
                    ) : (
                        <>
                            <div style={{ width: '30px', textAlign: 'center' }}><i className="fa-solid fa-user"></i></div>
                            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Log In</span>
                        </>
                    )}
                </div>

                {showMenu && user && (
                    <div className="profile-menu">
                        {/* 4. CONNECT THE BUTTON CLICK HERE */}
                        <div 
                            className="menu-item" 
                            onClick={() => { 
                                setShowSettings(true); // Open Settings
                                setShowMenu(false);    // Close Menu
                            }}
                        >
                            <i className="fa-solid fa-gear"></i> Settings
                        </div>

                        <div className="menu-item">
                            <i className="fa-solid fa-bolt"></i> Upgrade Plan
                        </div>
                        <div className="menu-item logout" onClick={handleLogout}>
                            <i className="fa-solid fa-right-from-bracket"></i> Log Out
                        </div>
                    </div>
                )}

                <div className="sign">
                    <p>Made with &hearts; by Shivam</p>
                </div> 
            </div>   
        </section>
    )
}

export default Sidebar;