// server.js
const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');

const app = express();

// --- SECURITY UPDATE: RESTRICT CORS ---
// Replace these with the actual URLs where your frontend lives.
// Include localhost so you can still test it on your own computer!
const allowedWebsites = [
    'http://localhost:5500',               // Live Server (VS Code)
    'http://127.0.0.1:5500/',               // Live Server (VS Code) alternative
    'https://toolez.netlify.app',           // EXAMPLE: Your live frontend URL
    'https://www.yourcustomdomain.com'     // EXAMPLE: Your actual domain name
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedWebsites.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Access Denied: This API is locked to ToolEz only.'));
        }
    }
}));

app.use(express.json());
app.post('/api/download', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'Video URL is required' });
    }

    try {
        // This tells yt-dlp to just get the direct download URL, not download it to the server
        const output = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: [
                'referer:youtube.com',
                'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ]
        });

        // Send the direct, raw MP4 link back to your frontend
        res.json({
            title: output.title,
            thumbnail: output.thumbnail,
            downloadUrl: output.url // This is the raw media URL
        });

    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).json({ error: 'Failed to fetch video. The link might be private or invalid.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`ToolEz Backend running on http://localhost:${PORT}`);
});
