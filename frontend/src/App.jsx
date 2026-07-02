import { useState, useRef, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './index.css';

function App() {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    try {
      let error;
      if (isLoginMode) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        error = signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        error = signUpError;
        if (!error) {
          alert('Check your email for the confirmation link!');
        }
      }

      if (error) throw error;
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Error: ' + data.detail }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection failed. Is the backend running?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="app-container">
        <div className="login-card glass">
          <div className="login-header">
            <h1>{isLoginMode ? 'Welcome Back' : 'Create Account'}</h1>
            <p>{isLoginMode ? 'Sign in to continue to Chatbot' : 'Sign up to start chatting'}</p>
          </div>
          <form onSubmit={handleAuth} className="login-form">
            {authError && <div className="auth-error">{authError}</div>}
            
            <div className="input-group">
              <label>Email</label>
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required 
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="primary-btn" disabled={isLoading}>
              {isLoading ? 'Loading...' : (isLoginMode ? 'Sign In' : 'Sign Up')}
            </button>
            
            <button 
              type="button" 
              className="toggle-auth-btn"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setAuthError('');
              }}
            >
              {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="chat-interface glass">
        <div className="chat-header">
          <h2>Kraionyx Chatbot</h2>
          <div className="header-actions">
            <span className="user-email">{session.user.email}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
        
        <div className="messages-container">
          {messages.length === 0 && (
            <div className="empty-state">
              <div className="wave-emoji">👋</div>
              <h3>Start a conversation</h3>
              <p>Type a message below to chat with the Cerebras AI.</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-wrapper ${msg.role}`}>
              <div className="message-bubble">
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-wrapper assistant">
              <div className="message-bubble typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="message-input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()} className="send-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
