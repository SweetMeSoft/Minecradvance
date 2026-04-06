const fs = require('fs');

const masterData = JSON.parse(fs.readFileSync('./public/assets/data/master-advancements.json', 'utf8'));
const userData = JSON.parse(fs.readFileSync('./fc818535-b5e1-44f2-b9b5-2705ff3ec0ee.json', 'utf8'));

// build state
const stateAdvancements = new Map();
for (const [k, v] of Object.entries(userData)) {
  if (k === 'DataVersion') continue;
  if (typeof v === 'object' && v !== null && 'done' in v) {
    stateAdvancements.set(k, v);
  }
}

// compute
let totalAdvancements = 0;
let completedAdvancements = 0;

for (const master of masterData.advancements) {
  totalAdvancements++;
  const userAdv = stateAdvancements.get(master.id);
  let completed = false;
  if (userAdv) {
    if (master.criteria && master.criteria.length > 0) {
      const completedCriteria = master.criteria.filter(c => c in userAdv.criteria);
      completed = userAdv.done;
    } else {
      completed = userAdv.done;
    }
  }
  if (completed) completedAdvancements++;
}

console.log('Total:', totalAdvancements);
console.log('Completed:', completedAdvancements);
