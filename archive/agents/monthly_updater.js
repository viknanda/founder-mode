import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { exec } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_FILE = path.join(__dirname, '../public/data/tweets_master.json');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const masterData = JSON.parse(fs.readFileSync(MASTER_FILE, 'utf-8'));
const authors = Object.keys(masterData.authors);

function ask(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function openUrl(url) {
    const start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
    exec(`${start} "${url}"`);
}

async function main() {
    console.log("--- Monthly Tweet Update Agent ---");
    console.log("This agent will help you discover and add new verified tweets from the last month.\n");

    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const dateStr = lastMonth.toISOString().split('T')[0];
    console.log(`Targeting tweets since: ${dateStr}\n`);

    for (const [index, handle] of authors.entries()) {
        const author = masterData.authors[handle];
        console.log(`\n[${index + 1}/${authors.length}] Checking: ${author.profile.name} (@${handle})`);

        // Construct a smart search URL
        // Using Google Search with site:x.com and date filters is reliable without API
        // "site:x.com/handle" ensures we target their profile or mentions
        const query = `site:x.com/${handle} "${author.profile.name}" after:${dateStr}`;
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

        console.log(`  Opening search for potential hits...`);
        openUrl(searchUrl);

        while (true) {
            const answer = await ask(`  Found a verified tweet? (paste URL or 'n' for next author): `);

            if (answer.toLowerCase() === 'n' || answer === '') break;

            // In a real automated agent, we would parse the URL. 
            // Here we ask for manual copy-paste to ensure 100% verification as requested.
            console.log("  > Great! Enter the details manually to confirm authenticity.");

            const text = await ask("    Text: ");
            const date = await ask("    Date (YYYY-MM-DD): ");
            // Optional stats
            const likes = await ask("    Likes (e.g. 5k): ") || "1k";
            const replies = await ask("    Replies (e.g. 100): ") || "50";

            if (text && date) {
                author.tweets.push({
                    text,
                    date,
                    stats: { likes, replies }
                });
                console.log("    [+] Tweet added!");
            }
        }
    }

    console.log("\nSaving updates...");
    fs.writeFileSync(MASTER_FILE, JSON.stringify(masterData, null, 2));
    console.log("Done! Master dataset updated.");
    rl.close();
}

main();
