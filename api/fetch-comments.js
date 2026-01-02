// Instagram Comment Scraper - Public Posts
// Using Instagram's public JSON endpoints

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

    try {
        // Extract shortcode from URL
        const shortcodeMatch = url.match(/\/p\/([A-Za-z0-9_-]+)/) ||
            url.match(/\/reel\/([A-Za-z0-9_-]+)/);

        if (!shortcodeMatch) {
            return res.status(400).json({
                error: 'Invalid Instagram URL'
            });
        }

        const shortcode = shortcodeMatch[1];

        // Method 1: Try Instagram's public GraphQL endpoint
        const graphqlUrl = `https://www.instagram.com/graphql/query/?query_hash=f0986789a5c5d17c2400faebf16efd0d&variables=${encodeURIComponent(JSON.stringify({
            shortcode: shortcode,
            first: 100
        }))}`;

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.instagram.com/',
            'X-IG-App-ID': '936619743392459',
            'X-Requested-With': 'XMLHttpRequest'
        };

        let response = await fetch(graphqlUrl, { headers });

        // Method 2: Try the embed endpoint
        if (!response.ok) {
            const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
            response = await fetch(embedUrl, { headers });

            if (!response.ok) {
                // Method 3: Try standard page with __a=1
                const standardUrl = `https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`;
                response = await fetch(standardUrl, { headers });
            }
        }

        if (!response.ok) {
            throw new Error('Instagram blocked the request');
        }

        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // Parse HTML for embedded JSON
            const html = await response.text();
            const jsonMatch = html.match(/window\._sharedData = ({.+?});<\/script>/);
            if (jsonMatch) {
                data = JSON.parse(jsonMatch[1]);
            } else {
                throw new Error('Could not extract data from Instagram');
            }
        }

        // Extract comments from the data structure
        const comments = extractComments(data);

        return res.status(200).json({
            success: true,
            comments: comments,
            total: comments.length,
            shortcode: shortcode
        });

    } catch (error) {
        console.error('Scraping error:', error);

        return res.status(200).json({
            success: false,
            error: error.message,
            message: 'Unable to fetch comments. The post may be private or Instagram is blocking requests.'
        });
    }
}

function extractComments(data) {
    const comments = [];

    try {
        // Try different data structures Instagram uses
        let commentData = null;

        // Structure 1: GraphQL response
        if (data.data?.shortcode_media?.edge_media_to_parent_comment) {
            commentData = data.data.shortcode_media.edge_media_to_parent_comment.edges;
        }
        // Structure 2: Page data
        else if (data.entry_data?.PostPage?.[0]?.graphql?.shortcode_media?.edge_media_to_parent_comment) {
            commentData = data.entry_data.PostPage[0].graphql.shortcode_media.edge_media_to_parent_comment.edges;
        }
        // Structure 3: Media data
        else if (data.graphql?.shortcode_media?.edge_media_to_parent_comment) {
            commentData = data.graphql.shortcode_media.edge_media_to_parent_comment.edges;
        }

        if (commentData && Array.isArray(commentData)) {
            commentData.forEach(edge => {
                const node = edge.node;
                if (node && node.owner) {
                    comments.push({
                        username: node.owner.username,
                        text: node.text || '',
                        timestamp: node.created_at || Date.now(),
                        id: node.id || Math.random().toString()
                    });
                }
            });
        }
    } catch (error) {
        console.error('Error extracting comments:', error);
    }

    return comments;
}
