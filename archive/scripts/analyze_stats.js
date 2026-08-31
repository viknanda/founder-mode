import fs from 'fs';
const tweets = JSON.parse(fs.readFileSync('./tweets.json', 'utf8'));

const totalTweets = tweets.length;
const authors = {};

tweets.forEach(t => {
    authors[t.name] = (authors[t.name] || 0) + 1;
});

const authorList = Object.keys(authors).map(name => ({ name, count: authors[name] })).sort((a, b) => b.count - a.count);

console.log(`Total Tweets: ${totalTweets}`);
console.log(`Total Authors: ${authorList.length}`);
console.log('--- Tweets per Author ---');
authorList.forEach(a => console.log(`${a.name}: ${a.count}`));
