import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  CircularProgress, 
  Alert,
  Chip,
  Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import DatabaseIcon from '@mui/icons-material/Storage';
import RefreshIcon from '@mui/icons-material/Refresh';
import Markdown from 'react-markdown';

/**
 * Enhanced Chatbot Component with Database Integration
 * Provides AI assistance with real-time parish data while maintaining security
 */
const Chatbot = () => {
  // ===== State Management =====
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'model',
      parts: [{ text: `# Welcome to SagradaGo Parish Assistant! 🏛️\n\nI'm your virtual parish assistant with access to **real-time parish data**. I can help you with:\n\n✅ **Current church events and schedules**\n✅ **Available sacrament services**\n✅ **Mass times and parish activities**\n✅ **Donation and volunteer opportunities**\n✅ **Using SagradaGo system features**\n\n🔒 **Privacy Note:** I only access public parish information and never share personal details of parishioners.\n\nHow may I assist you today?`}]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [databaseConnected, setDatabaseConnected] = useState(null);
  const [lastContextUpdate, setLastContextUpdate] = useState(null);
  const messagesEndRef = useRef(null);

  // ===== Effects =====
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Check database connection status on component mount
  useEffect(() => {
    if (open) {
      checkHealthStatus();
    }
  }, [open]);

  // ===== API Configuration =====

  const getApiBaseUrl = () => {
    const hostname =
      typeof window !== "undefined" ? window.location.hostname : "localhost";
    const isLocalhost =
      hostname === "localhost" || hostname === "127.0.0.1";

    if (isLocalhost) {
      console.log("Using local backend: http://localhost:5000");
      return "http://localhost:5000";
    }

    const apiUrl =
      process.env.REACT_APP_API_URL ||
      "https://sagradago-backend.onrender.com"; // fallback for Render
    console.log("Using production backend:", apiUrl);
    return apiUrl;
  };

  const API_BASE_URL = getApiBaseUrl();
  const API_GEMINI_URL = `${API_BASE_URL}/api/gemini`;
  const API_HEALTH_URL = `${API_BASE_URL}/api/health`;

  // ===== Helper Functions =====
  /**
   * Check server health and database connectivity
   */
  const checkHealthStatus = async () => {
    try {
      const response = await fetch(API_HEALTH_URL);
      if (response.ok) {
        const healthData = await response.json();
        setDatabaseConnected(healthData.databaseConnected);
        setLastContextUpdate(new Date().toISOString());
        console.log('Health check successful:', healthData);
      } else {
        setDatabaseConnected(false);
        console.warn('Health check failed:', response.status);
      }
    } catch (error) {
      console.error('Health check error:', error);
      setDatabaseConnected(false);
    }
  };

  /**
   * Handle manual refresh of database connection
   */
  const handleRefreshConnection = async () => {
    setLoading(true);
    await checkHealthStatus();
    setLoading(false);
    
    // Add system message about refresh
    const refreshMessage = {
      role: 'model',
      parts: [{ text: `🔄 **Database connection refreshed!** I now have the latest parish information available.` }]
    };
    setMessages(prev => [...prev, refreshMessage]);
  };

  // ===== Message Handling =====
  /**
   * Sends a message to the enhanced Gemini API with database context
   * @param {string} message - The message to send
   */
  const sendMessage = async (message) => {
    if (!message.trim()) return;

    try {
      setLoading(true);
      setError(null);
      console.log('[Enhanced Chatbot] Sending message with database context:', message);

      // Add user message to chat
      const userMessage = {
        role: 'user',
        parts: [{ text: message }]
      };
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      // Build conversation history
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.parts[0].text }]
      }));

      // Check server health first
      try {
        const healthCheck = await fetch(API_HEALTH_URL);
        if (!healthCheck.ok) {
          throw new Error('Server is not healthy. Please try again later.');
        }
        
        const healthData = await healthCheck.json();
        setDatabaseConnected(healthData.databaseConnected);
      } catch (error) {
        console.error('[Enhanced Chatbot] Health check failed:', error);
        throw new Error('Cannot connect to the server. Please make sure the server is running.');
      }

      // Make API request to enhanced endpoint
      const response = await fetch(API_GEMINI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, history }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error('[Enhanced Chatbot] Server error:', errorData);
          throw new Error(errorData.error || 'Failed to process message');
        } else {
          const errorText = await response.text();
          console.error('[Enhanced Chatbot] Server returned non-JSON response:', errorText);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();

      // Add AI response to chat
      const aiMessage = {
        role: 'model',
        parts: [{ text: data.reply }]
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Update last context update time
      setLastContextUpdate(new Date().toISOString());

    } catch (error) {
      console.error('[Enhanced Chatbot] Error occurred:', error);
      let errorMessage = error.message;
      
      if (error.message === 'Failed to fetch') {
        errorMessage = 'Cannot connect to the server. Please check your internet connection and try again.';
      }
      
      setError(errorMessage);
      
      // Add error message to chat
      const errorResponse = {
        role: 'model',
        parts: [{ text: `❌ **Error:** ${errorMessage}\n\nPlease try again or contact the parish office for assistance.` }]
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  // ===== Quick Action Buttons =====
  const quickActions = [
    { label: 'Upcoming Events', query: 'What events are coming up at the parish?' },
    { label: 'Mass Schedule', query: 'When are the mass times?' },
    { label: 'Sacraments', query: 'What sacrament services are available?' },
    { label: 'How to Donate', query: 'How can I make a donation to the parish?' }
  ];

  const handleQuickAction = (query) => {
    setInput(query);
    sendMessage(query);
  };

  // ===== Render Methods =====
  /**
   * Renders a single message in the chat with enhanced styling
   */
  const renderMessage = (msg, i) => (
    <Box
      key={i}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
        gap: 0.5,
        mb: 1
      }}
    >
      <Box sx={{
        background: msg.role === 'user' ? '#E1D5B8' : '#f8f9fa',
        color: '#222',
        borderRadius: 2,
        p: 2,
        maxWidth: '85%',
        wordBreak: 'break-word',
        border: msg.role === 'model' ? '1px solid #e0e0e0' : 'none',
        boxShadow: msg.role === 'model' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
      }}>
        <Markdown
          components={{
            // Custom styling for markdown elements
            h1: ({children}) => <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#6B5F32' }}>{children}</Typography>,
            h2: ({children}) => <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, color: '#6B5F32' }}>{children}</Typography>,
            p: ({children}) => <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.6 }}>{children}</Typography>,
            ul: ({children}) => <Box component="ul" sx={{ pl: 2, mb: 0.5 }}>{children}</Box>,
            li: ({children}) => <Typography component="li" variant="body2" sx={{ mb: 0.25 }}>{children}</Typography>
          }}
        >
          {msg.parts[0].text}
        </Markdown>
      </Box>
    </Box>
  );

  /**
   * Renders the status bar with database connection info
   */
  const renderStatusBar = () => (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      p: 1,
      backgroundColor: databaseConnected ? '#e8f5e8' : '#fff3e0',
      borderBottom: '1px solid #eee'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DatabaseIcon 
          sx={{ 
            fontSize: 16, 
            color: databaseConnected ? '#4caf50' : '#ff9800' 
          }} 
        />
        <Chip
          label={databaseConnected ? 'Live Data Connected' : 'Limited Data'}
          size="small"
          color={databaseConnected ? 'success' : 'warning'}
          variant="outlined"
        />
      </Box>
      
      <Tooltip title="Refresh database connection">
        <Button
          size="small"
          onClick={handleRefreshConnection}
          disabled={loading}
          sx={{ minWidth: 'auto', p: 0.5 }}
        >
          <RefreshIcon sx={{ fontSize: 16 }} />
        </Button>
      </Tooltip>
    </Box>
  );

  // ===== Main Render =====
  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      {open ? (
        // Enhanced Chat Window
        <Box sx={{
          width: 380,
          height: 520,
          background: 'white',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Enhanced Header */}
          <Box sx={{
            background: 'linear-gradient(135deg, #E1D5B8 0%, #d1c5a8 100%)',
            color: 'white',
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#6B5F32', mb: 0.5 }}>
                Parish Assistant
              </Typography>
              <Typography variant="caption" sx={{ color: '#8B7D4F', opacity: 0.9 }}>
                {databaseConnected ? 'Connected to live parish data' : 'Limited data mode'}
              </Typography>
            </Box>
            <Button 
              onClick={() => setOpen(false)} 
              sx={{ color: '#6B5F32', minWidth: 'auto' }}
            >
              <CloseIcon />
            </Button>
          </Box>

          {/* Status Bar */}
          {renderStatusBar()}

          {/* Messages */}
          <Box sx={{
            flex: 1,
            p: 2,
            overflowY: 'auto',
            background: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5
          }}>
            {messages.map(renderMessage)}
            
            {loading && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                p: 2,
                background: '#f0f0f0',
                borderRadius: 2,
                alignSelf: 'flex-start'
              }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  {databaseConnected ? 'Accessing parish database...' : 'Processing your request...'}
                </Typography>
              </Box>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            )}
            
            <div ref={messagesEndRef} />
          </Box>

          {/* Quick Actions */}
          {messages.length <= 1 && !loading && (
            <Box sx={{ p: 1, borderTop: '1px solid #eee', backgroundColor: '#fff' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Quick actions:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {quickActions.map((action, index) => (
                  <Chip
                    key={index}
                    label={action.label}
                    size="small"
                    onClick={() => handleQuickAction(action.query)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#E1D5B8' }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Enhanced Input */}
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            sx={{
              display: 'flex',
              gap: 1,
              p: 2,
              borderTop: '1px solid #eee',
              background: '#fff'
            }}
          >
            <TextField
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about parish services, events, or schedules..."
              variant="outlined"
              size="small"
              fullWidth
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: '#f8f9fa'
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !input.trim()}
              sx={{
                minWidth: 'auto',
                px: 2,
                borderRadius: 3,
                backgroundColor: '#E1D5B8',
                '&:hover': {
                  backgroundColor: '#d1c5a8'
                }
              }}
            >
              <SendIcon />
            </Button>
          </Box>
        </Box>
      ) : (
        // Enhanced Chat Button
        <Button
          onClick={() => setOpen(true)}
          variant="contained"
          startIcon={<ChatIcon />}
          sx={{
            backgroundColor: '#E1D5B8',
            color: 'black',
            borderRadius: 4,
            px: 3,
            py: 1.5,
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            '&:hover': {
              backgroundColor: '#d1c5a8',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Parish Assistant
        </Button>
      )}
    </Box>
  );
};

export default Chatbot;