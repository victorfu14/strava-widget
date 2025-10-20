// This script is 100% public and safe.
// It just reads the stats.json file that our backend creates.

async function fetchStats() {
    try {
        // Fetch the data file. Add a cache-buster (?t=...) to get the latest version.
        const response = await fetch(`stats.json?t=${new Date().getTime()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok. Is stats.json file missing?');
        }
        const stats = await response.json();
        displayStats(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        document.getElementById('stats-container').innerHTML = 
            '<div class="loading" style="color: red;">Error: Could not load stats.</div>';
    }
}

function displayStats(stats) {
    const container = document.getElementById('stats-container');

    // We can format the data however we want,
    // because our backend script already did the math.
    container.innerHTML = `
        <div class="stat">
            <div class="stat-label">Ride Distance</div>
            <div class="stat-value">${stats.ride_dist}<span class="stat-unit"> mi</span></div>
        </div>
        <div class="stat">
            <div class="stat-label">Ride Time</div>
            <div class="stat-value">${stats.ride_time}<span class="stat-unit"> hr</span></div>
        </div>
        <div class="stat">
            <div class="stat-label">Run Distance</div>
            <div class="stat-value">${stats.run_dist}<span class="stat-unit"> mi</span></div>
        </div>
        <div class="stat">
            <div class="stat-label">Run Time</div>
            <div class="stat-value">${stats.run_time}<span class="stat-unit"> hr</span></div>
        </div>
    `;
}

// Run the script when the page loads
fetchStats();