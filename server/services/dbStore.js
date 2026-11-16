const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function getFilePath(collection) {
  return path.join(dataDir, `${collection}.json`);
}

function readData(collection) {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${collection}:`, err);
    return [];
  }
}

function writeData(collection, data) {
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${collection}:`, err);
  }
}

// Initialize default users if users.json does not exist
function initDefaultUsers() {
  const users = readData('users');
  if (users.length === 0) {
    const defaultUsers = [
      {
        id: 'user_alex',
        username: 'AlexCode',
        displayName: 'Alex Rivers',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexCode',
        rating: 1740,
        competitions: 28,
        wins: 19,
        losses: 9,
        winRate: 67.8,
        totalPoints: 2480,
        avgScore: 88.5,
        solvedProblems: ['kadanes-algorithm', 'two-sum', 'binary-search', 'valid-parentheses']
      },
      {
        id: 'user_sarah',
        username: 'SarahDev',
        displayName: 'Sarah Chen',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SarahDev',
        rating: 1680,
        competitions: 25,
        wins: 16,
        losses: 9,
        winRate: 64.0,
        totalPoints: 2190,
        avgScore: 87.6,
        solvedProblems: ['maximum-product-subarray', 'coin-change', 'longest-increasing-subsequence']
      },
      {
        id: 'user_marcus',
        username: 'MarcusB',
        displayName: 'Marcus Bell',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MarcusB',
        rating: 1820,
        competitions: 34,
        wins: 25,
        losses: 9,
        winRate: 73.5,
        totalPoints: 3120,
        avgScore: 91.7,
        solvedProblems: ['edit-distance', 'trapping-rain-water', 'find-the-median-of-two-sorted-arrays']
      },
      {
        id: 'user_elena',
        username: 'ElenaR',
        displayName: 'Elena Rostova',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ElenaR',
        rating: 1590,
        competitions: 18,
        wins: 11,
        losses: 7,
        winRate: 61.1,
        totalPoints: 1540,
        avgScore: 85.5,
        solvedProblems: ['container-with-most-water', 'merge-intervals']
      }
    ];
    writeData('users', defaultUsers);
  }
}

initDefaultUsers();

module.exports = {
  find(collection, filterFn = () => true) {
    const list = readData(collection);
    return list.filter(filterFn);
  },
  findOne(collection, filterFn) {
    const list = readData(collection);
    return list.find(filterFn) || null;
  },
  insert(collection, item) {
    const list = readData(collection);
    list.push(item);
    writeData(collection, list);
    return item;
  },
  update(collection, filterFn, updateFn) {
    const list = readData(collection);
    let updated = null;
    const newList = list.map(item => {
      if (filterFn(item)) {
        updated = updateFn({ ...item });
        return updated;
      }
      return item;
    });
    writeData(collection, newList);
    return updated;
  },
  delete(collection, filterFn) {
    const list = readData(collection);
    const newList = list.filter(item => !filterFn(item));
    writeData(collection, newList);
    return list.length !== newList.length;
  }
};
