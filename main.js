// Vercel Web Analytics
import { inject } from '@vercel/analytics';
inject();

const TWEETS_PER_BATCH = 100;
const ROTATION_MS = 30000; // 30 seconds

// Evergreen Era-based Distribution (Modern: 34%, Growth: 33%, Classic: 33%)
const ERA_DISTRIBUTION = {
  modern: 0.34,   // 2025-2026 (Modern / AI Wave)
  growth: 0.33,   // 2021-2024 (Unicorn & Tech Boom)
  classic: 0.33   // 2006-2020 (Classic / Vintage Web)
};

let tweetsData = []; // State for fetched dataset

async function init() {
  const feedContainer = document.getElementById('feed');
  const tweetTemplate = document.getElementById('tweet-template');
  const timerElement = document.getElementById('timer');

  // Fetch Dataset
  try {
    const response = await fetch(`/tweets.json?t=${Date.now()}`); // Cache busting
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    tweetsData = JSON.parse(text);
  } catch (err) {
    console.error("Failed to load tweets:", err);
    if (feedContainer) {
      feedContainer.textContent = "Failed to load hype. Try again later.";
    }
    return;
  }

  // State
  let currentSeedIndex = Date.now();
  let nextRefreshTime = Date.now() + ROTATION_MS;

  function updateFeed() {
    if (!feedContainer || !tweetTemplate) return;
    const seedKey = `epoch-${currentSeedIndex}`;
    const currentTweets = getStratifiedSubset(tweetsData, seedKey, TWEETS_PER_BATCH);

    feedContainer.innerHTML = '';
    renderFeed(currentTweets, feedContainer, tweetTemplate);
  }

  function updateTimer() {
    const now = Date.now();
    const msLeft = nextRefreshTime - now;

    // Auto-advance feed smoothly when time is up
    if (msLeft <= 0) {
      currentSeedIndex = Date.now();
      updateFeed();
      nextRefreshTime = Date.now() + ROTATION_MS;
      return;
    }

    const secsLeft = Math.ceil(msLeft / 1000);
    if (timerElement) {
      timerElement.textContent = `Let's Go 🚀: ${secsLeft}s (Click to refresh)`;
    }
  }

  // Initial Render
  updateFeed();

  // Timer Loop (100ms interval for smooth ticking)
  setInterval(updateTimer, 100);

  // Smooth in-memory refresh
  window.handleRefreshClick = function () {
    const btn = document.getElementById('timer');
    currentSeedIndex = Date.now();
    updateFeed();
    nextRefreshTime = Date.now() + ROTATION_MS;

    if (btn) {
      btn.style.borderColor = '#fff';
      setTimeout(() => {
        btn.style.borderColor = '#333';
      }, 200);
    }
  };

  // Event listener on timer button
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#timer');
    if (!btn) return;
    e.preventDefault();
    window.handleRefreshClick();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* --- Core Algorithms --- */

// Deterministic PRNG (Mulberry32)
function mulberry32(a) {
  return function () {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Convert string seed to 128-bit integer hash
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

// Classify tweet into tech era based on year
function getEra(tweet) {
  const year = new Date(tweet.time).getFullYear();
  if (year >= 2025) return 'modern';      // 2025-2026 (Modern / AI Wave)
  if (year >= 2021) return 'growth';      // 2021-2024 (Unicorn & Tech Boom)
  return 'classic';                       // 2006-2020 (Classic / Vintage Web)
}

// Stratified sampling to project evenly from each era
function getStratifiedSubset(allTweets, seedKey, count) {
  if (!allTweets || allTweets.length === 0) return [];
  if (allTweets.length <= count) return [...allTweets];

  const seed = cyrb128(seedKey);
  const random = mulberry32(seed);

  // Target counts per era
  const counts = {
    modern: Math.round(count * ERA_DISTRIBUTION.modern),
    growth: Math.round(count * ERA_DISTRIBUTION.growth),
    classic: Math.round(count * ERA_DISTRIBUTION.classic)
  };

  // Adjust for rounding differences
  const total = counts.modern + counts.growth + counts.classic;
  if (total < count) counts.modern += (count - total);
  if (total > count) counts.modern -= (total - count);

  // Group tweets into era buckets
  const buckets = {
    modern: [],
    growth: [],
    classic: []
  };

  allTweets.forEach(tweet => {
    const era = getEra(tweet);
    if (buckets[era]) {
      buckets[era].push(tweet);
    }
  });

  // Fisher-Yates shuffle with seeded random
  const shuffleBucket = (bucket) => {
    const shuffled = [...bucket];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  buckets.modern = shuffleBucket(buckets.modern);
  buckets.growth = shuffleBucket(buckets.growth);
  buckets.classic = shuffleBucket(buckets.classic);

  // Assemble quota slices
  const selectedModern = buckets.modern.slice(0, counts.modern);
  const selectedGrowth = buckets.growth.slice(0, counts.growth);
  const selectedClassic = buckets.classic.slice(0, counts.classic);

  let result = [...selectedModern, ...selectedGrowth, ...selectedClassic];

  // Backfill fallback in case any era has fewer items than requested quota
  if (result.length < count) {
    const chosenSet = new Set(result);
    const pool = shuffleBucket(allTweets.filter(t => !chosenSet.has(t)));
    const needed = count - result.length;
    result = result.concat(pool.slice(0, needed));
  }

  // Final seeded shuffle across combined batch
  return shuffleBucket(result);
}

/* --- Rendering & Formatting --- */

function renderFeed(tweets, container, tTemplate) {
  tweets.forEach((tweet) => {
    const likesCount = parseStats(tweet.stats?.likes);
    let sizeClass = '';

    if (likesCount > 400000) {
      sizeClass = 'tile-large';
    } else if (likesCount > 50000) {
      sizeClass = 'tile-wide';
    }

    const tweetNode = createTweetElement(tweet, tTemplate, sizeClass);
    container.appendChild(tweetNode);
  });
}

// Unified metric parser (handles numbers, '120k', '1.5M', commas)
function parseStats(stat) {
  if (typeof stat === 'number') return isNaN(stat) ? 0 : stat;
  if (!stat) return 0;
  const clean = String(stat).trim().toUpperCase();
  if (clean.endsWith('M')) {
    return (parseFloat(clean) || 0) * 1000000;
  }
  if (clean.endsWith('K')) {
    return (parseFloat(clean) || 0) * 1000;
  }
  return parseInt(clean.replace(/,/g, ''), 10) || 0;
}

function toHex(stat) {
  const num = parseStats(stat);
  return '0x' + Math.floor(num).toString(16).toUpperCase();
}

// Security: Validate URL protocol to prevent javascript: XSS
function sanitizeUrl(url, fallbackHandle) {
  if (url && typeof url === 'string') {
    const trimmed = url.trim();
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      return trimmed;
    }
  }
  const cleanHandle = (fallbackHandle || '').replace('@', '').trim();
  return cleanHandle ? `https://x.com/${cleanHandle}` : '#';
}

function createTweetElement(data, template, sizeClass) {
  const clone = template.content.cloneNode(true);
  const article = clone.querySelector('.tweet-card');
  if (sizeClass) article.classList.add(sizeClass);

  const headerLink = clone.querySelector('.tweet-header');
  if (headerLink) {
    headerLink.href = sanitizeUrl(data.companyUrl, data.handle);
    headerLink.target = '_blank';
    headerLink.rel = 'noopener noreferrer';
  }

  const img = clone.querySelector('.avatar');
  if (img) {
    img.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name || 'Founder')}`;
    img.alt = data.name || 'Avatar';
  }

  // Safe DOM binding using textContent
  clone.querySelector('.name').textContent = data.name || '';
  clone.querySelector('.handle').textContent = data.handle || '';
  clone.querySelector('.time').textContent = formatDate(data.time);
  clone.querySelector('.tweet-content').textContent = data.content || '';

  const likesContainer = clone.querySelector('.stat');
  if (likesContainer) {
    const likesEl = likesContainer.querySelector('.likes');
    if (likesEl) {
      likesEl.textContent = toHex(data.stats?.likes);
    }
  }

  return clone;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

