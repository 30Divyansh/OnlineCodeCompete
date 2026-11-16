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
