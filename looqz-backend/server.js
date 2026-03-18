const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Environment Variables
const LOOQZ_API_KEY = process.env.LOOQZ_API_KEY;
const LOOQZ_API_ENDPOINT = process.env.LOOQZ_API_ENDPOINT || "https://looqz.in/api/v1/public/generate-image";
const PUBLIC_URL = process.env.PUBLIC_URL; // Optional override for the public URL

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images statically so the Looqz API can download them
app.use('/uploads', express.static('uploads'));

// Multer config for handling multipart/form-data
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

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

    // Determine the public URL where the Looqz API can fetch the uploaded image.
    // In production, this would be your server's domain or an AWS S3 bucket link.
    const host = req.get('host');
    const protocol = req.protocol; // http or https
    const baseUrl = PUBLIC_URL || `${protocol}://${host}`;
    
    let userImageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    // If using LocalTunnel or Ngrok, the free tiers inject a mandatory HTML warning screen 
    // to bots that crashes external APIs expecting robust images. 
    // To bypass this for local development, we temporarily upload to a 1-hour image host.
    if (baseUrl.includes('loca.lt') || baseUrl.includes('ngrok')) {
      console.log(`[Proxy] Detected ${baseUrl}. Bypassing HTML warning using Catbox...`);
      const fileBuffer = fs.readFileSync(req.file.path);
      const blob = new Blob([fileBuffer], { type: req.file.mimetype || 'image/jpeg' });
      const formData = new FormData();
      formData.append('reqtype', 'fileupload');
      formData.append('time', '1h');
      formData.append('fileToUpload', blob, 'image.jpg');
      
      const uploadRes = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
        method: 'POST', body: formData
      });
      userImageUrl = (await uploadRes.text()).trim();
    }

    console.log(`[Proxy] Forwarding request to Looqz AI...`);
    console.log(`[Proxy] Product URL: ${product_image_url}`);
    console.log(`[Proxy] User Image URL: ${userImageUrl}`);

    // Send payload to Looqz API
    const looqzPayload = {
      product_image_url: product_image_url,
      user_image_url: userImageUrl,
      image_count: image_count ? parseInt(image_count, 10) : 1
    };

    const headers = {
      'Authorization': `Bearer ${LOOQZ_API_KEY}`,
      'Content-Type': 'application/json'
    };
    
    // Spoof the domain if configured in .env, otherwise pass the extension's actual origin
    const spoofDomain = process.env.LOOQZ_API_DOMAIN;
    if (spoofDomain) {
      headers['Origin'] = spoofDomain;
      headers['Referer'] = spoofDomain + "/";
    } else {
      if (req.get('origin')) headers['Origin'] = req.get('origin');
      if (req.get('referer')) headers['Referer'] = req.get('referer');
    }

    const looqzResponse = await axios.post(LOOQZ_API_ENDPOINT, looqzPayload, { headers });

    // Return the successful response back to the Chrome Extension
    res.json(looqzResponse.data);

    // Optional: Clean up the local file after processing to save disk space
    // setTimeout(() => {
    //   fs.unlink(req.file.path, (err) => {
    //     if (err) console.error("Failed to delete temp user image:", err);
    //   });
    // }, 60000); // Clean up after 1 minute

  } catch (error) {
    console.error("[Proxy Error]:", error?.response?.data || error.message);
    
    if (error.response) {
      // Forward the exact error code and details from Looqz
      return res.status(error.response.status).json(error.response.data);
    }
    
    res.status(500).json({ error: "Server Error", message: "Failed to connect to Looqz AI service" });
  }
});

app.listen(port, () => {
  console.log(`Looqz Backend Server is running on http://localhost:${port}`);
  console.log(`Ready to securely proxy requests to the Looqz AI API!`);
});
