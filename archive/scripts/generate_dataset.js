import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const COUNT = 100000;
const OUTPUT_FILE = path.join(__dirname, 'public/tweets.json');

// Authentic Historical Tweet Archive
// Source:// Hall of Fame - Strictly Verified Iconic Tweets
// Hall of Fame - Strictly Verified Iconic Tweets
// Load tweets from the master JSON file
const MASTER_FILE = path.join(__dirname, 'public/data/tweets_master.json');
const masterData = JSON.parse(fs.readFileSync(MASTER_FILE, 'utf-8'));

// Flatten the structure for the generator
const HALL_OF_FAME_TWEETS = [];

Object.values(masterData.authors).forEach(author => {
    author.tweets.forEach(tweet => {
        HALL_OF_FAME_TWEETS.push({
            handle: author.profile.handle,
            name: author.profile.name,
            avatarSeed: author.profile.avatarSeed,
            companyUrl: author.profile.companyUrl,
            bg: author.profile.bg,
            text: tweet.text,
            date: tweet.date,
            stats: tweet.stats
        });
    });
});

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const tweets = [];
console.log(`Generating ${COUNT} tweets from Verification Hall of Fame...`);

for (let i = 0; i < COUNT; i++) {
    // Sample from the archive with replacement
    const template = getRandom(HALL_OF_FAME_TWEETS);

    tweets.push({
        id: i + 1,
        name: template.name,
        handle: template.handle,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${template.avatarSeed}&backgroundColor=${template.bg}`,
        content: template.text,
        time: template.date, // Real date
        stats: template.stats, // Hardcoded stats
        companyUrl: template.companyUrl
    });
}

// Ensure directory exists
const dir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(tweets, null, 2)); // Pretty print for readability (optional, can be minified)
console.log(`Done! Saved to ${OUTPUT_FILE}`);
