// Instagram Comment Fetcher - Using Correct Apify Actor
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

    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'Instagram URL is required' });
        }

        const apifyToken = process.env.APIFY_API_TOKEN;

        if (!apifyToken) {
            return res.status(500).json({
                error: 'APIFY_API_TOKEN not set',
                message: 'Please add APIFY_API_TOKEN to your Vercel environment variables'
            });
        }

        console.log('Fetching comments for URL:', url);

        // Use the correct Apify Instagram Scraper actor
        // This is the official Apify actor that works
        const apifyUrl = 'https://api.apify.com/v2/acts/apify/instagram-scraper/run-sync-get-dataset-items';

        const response = await fetch(`${apifyUrl}?token=${apifyToken}&timeout=180`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                directUrls: [url],
                resultsType: 'comments',  // Important: get comments only
                resultsLimit: 10000,
                searchType: 'hashtag',
                searchLimit: 1
            })
        });

        console.log('Apify response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Apify error:', errorText);

            return res.status(500).json({
                success: false,
                error: `Apify error: ${response.status}`,
                details: errorText.substring(0, 300),
                message: 'Failed to fetch comments. Please check the Instagram URL or try again.'
            });
        }

        const data = await response.json();
        console.log('Apify returned', data.length, 'items');

        // Parse comments from Apify response
        const comments = [];

        if (Array.isArray(data)) {
            data.forEach((item, index) => {
                // Apify returns different structures, handle both
                const username = item.ownerUsername || item.owner?.username || `user_${index}`;
                const text = item.text || item.comment || '';

                if (username) {
                    comments.push({
                        username: username,
                        text: text,
                        timestamp: item.timestamp || item.created_time || Date.now(),
                        id: item.id || index.toString()
                    });
                }
            });
        }

        console.log('Successfully parsed', comments.length, 'comments');

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
            message: 'An error occurred while fetching comments. Please try again.'
        });
    }
}
