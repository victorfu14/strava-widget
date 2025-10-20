// This script runs on a server (GitHub Actions), not in the browser.
// It's safe to use secrets here, as they are loaded from environment variables.

const fetch = require('node-fetch');
const fs = require('fs');

// Get secrets from GitHub Actions environment variables
const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;
const ATHLETE_ID = process.env.STRAVA_ATHLETE_ID;

const authLink = "https://www.strava.com/oauth/token";
const statsLink = `https://www.strava.com/api/v3/athletes/${ATHLETE_ID}/stats`;

// 1. Function to get a new Access Token
async function getAccessToken() {
    const response = await fetch(authLink, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: REFRESH_TOKEN,
            grant_type: 'refresh_token'
        })
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to refresh access token: ${JSON.stringify(errorData)}`);
    }
    const data = await response.json();
    return data.access_token;
}

// 2. Function to fetch stats
async function getStravaStats(accessToken) {
    const response = await fetch(statsLink, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch Strava stats: ${JSON.stringify(errorData)}`);
    }
    const data = await response.json();
    return data;
}

// 3. Main function
async function main() {
    try {
        console.log("Fetching new access token...");
        const accessToken = await getAccessToken();
        
        console.log("Fetching Strava stats...");
        const stats = await getStravaStats(accessToken);

        // Process the stats (convert from meters to miles, seconds to hours)
        const processedStats = {
            ride_dist: (stats.ytd_ride_totals.distance / 1609.34).toFixed(0),
            ride_time: (stats.ytd_ride_totals.moving_time / 3600).toFixed(1),
            run_dist: (stats.ytd_run_totals.distance / 1609.34).toFixed(0),
            run_time: (stats.ytd_run_totals.moving_time / 3600).toFixed(1)
        };

        // Save the stats to a public JSON file
        fs.writeFileSync('stats.json', JSON.stringify(processedStats, null, 2));
        console.log("Successfully wrote stats to stats.json");
        console.log(JSON.stringify(processedStats, null, 2));

    } catch (error) {
        console.error(error);
        process.exit(1); // Exit with an error code to fail the Action
    }
}

main();