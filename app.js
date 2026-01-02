// ===== INSTAGRAM COMMENT PICKER - AUTO WINNER SELECTOR =====
// State Management
let appState = {
    comments: [],
    uniqueParticipants: [],
    winners: [],
    postInfo: null,
    isDemoMode: false
};

// DOM Elements
const elements = {
    instagramUrl: document.getElementById('instagramUrl'),
    winnerCount: document.getElementById('winnerCount'),
    autoPick: document.getElementById('autoPick'),
    fetchBtn: document.getElementById('fetchBtn'),
    pickAgainBtn: document.getElementById('pickAgainBtn'),
    exportBtn: document.getElementById('exportBtn'),
    continueBtn: document.getElementById('continueBtn'),

    loadingOverlay: document.getElementById('loadingOverlay'),
    loadingText: document.getElementById('loadingText'),
    loadingSubtext: document.getElementById('loadingSubtext'),

    winnerOverlay: document.getElementById('winnerOverlay'),
    winnerDisplay: document.getElementById('winnerDisplay'),

    statsSection: document.getElementById('statsSection'),
    resultsSection: document.getElementById('resultsSection'),
    participantsSection: document.getElementById('participantsSection'),

    totalComments: document.getElementById('totalComments'),
    uniqueUsers: document.getElementById('uniqueUsers'),
    duplicatesRemoved: document.getElementById('duplicatesRemoved'),
    validEntries: document.getElementById('validEntries'),

    winnersList: document.getElementById('winnersList'),
    participantsList: document.getElementById('participantsList')
};

// ===== HELPERS =====
function showLoading(text = 'Fetching comments...', subtext = 'Please wait') {
    elements.loadingText.textContent = text;
    elements.loadingSubtext.textContent = subtext;
    elements.loadingOverlay.classList.add('active');
}

function hideLoading() {
    elements.loadingOverlay.classList.remove('active');
}

function showError(message) {
    hideLoading();
    alert(`❌ Error: ${message}`);
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
        showLoading('Fetching Instagram comments...', 'This may take a moment');

        // Call our backend API
        const response = await fetch('/api/fetch-comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch comments from Instagram');
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch comments');
        }

        appState.isDemoMode = data.demoMode || false;
        appState.postInfo = data.postInfo;

        return data.comments;

    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// ===== PROCESS COMMENTS =====
function processComments(comments) {
    const userMap = new Map();
    const processed = [];

    comments.forEach((comment) => {
        const username = comment.username.toLowerCase().replace('@', '').trim();

        if (username && !userMap.has(username)) {
            processed.push({
                username: comment.username,
                text: comment.text || '',
                timestamp: comment.timestamp,
                id: comment.id
            });
            userMap.set(username, true);
        }
    });

    return {
        unique: processed,
        total: comments.length,
        duplicates: comments.length - processed.length
    };
}

// ===== UPDATE STATISTICS =====
function updateStatistics(total, unique, duplicates) {
    elements.totalComments.textContent = total;
    elements.uniqueUsers.textContent = unique;
    elements.duplicatesRemoved.textContent = duplicates;
    elements.validEntries.textContent = unique;

    animateValue(elements.totalComments, 0, total, 800);
    animateValue(elements.uniqueUsers, 0, unique, 800);
    animateValue(elements.duplicatesRemoved, 0, duplicates, 800);
    animateValue(elements.validEntries, 0, unique, 800);
}

// ===== DISPLAY PARTICIPANTS =====
function displayParticipants(participants) {
    elements.participantsList.innerHTML = '';

    participants.forEach((participant, index) => {
        const item = document.createElement('div');
        item.className = 'participant-item';
        item.innerHTML = `
            <span class="participant-number">#${index + 1}</span>
            <span class="participant-username">@${participant.username}</span>
        `;
        elements.participantsList.appendChild(item);
    });
}

// ===== CONFETTI ANIMATION =====
function createConfetti() {
    const confettiContainer = document.getElementById('confetti');
    confettiContainer.innerHTML = '';

    const colors = ['#FF6B6B', '#4ECDC4', '#FFD700', '#FF4757', '#FFA502', '#C44569'];
    const shapes = ['circle', 'square'];

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        const size = Math.random() * 10 + 5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];

        confetti.style.position = 'absolute';
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        confetti.style.backgroundColor = color;
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = -10 + 'px';
        confetti.style.borderRadius = shape === 'circle' ? '50%' : '0';
        confetti.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;
        confetti.style.animationDelay = Math.random() * 0.5 + 's';

        confettiContainer.appendChild(confetti);
    }

    // Add CSS animation for confetti
    if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.textContent = `
            @keyframes confettiFall {
                to {
                    transform: translateY(100vh) rotate(${Math.random() * 720}deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== SHOW WINNER REVEAL =====
function showWinnerReveal(winner) {
    createConfetti();
    elements.winnerDisplay.textContent = `@${winner.username}`;
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

// ===== DISPLAY WINNER RESULTS =====
function displayWinnerResults(winners) {
    elements.winnersList.innerHTML = '';

    const badges = ['🥇', '🥈', '🥉', '🏆', '⭐', '🎯', '🎊', '🎁', '💎', '👑'];
    const ranks = ['1st Place', '2nd Place', '3rd Place', '4th Place', '5th Place'];

    winners.forEach((winner, index) => {
        const card = document.createElement('div');
        card.className = 'winner-card';
        card.style.animationDelay = `${index * 0.1}s`;

        const badge = badges[index] || '🌟';
        const rank = ranks[index] || `Winner #${index + 1}`;

        card.innerHTML = `
            <div class="winner-badge">${badge}</div>
            <div class="winner-info">
                <div class="winner-rank">${rank}</div>
                <div class="winner-username">@${winner.username}</div>
                ${winner.text ? `<div class="winner-comment">"${winner.text}"</div>` : ''}
            </div>
        `;

        elements.winnersList.appendChild(card);
    });
}

