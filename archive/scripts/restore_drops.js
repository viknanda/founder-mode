import fs from 'fs';

const archivePath = 'drops_archive.txt';
const dropsPath = 'drops.txt';
const tweetsPath = 'public/tweets.json';

const archiveInfo = fs.readFileSync(archivePath, 'utf8').trim().split('\n');
// Get the last 9 lines (since we know there were 9)
const lastBatch = archiveInfo.slice(-9);

// Check tweets.json to see what we already have
const tweets = JSON.parse(fs.readFileSync(tweetsPath, 'utf8'));
const existingHandles = new Set(tweets.map(t => t.handle));

// Filter out the one we know succeeded (signulll)
// Actually better to check if the URL is "represented" in the tweets, 
// but the customized scraper doesn't save the source URL in the tweet object explicitly, 
// it extracts ID. 
// The successful one was signulll.
const toRetry = lastBatch.filter(url => !url.includes('signulll'));

fs.writeFileSync(dropsPath, toRetry.join('\n') + '\n');
console.log(`Restored ${toRetry.length} URLs to drops.txt`);
