import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_FILE = path.join(__dirname, 'public/data/tweets_master.json');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const masterData = JSON.parse(fs.readFileSync(MASTER_FILE, 'utf-8'));
const authors = Object.keys(masterData.authors);

function ask(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    console.log("--- Hype Tweets Manual Harvester ---");
    console.log("Existing Authors:");
    authors.forEach((a, i) => console.log(`${i + 1}. ${masterData.authors[a].profile.name} (@${a})`));

    const authorIdx = await ask("\nSelect author (number) or type 'new': ");

    let authorKey;
    if (authorIdx === 'new') {
        const handle = await ask("Enter handle (without @): ");
        const name = await ask("Enter full name: ");
        const companyUrl = await ask("Enter company URL: ");

        masterData.authors[handle] = {
            profile: {
                handle: `@${handle}`,
                name: name,
                avatarSeed: name.split(' ')[0],
                companyUrl: companyUrl,
                bg: "b6e3f4" // Default
            },
            tweets: []
        };
        authorKey = handle;
    } else {
        authorKey = authors[parseInt(authorIdx) - 1];
    }

    if (!authorKey || !masterData.authors[authorKey]) {
        console.error("Invalid selection.");
        rl.close();
        return;
    }

    const currentCount = masterData.authors[authorKey].tweets.length;
    console.log(`\nSelected: ${masterData.authors[authorKey].profile.name} (Current tweets: ${currentCount})`);

    while (true) {
        console.log("\n--- Add New Tweet ---");
        const text = await ask("Tweet Text: ");
        if (!text) break;

        const date = await ask("Date (YYYY-MM-DD): ");
        const likes = await ask("Likes (e.g., 50k): ");
        const replies = await ask("Replies (e.g., 1.2k): ");

        const confirmation = await ask("Is this verified? (y/n): ");
        if (confirmation.toLowerCase() === 'y') {
            masterData.authors[authorKey].tweets.push({
                text,
                date,
                stats: { likes, replies }
            });
            console.log("Saved!");
        } else {
            console.log("Skipped.");
        }

        const cont = await ask("Add another for this author? (y/n): ");
        if (cont.toLowerCase() !== 'y') break;
    }

    fs.writeFileSync(MASTER_FILE, JSON.stringify(masterData, null, 2));
    console.log("\nMaster dataset updated locally.");
    rl.close();
}

main();