// ===== EXPORT RESULTS =====
function exportResults() {
    if (appState.winners.length === 0) {
        alert('No winners to export yet!');
        return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    let text = `Instagram Comment Picker Results\n`;
    text += `Date: ${timestamp}\n`;
    text += `Post: ${appState.postInfo?.shortcode || 'N/A'}\n`;
    text += `Total Comments: ${appState.comments.length}\n`;
    text += `Unique Participants: ${appState.uniqueParticipants.length}\n`;
    text += `Duplicates Removed: ${appState.comments.length - appState.uniqueParticipants.length}\n`;

    if (appState.isDemoMode) {
        text += `\n⚠️ DEMO MODE - Using test data\n`;
    }

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

// ===== MAIN FLOW =====
async function handleFetchAndPick() {
    const url = elements.instagramUrl.value.trim();

    if (!url) {
        showError('Please enter an Instagram post URL');
        return;
    }

    // Validate URL format
    if (!url.includes('instagram.com')) {
        showError('Please enter a valid Instagram URL');
        return;
    }

    try {
        // Fetch comments
        const comments = await fetchInstagramComments(url);

        if (!comments || comments.length === 0) {
            hideLoading();
            showError('No comments found on this post');
            return;
        }

        appState.comments = comments;

        // Process comments
        showLoading('Processing comments...', 'Removing duplicates');
        await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause for UX

        const processed = processComments(comments);
        appState.uniqueParticipants = processed.unique;

        if (processed.unique.length === 0) {
            hideLoading();
            showError('No valid participants found');
            return;
        }

        // Update UI
        updateStatistics(processed.total, processed.unique.length, processed.duplicates);
        displayParticipants(processed.unique);

        elements.statsSection.style.display = 'block';
        elements.participantsSection.style.display = 'block';

        // Auto-pick if enabled
        if (elements.autoPick.checked) {
            showLoading('Selecting winner...', '🎲 Rolling the dice...');
            await new Promise(resolve => setTimeout(resolve, 1500)); // Dramatic pause

            const count = parseInt(elements.winnerCount.value);
            const winners = pickWinners(processed.unique, count);
            appState.winners = winners;

            hideLoading();

            // Show dramatic reveal
            showWinnerReveal(winners[0]);

            // Display detailed results
            displayWinnerResults(winners);
            elements.resultsSection.style.display = 'block';

        } else {
            hideLoading();
            alert(`✅ Found ${processed.unique.length} unique participants! Scroll down to pick winners.`);
        }

        // Scroll to results
        setTimeout(() => {
            elements.statsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);

    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to fetch comments. Please try again.');
    }
}

function handlePickAgain() {
    if (appState.uniqueParticipants.length === 0) {
        alert('No participants available');
        return;
    }

    const count = parseInt(elements.winnerCount.value);
    const winners = pickWinners(appState.uniqueParticipants, count);
    appState.winners = winners;

    // Show reveal for first winner
    showWinnerReveal(winners[0]);

    // Update results
    displayWinnerResults(winners);
}

// ===== EVENT LISTENERS =====
elements.fetchBtn.addEventListener('click', handleFetchAndPick);

elements.pickAgainBtn.addEventListener('click', handlePickAgain);

elements.exportBtn.addEventListener('click', exportResults);

elements.continueBtn.addEventListener('click', () => {
    hideWinnerReveal();
    elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// Enter key support
elements.instagramUrl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleFetchAndPick();
    }
});

// ===== INITIALIZATION =====
console.log('🎉 Instagram Comment Picker Loaded!');
console.log('📊 Auto-Fetch & Pick: READY');
console.log('🛡️ Anti-Cheat Protection: ENABLED');
console.log('🔒 Cryptographically Secure Random: ENABLED');

// Show demo if in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 DEV MODE: You can test with any Instagram URL');
    console.log('💡 API will use demo data if Instagram blocks requests');
}
