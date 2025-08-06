import { Alert, Box, Button, DialogActions, DialogContent, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { supabase } from "../../config/supabase";

const ForgotPasswordDialog = ({
    onClose,
    toggleForgotPassword,
}) => {
    const [email, setEmail] = useState('');
    const [showForgotPasswordMessage, setShowForgotPasswordMessage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!email) {
            setError('Email is required');
            setLoading(false);
            return;
        }
        
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/set-password`
            });
            // Simulate API call to send reset password email
            if (error) {
                setError(error.message);
            } else {
                setShowForgotPasswordMessage(true);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error('Reset password error:', err);
        } finally {
            setLoading(false);
        }
    }
    return (
        <>
            
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                {showForgotPasswordMessage ? (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Please check your email
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        An email has been sent to {email}. Click the link on the email to reset your password.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => {
                            onClose();
                        }}
                        sx={{ bgcolor: '#E1D5B8', '&:hover': { bgcolor: '#d4c4a1' } }}
                    >
                        Close
                    </Button>
                    </Box>
                ) : (
                    <form onSubmit={handleForgotPassword}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Enter your email address to reset your password.
                        </Typography>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal"
                            required
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 2, bgcolor: '#E1D5B8', '&:hover': { bgcolor: '#d4c4a1' } }}
                            disabled={loading}
                        >
                            {loading ? 'Sending Link...' : 'Send Reset Link'}
                        </Button>
                    </form>
                )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: 'center', flexDirection: 'column' }}>
                <Button
                onClick={toggleForgotPassword}
                sx={{ color: '#6B5F32' }}
                disabled={loading}
                >
                Login to your account
                </Button>
            </DialogActions>
        </>
    ) ;

}
export default ForgotPasswordDialog;