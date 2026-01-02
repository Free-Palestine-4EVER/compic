// Instagram Comment Fetcher API
// Note: Instagram's official API requires authentication and has strict rate limits
// This endpoint uses public scraping as a fallback (for educational purposes)

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
                error: 'Invalid Instagram URL. Please use a post or reel URL (e.g., https://www.instagram.com/p/ABC123/)'
            });
        }

        const shortcode = shortcodeMatch[1];

        // Method 1: Try to fetch via Instagram's GraphQL endpoint (may be blocked)
        // This is for demonstration - in production, you'd need proper authentication

        const response = await fetch(`https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            // If Instagram blocks us, return demo data for testing
            console.log('Instagram API blocked, using demo mode');
            return res.status(200).json({
                success: true,
                demoMode: true,
                message: 'Instagram API is currently unavailable. Using demo data for testing.',
                comments: generateDemoComments(),
                postInfo: {
                    shortcode: shortcode,
                    owner: 'demo_user',
                    caption: 'This is a demo post for testing purposes'
                }
            });
        }

        const data = await response.json();

        // Parse Instagram data structure
        const comments = parseInstagramComments(data);

        return res.status(200).json({
            success: true,
            demoMode: false,
            comments: comments,
            postInfo: {
                shortcode: shortcode,
                owner: data.graphql?.shortcode_media?.owner?.username || 'unknown',
                caption: data.graphql?.shortcode_media?.edge_media_to_caption?.edges[0]?.node?.text || ''
            }
        });

    } catch (error) {
        console.error('Error fetching comments:', error);

        // Return demo data on error for testing
        return res.status(200).json({
            success: true,
            demoMode: true,
            message: 'Could not fetch real comments. Using demo data for testing.',
            comments: generateDemoComments(),
            postInfo: {
                shortcode: 'demo',
                owner: 'demo_user',
                caption: 'Demo post for testing'
            }
        });
    }
}

function parseInstagramComments(data) {
    const comments = [];

    try {
        const edges = data.graphql?.shortcode_media?.edge_media_to_parent_comment?.edges || [];

        for (const edge of edges) {
            const comment = edge.node;
            comments.push({
                username: comment.owner?.username || 'unknown',
                text: comment.text || '',
                timestamp: comment.created_at || Date.now(),
                id: comment.id || Math.random().toString()
            });
        }
    } catch (error) {
        console.error('Error parsing comments:', error);
    }

    return comments;
}

function generateDemoComments() {
    // Generate realistic demo data for testing
    const demoUsers = [
        'john_doe', 'jane_smith', 'mike_jones', 'sara_wilson', 'alex_kim',
        'chris_lee', 'emma_brown', 'david_miller', 'sophia_garcia', 'ryan_davis',
        'olivia_martinez', 'james_taylor', 'ava_anderson', 'william_thomas', 'isabella_moore',
        'JOHN_DOE', 'Jane_Smith', 'MIKE_JONES' // Duplicates for testing
    ];

    const demoComments = [
        'This is amazing! 🎉', 'I love this! ❤️', 'Count me in!', 'This looks great!',
        'Amazing work! 👏', 'Can\'t wait! 🔥', 'Let\'s go! 💪', 'So cool!',
        'This is awesome! ⭐', 'Great post! 🎊', 'Incredible! 🌟', 'Love it! 💯',
        'Perfect! ✨', 'Fantastic! 🎈', 'Awesome! 🚀'
    ];

    return demoUsers.map((username, index) => ({
        username: username,
        text: demoComments[index % demoComments.length],
        timestamp: Date.now() - (index * 60000),
        id: `demo_${index}`
    }));
}
