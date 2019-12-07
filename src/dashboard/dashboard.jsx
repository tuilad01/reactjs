import React, { Component } from "react";

// Config
import config from "./../config";
import utilities from './../utilities'
import dataAccess from "./../dataAccess";
import localStorageUtility from "./../localStorageUtility";

// import component
import SpinnerLoading from "../spinner-loading/spinner-loading";
// import Statistic from "./component/statistic";
import SameWordModal from "./component/sameword.modal";
// import ListGroup from './component/list'

let learnLocal = dataAccess.getLearnLocal();

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      groups: [],
      similarGroup: {},
      forgetGroup: {},
      isShowModal: false,
    };
    this.wordLocal = dataAccess.getWordLocal();
    this.groupLocal = dataAccess.getGroupLocal();
    this.numberWordRemember = dataAccess.getNumberWordRemember();
    this.percentProgressBar = Math.round(
      (this.numberWordRemember * 100) / this.wordLocal.count
    );
  }

  componentDidMount() {
    const groups = localStorageUtility.getArray(config.localStorage.groups);
    const similarGroup = learnLocal[config.localStorage.similarGroup];
    const forgetGroup = learnLocal[config.localStorage.forgetGroup];

    this.setState({
      isLoaded: true,
      groups: groups,
      similarGroup: similarGroup || {},
      forgetGroup: forgetGroup || {}
    });
  }



  /* Events SameWord Modal component  */

  openModal = () => {
    this.setState({
      isShowModal: true
    });
  };

  closeModal = () => {
    this.setState({
      isShowModal: false
    });
  };

  onChange = () => {
    learnLocal = dataAccess.getLearnLocal();
    const similarGroup = learnLocal[config.localStorage.similarGroup];
    this.setState({
      similarGroup: similarGroup
    })
  }

  /* END */

  addForgetGroup = () => {
    const learnLocalClone = { ...learnLocal };
    let forgetGroup = { ...this.state.forgetGroup };
    let wordsForgetGroup = [];
    for (const key in learnLocalClone) {
      if (
        key === config.localStorage.similarGroup ||
        key === config.localStorage.forgetGroup
      )
        continue;

      if (learnLocalClone.hasOwnProperty(key)) {
        const group = learnLocalClone[key];
        wordsForgetGroup = [...wordsForgetGroup, ...group.state1];
      }
    }

    forgetGroup.words = wordsForgetGroup;
    forgetGroup.state1 = wordsForgetGroup;
    forgetGroup.state2 = []
    forgetGroup.state3 = []
    forgetGroup.state = 1

    learnLocal[config.localStorage.forgetGroup] = forgetGroup;

    localStorageUtility.set(config.localStorage.learn, learnLocal);

    this.setState({
      forgetGroup: forgetGroup
    });
  };


  render() {
    const {
      error,
      isLoaded,
      groups,
      isShowModal,
      similarGroup,
      forgetGroup
    } = this.state;

    if (error) {
      return (
        <section className="flex-center color-red">
          Error: {error.message}
        </section>
      );
    } else if (!isLoaded) {
      return <SpinnerLoading />;
    } else {
      return (
        <div>
          {Statistic(
            this.wordLocal.count,
            this.groupLocal.length,
            this.numberWordRemember,
            this.openModal,
            this.addForgetGroup
          )}

          {ListGroup(
            groups,
            [forgetGroup, similarGroup]
          )}

          <SameWordModal
            learnLocal={learnLocal}
            isShowModal={isShowModal}
            onCloseModal={this.closeModal}
            onChange={this.onChange}
          />
        </div>
      );
    }
  }
}

export default Dashboard;


function Statistic(wordCount, groupCount, rememberWordCount, onOpenModal, onAddForgetGroup) {

  const percent = Math.ceil(
    (rememberWordCount * 100) / wordCount
  );

  return (
    <section>
      <main>
        <div className="box-container">
          <div className="box">
            <p>{wordCount}</p>
            <p>words</p>
          </div>
          <div className="box">
            <p>{groupCount}</p>
            <p>groups</p>
          </div>
          <div className="box">
            <span>0</span>
            <p>Week word</p>
          </div>
          <div className="box box-clickable" onClick={onOpenModal}>
            <p>
              <i className="material-icons">add</i> Same
                      </p>
          </div>
          <div
            className="box box-clickable"
            onClick={onAddForgetGroup}
          >
            <p>
              <i className="material-icons">add</i> Forget
                      </p>
          </div>
        </div>
        <div>
          <div className="number-progress-bar">
            <span>{`${rememberWordCount}/${wordCount}`}</span>
          </div>
          <div className="progress-bar margin-center">
            <div style={{ width: `${percent}%` }}>
              <div></div>
            </div>
          </div>
        </div>
      </main>
    </section>

  )
}

