// Instagram Comment Fetcher - Using Apify Async Endpoint
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

        // Step 1: Start the actor run (async)
        const startUrl = `https://api.apify.com/v2/acts/apify~instagram-scraper/runs?token=${apifyToken}`;

        console.log('Starting Apify actor run...');

        const startResponse = await fetch(startUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                directUrls: [url],
                resultsType: 'comments',
                resultsLimit: 10000,
                searchType: 'hashtag',
                addParentData: false
            })
        });

        if (!startResponse.ok) {
            const errorText = await startResponse.text();
            console.error('Failed to start Apify run:', errorText);
            throw new Error(`Failed to start scraper: ${startResponse.status}`);
        }

        const runData = await startResponse.json();
        const runId = runData.data.id;
        const defaultDatasetId = runData.data.defaultDatasetId;

        console.log('Run started:', runId, 'Dataset:', defaultDatasetId);

        // Step 2: Poll for completion
        let attempts = 0;
        let status = 'RUNNING';
        const maxAttempts = 60; // 2 minutes max (2 sec intervals)

        while (status === 'RUNNING' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

            const statusUrl = `https://api.apify.com/v2/actor-runs/${runId}?token=${apifyToken}`;
            const statusResponse = await fetch(statusUrl);
            const statusData = await statusResponse.json();
            status = statusData.data.status;

            attempts++;
            console.log(`Poll ${attempts}: Status = ${status}`);
        }

        if (status !== 'SUCCEEDED') {
            throw new Error(`Scraper run failed with status: ${status}`);
        }

        console.log('Run completed successfully!');

        // Step 3: Get the full dataset
        const datasetUrl = `https://api.apify.com/v2/datasets/${defaultDatasetId}/items?token=${apifyToken}`;
        console.log('Fetching dataset...');

        const datasetResponse = await fetch(datasetUrl);

        if (!datasetResponse.ok) {
            throw new Error('Failed to fetch dataset');
        }

        const data = await datasetResponse.json();
        console.log('Dataset fetched, total items:', data.length);

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
