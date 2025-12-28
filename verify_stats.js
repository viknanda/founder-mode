import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./public/tweets.json', 'utf8'));

const total = data.length;
const authors = {};

data.forEach(t => {
    authors[t.name] = (authors[t.name] || 0) + 1;
});

console.log(`Total Tweets: ${total}`);
console.log(`Total Authors: ${Object.keys(authors).length}`);
console.log('--- Tweets per Author ---');
Object.entries(authors)
    .sort(([, a], [, b]) => b - a)
    .forEach(([name, count]) => console.log(`${name}: ${count}`));
