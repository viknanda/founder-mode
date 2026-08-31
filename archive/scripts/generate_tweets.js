const fs = require('fs');

// Author Profiles with Themes & Templates
const authors = {
    "Aaron Levie": {
        handle: "@levie",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aaron&backgroundColor=c0aede",
        companyUrl: "https://box.com",
        themes: [
            "AI eating software", "Enterprise software is underrated", "Cloud computing",
            "Startup hard truths", "Silicon Valley culture", "Box features", "Digital transformation"
        ],
        templates: [
            "AI is going to change {topic} more than {compare} did.",
            "{topic} is the new {compare}.",
            "Enterprise software is actually {adjective}.",
            "The best startups are {adjective}.",
            "Focus on {topic}.",
            "If you're not using AI for {topic}, you're falling behind.",
            "The cloud is just {topic} at scale."
        ],
        vocab: {
            topic: ["software", "content", "workflow", "collaboration", "security", "innovation"],
            compare: ["mobile", "the internet", "social media", "on-premise"],
            adjective: ["exciting", "critical", "underrated", "hard", "messy"]
        }
    },
    "Amit": {
        handle: "@amitisinvesting",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit&backgroundColor=c0aede",
        companyUrl: "https://x.com/amitisinvesting",
        themes: [
            "Stock market trends", "SaaS valuations", "Fed rates", "Long term investing",
            "Tech earnings", "Cloud growth", "Cybersecurity"
        ],
        templates: [
            "{company} earnings were {adjective}.",
            "Long {company}.",
            "{topic} is key for 2025.",
            "Market is {adjective}.",
            "Don't bet against {topic}.",
            "SaaS multiples are {adjective}.",
            "Invest in {topic}."
        ],
        vocab: {
            company: ["Nvidia", "Palantir", "Crowdstrike", "Tesla", "Microsoft", "Google"],
            topic: ["cloud", "security", "AI", "founders", "innovation"],
            adjective: ["insane", "resetting", "healthy", "wild", "undervalued"]
        }
    },
    "Bernt Bornich": {
        handle: "@BerntBornich",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bernt&backgroundColor=c0aede",
        companyUrl: "https://1x.tech",
        themes: [
            "Humanoid robots", "Embodied AI", "Safety in robotics", "Manufacturing at scale",
            "Androids in homes", "Labour shortage"
        ],
        templates: [
            "{topic} is the next frontier.",
            "Building {topic} is hard but necessary.",
            "Safety is {adjective}.",
            "Robots will {action}.",
            "We need {topic} to solve the labor shortage.",
            "1X is building {topic}.",
            "Embodied AI is {adjective}."
        ],
        vocab: {
            topic: ["humanoids", "hardware", "NEO", "EVE", "autonomy"],
            adjective: ["paramount", "complex", "real", "scalable", "safe"],
            action: ["help us", "work alongside us", "scale", "learn"]
        }
    },
    "Brett Adcock": {
        handle: "@adcock_brett",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Brett&backgroundColor=b6e3f4",
        companyUrl: "https://figure.ai",
        themes: [
            "Humanoid robots", "Figure 01/02", "Hardware hard tech", "Manufacturing",
            "AI in physical world", "Hiring engineers"
        ],
        templates: [
            "Figure {version} is {adjective}.",
            "Adding {capability} to the robot.",
            "Hard tech is {adjective}.",
            "We need more {role}.",
            "Deploying robots into {location}.",
            "The physical world needs {topic}.",
            "Building the {adjective} humanoid."
        ],
        vocab: {
            version: ["01", "02"],
            capability: ["speech", "vision", "dexterity", "speed"],
            adjective: ["hard", "critical", "advanced", "autonomous"],
            role: ["engineers", "builders", "talent"],
            location: ["manufacturing", "BMW", "homes", "logistics"],
            topic: ["AI", "automation", "labor"]
        }
    },
    "Brian Chesky": {
        handle: "@bchesky",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Brian&backgroundColor=c0aede",
        companyUrl: "https://airbnb.com",
        themes: [
            "Design driven", "User experience", "Travel trends", "Airbnb updates",
            "Creative process", "Founding story"
        ],
        templates: [
            "Design is {adjective}.",
            "We just released {feature}.",
            "Travel is {adjective}.",
            "Focus on the {topic}.",
            "Airbnb is {action}.",
            "The best products are {adjective}.",
            "I'm living in {location}."
        ],
        vocab: {
            adjective: ["details", "back", "changing", "emotional", "simple"],
            feature: ["AirCover", "Icons", "Categories", "transparent pricing"],
            topic: ["guest", "host", "experience", "journey", "detail"],
            action: ["listening", "shipping", "fixing", "designing"],
            location: ["Airbnbs", "San Francisco", "a new listing"]
        }
    },
    "Chamath Palihapitiya": {
        handle: "@chamath",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chamath&backgroundColor=c0aede",
        companyUrl: "https://socialcapital.com",
        themes: [
            "Markets", "Bitcoin", "Climate change", "Hard truths", "All-In Pod",
            "Venture capital", "Media"
        ],
        templates: [
            "{topic} is broken.",
            "Long {topic}.",
            "The media doesn't understand {topic}.",
            "We need to fix {topic}.",
            "Capitalism needs {noun}.",
            "{topic} to the moon.",
            "Just recorded {podcast}."
        ],
        vocab: {
            topic: ["education", "healthcare", "Bitcoin", "energy", "SaaS"],
            noun: ["capital", "reform", "truth", "growth"],
            podcast: ["All-In", "the pod"]
        }
    },
    "Elon Musk": {
        handle: "@elonmusk",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elon&backgroundColor=c0aede",
        companyUrl: "https://x.com",
        themes: [
            "Mars", "Tesla FSD", "SpaceX launches", "Free speech", "AI safety",
            "Memes", "Rockets"
        ],
        templates: [
            "{topic} is critical.",
            "Making life {adjective}.",
            "SpaceX {topic} happening soon.",
            "Tesla {topic} is {adjective}.",
            "True.",
            "Interesting.",
            "We must become {noun}.",
            "{topic} fixes this."
        ],
        vocab: {
            topic: ["FSD", "Starship", "Optimus", "X", "Mars"],
            adjective: ["multi-planetary", "essential", "mind-blowing", "next-level"],
            noun: ["multi-planetary", "a spacefaring civilization", "truth seekers"]
        }
    },
    "Farzad Mesbahi": {
        handle: "@farzadmesbahi",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Farzad&backgroundColor=c0aede",
        companyUrl: "https://youtube.com/@FarzadMesbahi",
        themes: [
            "Tesla analysis", "Elon Musk", "Media bias", "EV market", "First principles"
        ],
        templates: [
            "The media is wrong about {topic}.",
            "Tesla is {adjective}.",
            "Look at the {noun}.",
            "This is {adjective}.",
            "Elon is playing {game}.",
            "{topic} is inevitable."
        ],
        vocab: {
            topic: ["Tesla", "competition", "EVs", "FSD"],
            adjective: ["bankwupt", "winning", "insane", "obvious"],
            noun: ["margins", "growth", "data", "software"],
            game: ["4D chess", "the long game"]
        }
    },
    "Jack Dorsey": {
        handle: "@jack",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&backgroundColor=c0aede",
        companyUrl: "https://block.xyz",
        themes: [
            "Bitcoin", "Decentralization", "Nostr", "Open protocols", "Minimalism"
        ],
        templates: [
            "{topic} fixes this.",
            "Open {topic}.",
            "No.",
            "Yes.",
            "Focus on {topic}.",
            "Work on {topic}."
        ],
        vocab: {
            topic: ["bitcoin", "protocol", "nostr", "internet", "freedom"]
        }
    },
    "Jeff Bezos": {
        handle: "@JeffBezos",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jeff&backgroundColor=c0aede",
        companyUrl: "https://blueorigin.com",
        themes: [
            "Blue Origin", "Space", "Amazon history", "Day 1 mindset", "Customer obsession"
        ],
        templates: [
            "Gradatim Ferociter.",
            "It remains {day}.",
            "Start with the {noun}.",
            "Obsess over {topic}.",
            "Space is {adjective}.",
            "Invent and {action}."
        ],
        vocab: {
            day: ["Day 1"],
            noun: ["customer", "future", "vision"],
            topic: ["customers", "details", "long term"],
            adjective: ["hard", "big", "essential"],
            action: ["wander", "simplify", "scale"]
        }
    },
    "Jesse Pujji": {
        handle: "@jspujji",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jesse&backgroundColor=c0aede",
        companyUrl: "https://gatewayx.com",
        themes: [
            "Bootstrap", "Growth marketing", "Holding companies", "Mental models", "Business frameworks"
        ],
        templates: [
            "The best way to grow is {method}.",
            "Bootstrap your {noun}.",
            "Framework: {topic}.",
            "Growth is {adjective}.",
            "Hire for {trait}.",
            "My mental model for {topic}."
        ],
        vocab: {
            method: ["profitably", "slowly", "through content"],
            noun: ["business", "SaaS", "agency"],
            topic: ["hiring", "decisions", "marketing"],
            adjective: ["math", "simple", "hard"],
            trait: ["attitude", "aptitude", "hustle"]
        }
    },
    "Logan Kilpatrick": {
        handle: "@logankilpatrick",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Logan&backgroundColor=c0aede",
        companyUrl: "https://openai.com",
        themes: [
            "Developer experience", "OpenAI updates", "Python", "Community", "Building"
        ],
        templates: [
            "Developers are {adjective}.",
            "Building with {tool}.",
            "AI is {adjective} for devs.",
            "Just shipped {feature}.",
            "Community is {adjective}.",
            "Python is {adjective}."
        ],
        vocab: {
            adjective: ["amazing", "fast", "powerful", "creative"],
            tool: ["API", "GPT-4", "Python"],
            feature: ["updates", "docs", "examples"]
        }
    },
    "Marc Andreessen": {
        handle: "@pmarca",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marc&backgroundColor=c0aede",
        companyUrl: "https://a16z.com",
        themes: [
            "Tech optimism", "Building", "History", "Acc/Dec", "Startups", "Policy"
        ],
        templates: [
            "It is time to {action}.",
            "Software is {action} the world.",
            "{topic} is a moral imperative.",
            "Accelerate {topic}.",
            "The future is {adjective}.",
            "Read {book}."
        ],
        vocab: {
            action: ["build", "eating", "accelerate"],
            topic: ["tech", "growth", "AI", "energy"],
            adjective: ["bright", "ours to build", "now"],
            book: ["history", "the classics"]
        }
    },
    "Naval": {
        handle: "@naval",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Naval&backgroundColor=c0aede",
        companyUrl: "https://nav.al",
        themes: [
            "Wealth", "Happiness", "Leverage", "Philosophy", "Meditation", "Reading"
        ],
        templates: [
            "Wealth is {noun}.",
            "Happiness is {noun}.",
            "Seek {noun}, not {noun2}.",
            "Read {adjective}.",
            "Leverage is {adjective}.",
            "The closer you are to the truth, the more {adjective} you become."
        ],
        vocab: {
            noun: ["freedom", "peace", "assets", "equity", "knowledge"],
            noun2: ["status", "money", "noise"],
            adjective: ["silent", "permanent", "compound interest", "permissionless"]
        }
    },
    "Sam Altman": {
        handle: "@sama",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam&backgroundColor=c0aede",
        companyUrl: "https://openai.com",
        themes: [
            "AGI", "Scale", "Future", "Startups", "Y Combinator advice", "Energy"
        ],
        templates: [
            "AGI will be {adjective}.",
            "Scale is {adjective}.",
            "The cost of intelligence is trending to {value}.",
            "Focus on {topic}.",
            "Great founders {action}.",
            "Energy is {adjective}."
        ],
        vocab: {
            adjective: ["surprising", "all you need", "transformative", "abundant"],
            value: ["zero", "near zero"],
            topic: ["product", "users", "research", "compute"],
            action: ["ship", "iterate", "dream big"]
        }
    }
};

