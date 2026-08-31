
import fs from 'fs';

const tweets = JSON.parse(fs.readFileSync('public/tweets.json', 'utf8'));

// Heuristics for "Suspicious" / "Slop" / "Misattribution"
// 1. Third person (e.g. "He", "They" - though less likely in tweets, worth checking "We are" for company slogans)
// 2. Very short (< 15 chars) - often generic like "AI is good"
// 3. Generic corporate speak keys ("Company is leading", "Our mission")
// 4. Repeated quotes (Dedupe check)

const suspicious = [];
const short = [];
const thirdPerson = [];

const authors = {};

tweets.forEach((t, i) => {
    const content = t.content;
    const author = t.name;

    if (!authors[author]) authors[author] = 0;
    authors[author]++;

    // Check very short
    if (content.length < 20) {
        short.push({ i, author, content });
    }

    // Check "We are" (often marketing copy, like the Brett Adcock one)
    if (content.toLowerCase().startsWith('we are') || content.toLowerCase().includes(' our ')) {
        thirdPerson.push({ i, author, content });
    }

    // Check specific "slop" phrases
    const slopPhrases = [
        "game changer", "revolutionary", "innovation", "future of", "unleash", "transforming"
    ];
    if (slopPhrases.some(p => content.toLowerCase().includes(p))) {
        suspicious.push({ i, author, content, reason: 'Marketing Speak' });
    }
});

console.log(`Analyzing ${tweets.length} tweets...`);
console.log('--- Author Counts ---');
console.log(authors);

console.log('\n--- Potential Third-Person / Company Speak ("We are", "Our") ---');
thirdPerson.forEach(t => console.log(`[${t.author}] ${t.content}`));

console.log('\n--- Very Short / Generic (< 20 chars) ---');
short.slice(0, 20).forEach(t => console.log(`[${t.author}] ${t.content}`)); // Show sample

console.log('\n--- Suspicious Marketing Keywords ---');
suspicious.slice(0, 20).forEach(t => console.log(`[${t.author}] ${t.content}`)); // Show sample
