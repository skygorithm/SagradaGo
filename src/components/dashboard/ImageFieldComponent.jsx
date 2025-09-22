import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import { isImageUrl } from "../../utils/admin-functions/isImageUrl";
import { downloadImage } from "../../utils/admin-functions/downloadImage";
import { removeImageFromStorage } from "../../utils/admin-functions/removeImage";
import blobUrlToFile from "../../utils/blobUrlToFile";
import { supabase } from "../../config/supabase";

// Upload helper
async function uploadFileToStorage(file, field) {
  const ext = file.name.split(".").pop();
  const filePath = `${field}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("certificates")
    .upload(filePath, file, { upsert: true });

  if (error) throw new Error("Upload error: " + error.message);

  const { data } = supabase.storage.from("certificates").getPublicUrl(filePath);
  return data.publicUrl;
}

export default function ImageFieldComponent({ field, value, onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    let file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    try {
      if (!(file instanceof File)) {
        file = await blobUrlToFile(
          URL.createObjectURL(file),
          `${field}_${Date.now()}.png`
        );
      }
      const publicUrl = await uploadFileToStorage(file, field);
      onChange(publicUrl);
    } catch (err) {
      alert("Image upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (window.confirm("Remove image?")) {
      if (value) await removeImageFromStorage(value);
      onChange(null);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2">{field}</Typography>

      {value && isImageUrl(value) ? (
        <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2, mt: 1 }}>
          <img
            src={value}
            alt={field}
            style={{
              width: 100,
              height: 100,
              objectFit: "cover",
              borderRadius: 4,
              border: "1px solid #eee",
            }}
          />
          <Box display="flex" flexDirection="column" gap={1}>
            <IconButton
              color="primary"
              onClick={() =>
                downloadImage(value, `${field}_${Date.now()}.jpg`)
              }
            >
              <DownloadIcon />
            </IconButton>
            <IconButton color="error" onClick={handleRemove}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          No image uploaded
        </Typography>
      )}

      <Button
        variant="outlined"
        component="label"
        disabled={uploading}
        sx={{ mt: 1 }}
      >
        {uploading ? <CircularProgress size={20} /> : "Choose File"}
        <input type="file" accept="image/*" hidden onChange={handleFileChange} />
      </Button>
    </Box>
  );
}
