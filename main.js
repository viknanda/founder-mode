// Removed static import
// import tweetsData from './tweets.json';

const TWEETS_PER_BATCH = 100;
const ROTATION_MS = 30000; // 30 seconds

// Time period distribution (relative to current date)
const TIME_DISTRIBUTION = {
  fresh: 0.10,      // <= 1 month (target 10%)
  recent: 0.25,     // <= 1 year (target 25%)
  mid: 0.35,        // 1-3 years (target 35%)
  historical: 0.30  // > 3 years (target 30%)
};


// let userOffset = 0; // Removed in refactor
let tweetsData = []; // State for fetched data

async function init() {
  const feedContainer = document.getElementById('feed');
  const tweetTemplate = document.getElementById('tweet-template');
  const timerElement = document.getElementById('timer');

  // Fetch Data
  try {
    const response = await fetch(`/tweets.json?t=${Date.now()}`); // Cache busting
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    tweetsData = JSON.parse(text);
    console.log(`Loaded ${tweetsData.length} tweets.`);
  } catch (err) {
    console.error("Failed to load tweets:", err);
    feedContainer.textContent = "Failed to load hype. Try again later.";
    return;
  }

  // State
  let currentSeedIndex = Date.now(); // Start fresh always (was based on 30s bucket)
  let nextRefreshTime = Date.now() + ROTATION_MS; // Initial full 30s

  function updateFeed() {
    const seedKey = `epoch-${currentSeedIndex}`;

    // Select Tweets with time-balanced distribution
    const currentTweets = getStratifiedSubset(tweetsData, seedKey, TWEETS_PER_BATCH);

    // DEBUG: Log refresh event
    console.log(`[Refresh] Seed: ${seedKey}, First Tweet: "${currentTweets[0]?.content.substring(0, 20)}..."`);

    // Clear & Render
    feedContainer.innerHTML = '';

    // Add inline ad as first item
    const inlineAd = document.createElement('div');
    inlineAd.className = 'inline-ad-container';

    // Add "Sponsored" label
    const adLabel = document.createElement('div');
    adLabel.className = 'ad-label';
    adLabel.textContent = 'Sponsored';
    inlineAd.appendChild(adLabel);

    // Create ad content container
    const adContent = document.createElement('div');
    adContent.className = 'inline-ad-content';

    // Create ad script
    const adScript = document.createElement('script');
    adScript.async = true;
    adScript.setAttribute('data-cfasync', 'false');
    adScript.src = 'https://pl28331080.effectivegatecpm.com/16d519e41cde9c05d3cd957495dc0172/invoke.js';
    adContent.appendChild(adScript);

    // Create ad container div
    const adContainer = document.createElement('div');
    adContainer.id = 'container-16d519e41cde9c05d3cd957495dc0172';
    adContent.appendChild(adContainer);

    inlineAd.appendChild(adContent);
    feedContainer.appendChild(inlineAd);

    // Render tweets
    renderFeed(currentTweets, feedContainer, tweetTemplate);

    // Add bottom ad as last item
    const bottomAd = document.createElement('div');
    bottomAd.className = 'bottom-ad-container';

    // Create atOptions script
    const optionsScript = document.createElement('script');
    optionsScript.textContent = `
      atOptions = {
        'key': '95a39c84b6f581cea25dce49e0171f41',
        'format': 'iframe',
        'height': 90,
        'width': 728,
        'params': {}
      };
    `;
    bottomAd.appendChild(optionsScript);

    // Create invoke script
    const invokeScript = document.createElement('script');
    invokeScript.src = 'https://www.highperformanceformat.com/95a39c84b6f581cea25dce49e0171f41/invoke.js';
    bottomAd.appendChild(invokeScript);

    feedContainer.appendChild(bottomAd);
  }

  function updateTimer() {
    const now = Date.now();
    const msLeft = nextRefreshTime - now;

    // Auto-advance if time is up - trigger full page reload
    if (msLeft <= 0) {
      location.reload();
      return;
    }

    const secsLeft = Math.ceil(msLeft / 1000);

    if (timerElement) {
      timerElement.textContent = `Let's Go 🚀: ${secsLeft}s (Click to refresh)`;
    }
  }

  // Initial Render
  updateFeed();

  // Timer Loop
  setInterval(() => {
    updateTimer();
  }, 100);

  // Global function for inline onclick (Safari compatibility)
  window.handleRefreshClick = function () {
    const btn = document.getElementById('timer');

    // 1. Advance content
    currentSeedIndex = Date.now(); // Guaranteed unique seed
    updateFeed();

    // 2. Reset Timer to full 30s
    nextRefreshTime = Date.now() + ROTATION_MS;

    // Visual feedback
    if (btn) {
      btn.style.borderColor = '#fff';
      setTimeout(() => {
        btn.style.borderColor = '#333';
      }, 200);
    }
  };

  // Also keep document listener as fallback
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#timer');
    if (!btn) return;
    window.handleRefreshClick();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* --- Core Logic --- */

// A simple seeded PRNG (Mulberry32)
function mulberry32(a) {
  return function () {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// Convert string seed to integer
function cyrb128(str) {
  let h1 = 1779033703, h2 = 3144134277,
    h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return (h1 ^ h2 ^ h3 ^ h4) >>> 0;
}

// Classify tweet into time period
// Classify tweet into time period based on relative age
function getTimePeriod(tweet) {
  const tweetDate = new Date(tweet.time);
  const now = new Date();
  const daysAgo = (now - tweetDate) / (1000 * 60 * 60 * 24);
  const yearsAgo = daysAgo / 365.25;

  if (daysAgo <= 30) return 'fresh';          // Within past month
  if (yearsAgo <= 1) return 'recent';         // 1 month to 1 year
  if (yearsAgo <= 3) return 'mid';            // 1-3 years ago
  return 'historical';                        // Older than 3 years
}

// Stratified sampling to maintain time period distribution
function getStratifiedSubset(allTweets, seedKey, count) {
  const seed = cyrb128(seedKey);
  const random = mulberry32(seed);

  // Calculate target counts for each period
  const counts = {
    fresh: Math.round(count * TIME_DISTRIBUTION.fresh),
    recent: Math.round(count * TIME_DISTRIBUTION.recent),
    mid: Math.round(count * TIME_DISTRIBUTION.mid),
    historical: Math.round(count * TIME_DISTRIBUTION.historical)
  };

  // Adjust for rounding errors
  const total = counts.fresh + counts.recent + counts.mid + counts.historical;
  if (total < count) counts.fresh += (count - total);
  if (total > count) counts.fresh -= (total - count);

  // Separate tweets by time period
  const buckets = {
    fresh: [],
    recent: [],
    mid: [],
    historical: []
  };

  allTweets.forEach(tweet => {
    const period = getTimePeriod(tweet);
    if (buckets[period]) {
      buckets[period].push(tweet);
    }
  });

  // Fisher-Yates shuffle each bucket with seeded random
  const shuffleBucket = (bucket) => {
    const shuffled = [...bucket];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  buckets.fresh = shuffleBucket(buckets.fresh);
  buckets.recent = shuffleBucket(buckets.recent);
  buckets.mid = shuffleBucket(buckets.mid);
  buckets.historical = shuffleBucket(buckets.historical);

  let result = [];

  // Fill according to distribution targets
  // Note: If a bucket doesn't have enough tweets, we just take what we have. 
  // In a robust system we'd backfill from others, but for now this is fine.
  result = result.concat(buckets.fresh.slice(0, counts.fresh));
  result = result.concat(buckets.recent.slice(0, counts.recent));
  result = result.concat(buckets.mid.slice(0, counts.mid));
  result = result.concat(buckets.historical.slice(0, counts.historical));

  // Final shuffle of the whole result
  const selected = shuffleBucket(result);

  console.log(`Selected ${selected.length} tweets - Fresh: ${counts.fresh}, Recent: ${counts.recent}, Mid: ${counts.mid}, Historical: ${counts.historical} (from ${allTweets.length} total in dataset)`);

  return selected;
}

// Keep old function for reference (not used)
function getSeededSubset(allTweets, seedKey, count) {
  const seed = cyrb128(seedKey);
  const random = mulberry32(seed);

  // Fisher-Yates Shuffle with seeded random
  const shuffled = [...allTweets];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}


/* --- Rendering --- */

function renderFeed(tweets, container, tTemplate) {
  tweets.forEach((tweet, index) => {
    // 1. Determine size
    const likesCount = parseStats(tweet.stats.likes);
    let sizeClass = '';

    if (likesCount > 400000) {
      sizeClass = 'tile-large';
    } else if (likesCount > 50000) {
      sizeClass = 'tile-wide';
    }

    // 2. Render Tweet
    const tweetNode = createTweetElement(tweet, tTemplate, sizeClass);
    container.appendChild(tweetNode);
  });
}

function parseStats(statString) {
  if (statString.includes('M')) {
    return parseFloat(statString) * 1000000;
  }
  if (statString.includes('k')) {
    return parseFloat(statString) * 1000;
  }
  return parseInt(statString);
}

function createTweetElement(data, template, sizeClass) {
  const clone = template.content.cloneNode(true);

  const article = clone.querySelector('.tweet-card');
  if (sizeClass) article.classList.add(sizeClass);

  const headerLink = clone.querySelector('.tweet-header');
  const handle = data.handle.replace('@', '');
  // Update headerLink.href to use companyUrl if available, otherwise default to X.com profile
  if (headerLink) {
    headerLink.href = data.companyUrl || `https://x.com/${handle}`;
  }

  const img = clone.querySelector('.avatar');
  img.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`;
  img.alt = data.name;

  clone.querySelector('.name').textContent = data.name;
  clone.querySelector('.handle').textContent = data.handle;
  clone.querySelector('.time').textContent = formatDate(data.time);
  clone.querySelector('.tweet-content').textContent = data.content;

  // Stats - Hex & Flame Mode
  const likesContainer = clone.querySelector('.stat');
  if (likesContainer) {
    const likesEl = likesContainer.querySelector('.likes');
    if (likesEl) {
      likesEl.textContent = toHex(data.stats.likes);
    }
  }
  // Remove replies logic as per instruction
  // clone.querySelector('.replies').textContent = data.stats.replies;

  return clone;
}

function toHex(statString) {
  let num;
  if (typeof statString === 'string') {
    if (statString.toUpperCase().includes('M')) {
      num = parseFloat(statString) * 1000000;
    } else if (statString.toUpperCase().includes('K')) {
      num = parseFloat(statString) * 1000;
    } else {
      num = parseInt(statString.replace(/,/g, ''), 10);
    }
  } else {
    num = statString;
  }

  if (isNaN(num)) return '0x0';
  return '0x' + Math.floor(num).toString(16).toUpperCase();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}
