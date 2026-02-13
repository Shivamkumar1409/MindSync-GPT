import React, { useContext, useState } from 'react';
import { MyContext } from '../MyContext';
import './Login.css';

const Login = ({ onClose }) => {
    const { loginWithGoogle, loginWithEmail, signupWithEmail } = useContext(MyContext);
    
    const [isSignup, setIsSignup] = useState(false); // Toggle state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        try {
            if (isSignup) {
                await signupWithEmail(email, password);
            } else {
                await loginWithEmail(email, password);
            }
            onClose(); // Close on success
        } catch (err) {
            // Simplify error message
            setError(err.message.replace("Firebase: ", ""));
        }
    };

    return (
        <div className="login-overlay">
            <div className="login-modal">
                <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>
                <p>Log in to save your chat history.</p>

                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleSubmit} className="login-form">
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                    />
                    <button type="submit" className="auth-btn">
                        {isSignup ? "Sign Up" : "Log In"}
                    </button>
                </form>

                <div className="divider">OR</div>

                <button className="google-btn" onClick={handleGoogleLogin}>
                    <i className="fa-brands fa-google"></i> Continue with Google
                </button>
                
                <p className="toggle-text">
                    {isSignup ? "Already have an account? " : "Don't have an account? "}
                    <span onClick={() => setIsSignup(!isSignup)}>
                        {isSignup ? "Log In" : "Sign Up"}
                    </span>
                </p>

                <button className="close-btn" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default Login;