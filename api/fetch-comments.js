// Instagram Comment Fetcher - Correct Apify API Endpoint
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
                error: 'APIFY_API_TOKEN not set'
            });
        }

        console.log('Fetching comments for URL:', url);

        // Correct Apify API endpoint with tilde separator
        const apifyUrl = `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${apifyToken}`;

        console.log('Calling Apify...');

        const response = await fetch(apifyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                directUrls: [url],
                resultsType: 'comments',
                resultsLimit: 999999,  // Get ALL comments
                searchType: 'hashtag',
                searchLimit: 1,
                maxComments: 999999    // Also set maxComments to ensure we get everything
            }),
            timeout: 300000 // 5 minute timeout
        });

        console.log('Apify response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Apify error:', errorText);

            return res.status(500).json({
                success: false,
                error: `Apify returned ${response.status}`,
                details: errorText.substring(0, 500),
                message: 'Failed to fetch comments from Instagram'
            });
        }

        const data = await response.json();
        console.log('Apify returned data, length:', Array.isArray(data) ? data.length : 'not an array');

        // Parse comments
        const comments = [];

        if (Array.isArray(data)) {
            data.forEach((item, index) => {
                const username = item.ownerUsername || item.username || `user_${index}`;
                const text = item.text || '';

                if (username && username !== 'user_' + index) {
                    comments.push({
                        username: username,
                        text: text,
                        timestamp: item.timestamp || Date.now(),
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
            message: 'Failed to fetch comments. Please try again.'
        });
    }
}
