const fs = require('fs');

function isUserAdvancement(value) {
  return typeof value === 'object' && value !== null && 'done' in value;
}

try {
  const content = fs.readFileSync('./fc818535-b5e1-44f2-b9b5-2705ff3ec0ee.json', 'utf8');
  const json = JSON.parse(content);
  
  let validEntryCount = 0;
  const advancements = new Map();
  for (const [key, value] of Object.entries(json)) {
    if (key === 'DataVersion') continue;
    if (isUserAdvancement(value)) {
      advancements.set(key, value);
      validEntryCount++;
    }
  }

  console.log('validEntryCount:', validEntryCount);
  console.log('first 3 keys:', Array.from(advancements.keys()).slice(0, 3));
} catch (e) {
  console.error(e);
}
