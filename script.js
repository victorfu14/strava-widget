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
    const currentYear = new Date().getFullYear();
    const widget = document.querySelector('.widget');
    
    // Set the inner HTML of the widget
    widget.innerHTML = `
        <h2>My ${currentYear} Stats</h2>
    
        <div id="stats-container">
            <div class="stat-group">
                <img src="img/cycling.gif" class="stat-icon" alt="Cycling icon">
                <div class="stat">
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
            </div>

            <div class="stat-group">
                <img src="img/hiking.gif" class="stat-icon" alt="Hiking icon">
                <div class="stat">
                    <div class="stat-label">Hike Distance</div>
                    <div class="stat-value">${stats.hike_dist}<span class="stat-unit"> mi</span></div>
                </div>
                <div class="stat">
                    <div class="stat-label">Hike Time</div>
                    <div class="stat-value">${stats.hike_time}<span class="stat-unit"> hr</span></div>
                </div>
                <div class="stat">
                    <div class="stat-label">Hike Elevation</div>
                    <div class="stat-value">${stats.hike_elev}<span class="stat-unit"> ft</span></div>
                </div>
            </div>
            
            <div class="stat-group">
                <img src="img/running.gif" class="stat-icon" alt="Running icon">
                <div class="stat">
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
            </div>
            
            <div class="stat-group">
                <img src="img/swimming.gif" class="stat-icon" alt="Swimming icon">
                <div class="stat">
                    <div class="stat-label">Swim Distance</div>
                    <div class="stat-value">${stats.swim_dist}<span class="stat-unit"> km</span></div>
                </div>
                <div class="stat">
                    <div class="stat-label">Swim Time</div>
                    <div class="stat-value">${stats.swim_time}<span class="stat-unit"> hr</span></div>
                </div>
            </div>

            <div class="stat-group">
                <img src="img/other-activities.gif" class="stat-icon" alt="Workout icon">
                <div class="stat">
                    <div class="stat-label">Other Sports</div>
                    <div class="stat-value">${stats.other_time}<span class="stat-unit"> hr</span></div>
                </div>
            </div>

        </div> 
        <a href="https://www.strava.com/athletes/${stats.athlete_id}" class="profile-link" target="_blank" rel="noopener noreferrer">
            View Profile on Strava :)
        </a> <br>
        <a href="https://www.flaticon.com/animated-icons/" title="animated icons" style="font-size: 70%;">Animated icons created by Freepik - Flaticon</a>
    `;
}

// Run the script when the page loads
fetchStats();