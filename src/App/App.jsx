import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import localStorageUtil from '../localStorageUtility';
import config from '../config';

// import component 
import Nav from '../nav/nav';
// import NavControl from '../nav-control/nav-control';
// import List from '../list/list';
import NavMenu from '../menu/menu';
import Footer from '../footer/footer';
import Dashboard from "../dashboard/dashboard";
import Learn from "../learn/learn";
import Notfound from "../notfound/notfound";
import SpinnerLoading from "../spinner-loading/spinner-loading";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groupFetch: {
        error: null,
        isLoaded: false
      },
      wordFetch: {
        error: null,
        isLoaded: false,
      },
      isShowMenu: false,
      scrollTop: 0
    };

    this.learnLocal = localStorageUtil.get(config.localStorage.learn)
  }

  componentDidMount() {
    this.initLocalData();

    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll.bind(this));
  }

  fetchNewGroup(arrGroup) {
    if (!arrGroup || arrGroup.length === 0) return false;

    const strLearnLocal = this.learnLocal;

    if (!strLearnLocal) return false;
    const learn = JSON.parse(strLearnLocal);
    let arrKeyNotFound = [];
    for (const key in learn) {
      if (learn.hasOwnProperty(key)) {
        const group = learn[key];

        const groupNew = arrGroup.find(_ => _._id === group._id);

        if (!groupNew) {
          arrKeyNotFound.push(group._id);
          continue;
        }

        if (groupNew.words.length === group.words.length) continue;

        // New word in group
        groupNew.words.filter(_ => !group.words.find(__ => __._id === _._id)).map(word => {
          group.state1.push({
            _id: word._id,
            name: word.name,
            mean: word.mean,
            flipped: false,
            display: true
          });
          return word;
        });
        // Word not found in group local
        group.words.filter(_ => !groupNew.words.find(__ => __._id === _._id)).map(word => {
          group.state1 = group.state1.filter(_ => _._id !== word._id);
          group.state2 = group.state2.filter(_ => _._id !== word._id);
          group.state3 = group.state3.filter(_ => _._id !== word._id);
          return word;
        });

        group.words = groupNew.words;
        group.percent = Math.round((group.state3.length * 100) / group.words.length);
      }
    }

    if (arrKeyNotFound.length > 0) {
      arrKeyNotFound.map(key => {
        delete learn[key];
        return key;
      });
    }


    localStorageUtil.set(config.localStorage.learn, learn);
    this.learnLocal = JSON.stringify(learn)
    return true
  }

  _createGroup = () => {
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

  createSimilarGroup = () => {
    const strLearnLocal = this.learnLocal
    let learn = {}
    if (strLearnLocal) {
      learn = JSON.parse(strLearnLocal);
      if (learn[config.localStorage.similarGroup]) {
        return false;
      }
    }

    learn[config.localStorage.similarGroup] = this._createGroup()
    learn[config.localStorage.similarGroup]._id = config.localStorage.similarGroup
    learn[config.localStorage.similarGroup].name = 'Similar words'
    learn[config.localStorage.similarGroup].description = 'Similar words'

    localStorageUtil.set(config.localStorage.learn, learn);
    this.learnLocal = JSON.stringify(learn)
  }

  createForgetGroup = () => {
    const strLearnLocal = this.learnLocal
    let learn = {}
    if (strLearnLocal) {
      learn = JSON.parse(strLearnLocal);
      if (learn[config.localStorage.forgetGroup]) {
        return false;
      }
    }

    learn[config.localStorage.forgetGroup] = this._createGroup()
    learn[config.localStorage.forgetGroup]._id = config.localStorage.forgetGroup
    learn[config.localStorage.forgetGroup].name = 'Forget words'
    learn[config.localStorage.forgetGroup].description = 'Forget words'

    localStorageUtil.set(config.localStorage.learn, learn);
    this.learnLocal = JSON.stringify(learn)
  }

  initLocalData = () => {
    const localGroups = localStorageUtil.getArray(config.localStorage.groups);

    if (localGroups.length <= 0) {
      fetch(`${config.apiUrl}/group`)
        .then(res => res.json())
        .then(result => {
          localStorageUtil.set(config.localStorage.groups, result);

          this.fetchNewGroup(result)
          this.createSimilarGroup()
          this.createForgetGroup()

          this.setState((state) => {
            state.groupFetch.isLoaded = true;
            return state;
          });

          return result
        })
        .catch(error => {
          this.setState((state) => {
            state.groupFetch.isLoaded = true;
            state.groupFetch.error = error;
            return state;
          });
          return error
        });
    } else {
      this.setState((state) => {
        state.groupFetch.isLoaded = true;
      });
    }

    const localWords = localStorageUtil.get(config.localStorage.words);
    if (!localWords) {
      fetch(`${config.apiUrl}/word/total`)
        .then(res => res.json())
        .then(result => {
          localStorageUtil.set(config.localStorage.words, result);
          this.setState((state) => {
            state.wordFetch.isLoaded = true;
            return state;
          });
          return result
        })
        .catch(error => {
          this.setState((state) => {
            state.wordFetch.isLoaded = true;
            state.wordFetch.error = error;
            return state;
          });
          return error
        });
    } else {
      this.setState((state) => {
        state.wordFetch.isLoaded = true;
        return state;
      });
    }
  }

  callOpenMenu() {
    this.setState(state => {
      state.isShowMenu = !state.isShowMenu;
      return state;
    })
  }

  handleScroll() {
    this.setState({
      scrollTop: window.scrollY
    })
  }

  scrollTop() {
    const display = this.state.scrollTop < 200 ? 'none' : 'block';
    const scrollTop = () => {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };

    return (
      <div className="scroll-top" style={{ display: display }} onClick={scrollTop}>
        <i className="material-icons">
          arrow_upward
              </i>
      </div>
    );
  }


  render() {
    const { groupFetch, wordFetch } = this.state;

    if (groupFetch.error || wordFetch.error) {
      return (
        <section className="flex-center color-red">
          <p>Error fetch group: {groupFetch.error}</p>
          <p>Error fetch word: {wordFetch.error}</p>
        </section>
      );
    }
    else if (!groupFetch.isLoaded || !wordFetch.isLoaded) {
      return (
        <section>
          <div className="flex-center">
            <SpinnerLoading />
          </div>
          <h1 className="color-white text-center">Initializing System, Please Wait For Minutes!</h1>
        </section>
      );
    } else {
      return (
        <Router>
          <div>
            <Nav onClickShowMenu={this.callOpenMenu.bind(this)} />
            <Switch>
              <Route exact path="/" component={Dashboard} />
              <Route exact path="/learn/:id" component={Learn} />
              <Route component={Notfound} />
            </Switch>
            {this.state.isShowMenu ? <NavMenu /> : ""}

            <Footer />

            {this.scrollTop()}
          </div>
        </Router>
      );
    }
  }
}

export default App;
