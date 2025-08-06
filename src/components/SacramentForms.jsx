import { Box, Typography } from "@mui/material";
import CardPopup from "../pages/CardPopUp";

const SacramentFormCard = ({ cardOpen, setCardOpen, title, children  }) => {
    // Used to display a card popup for sacrament forms
    return (
        <CardPopup open={cardOpen} onClose={() => setCardOpen(false)} title={title} maxWidth="md" >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2,  maxHeight: '70vh', overflowY: 'auto' }}>
                {children}
            </Box>
      </CardPopup>
    );
}

export default SacramentFormCard;