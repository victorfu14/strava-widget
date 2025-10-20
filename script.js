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

    // Generate the HTML for our new stats, now with icons!
    container.innerHTML = `
        <div class="stat">
            <img src="img/cycling.gif" class="stat-icon" alt="Cycling icon">
            <div class="stat-label">Ride Distance</div>
            <div class="stat-value">${stats.ride_dist}<span class="stat-unit"> mi</span></div>
        </div>
        <div class="stat">
            <div class="stat-label">Ride Time</div>
            <div class="stat-value">${stats.ride_time}<span class="stat-unit"> hr</span></div>
        </div>
        <div class="stat">
            <div class="stat-label">Ride Elevation</div>
            <div class="stat-value">${stats.ride_elev}<span class="stat-unit"> ft</span></div>
        </div>
        
        <hr style="border:0; border-top: 1px solid #eee; margin: 20px 0;">

        <div class="stat">
            <img src="img/running.gif" class="stat-icon" alt="Running icon">
            <div class="stat-label">Run Distance</div>
            <div class="stat-value">${stats.run_dist}<span class="stat-unit"> mi</span></div>
        </div>
        <div class="stat">
            <div class="stat-label">Run Time</div>
            <div class="stat-value">${stats.run_time}<span class="stat-unit"> hr</span></div>
        </div>
        <div class="stat">
            <div class="stat-label">Run Elevation</div>
            <div class="stat-value">${stats.run_elev}<span class="stat-unit"> ft</span></div>
        </div>
        
        <hr style="border:0; border-top: 1px solid #eee; margin: 20px 0;">

        <div class="stat">
            <img src="img/swimming.gif" class="stat-icon" alt="Swimming icon">
            <div class="stat-label">Swim Distance</div>
            <div class="stat-value">${stats.swim_dist}<span class="stat-unit"> km</span></div>
        </div>
        <div class="stat">
            <div class="stat-label">Swim Time</div>
            <div class="stat-value">${stats.swim_time}<span class="stat-unit"> hr</span></div>
        </div>

        <a href="https://www.flaticon.com/free-animated-icons" title="animated icons">Animated icons created by Freepik - Flaticon</a>
    `;
}

// Run the script when the page loads
fetchStats();