// Instagram Comment Fetcher using Apify - Fixed Version
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

    const apifyToken = process.env.APIFY_API_TOKEN;

    if (!apifyToken) {
        return res.status(500).json({
            error: 'APIFY_API_TOKEN not configured',
            message: 'Please add your Apify API token to Vercel environment variables'
        });
    }

    try {
        console.log('Starting Apify scrape for URL:', url);

        // Use Apify's Instagram Comment Scraper
        const actorId = 'apify/instagram-comment-scraper';
        const apifyUrl = `https://api.apify.com/v2/acts/${actorId}/runs?token=${apifyToken}`;

        // Start the actor run
        const runResponse = await fetch(apifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                directUrls: [url],
                resultsLimit: 10000
            })
        });

        if (!runResponse.ok) {
            const error = await runResponse.text();
            console.error('Apify start error:', error);
            throw new Error(`Failed to start Apify actor: ${runResponse.status}`);
        }

        const runData = await runResponse.json();
        const runId = runData.data.id;
        console.log('Apify run started:', runId);

        // Wait for the run to complete (poll for status)
        let attempts = 0;
        let runStatus = 'RUNNING';

        while (runStatus === 'RUNNING' && attempts < 60) { // Max 60 seconds
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

            const statusResponse = await fetch(
                `https://api.apify.com/v2/actor-runs/${runId}?token=${apifyToken}`
            );
            const statusData = await statusResponse.json();
            runStatus = statusData.data.status;

            console.log(`Apify status (attempt ${attempts + 1}):`, runStatus);
            attempts++;
        }

        if (runStatus !== 'SUCCEEDED') {
            throw new Error(`Apify run failed with status: ${runStatus}`);
        }

        // Get the dataset results
        const datasetId = runData.data.defaultDatasetId;
        const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`;

        const datasetResponse = await fetch(datasetUrl);
        const comments = await datasetResponse.json();

        console.log(`Retrieved ${comments.length} comments`);

        // Format comments
        const formattedComments = comments.map((item, index) => ({
            username: item.ownerUsername || `user_${index}`,
            text: item.text || '',
            timestamp: item.timestamp || Date.now(),
            id: item.id || index.toString()
        }));

        return res.status(200).json({
            success: true,
            comments: formattedComments,
            total: formattedComments.length,
            source: 'apify'
        });

    } catch (error) {
        console.error('Apify error:', error);

        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Failed to fetch comments. The post may be private or Apify encountered an error.',
            debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
