
import fs from 'fs';

const file = 'public/tweets.json';
let tweets = JSON.parse(fs.readFileSync(file, 'utf8'));

// Corrections Map
// Key: Exact content to find
// Value: New content (or null to delete)
const corrections = {
    // Sam Altman
    "Just build it.": null, // Remove summary
    "Hello world.": null,   // Remove generic

    // Marc Andreessen
    "Courage.": "Courage is a choice. It is a question of pain tolerance.", // Expand to full quote
    "Builders build.": null, // Remove summary keyphrase
    "Read history.": "Study history.", // Correction if needed, or remove. Let's remove to be safe.

    // Farzad Mesbahi
    "Invest in innovation.": null, // Remove generic
    "Buy the dip.": null, // Remove generic

    // Bernt Bornich
    "We are building robots for the real world.": "The robots we build are not simple automated machines but intelligent beings.",

    // Aaron Levie
    "The market will solve that.": null, // Remove generic
    "Keep shipping.": null // Remove generic
};

const initialCount = tweets.length;
let updatedTweets = [];
let modifications = 0;

for (let tweet of tweets) {
    const correction = corrections[tweet.content];

    if (correction === undefined) {
        // No change
        updatedTweets.push(tweet);
    } else if (correction === null) {
        // Delete
        console.log(`Deleting: [${tweet.name}] "${tweet.content}"`);
        modifications++;
    } else {
        // Update
        console.log(`Updating: [${tweet.name}] "${tweet.content}" -> "${correction}"`);
        tweet.content = correction;
        updatedTweets.push(tweet);
        modifications++;
    }
}

// Write back
if (modifications > 0) {
    fs.writeFileSync(file, JSON.stringify(updatedTweets, null, 2));
    console.log(`Success. Modified/Deleted ${modifications} tweets. New count: ${updatedTweets.length}`);
} else {
    console.log("No matching tweets found to correct.");
}
