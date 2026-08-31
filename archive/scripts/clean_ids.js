import fs from 'fs';

const TWEETS_FILE = './tweets.json';
const tweets = JSON.parse(fs.readFileSync(TWEETS_FILE, 'utf8'));

let cleanedCount = 0;
const cleanedTweets = tweets.map(t => {
    if (t.id && String(t.id).includes('?')) {
        t.id = String(t.id).split('?')[0];
        cleanedCount++;
    }
    return t;
});

fs.writeFileSync(TWEETS_FILE, JSON.stringify(cleanedTweets, null, 4));
console.log(`Cleaned ${cleanedCount} tweet IDs.`);
