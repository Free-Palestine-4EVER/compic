// ===== STATE MANAGEMENT =====
let commentsData = {
    raw: [],
    parsed: [],
    unique: [],
    duplicates: 0,
    winners: []
};

// ===== DOM ELEMENTS =====
const elements = {
    commentsInput: document.getElementById('commentsInput'),
    winnerCount: document.getElementById('winnerCount'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    pickWinnerBtn: document.getElementById('pickWinnerBtn'),
    pickAgainBtn: document.getElementById('pickAgainBtn'),
    exportBtn: document.getElementById('exportBtn'),
    statsSection: document.getElementById('statsSection'),
    winnerSection: document.getElementById('winnerSection'),
    participantsSection: document.getElementById('participantsSection'),
    totalComments: document.getElementById('totalComments'),
    uniqueUsers: document.getElementById('uniqueUsers'),
    duplicatesRemoved: document.getElementById('duplicatesRemoved'),
    validEntries: document.getElementById('validEntries'),
    winnersList: document.getElementById('winnersList'),
    participantsList: document.getElementById('participantsList')
};

// ===== COMMENT PARSER =====
function parseComments(text) {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const parsed = [];
    const userMap = new Map();

    lines.forEach((line, index) => {
        line = line.trim();
        if (!line) return;

        let username = '';
        let comment = '';

        // Try to parse format: "username: comment"
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0 && colonIndex < 50) { // Username shouldn't be too long
            username = line.substring(0, colonIndex).trim();
            comment = line.substring(colonIndex + 1).trim();
        } else {
            // If no colon, treat entire line as username
            username = line.trim();
            comment = '';
        }

        // Clean username (remove @ if present, convert to lowercase for comparison)
        username = username.replace('@', '').trim();
        const usernameLower = username.toLowerCase();

        if (username) {
            // Check if this user already commented
            if (!userMap.has(usernameLower)) {
                const entry = {
                    id: parsed.length,
                    username: username,
                    comment: comment,
                    originalLine: line
                };
                parsed.push(entry);
                userMap.set(usernameLower, entry);
            }
            // If user already exists, we skip it (duplicate protection)
        }
    });

    return {
        parsed: parsed,
        totalLines: lines.length,
        uniqueCount: parsed.length,
        duplicatesCount: lines.length - parsed.length
    };
}

// ===== CRYPTOGRAPHICALLY SECURE RANDOM =====
function getSecureRandomInt(max) {
    // Use crypto.getRandomValues for truly random selection
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
}

function shuffleArray(array) {
    // Fisher-Yates shuffle with cryptographically secure randomness
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = getSecureRandomInt(i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ===== ANALYZE COMMENTS =====
function analyzeComments() {
    const text = elements.commentsInput.value;

    if (!text.trim()) {
        alert('Please paste some comments first!');
        return;
    }

    const result = parseComments(text);

    commentsData.raw = text.split('\n');
    commentsData.parsed = result.parsed;
    commentsData.unique = result.parsed;
    commentsData.duplicates = result.duplicatesCount;

    // Update stats
    elements.totalComments.textContent = result.totalLines;
    elements.uniqueUsers.textContent = result.uniqueCount;
    elements.duplicatesRemoved.textContent = result.duplicatesCount;
    elements.validEntries.textContent = result.uniqueCount;

    // Animate numbers
    animateValue(elements.totalComments, 0, result.totalLines, 800);
    animateValue(elements.uniqueUsers, 0, result.uniqueCount, 800);
    animateValue(elements.duplicatesRemoved, 0, result.duplicatesCount, 800);
    animateValue(elements.validEntries, 0, result.uniqueCount, 800);

    // Display participants
    displayParticipants(result.parsed);

    // Show stats section
    elements.statsSection.style.display = 'block';
    elements.statsSection.classList.add('fade-in');

    // Show participants section
    elements.participantsSection.style.display = 'block';
    elements.participantsSection.classList.add('fade-in');

    // Hide winner section if it was showing
    elements.winnerSection.style.display = 'none';

    // Scroll to stats
    elements.statsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== NUMBER ANIMATION =====
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

// ===== PICK WINNERS =====
function pickWinners() {
    const count = parseInt(elements.winnerCount.value);

    if (count < 1) {
        alert('Please select at least 1 winner!');
        return;
    }

    if (count > commentsData.unique.length) {
        alert(`You can only pick up to ${commentsData.unique.length} winners (total unique participants)!`);
        return;
    }

    // Shuffle all participants and take the first N
    const shuffled = shuffleArray(commentsData.unique);
    const winners = shuffled.slice(0, count);

    commentsData.winners = winners;

    // Display winners
    displayWinners(winners);

    // Show winner section
    elements.winnerSection.style.display = 'block';
    elements.winnerSection.classList.add('fade-in');

    // Scroll to winners
    setTimeout(() => {
        elements.winnerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

// ===== DISPLAY WINNERS =====
function displayWinners(winners) {
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
                ${winner.comment ? `<div class="winner-comment">"${winner.comment}"</div>` : ''}
            </div>
        `;

        elements.winnersList.appendChild(card);
    });
}

// ===== EXPORT RESULTS =====
function exportResults() {
    if (commentsData.winners.length === 0) {
        alert('No winners to export yet!');
        return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    let text = `Instagram Comment Picker Results\n`;
    text += `Date: ${timestamp}\n`;
    text += `Total Comments: ${commentsData.raw.length}\n`;
    text += `Unique Participants: ${commentsData.unique.length}\n`;
    text += `Duplicates Removed: ${commentsData.duplicates}\n`;
    text += `\n${'='.repeat(50)}\n\n`;
    text += `WINNERS:\n\n`;

    commentsData.winners.forEach((winner, index) => {
        text += `${index + 1}. @${winner.username}\n`;
        if (winner.comment) {
            text += `   Comment: "${winner.comment}"\n`;
        }
        text += `\n`;
    });

    text += `\n${'='.repeat(50)}\n\n`;
    text += `ALL VALID PARTICIPANTS:\n\n`;

    commentsData.unique.forEach((participant, index) => {
        text += `${index + 1}. @${participant.username}\n`;
    });

    // Create download
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `instagram-picker-results-${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ===== PICK AGAIN =====
function pickAgain() {
    pickWinners();
}

// ===== EVENT LISTENERS =====
elements.analyzeBtn.addEventListener('click', analyzeComments);
elements.pickWinnerBtn.addEventListener('click', pickWinners);
elements.pickAgainBtn.addEventListener('click', pickAgain);
elements.exportBtn.addEventListener('click', exportResults);

// Allow Enter key in winner count input
elements.winnerCount.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (commentsData.unique.length > 0) {
            pickWinners();
        } else {
            analyzeComments();
        }
    }
});

// ===== INITIALIZATION =====
console.log('🎉 Instagram Comment Picker Loaded!');
console.log('📊 Anti-Cheat Protection: ENABLED');
console.log('🔒 Cryptographically Secure Random: ENABLED');
