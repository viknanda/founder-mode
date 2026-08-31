import fs from 'fs';

// Read datasets
const currentFile = 'public/tweets.json';
const masterFile = 'public/data/tweets_master.json';

let newTweets = [];
let oldTweets = [];

try {
    newTweets = JSON.parse(fs.readFileSync(currentFile, 'utf8'));
    console.log(`Read ${newTweets.length} new authentically sourced tweets.`);

    // INJECT RECENT CONTENT (BATCH 1)
    try {
        const injected = JSON.parse(fs.readFileSync('injected_recent.json', 'utf8'));
        newTweets = [...newTweets, ...injected];
        console.log(`Injected Batch 1: ${injected.length} recent targeted tweets.`);
    } catch (e) {
        console.warn("No injected content found or error:", e.message);
    }

    // INJECT RECENT CONTENT (BATCH 2)
    try {
        const injected2 = JSON.parse(fs.readFileSync('injected_recent_2.json', 'utf8'));
        newTweets = [...newTweets, ...injected2];
        console.log(`Injected Batch 2: ${injected2.length} recent targeted tweets. Total New Pool: ${newTweets.length}`);
    } catch (e) {
        console.warn("No injected_2 content found or error:", e.message);
    }
} catch (e) {
    console.error("Error reading current tweets:", e.message);
}

try {
    const masterData = JSON.parse(fs.readFileSync(masterFile, 'utf8'));
    console.log("Read master file. Parsing...");

    // Flatten master data
    let idCounter = 1;
    for (const [key, author] of Object.entries(masterData.authors)) {
        const profile = author.profile;
        for (const t of author.tweets) {
            oldTweets.push({
                id: idCounter++, // Temporary ID
                name: profile.name,
                handle: profile.handle,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatarSeed}&backgroundColor=${profile.bg || 'ffffff'}`,
                content: t.text,
                time: t.date,
                stats: t.stats,
                companyUrl: profile.companyUrl
            });
        }
    }
    console.log(`Extracted ${oldTweets.length} original tweets from master.`);
} catch (e) {
    console.error("Error reading master tweets:", e.message);
}

// Merge: New (High Priority) + Old (Backfill)
// The user wants to "append" new to original. 
// But "New" ones are better (Deep Source). 
// deduplication should favor the NEW ones if content matches strictly?
// Actually, duplicates might differ slightly.
// We will append New -> Old.

const combined = [...oldTweets, ...newTweets].reverse(); // Process newest (injected) first

// Deduplicate
const seen = new Set();
const uniqueTweets = [];

// Normalize helper
const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50); // First 50 chars sufficient?

// We iterate through 'combined'.
// Since we put 'old' first, we keep 'old'. 
// If 'new' has same content, we skip it?
// NO. 'New' might have better formatting or timestamps. 
// BUT 'Old' has user-curated content maybe.
// The user said "append this new set TO the original".
// So Original + New.
// If I process in that order, the first one encountered (Original) is kept.
// If New is duplicate, it is dropped.
// This assumes Original is "Truth".

for (const tweet of combined) {
    if (!tweet.content) continue;
    const sig = normalize(tweet.content);
    if (!seen.has(sig)) {
        seen.add(sig);
        // Ensure ID is unique and persistent where possible
        // Use the tweet's own ID if it's "real" (>=20000 for new ones, or whatever for old)
        // We'll re-index later if needed, but keeping IDs is good for caching.
        uniqueTweets.push(tweet);
    }
}

console.log(`Merged Total (Raw): ${combined.length}`);
console.log(`Final Unique Total: ${uniqueTweets.length}`);

// ID Re-indexing to ensure cleanliness?
// Or keep existing IDs?
// If we re-index, we break client state if it relies on IDs (e.g. likes?).
// But this is a static JSON app. Re-indexing is fine.
// Let's re-index to be clean 1..N.
const finalized = uniqueTweets.map((t, i) => ({ ...t, id: i + 1 }));

// Write output
fs.writeFileSync('public/tweets.json', JSON.stringify(finalized, null, 2));
console.log(`Successfully merged and saved to public/tweets.json`);
