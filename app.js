// ===== Instagram Comment Picker - Manual Input Version =====
let appState = {
    comments: [],
    uniqueParticipants: [],
    winners: []
};

const elements = {
    commentsInput: document.getElementById('commentsInput'),
    winnerCount: document.getElementById('winnerCount'),
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

// ===== PARSE COMMENTS =====
function parseComments(text) {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const parsed = [];
    const userMap = new Map();

    lines.forEach((line) => {
        line = line.trim();
        if (!line) return;

        let username = '';
        let comment = '';

        const colonIndex = line.indexOf(':');
        if (colonIndex > 0 && colonIndex < 50) {
            username = line.substring(0, colonIndex).trim();
            comment = line.substring(colonIndex + 1).trim();
        } else {
            username = line.trim();
            comment = '';
        }

        username = username.replace('@', '').trim();
        const usernameLower = username.toLowerCase();

        if (username && !userMap.has(usernameLower)) {
            parsed.push({
                username: username,
                text: comment,
                id: parsed.length
            });
            userMap.set(usernameLower, true);
        }
    });

    return {
        parsed: parsed,
        totalLines: lines.length,
        uniqueCount: parsed.length,
        duplicatesCount: lines.length - parsed.length
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

//===== DISPLAY WINNERS =====
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

    participants.forEach((participant, index) => {
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

// ===== MAIN FLOW =====
async function handlePickWinner() {
    const text = elements.commentsInput.value.trim();

    if (!text) {
        alert('�� Please paste some comments first!');
        return;
    }

    try {
        showLoading('Analyzing comments...', 'Removing duplicates');
        await new Promise(resolve => setTimeout(resolve, 800));

        const result = parseComments(text);

        if (result.uniqueCount === 0) {
            hideLoading();
            alert('❌ No valid comments found. Please check the format!');
            return;
        }

        appState.comments = text.split('\n');
        appState.uniqueParticipants = result.parsed;

        // Update stats
        updateStatistics(result.totalLines, result.uniqueCount, result.duplicatesCount);
        displayParticipants(result.parsed);

        elements.statsSection.style.display = 'block';
        elements.participantsSection.style.display = 'block';

        // Pick winner
        showLoading('Selecting winner...', '🎲 Randomizing selection...');
        await new Promise(resolve => setTimeout(resolve, 1500));

        const count = parseInt(elements.winnerCount.value);
        const winners = pickWinners(result.parsed, count);
        appState.winners = winners;

        hideLoading();

        // Show reveal
        showWinnerReveal(winners[0]);

        // Display all winners
        displayWinners(winners);
        elements.winnersSection.style.display = 'block';

    } catch (error) {
        hideLoading();
        console.error('Error:', error);
        alert('❌ An error occurred. Please try again!');
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
elements.pickWinnerBtn.addEventListener('click', handlePickWinner);
elements.pickAgainBtn.addEventListener('click', handlePickAgain);
elements.exportBtn.addEventListener('click', exportResults);
elements.continueBtn.addEventListener('click', () => {
    hideWinnerReveal();
    elements.winnersSection.scrollIntoView({ behavior: 'smooth' });
});

elements.commentsInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        handlePickWinner();
    }
});

// ===== INITIALIZATION =====
console.log('✨ Instagram Comment Picker Ready!');
console.log('🛡️ Anti-Cheat: ON');
console.log('🎲 Cryptographic Random: ON');
