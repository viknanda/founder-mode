// Removed static import
// import tweetsData from './tweets.json';

const TWEETS_PER_BATCH = 100;
const ROTATION_MS = 30000; // 30 seconds

// let userOffset = 0; // Removed in refactor
let tweetsData = []; // State for fetched data

async function init() {
  const feedContainer = document.getElementById('feed');
  const tweetTemplate = document.getElementById('tweet-template');
  const timerElement = document.getElementById('timer');

  if (!feedContainer || !tweetTemplate) {
    console.error("Missing DOM elements", { feedContainer, tweetTemplate });
    return;
  }

  // Fetch Data
  try {
    const response = await fetch('/tweets.json');
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
  let currentSeedIndex = Math.floor(Date.now() / ROTATION_MS); // Start from current wall time
  let nextRefreshTime = Date.now() + ROTATION_MS; // Initial full 30s

  function updateFeed() {
    const seedKey = `epoch-${currentSeedIndex}`;

    // Select Tweets
    const currentTweets = getSeededSubset(tweetsData, seedKey, TWEETS_PER_BATCH);

    // Clear & Render
    feedContainer.innerHTML = '';

    // Add inline ad as first item
    const inlineAd = document.createElement('div');
    inlineAd.className = 'inline-ad-container';
    inlineAd.innerHTML = `
      <div class="ad-label">Sponsored</div>
      <div class="inline-ad-content">
        <script async="async" data-cfasync="false" src="https://pl28331080.effectivegatecpm.com/16d519e41cde9c05d3cd957495dc0172/invoke.js"></script>
        <div id="container-16d519e41cde9c05d3cd957495dc0172"></div>
      </div>
    `;
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

    // Auto-advance if time is up
    if (msLeft <= 0) {
      currentSeedIndex++;
      nextRefreshTime = now + ROTATION_MS;
      updateFeed();
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
    currentSeedIndex++;
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
  headerLink.href = `https://x.com/${handle}`;

  const img = clone.querySelector('.avatar');
  img.src = data.avatar;
  img.alt = data.name;

  clone.querySelector('.name').textContent = data.name;
  clone.querySelector('.handle').textContent = data.handle;
  clone.querySelector('.time').textContent = data.time;
  clone.querySelector('.tweet-content').textContent = data.content;

  clone.querySelector('.replies').textContent = data.stats.replies;
  clone.querySelector('.likes').textContent = data.stats.likes;

  return clone;
}