// Generate random date within range
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
}

function generateTweet(author, period) {
    const template = author.templates[Math.floor(Math.random() * author.templates.length)];
    let content = template;

    // Replace placeholders
    for (const [key, values] of Object.entries(author.vocab)) {
        const value = values[Math.floor(Math.random() * values.length)];
        content = content.replace(`{${key}}`, value);
        content = content.replace(`{${key}2}`, values[Math.floor(Math.random() * values.length)]);
    }

    // Formatting cleanups
    content = content.charAt(0).toUpperCase() + content.slice(1);

    // Stats
    const likes = Math.floor(Math.random() * 20000) + 500;
    const replies = Math.floor(likes * 0.1);

    // Time period
    let start, end;
    const now = new Date();
    if (period === 'recent') {
        start = new Date('2024-01-01');
        end = new Date('2025-12-30');
    } else if (period === 'mid') {
        start = new Date('2021-01-01');
        end = new Date('2023-12-31');
    } else {
        start = new Date('2014-01-01');
        end = new Date('2020-12-31');
    }

    return {
        id: Math.floor(Math.random() * 10000000),
        name: "temp", // Filled later
        handle: author.handle,
        avatar: author.avatar,
        content: content,
        time: randomDate(start, end),
        stats: {
            likes: likes > 1000 ? (likes / 1000).toFixed(1) + 'k' : likes.toString(),
            replies: replies > 1000 ? (replies / 1000).toFixed(1) + 'k' : replies.toString()
        },
        companyUrl: author.companyUrl
    };
}

// Generate the dataset
const generatedTweets = [];

for (const [name, author] of Object.entries(authors)) {
    // Target: 60 total per author
    // Recent: 12 (20%)
    // Mid: 30 (50%)
    // Historical: 18 (30%)

    for (let i = 0; i < 12; i++) {
        const tweet = generateTweet(author, 'recent');
        tweet.name = name;
        generatedTweets.push(tweet);
    }

    for (let i = 0; i < 30; i++) {
        const tweet = generateTweet(author, 'mid');
        tweet.name = name;
        generatedTweets.push(tweet);
    }

    for (let i = 0; i < 18; i++) {
        const tweet = generateTweet(author, 'historical');
        tweet.name = name;
        generatedTweets.push(tweet);
    }
}

console.log(JSON.stringify(generatedTweets, null, 2));
