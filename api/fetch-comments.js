// Instagram Comment Fetcher - Simplified with Better Error Handling
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'Instagram URL is required' });
        }

        // Check for API token
        const apifyToken = process.env.APIFY_API_TOKEN;
        console.log('Token exists:', !!apifyToken);
        console.log('Token length:', apifyToken?.length);

        if (!apifyToken) {
            return res.status(500).json({
                error: 'APIFY_API_TOKEN not set',
                message: 'Please add APIFY_API_TOKEN to your Vercel environment variables',
                envVars: Object.keys(process.env).filter(k => k.includes('APIFY'))
            });
        }

        console.log('Fetching comments for URL:', url);

        // Use the simpler sync endpoint
        const apifyUrl = 'https://api.apify.com/v2/acts/zuzka~instagram-comments-scraper/run-sync-get-dataset-items';

        console.log('Calling Apify...');

        const response = await fetch(`${apifyUrl}?token=${apifyToken}&timeout=120`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                directUrls: [url],
                resultsLimit: 10000
            })
        });

        console.log('Apify response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Apify error response:', errorText);

            return res.status(500).json({
                success: false,
                error: `Apify returned ${response.status}`,
                details: errorText.substring(0, 500),
                message: 'Failed to scrape Instagram. The post may be private or your Apify token may be invalid.'
            });
        }

        const data = await response.json();
        console.log('Apify returned', data.length, 'items');

        // Parse comments
        const comments = [];

        if (Array.isArray(data)) {
            data.forEach((item, index) => {
                if (item.ownerUsername) {
                    comments.push({
                        username: item.ownerUsername,
                        text: item.text || '',
                        timestamp: item.timestamp || Date.now(),
                        id: item.id || index.toString()
                    });
                }
            });
        }

        console.log('Parsed', comments.length, 'comments');

        return res.status(200).json({
            success: true,
            comments: comments,
            total: comments.length,
            source: 'apify'
        });

    } catch (error) {
        console.error('Handler error:', error);

        return res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack?.substring(0, 500),
            message: 'An error occurred while fetching comments'
        });
    }
}
