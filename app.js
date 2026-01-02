// ===== Instagram Comment Picker with URL Fetching =====
let appState = {
    comments: [],
    uniqueParticipants: [],
    winners: []
};

const elements = {
    instagramUrl: document.getElementById('instagramUrl'),
    commentsInput: document.getElementById('commentsInput'),
    winnerCount: document.getElementById('winnerCount'),
    fetchBtn: document.getElementById('fetchBtn'),
    pickWinnerBtn: document.getElementById('pickWinnerBtn'),
    pickAgainBtn: document.getElementById('pickAgainBtn'),
    exportBtn: document.getElementById('exportBtn'),
    continueBtn: document.getElementById('continueBtn'),

    loadingOverlay: document.getElementById('loadingOverlay'),
    loadingText: document.getElementById('loadingText'),
    loadingSubtext: document.getElementById('loadingSubtext'),

    winnerOverlay: document.getElementById('winnerOverlay'),
    winnerAvatar: document.getElementById('winnerAvatar'),
    winnerUsernameBig: document.getElementById('winnerUsernameBig'),
    winnerCommentBig: document.getElementById('winnerCommentBig'),

    statsSection: document.getElementById('statsSection'),
    winnersSection: document.getElementById('winnersSection'),
    participantsSection: document.getElementById('participantsSection'),

    totalComments: document.getElementById('totalComments'),
    uniqueUsers: document.getElementById('uniqueUsers'),
    duplicatesRemoved: document.getElementById('duplicatesRemoved'),
    validEntries: document.getElementById('validEntries'),

    winnersList: document.getElementById('winnersList'),
    participantsList: document.getElementById('participantsList')
};

// ===== HELPERS =====
function showLoading(text = 'Processing...', subtext = 'Please wait') {
    elements.loadingText.textContent = text;
    elements.loadingSubtext.textContent = subtext;
    elements.loadingOverlay.classList.add('active');
}

function hideLoading() {
    elements.loadingOverlay.classList.remove('active');
}

function showError(message) {
    hideLoading();
    alert(`❌ ${message}`);
}

function getSecureRandomInt(max) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = getSecureRandomInt(i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = end;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// ===== FETCH INSTAGRAM COMMENTS =====
async function fetchInstagramComments(url) {
    try {
        showLoading('Fetching comments from Instagram...', 'This may take a moment');

        const response = await fetch('/api/fetch-comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch comments');
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch comments');
        }

        return data.comments;

    } catch (error) {
        throw error;
    }
}

// ===== PROCESS COMMENTS =====
function processComments(comments) {
    const userMap = new Map();
    const processed = [];
    let duplicateCount = 0;

    console.log(`Processing ${comments.length} total comments...`);

    comments.forEach((comment, index) => {
        // Normalize username: lowercase, remove @, trim whitespace, remove dots/underscores variations
        let username = comment.username || '';

        // Remove @ symbol
        username = username.replace(/@/g, '');

        // Convert to lowercase
        username = username.toLowerCase().trim();

        // Log first few for debugging
        if (index < 5) {
            console.log(`Comment ${index}: username="${username}", original="${comment.username}"`);
        }

        if (!username) {
            console.log(`Skipping comment ${index}: empty username`);
            return; // Skip empty usernames
        }

        // Check if we've already seen this user
        if (userMap.has(username)) {
            duplicateCount++;
            if (duplicateCount <= 5) {
                console.log(`Duplicate found: ${username} (already seen)`);
            }
            return; // Skip duplicates
        }

        // Add to our unique list
        processed.push({
            username: comment.username, // Keep original format for display
            text: comment.text || '',
            timestamp: comment.timestamp,
            id: comment.id
        });

        // Mark this username as seen
        userMap.set(username, true);
    });

    console.log(`Final results: ${processed.length} unique users, ${duplicateCount} duplicates removed`);

    return {
        unique: processed,
        total: comments.length,
        duplicates: duplicateCount
    };
}

// ===== CREATE SPARKLES =====
function createSparkles() {
    const sparklesContainer = document.getElementById('sparkles');
    sparklesContainer.innerHTML = '';

    const emojis = ['✨', '⭐', '💫', '🌟', '✨', '⭐'];

    for (let i = 0; i < 50; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 2 + 's';
        sparkle.style.animationDuration = (Math.random() * 2 + 1) + 's';
        sparklesContainer.appendChild(sparkle);
    }
}

// ===== SHOW WINNER REVEAL =====
function showWinnerReveal(winner) {
    createSparkles();

    const initial = winner.username.charAt(0).toUpperCase();
    elements.winnerAvatar.innerHTML = `<span class="avatar-initial">${initial}</span>`;
    elements.winnerUsernameBig.textContent = `@${winner.username}`;
    elements.winnerCommentBig.textContent = winner.text ? `"${winner.text}"` : '(No comment text)';

    elements.winnerOverlay.classList.add('active');
}

function hideWinnerReveal() {
    elements.winnerOverlay.classList.remove('active');
}

// ===== PICK WINNERS =====
function pickWinners(participants, count) {
    if (count > participants.length) {
        count = participants.length;
    }
    const shuffled = shuffleArray(participants);
    return shuffled.slice(0, count);
}

