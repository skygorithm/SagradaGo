import React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  Card,
  CardContent,
  IconButton,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

export default function CardPopup({
  open = false,
  onClose = () => {},
  title = "",
  children,
}) {
  const theme = useTheme();
  const isTiny = useMediaQuery("(max-width:360px)");

  return (
    <Dialog
      open={Boolean(open)}
      onClose={onClose}
      fullScreen={isTiny}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
          borderRadius: isTiny ? 0 : 3,
        },
      }}
    >
      <Card sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: "1px solid #eee",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img
              src="/images/sagrada.png"
              alt="Sagrada Familia Parish Logo"
              style={{ height: 40 }}
            />
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: "1rem", sm: "1.1rem" }, fontWeight: 600 }}
            >
              {title}
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            size="small"
            edge="end"
            aria-label="close"
            sx={{ "&:hover": { backgroundColor: "rgba(0,0,0,0.05)" } }}
          >
            ✕
          </IconButton>
        </Box>

        {/* Body */}
        <CardContent
          sx={{
            flex: 1,
            overflowY: "auto",
            p: { xs: 2, sm: 3 },
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {children}
        </CardContent>
      </Card>
    </Dialog>
  );
}

CardPopup.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
};