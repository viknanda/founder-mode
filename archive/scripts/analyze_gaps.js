
import fs from 'fs';

const tweets = JSON.parse(fs.readFileSync('public/tweets.json', 'utf8'));

function getTimePeriod(tweet) {
    const tweetDate = new Date(tweet.time);
    const now = new Date();
    const yearsAgo = (now - tweetDate) / (1000 * 60 * 60 * 24 * 365.25);

    if (yearsAgo <= 1) return 'recent';
    if (yearsAgo <= 3) return 'mid';
    return 'historical';
}

const analysis = {};
const overall = { recent: 0, mid: 0, historical: 0, total: 0 };

tweets.forEach(t => {
    const p = getTimePeriod(t);
    const author = t.name;

    if (!analysis[author]) {
        analysis[author] = { recent: 0, mid: 0, historical: 0, total: 0 };
    }

    analysis[author][p]++;
    analysis[author].total++;
    overall[p]++;
    overall.total++;
});

console.log("Overall:", overall);
console.log("Per Author:");
Object.keys(analysis).forEach(a => {
    const d = analysis[a];
    console.log(`[${a}] Total: ${d.total} | Rec: ${d.recent} (${(d.recent / d.total * 100).toFixed(0)}%) | Mid: ${d.mid} (${(d.mid / d.total * 100).toFixed(0)}%) | Hist: ${d.historical} (${(d.historical / d.total * 100).toFixed(0)}%)`);
});
