
import fs from 'fs';

const tweets = JSON.parse(fs.readFileSync('public/tweets.json', 'utf8'));

// Period logic from main.js
function getTimePeriod(tweet) {
    const tweetDate = new Date(tweet.time);
    const now = new Date();
    const yearsAgo = (now - tweetDate) / (1000 * 60 * 60 * 24 * 365.25);

    if (yearsAgo <= 1) return 'recent';           // Within past year
    if (yearsAgo <= 3) return 'mid';              // 1-3 years ago
    if (yearsAgo <= 10) return 'historical';      // 3-10 years ago
    return 'historical';                          // Older than 10 years
}

const buckets = { recent: 0, mid: 0, historical: 0 };

tweets.forEach(t => {
    const period = getTimePeriod(t);
    if (buckets[period] !== undefined) buckets[period]++;
});

console.log("Total Tweets:", tweets.length);
console.log("Distribution:", buckets);

// calculate overlap probability for a sample size of 100 (20/50/30)
// If we pick 20 'recent' from N 'recent', overlap is...
const SAMPLE_SIZE = 100;
const DIST = { recent: 0.20, mid: 0.50, historical: 0.30 };

for (const [key, count] of Object.entries(buckets)) {
    const needed = SAMPLE_SIZE * DIST[key];
    console.log(`Bucket '${key}': Has ${count}, Needs ${needed}. Utilization: ${((needed / count) * 100).toFixed(1)}%`);
}
