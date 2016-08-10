const assign = Object.assign || require('object.assign'); // Polyfill maybe needed for browser support

export function assignToEmpty(oldObject, newObject) {
  return assign({}, oldObject, newObject);
}

export function removeCache() {
  return window.isDev ? `?${Date.now()}` : ``;
}

export function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch ( e ) {
    return false;
  }
  return true;
}

export function notEmpty(obj) {
  if (obj !== null && obj) {
    if (obj.length > 0) return true;
  } else {
    return false;
  }
}
