
import fs from 'fs';

// Load Data
const tweets = JSON.parse(fs.readFileSync('public/tweets.json', 'utf8'));

// 1. Counts & Duplicates
const total = tweets.length;
const seen = new Set();
const duplicates = [];
const unique = [];

const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50);

tweets.forEach(t => {
    const sig = normalize(t.content);
    if (seen.has(sig)) {
        duplicates.push(t);
    } else {
        seen.add(sig);
        unique.push(t);
    }
});

// 2. Time Distribution
const now = new Date();
const distribution = { recent: 0, mid: 0, historical: 0 };

function getTimePeriod(tweet) {
    const tweetDate = new Date(tweet.time);
    const yearsAgo = (now - tweetDate) / (1000 * 60 * 60 * 24 * 365.25);
    if (yearsAgo <= 1) return 'recent';
    if (yearsAgo <= 3) return 'mid';
    return 'historical';
}

unique.forEach(t => {
    distribution[getTimePeriod(t)]++;
});

// 3. Author Stats
const authors = {};
unique.forEach(t => {
    if (!authors[t.name]) authors[t.name] = 0;
    authors[t.name]++;
});

const authorList = Object.entries(authors).sort((a, b) => b[1] - a[1]);

// Output
console.log("=== Dataset Statistics ===");
console.log(`Total Tweets: ${total}`);
console.log(`Unique Tweets: ${unique.length}`);
console.log(`Duplicate Candidates: ${duplicates.length}`);
console.log("\n=== Time Distribution (Unique) ===");
console.log(`Recent (<1yr): ${distribution.recent} (${(distribution.recent / unique.length * 100).toFixed(1)}%)`);
console.log(`Mid (1-3yrs): ${distribution.mid} (${(distribution.mid / unique.length * 100).toFixed(1)}%)`);
console.log(`Historical (>3yrs): ${distribution.historical} (${(distribution.historical / unique.length * 100).toFixed(1)}%)`);
console.log("\n=== Author Breakdown ===");
console.log(`Total Authors: ${authorList.length}`);
authorList.forEach(([name, count]) => {
    console.log(`${name}: ${count}`);
});
