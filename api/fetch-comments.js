// Instagram Comment Fetcher using Apify
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'Instagram URL is required' });
    }

    // Get Apify token from environment variable
    const apifyToken = process.env.APIFY_API_TOKEN;

    if (!apifyToken) {
        return res.status(500).json({
            error: 'Apify API token not configured',
            setup: 'Please add APIFY_API_TOKEN to your Vercel environment variables'
        });
    }

    try {
        // Extract post URL
        let postUrl = url.trim();
        if (!postUrl.includes('instagram.com')) {
            return res.status(400).json({ error: 'Invalid Instagram URL' });
        }

        // Call Apify Instagram Post Scraper
        const apifyUrl = 'https://api.apify.com/v2/acts/apify~instagram-post-scraper/run-sync-get-dataset-items';

        const apifyPayload = {
            directUrls: [postUrl],
            resultsType: 'comments',
            resultsLimit: 10000, // Get all comments
            searchType: 'hashtag',
            searchLimit: 1
        };

        console.log('Calling Apify with URL:', postUrl);

        const response = await fetch(`${apifyUrl}?token=${apifyToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(apifyPayload),
            timeout: 120000 // 2 minute timeout
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Apify error:', errorText);
            throw new Error(`Apify request failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('Apify response received, items:', data.length);

        // Parse comments from Apify response
        const comments = [];

        if (Array.isArray(data)) {
            data.forEach(item => {
                if (item.ownerUsername && item.text) {
                    comments.push({
                        username: item.ownerUsername,
                        text: item.text || '',
                        timestamp: item.timestamp || Date.now(),
                        id: item.id || Math.random().toString()
                    });
                }
            });
        }

        console.log(`Extracted ${comments.length} comments`);

        return res.status(200).json({
            success: true,
            comments: comments,
            total: comments.length,
            source: 'apify'
        });

    } catch (error) {
        console.error('Error fetching comments:', error);

        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Failed to fetch comments from Instagram. Please try again.'
        });
    }
}