// ===== DISPLAY WINNERS =====
function displayWinners(winners) {
    elements.winnersList.innerHTML = '';

    const ranks = ['🥇', '🥈', '🥉', '🏆', '⭐'];

    winners.forEach((winner, index) => {
        const item = document.createElement('div');
        item.className = 'winner-item';
        item.style.animationDelay = `${index * 0.1}s`;

        const rank = ranks[index] || '🌟';

        item.innerHTML = `
            <div class="winner-rank">${rank}</div>
            <div class="winner-details">
                <h4>@${winner.username}</h4>
                <p>${winner.text || '(No comment text)'}</p>
            </div>
        `;
        elements.winnersList.appendChild(item);
    });
}

// ===== DISPLAY PARTICIPANTS =====
function displayParticipants(participants) {
    elements.participantsList.innerHTML = '';

    participants.forEach((participant) => {
        const item = document.createElement('div');
        item.className = 'participant-item';
        item.innerHTML = `<span class="participant-username">@${participant.username}</span>`;
        elements.participantsList.appendChild(item);
    });
}

// ===== UPDATE STATS =====
function updateStatistics(total, unique, duplicates) {
    animateValue(elements.totalComments, 0, total, 800);
    animateValue(elements.uniqueUsers, 0, unique, 800);
    animateValue(elements.duplicatesRemoved, 0, duplicates, 800);
    animateValue(elements.validEntries, 0, unique, 800);
}

// ===== EXPORT RESULTS =====
function exportResults() {
    if (appState.winners.length === 0) {
        alert('No winners selected yet!');
        return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    let text = `Instagram Comment Picker Results\n`;
    text += `Date: ${timestamp}\n`;
    text += `Total Comments: ${appState.comments.length}\n`;
    text += `Unique Participants: ${appState.uniqueParticipants.length}\n`;
    text += `Duplicates Removed: ${appState.comments.length - appState.uniqueParticipants.length}\n`;
    text += `\n${'='.repeat(50)}\n\n`;
    text += `WINNERS:\n\n`;

    appState.winners.forEach((winner, index) => {
        text += `${index + 1}. @${winner.username}\n`;
        if (winner.text) {
            text += `   Comment: "${winner.text}"\n`;
        }
        text += `\n`;
    });

    text += `\n${'='.repeat(50)}\n\n`;
    text += `ALL VALID PARTICIPANTS:\n\n`;

    appState.uniqueParticipants.forEach((participant, index) => {
        text += `${index + 1}. @${participant.username}\n`;
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `instagram-winner-${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ===== MAIN FLOW - URL FETCH =====
async function handleFetchAndPick() {
    const url = elements.instagramUrl.value.trim();

    if (!url) {
        showError('Please enter an Instagram post URL');
        return;
    }

    if (!url.includes('instagram.com')) {
        showError('Please enter a valid Instagram URL');
        return;
    }

    try {
        const comments = await fetchInstagramComments(url);

        if (!comments || comments.length === 0) {
            hideLoading();
            showError('No comments found on this post');
            return;
        }

        appState.comments = comments;

        showLoading('Processing comments...', 'Removing duplicates');
        await new Promise(resolve => setTimeout(resolve, 500));

        const processed = processComments(comments);
        appState.uniqueParticipants = processed.unique;

        if (processed.unique.length === 0) {
            hideLoading();
            showError('No valid participants found');
            return;
        }

        updateStatistics(processed.total, processed.unique.length, processed.duplicates);
        displayParticipants(processed.unique);

        elements.statsSection.style.display = 'block';
        elements.participantsSection.style.display = 'block';

        showLoading('Selecting winner...', '🎲 Randomizing selection...');
        await new Promise(resolve => setTimeout(resolve, 1500));

        const count = parseInt(elements.winnerCount.value);
        const winners = pickWinners(processed.unique, count);
        appState.winners = winners;

        hideLoading();

        showWinnerReveal(winners[0]);

        displayWinners(winners);
        elements.winnersSection.style.display = 'block';

        setTimeout(() => {
            elements.statsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);

    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to fetch comments. The post may be private or Instagram blocked the request.');
    }
}

function handlePickAgain() {
    if (appState.uniqueParticipants.length === 0) {
        alert('No participants available!');
        return;
    }

    const count = parseInt(elements.winnerCount.value);
    const winners = pickWinners(appState.uniqueParticipants, count);
    appState.winners = winners;

    showWinnerReveal(winners[0]);
    displayWinners(winners);
}

// ===== EVENT LISTENERS =====
elements.fetchBtn.addEventListener('click', handleFetchAndPick);
elements.pickAgainBtn.addEventListener('click', handlePickAgain);
elements.exportBtn.addEventListener('click', exportResults);
elements.continueBtn.addEventListener('click', () => {
    hideWinnerReveal();
    elements.winnersSection.scrollIntoView({ behavior: 'smooth' });
});

elements.instagramUrl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleFetchAndPick();
    }
});

console.log('✨ Instagram Comment Picker Ready!');
console.log('🔗 URL Fetching: ENABLED');
console.log('🛡️ Anti-Cheat: ON');
console.log('🎲 Cryptographic Random: ON');
