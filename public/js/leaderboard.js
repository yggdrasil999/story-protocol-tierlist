document.addEventListener('DOMContentLoaded', () => {
    const leaderboardList = document.getElementById('leaderboard-list');
    const refreshButton = document.getElementById('refresh-leaderboard-btn');

    async function loadLeaderboard() {
        try {
            leaderboardList.innerHTML = '<p>Loading leaderboard data...</p>'; // نمایش پیام بارگذاری
            // !!! آدرس API بک‌اند آنلاین شما (تصحیح شده) !!!
            const response = await fetch('https://story-protocol-tierlist-production.up.railway.app/api/rankings/leaderboard');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const leaderboardData = await response.json();
            renderLeaderboard(leaderboardData);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            leaderboardList.innerHTML = '<p style="color: #dc3545;">Failed to load leaderboard data. Please try again.</p>';
        }
    }

    function renderLeaderboard(data) {
        leaderboardList.innerHTML = ''; // پاک کردن محتوای قبلی

        if (data.length === 0) {
            leaderboardList.innerHTML = '<p>No rankings submitted yet. Be the first to rank!</p>';
            return;
        }

        data.forEach((item, index) => {
            const leaderboardItem = document.createElement('div');
            leaderboardItem.className = 'leaderboard-item glass-effect';
            leaderboardItem.innerHTML = `
                <div class="rank">${index + 1}.</div>
                <img src="${item.logoUrl}" alt="${item.name} Logo" class="project-logo">
                <div class="project-name">${item.name}</div>
                <div class="score-votes">
                    <div class="score">${item.averageScore}</div>
                    <div class="votes">(${item.voteCount} votes)</div>
                </div>
            `;
            leaderboardList.appendChild(leaderboardItem);
        });
    }

    refreshButton.addEventListener('click', loadLeaderboard);

    // بارگذاری لیدربرد هنگام بارگذاری صفحه
    loadLeaderboard();
});