const storageEventName = 'storageChange';

function getItem(key) {
  const serializedState = localStorage.getItem(key);
  if (!serializedState) {
    return null;
  }
  return JSON.parse(serializedState);
}

function setItem(key, val) {
  const serializedState = JSON.stringify(val);

  localStorage.setItem(key, serializedState);

  const event = new Event(storageEventName);
  event.key = key;
  event.value = val;
  document.dispatchEvent(event);
}

function removeItem(key) {
  localStorage.removeItem(key);

  const event = new Event(storageEventName);
  event.key = key;
  document.dispatchEvent(event);
}

export default {
  getItem,
  setItem,
  removeItem,
  storageEventName,
};
