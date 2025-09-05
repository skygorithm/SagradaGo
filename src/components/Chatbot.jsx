import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import Markdown from 'react-markdown'

/**
 * Chatbot Component
 * A floating chat interface that allows users to interact with the Gemini AI
 */
const Chatbot = () => {
  // ===== State Management =====
  const [open, setOpen] = useState(false); // Controls chat window visibility
  const [messages, setMessages] = useState([
    { 
      role: 'model',
      parts: [{ text: `# Welcome to SagradaGo Parish Information System!\n\nI can help you with:\n\n- • Mass schedules and events\n- • Parish activities and programs\n- • Sacramental services\n- • Donations and offerings\n- • General parish information\n\nHow may I assist you today?`}]
    }
  ]);
  const [input, setInput] = useState(''); // Current input field value
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [error, setError] = useState(null); // Error state for displaying error messages
  const messagesEndRef = useRef(null); // Reference for auto-scrolling to latest message

  // ===== Effects =====
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

// ===== Message Handling =====
  // Resolve API base URL depending on environment (local dev uses server port, prod uses configured URL)
  const getApiBaseUrl = () => {
    // Use environment variable for API URL
    const apiUrl = process.env.REACT_APP_API_URL || 'https://sagradago.onrender.com';
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    if (isLocalhost) {
      console.log('Using local development API endpoint: http://localhost:5001');
      return 'http://localhost:5001';
    }

    console.log('Using production API endpoint:', apiUrl);
    return apiUrl;
  };
  const API_GEMINI_URL = getApiBaseUrl() + '/api/gemini';
  const API_HEALTH_URL = getApiBaseUrl() + '/api/health';
  /**
   * Sends a message to the Gemini API and handles the response
   * @param {string} message - The message to send
   */
  const sendMessage = async (message) => {
    if (!message.trim()) return;

    try {
      setLoading(true);
      setError(null);
      console.log('[Chatbot Debug] Sending message', message);

      // Add user message to chat
      const userMessage = {
        role: 'user',
        parts: [{ text: message }]
      };
      setMessages(prev => [...prev, userMessage]);
      setInput(''); // Clear input after sending

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
      } catch (error) {
        console.error('[Chatbot Debug] Health check failed:', error);
        throw new Error('Cannot connect to the server. Please make sure the server is running.');
      }

      // Make API request
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
          console.error('[Chatbot Debug] Server error:', errorData);
          throw new Error(errorData.error || 'Failed to process message');
        } else {
          const errorText = await response.text();
          console.error('[Chatbot Debug] Server returned non-JSON response:', errorText);
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
    } catch (error) {
      console.error('[Chatbot Debug] Error occurred', error);
      let errorMessage = error.message;
      
      if (error.message === 'Failed to fetch') {
        errorMessage = 'Cannot connect to the server. Please make sure the server is running.';
      }
      
      setError(errorMessage);
      
      // Add error message to chat
      const errorResponse = {
        role: 'model',
        parts: [{ text: `Error: ${errorMessage}` }]
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  // ===== Render Methods =====
  /**
   * Renders a single message in the chat
   * @param {Object} msg - The message to render
   * @param {number} i - The message index
   */
  const renderMessage = (msg, i) => (
    <Box
      key={i}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
        gap: 0.5
      }}
    >
      <Box sx={{
        background: msg.role === 'user' ? '#E1D5B8' : '#e3e3e3',
        color: '#222',
        borderRadius: 2,
        p: 1.5,
        maxWidth: '80%',
        wordBreak: 'break-word'
      }}>
        {/* <Typography variant="body1">{msg.parts[0].text}</Typography> */}
        <Markdown>{msg.parts[0].text}</Markdown>
      </Box>
    </Box>
  );

  // ===== Main Render =====
  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      {open ? (
        // Chat Window
        <Box sx={{
          width: 340,
          height: 480,
          background: 'white',
          borderRadius: 2,
          boxShadow: '0 2px 16px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <Box sx={{
            background: '#E1D5B8',
            color: 'white',
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#6B5F32' }}>
              Parish Assistant
            </Typography>
            <Button onClick={() => setOpen(false)} sx={{ color: 'white', minWidth: 'auto' }}>
              <CloseIcon />
            </Button>
          </Box>

          {/* Messages */}
          <Box sx={{
            flex: 1,
            p: 2,
            overflowY: 'auto',
            background: '#f7f7f7',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}>
            {messages.map(renderMessage)}
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Assistant is typing...
                </Typography>
              </Box>
            )}
            {error && (
              <Typography variant="body2" color="error" sx={{ p: 1 }}>
                {error}
              </Typography>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            sx={{
              display: 'flex',
              gap: 1,
              p: 1,
              borderTop: '1px solid #eee',
              background: '#fff'
            }}
          >
            <TextField
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              variant="outlined"
              size="small"
              fullWidth
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f7f7f7'
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
        // Chat Button
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
            '&:hover': {
              backgroundColor: '#d1c5a8'
            }
          }}
        >
          Ask Parish Assistant
        </Button>
      )}
    </Box>
  );
};

export default Chatbot;