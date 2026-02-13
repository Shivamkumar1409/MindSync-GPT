import { createContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { auth, googleProvider } from "./firebase"; 
import { 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from "firebase/auth";

export const MyContext = createContext();

export const ContextProvider = ({ children }) => {
    // --- 1. CHAT & THREAD STATE ---
    const [prompt, setPrompt] = useState("");
    const [reply, setReply] = useState(null);
    const [currThreadId, setCurrThreadId] = useState(uuidv4());
    const [prevChats, setPrevChats] = useState([]); 
    const [allThreads, setAllThreads] = useState([]); 
    const [newChat, setNewChat] = useState(true);

    // --- 2. AUTHENTICATION STATE ---
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- 3. THEME STATE (NEW ADDITION) ---
    // Check localStorage for saved theme, default to "dark"
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    };

    // Apply the theme to the HTML body whenever it changes
    useEffect(() => {
        document.body.setAttribute("data-theme", theme);
    }, [theme]);

    // --- 4. AUTH LISTENERS ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- 5. AUTH FUNCTIONS ---
    const loginWithGoogle = () => {
        return signInWithPopup(auth, googleProvider);
    };

    const loginWithEmail = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    }

    const signupWithEmail = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    const logout = () => {
        return signOut(auth);
    };

    // --- 6. BUNDLE EVERYTHING ---
    const providerValues = {
        // Chat Props
        prompt, setPrompt,
        reply, setReply,
        currThreadId, setCurrThreadId,
        prevChats, setPrevChats,
        allThreads, setAllThreads,
        newChat, setNewChat,
        
        // Auth Props
        user, loading,
        loginWithGoogle, 
        loginWithEmail,
        signupWithEmail,
        logout,

        // Theme Props (NEW)
        theme, toggleTheme 
    };

    return (
        <MyContext.Provider value={providerValues}>
            {!loading && children} 
        </MyContext.Provider>
    )
}