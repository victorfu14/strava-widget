require('dotenv').config();

const fetch = require('node-fetch');
const fs = require('fs');

// Get secrets from GitHub Actions environment variables
const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;
const ATHLETE_ID = process.env.STRAVA_ATHLETE_ID;

const authLink = "https://www.strava.com/oauth/token";
const statsLink = `https://www.strava.com/api/v3/athletes/${ATHLETE_ID}/stats`;

// --- Get Access Token ---
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

// --- Get YTD Stats for Run/Ride/Swim ---
async function getYTDStats(accessToken) {
    const response = await fetch(statsLink, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch YTD stats: ${JSON.stringify(errorData)}`);
    }
    return await response.json();
}

// --- Get Other Activities ---
async function getManualExtraStats(accessToken) {
    console.log("Fetching manual hike and other stats...");
    let page = 1;
    let hikingDistance = 0;
    let hikingTime = 0;
    let hikingElevation = 0;
    let otherTime = 0;
    const perPage = 100;

    const currentYear = new Date().getFullYear();
    const afterTimestamp = Math.floor(new Date(currentYear, 0, 1).getTime() / 1000);

    while (true) {
        console.log(`Fetching page ${page} of activities...`);
        const activitiesUrl = `https://www.strava.com/api/v3/athlete/activities?after=${afterTimestamp}&per_page=${perPage}&page=${page}`;
        
        const response = await fetch(activitiesUrl, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to fetch activities: ${JSON.stringify(errorData)}`);
        }
        
        const activities = await response.json();
        
        if (activities.length === 0) {
            console.log("No more activities, stopping loop.");
            break;
        }

        // Loop through activities and categorize them
        for (const activity of activities) {
            if (activity.type === 'Hike') {
                hikingDistance += activity.distance;
                hikingTime += activity.moving_time;
                hikingElevation += activity.total_elevation_gain;
            } 
            // If it's NOT Ride, Run, Swim, or Hike, add its time to "Other"
            else if (activity.type !== 'Ride' && activity.type !== 'Run' && activity.type !== 'Swim') {
                otherTime += activity.moving_time;
            }
        }
        
        page++; 
    }

    console.log("Finished fetching extra stats.");
    return { hikingDistance, hikingTime, hikingElevation, otherTime };
}


async function main() {
    try {
        console.log("Fetching new access token...");
        const accessToken = await getAccessToken();
        
        console.log("Fetching YTD stats (Run, Ride, Swim)...");
        const ytdStats = await getYTDStats(accessToken);
        
        console.log("Fetching YTD stats (Hike & Other)...");
        const extraStats = await getManualExtraStats(accessToken); // <-- Updated function call

        // Process the stats
        const processedStats = {
            athlete_id: ATHLETE_ID,

            // Rides
            ride_dist: (ytdStats.ytd_ride_totals.distance / 1609.34).toFixed(0),
            ride_time: (ytdStats.ytd_ride_totals.moving_time / 3600).toFixed(1),
            ride_elev: (ytdStats.ytd_ride_totals.elevation_gain * 3.28084).toFixed(0),

            // Runs
            run_dist: (ytdStats.ytd_run_totals.distance / 1609.34).toFixed(0),
            run_time: (ytdStats.ytd_run_totals.moving_time / 3600).toFixed(1),
            run_elev: (ytdStats.ytd_run_totals.elevation_gain * 3.28084).toFixed(0),

            // Swims
            swim_dist: (ytdStats.ytd_swim_totals.distance / 1000).toFixed(1), 
            swim_time: (ytdStats.ytd_swim_totals.moving_time / 3600).toFixed(1),
            
            // Hikes
            hike_dist: (extraStats.hikingDistance / 1609.34).toFixed(0),
            hike_time: (extraStats.hikingTime / 3600).toFixed(1),
            hike_elev: (extraStats.hikingElevation * 3.28084).toFixed(0),
            
            // Other (NEW)
            other_time: (extraStats.otherTime / 3600).toFixed(1)
        };

        // Save the stats to a public JSON file
        fs.writeFileSync('stats.json', JSON.stringify(processedStats, null, 2));
        console.log("Successfully wrote all stats to stats.json");
        console.log(JSON.stringify(processedStats, null, 2));

    } catch (error) {
        console.error(error);
        process.exit(1); 
    }
}

main();