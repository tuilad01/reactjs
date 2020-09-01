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

dataAccess.getRemindGroupDateLocal = function () {
  return localStorageUtility.getDate(config.localStorage.remindGroupDate);
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

dataAccess.setRemindGroupDateLocal = function (date) {
  if (!date) throw new Error("function [setRemindGroupDateLocal] Error: invalid parameters")
  try {
    localStorageUtility.set(config.localStorage.remindGroupDate, date);
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

    if (!localWords.count) {
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
    const groupIds = groups.map(_ => _._id)
    const objNewGroupLearnLocal = {}

    // Remove group in learn local
    if (learnLocal[config.localStorage.forgetGroup]) delete learnLocal[config.localStorage.forgetGroup]
    if (learnLocal[config.localStorage.similarGroup]) delete learnLocal[config.localStorage.similarGroup]

    learnLocalGroupKeys.forEach(id => {
      if (groupIds.indexOf(id) === -1)
        delete learnLocal[id]
    })

    for (let i = 0; i < groups.length; i++) {
      const { _id, name, description, words, createdAt } = groups[i];

      // Create group learn local for new group
      if (!learnLocal[_id]) {
        const newGroupLearnLocal = dataAccess.createModelGroupLearnById(_id, name, description, words, createdAt, dataAccess.Priorities.Default)
        objNewGroupLearnLocal[_id] = newGroupLearnLocal
        continue
      }

      let { state1, state2, state3 } = learnLocal[_id]
      const wordIds = learnLocal[_id].words.map(_ => _._id)
      const newWordIds = words.map(_ => _._id)

      // Remove and update words group of learn local
      state1 = _removeAndUpdateWordInState(state1, words, newWordIds)
      state2 = _removeAndUpdateWordInState(state2, words, newWordIds)
      state3 = _removeAndUpdateWordInState(state3, words, newWordIds)

      // Add new words into state1 group of learn local
      const newWords = words
        .filter(_ => wordIds.indexOf(_._id) === -1)
        .map(word => dataAccess.createModelWordLearn(word))
      state1 = [...state1, ...newWords]

      // Update all into group of learn local
      learnLocal[_id] = { ...learnLocal[_id], name, description, words, state1, state2, state3 }
    }
    // Store learn local
    dataAccess.setLearnLocal({ ...learnLocal, ...objNewGroupLearnLocal })
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

dataAccess.createModelGroupLearn = (priority) => {
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
    learnNumberTimes: 0,
    priority: priority
  }
}

dataAccess.createSimilarGroup = function () {
  try {
    let learnLocal = dataAccess.getLearnLocal()
    if (!learnLocal || learnLocal[config.localStorage.similarGroup]) {
      return false
    }

    const similarGroup = dataAccess.createModelGroupLearn(dataAccess.Priorities.ForgetOrSimilarGroup)
    similarGroup._id = config.localStorage.similarGroup
    similarGroup.name = 'Similar words'
    similarGroup.description = 'Similar words'

    learnLocal[config.localStorage.similarGroup] = similarGroup
    dataAccess.setLearnLocal(learnLocal)
  } catch (error) {
    console.error(error.message)
    return false
  }

  return true
}

dataAccess.createForgetGroup = function () {
  try {
    let learnLocal = dataAccess.getLearnLocal()
    if (!learnLocal || learnLocal[config.localStorage.forgetGroup]) {
      return false
    }

    const forgetGroup = dataAccess.createModelGroupLearn(dataAccess.Priorities.ForgetOrSimilarGroup)
    forgetGroup._id = config.localStorage.forgetGroup
    forgetGroup.name = 'Forget words'
    forgetGroup.description = 'Forget words'

    learnLocal[config.localStorage.forgetGroup] = forgetGroup
    dataAccess.setLearnLocal(learnLocal)
  } catch (error) {
    console.log(error.message)
    return false
  }

  return true
}

dataAccess.addWordToForgetGroup = function () {
  const learnLocal = dataAccess.getLearnLocal()
  try {
    const forgetGroup = learnLocal[config.localStorage.forgetGroup]
    let wordsForgetGroup = [];
    for (const key in learnLocal) {
      if (
        key === config.localStorage.similarGroup ||
        key === config.localStorage.forgetGroup
      )
        continue;

      if (learnLocal.hasOwnProperty(key)) {
        const group = learnLocal[key];
        wordsForgetGroup = [...wordsForgetGroup, ...group.state1];
      }
    }

    forgetGroup.words = wordsForgetGroup;
    forgetGroup.state1 = wordsForgetGroup;
    forgetGroup.state2 = []
    forgetGroup.state3 = []
    forgetGroup.state = 1

    learnLocal[config.localStorage.forgetGroup] = forgetGroup
    dataAccess.setLearnLocal(learnLocal)
  } catch (error) {
    console.log(error.message)
    return false
  }

  return learnLocal
}

dataAccess.createModelGroupLearnById = function (id, name, description, words, createdAt, priority) {
  return {
    _id: id,
    name: name,
    description: description,
    words: words || [],
    createdAt: createdAt,
    state: 1,
    state1: words || [],
    state2: [],
    state3: [],
    percent: 1,
    learnNumberTimes: 0,
    priority: priority
  }
}

dataAccess.sortByPriority = (arrLearnLocal) => {
  return arrLearnLocal.sort((a, b) => {
    return b.priority - a.priority
  })
}

dataAccess.remindGroup = () => {
  const remindGroupDate = dataAccess.getRemindGroupDateLocal()
  const now = new Date()
  const today = new Date(now.setHours(0, 0, 0, 0))

  if (remindGroupDate < today) {
    const learnLocal = dataAccess.getLearnLocal()
    if (learnLocal) {
      const arrLearnLocal = Object.values(learnLocal)

      const learnedGroup = arrLearnLocal.filter(group => {
        if (group.lastLearnAt) {
          if (group.priority === dataAccess.Priorities.Default) {
            return true
          } else if (group.priority === dataAccess.Priorities.RemindGroup) {
            // update priority
            group.priority = dataAccess.Priorities.Default
            return true
          }
        }
        return false
      })

      learnedGroup.sort((a, b) => {
        return new Date(a.lastLearnAt) - new Date(b.lastLearnAt)
      })

      // get 10 group
      learnedGroup.slice(0, 10).forEach(group => {
        learnLocal[group._id].priority = dataAccess.Priorities.RemindGroup
      })

      dataAccess.setLearnLocal(learnLocal)
      dataAccess.setRemindGroupDateLocal(now.getTime())
    }    
  }
}

dataAccess.Priorities = {
  ForgetOrSimilarGroup: 9999,
  Pinned: 555,
  RemindGroup: 222,
  Default: 0,
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