function ListGroup(groups, specialGroup) {
  const sortByPin = (a, b) => {
    const _groupA = { ...learnLocal[a._id] },
      _groupB = { ...learnLocal[b._id] };
    let isPinA = _groupA && _groupA.isPin ? true : false,
      isPinB = _groupB && _groupB.isPin ? true : false;

    if (isPinA === isPinB) return 0;
    if (isPinA) return -1;
    return 0;
  };

  const isExistGroup = (group) => {
    return group._id && group.words && group.words.length > 0
  }

  groups.sort(sortByPin);

  return (
    <section>
      <main>
        <ul className="list">
          {specialGroup.map(group =>
            isExistGroup(group) &&
            Row(
              group._id,
              group.name,
              group.description,
              group.words,
              group.createdAt
            )
          )}
          {groups.map(group =>
            Row(
              group._id,
              group.name,
              group.description,
              group.words,
              group.createdAt
            )
          )}
        </ul>
      </main>
    </section>
  )
}

function Row(
  id,
  name,
  description,
  words,
  createdAt
) {
  let clickTimeout = null;
  const group = learnLocal[id]
    ? learnLocal[id]
    : prepare_SetNewGroup_LearnLocal(
      id,
      name,
      description,
      words,
      createdAt
    );

  const percentDisplay = group.percent > 0 ? group.percent : 1;

  const setColorRow = (date) => {
    if (typeof date !== 'number') return "";

    const minute = utilities.getMin(date);
    const hour = utilities.getHour(date);
    const day = utilities.getDay(date);
    if (minute < 5) {
      return "learn-recent";
    } else if (hour < 1) {
      return "learn-recent-1hour";
    } else if (day > 1) {
      return "learn-recent-1day";
    } else {
      return "";
    }
  }

  const handleTouch = () => {
    if (clickTimeout !== null) {
      // Here handle double touch
      doubleTouch();
      clearTimeout(clickTimeout);
      clickTimeout = null;
    } else {
      clickTimeout = setTimeout(() => {
        // Here handle single touch
        singleTouch();
        clearTimeout(clickTimeout);
        clickTimeout = null;
      }, 200);
    }
  }

  const singleTouch = () => { }

  const doubleTouch = () => {
    if (!learnLocal[group._id]) {
      learnLocal[group._id] = group;
      localStorageUtility.set(config.localStorage.learn, learnLocal);
    }

    window.location.href = `/learn/${id}`
  }

  try {
    const temp = group.words.length;
  } catch (error) {
    debugger
  }


  return (
    <li
      className={setColorRow(group.lastLearnAt)}
      onClick={() => handleTouch()}
      key={group._id}
    >
      <div className="flex-center-column">
        {group.isPin && <i className="material-icons">warning</i>}
        <span>{group.words.length}</span>
      </div>
      <div className="detail">
        {GroupName(
          group.name,
          group.learnNumberTimes
        )}

        <p>{group.description}</p>
        {group.lastLearnAt &&
          <p className="last-learn-at">{utilities.toDate(group.lastLearnAt)}</p>}
      </div>
      <div className="margin-center">
        <div className={`c100 p${percentDisplay} blue`}>
          <span>{percentDisplay}%</span>
          <div className="slice">
            <div className="bar"></div>
            <div className="fill"></div>
          </div>
        </div>
      </div>
    </li>
  )
}

function GroupName(name, learnNumberTimes) {
  return learnNumberTimes ? (
    <p>
      {name} <i className="material-icons">flag</i> {learnNumberTimes}
    </p>
  ) : (
      <p>
        {name}
      </p>
    );
}

function prepare_SetNewGroup_LearnLocal(id, name, description, words, createdAt) {
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
    learnNumberTimes: 0
  }
}