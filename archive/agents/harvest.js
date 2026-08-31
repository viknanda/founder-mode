import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Config
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DROPS_FILE = path.join(__dirname, '../drops.txt');
const ARCHIVE_FILE = path.join(__dirname, '../drops_archive.txt');
const TWEETS_FILE = path.join(__dirname, '../public/tweets.json');
const SESSION_DIR = path.join(__dirname, '../.chrome_scraper_session');

async function harvest() {
    console.log('🚜 Hype Harvester Starting...');

    // 1. Read Drops
    if (!fs.existsSync(DROPS_FILE)) {
        console.log('No drops.txt found.');
        return;
    }
    const content = fs.readFileSync(DROPS_FILE, 'utf8');
    const urls = content.split('\n').map(l => l.trim()).filter(l => l.length > 0 && l.startsWith('http'));

    if (urls.length === 0) {
        console.log('📭 Drop box is empty.');
        return;
    }

    console.log(`found ${urls.length} drops to harvest.`);

    // 2. Launch Browser (Persistent Session)
    const browser = await puppeteer.launch({
        headless: false, // Must be visible for auth initially and to avoid bot detection
        userDataDir: SESSION_DIR,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();
    const newTweets = [];

    for (const url of urls) {
        try {
            console.log(`Processing: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle2' });

            // Check for login wall
            const isLoginWall = await page.$('a[href="/login"]');
            if (isLoginWall) {
                console.warn('⚠️ Login Wall Detected! Please login in the browser window.');
                await new Promise(r => setTimeout(r, 15000)); // Give user time to login
            }

            // Wait for tweet text
            await page.waitForSelector('[data-testid="tweetText"]', { timeout: 10000 });

            // Scrape Data
            const data = await page.evaluate((url) => {
                const textEl = document.querySelector('[data-testid="tweetText"]');
                const userEl = document.querySelector('[data-testid="User-Name"]');
                const timeEl = document.querySelector('time');

                // Likes (complex selector, usually by label "Like", or "x likes")
                // Strategy: find the like button group
                const likeButton = document.querySelector('[data-testid="like"]');
                let likes = "0";
                if (likeButton) {
                    const label = likeButton.getAttribute('aria-label') || "";
                    // Format: "156 likes" or "Like"
                    const match = label.match(/(\d+(?:,\d+)*(?:\.\d+)?[kKmMbB]?)\s+likes/i);
                    // Also sometimes inside the element as text
                    if (match) likes = match[1];
                    else {
                        // Try text content inside
                        likes = likeButton.textContent || "0";
                    }
                }

                if (!textEl || !userEl) return null;

                // Parse User Info
                const userText = userEl.innerText.split('\n'); // "Name\n@Handle\n..."
                const name = userText[0];
                const handle = userText[1]; // Usually checks out

                return {
                    id: url.split('?')[0].split('/').pop(), // Clean Tweet ID
                    name: name,
                    handle: handle,
                    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`, // Default to DiceBear for consistency
                    content: textEl.innerText,
                    time: timeEl ? timeEl.getAttribute('datetime') : new Date().toISOString(),
                    stats: {
                        likes: likes,
                        replies: "0" // Ignored by app now
                    },
                    companyUrl: `https://x.com/${handle.replace('@', '')}`
                };
            }, url);

            if (data) {
                newTweets.push(data);
                console.log(`✅ Scraped: ${data.name} - "${data.content.substring(0, 30)}..."`);
            } else {
                console.log(`❌ Failed to scrape content from ${url}`);
            }

            // Random pause to be nice
            await new Promise(r => setTimeout(r, 2000));

        } catch (e) {
            console.error(`❌ Error scraping ${url}:`, e.message);
        }
    }

    await browser.close();

    // 3. Save Data
    if (newTweets.length > 0) {
        let currentTweets = [];
        if (fs.existsSync(TWEETS_FILE)) {
            currentTweets = JSON.parse(fs.readFileSync(TWEETS_FILE, 'utf8'));
        }

        // Dedupe
        const existingIds = new Set(currentTweets.map(t => t.content)); // Use content as ID proxy since URL ids might vary
        const uniqueNews = newTweets.filter(t => !existingIds.has(t.content));

        const finalTweets = [...currentTweets, ...uniqueNews];
        fs.writeFileSync(TWEETS_FILE, JSON.stringify(finalTweets, null, 4));
        console.log(`💾 Saved ${uniqueNews.length} new tweets to tweets.json`);

        // 4. Archive Drops
        fs.appendFileSync(ARCHIVE_FILE, urls.join('\n') + '\n');
        fs.writeFileSync(DROPS_FILE, ''); // Clear inbox
        console.log('🧹 Drops archived.');
    } else {
        console.log('No new tweets found.');
    }
}

harvest();
