const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Environment Variables
const LOOQZ_API_KEY = process.env.LOOQZ_API_KEY;
const LOOQZ_API_ENDPOINT = process.env.LOOQZ_API_ENDPOINT || "https://looqz.in/api/v1/public/generate-image";

// Use memory storage — no disk writes (works on ephemeral filesystems like Render)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint (useful for Render health checks)
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'looqz-backend' });
});

// Upload user image to a temporary public host so the Looqz API can access it.
// Catbox Litterbox provides free 1-hour temporary hosting — perfect for this use case.
async function uploadToTempHost(buffer, mimetype) {
  const blob = new Blob([buffer], { type: mimetype || 'image/jpeg' });
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('time', '1h');
  formData.append('fileToUpload', blob, 'image.jpg');

  const response = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Temp image upload failed: ${response.status}`);
  }

  return (await response.text()).trim();
}

// The main POST endpoint called by the Chrome Extension
app.post('/try-on', upload.single('user_image'), async (req, res) => {
  try {
    const { product_image_url, image_count } = req.body;

    if (!product_image_url || !req.file) {
      return res.status(422).json({ error: "Validation failed", message: "Missing product_image_url or user_image" });
    }

    if (!LOOQZ_API_KEY) {
      return res.status(500).json({ error: "Configuration Error", message: "LOOQZ_API_KEY is not set on the server." });
    }

    // Upload user image to a temporary public URL
    const userImageUrl = await uploadToTempHost(req.file.buffer, req.file.mimetype);

    console.log(`[Proxy] Forwarding request to Looqz AI...`);
    console.log(`[Proxy] Product URL: ${product_image_url}`);
    console.log(`[Proxy] User Image URL: ${userImageUrl}`);

    // Send payload to Looqz API
    const looqzPayload = {
      product_image_url: product_image_url,
      user_image_url: userImageUrl,
      image_count: image_count ? parseInt(image_count, 10) : 1,
    };

    const headers = {
      'Authorization': `Bearer ${LOOQZ_API_KEY}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*'
    };

    // Set domain headers (required by Looqz API for key validation)
    const spoofDomain = process.env.LOOQZ_API_DOMAIN;
    if (spoofDomain) {
      headers['Origin'] = spoofDomain;
      headers['Referer'] = spoofDomain + "/";
    }

    const looqzResponse = await axios.post(LOOQZ_API_ENDPOINT, looqzPayload, { headers });

    // Return the successful response back to the Chrome Extension
    res.json(looqzResponse.data);
  } catch (error) {
    console.error("[Proxy Error]:", error?.response?.data || error.message);

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).json({ error: "Server Error", message: "Failed to connect to Looqz AI service" });
  }
});

app.listen(port, () => {
  console.log(`Looqz Backend Server is running on port ${port}`);
  console.log(`Ready to securely proxy requests to the Looqz AI API!`);
});
