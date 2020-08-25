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

dataAccess.setLearnLocal = function (learnLocal) {
  if (!learnLocal) throw new Error("function [setLearnLocal] Error: invalid parameters")
  try {
    localStorageUtility.set(config.localStorage.learn, learnLocal);
  } catch (error) {
    console.error(error.message)
  }
}

dataAccess.setGroupLocal = function (groups) {
  if (!groups) throw new Error("function [setGroupLocal] Error: invalid parameters")
  try {
    localStorageUtility.set(config.localStorage.groups, groups);
  } catch (error) {
    console.error(error.message)
  }
}

dataAccess.setWordLocal = function (totalNumber) {
  if (totalNumber < 0) throw new Error("function [setWordLocal] Error: invalid parameters")
  try {
    localStorageUtility.set(config.localStorage.words, totalNumber);
  } catch (error) {
    console.error(error.message)
  }
}

dataAccess.getGroupServer = function () {
  try {
    return fetch(`${config.apiUrl}/group/all`)
      .then(res => res.json())
      .then(groups => {
        return _handleData(groups)
      })
      .catch(error => {
        return _handleError(error)
      });
  } catch (error) {
    console.error(error.message)
  }
}

dataAccess.getTotalNumberWordServer = function () {
  try {
    return fetch(`${config.apiUrl}/word/total`)
      .then(res => res.json())
      .then(result => {
        return _handleData(result)
      })
      .catch(error => {
        return _handleError(error)
      });
  } catch (error) {
    console.error(error.message)
  }
}

dataAccess.getGroup = async function () {
  try {
    const localGroups = dataAccess.getGroupLocal();

    if (localGroups.length <= 0) {
      const result = await dataAccess.getGroupServer()

      if (result.isOk) {
        const groups = result.data
        dataAccess.setGroupLocal(groups)

        // TODO: update learn local
        dataAccess.updateLearnLocal(groups)

        // Return groups
        return groups
      } else {
        console.error(result.errorMessage)
      }
    } else {
      return localGroups
    }
  } catch (error) {
    console.error(error.message)
  }

  return []
}


dataAccess.getTotalNumberWord = async function () {
  try {
    const localWords = dataAccess.getWordLocal()

    if (!localWords) {
      const result = await dataAccess.getTotalNumberWordServer()

      if (result.isOk) {
        const totalNumberWord = result.data
        dataAccess.setWordLocal(totalNumberWord)
        // Return total number of words
        return totalNumberWord
      } else {
        console.error(result.errorMessage)
      }
    } else {
      return localWords
    }
  } catch (error) {
    console.error(error.message)
  }

  return 0
}

dataAccess.updateLearnLocal = function (groups) {
  if (!groups) throw new Error("function [updateLearnLocal] Error: invaild parameters")

  try {
    const learnLocal = dataAccess.getLearnLocal()
    if (!learnLocal) return false

    const learnLocalGroupKeys = Object.keys(learnLocal)
    // Remove group in learn local
    for (let i = 0; i < groups.length; i++) {
      const { _id, name, description, words } = groups[i];

      // Remove group nonexist
      if (learnLocalGroupKeys.indexOf(_id) === -1) {
        if (learnLocal[_id]) {
          delete learnLocal[_id]          
        }
        continue
      }

      let { state1, state2, state3 } = learnLocal[_id]
      const wordIds = learnLocal[_id].words.map(_ => _._id)

      // Remove and update words group of learn local
      state1 = _removeAndUpdateWordInState(state1)
      state2 = _removeAndUpdateWordInState(state2)
      state3 = _removeAndUpdateWordInState(state3)

      // Add new words into state1 group of learn local
      const newWords = words
        .filter(_ => wordIds.indexOf(_._id) === -1)
        .map(word => dataAccess.createModelWordLearn(word))
      state1 = [...state1, newWords]

      // Update all into group of learn local
      learnLocal[_id] = { ...learnLocal[_id], name, description, words, state1, state2, state3 }
    }

    // Store learn local
    dataAccess.setLearnLocal(learnLocal)
  } catch (error) {
    console.error(error.message)
    return false
  }

  return true
}

dataAccess.createModelWordLearn = (word) => {
  if (!word) throw new Error("function [createModelWordLearn] Error: invaild parameters")

  return {
    _id: word._id,
    name: word.name,
    mean: word.mean,
    flipped: false,
    display: true
  }
}

dataAccess.createModelGroupLearn = () => {
  return {
    _id: '',
    name: '',
    description: '',
    words: [],
    state: 1,
    state1: [],
    state2: [],
    state3: [],
    percent: 1,
    learnNumberTimes: 0
  }
}

dataAccess.createSimilarGroup = function () {  
  let learnLocal = dataAccess.getLearnLocal()
  if (!learnLocal || learnLocal[config.localStorage.similarGroup]) {
    return false
  }

  const similarGroup = dataAccess.createModelGroupLearn()
  similarGroup._id = config.localStorage.similarGroup
  similarGroup.name = 'Similar words'
  similarGroup.description = 'Similar words'

  learnLocal[config.localStorage.similarGroup] = similarGroup
  dataAccess.setLearnLocal(learnLocal)
}

dataAccess.createForgetGroup = function () {
  let learnLocal = dataAccess.getLearnLocal()
  if (!learnLocal || learnLocal[config.localStorage.forgetGroup]) {
    return false
  }

  const forgetGroup = dataAccess.createModelGroupLearn()
  forgetGroup._id = config.localStorage.forgetGroup
  forgetGroup.name = 'Forget words'
  forgetGroup.description = 'Forget words'

  learnLocal[config.localStorage.similarGroup] = forgetGroup
  dataAccess.setLearnLocal(learnLocal)
}

// Private functions
const _handleData = (data) => {
  return {
    isOk: true,
    data
  }
}

const _handleError = (error) => {
  return {
    isOk: false,
    errorMessage: error.message
  }
}

const _removeAndUpdateWordInState = (state, words, wordIds) => {
  return state.filter(word => {
    const index = wordIds.indexOf(word._id)
    // Update both name and mean word of group in learn local
    if (index >= 0) {
      const { name, mean } = words[index]
      word.name = name
      word.mean = mean
      return true
    }
    return false
  })
}




export default dataAccess;
