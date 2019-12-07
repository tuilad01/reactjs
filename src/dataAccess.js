import localStorageUtility from './localStorageUtility';
import config from "./config";

const dataAccess = {};

dataAccess.getLearnLocal = function () {
  let learnLocal = {};
  const strLearnLocal = localStorageUtility.get(config.localStorage.learn);
  if (strLearnLocal) {
    learnLocal = JSON.parse(strLearnLocal);
  }
  return learnLocal;
}

dataAccess.getWordLocal = function () {
  var word = localStorageUtility.get(config.localStorage.words);
  if (word) return JSON.parse(word);
  return {
    count: 0
  };
}

dataAccess.getGroupLocal = function () {
  return localStorageUtility.getArray(config.localStorage.groups);
}

dataAccess.getNumberWordRemember = function () {
  let number = 0;
  const learnLocal = dataAccess.getLearnLocal();
  for (const key in learnLocal) {
    if (learnLocal.hasOwnProperty(key)) {
      if (
        key === config.localStorage.forgetGroup ||
        key === config.localStorage.similarGroup
      )
        continue;
      const element = learnLocal[key];
      number += element.state3.length;
    }
  }
  return number;
}

dataAccess.getWordHasGroup = function () {
  const groups = dataAccess.getGroupLocal();
  const words = groups.map(d => d.words);

  return words.flat();
}

export default dataAccess;
