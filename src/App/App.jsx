import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";

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
      }
    };
  }

  componentDidMount() {
    this.initLocalData.call(this);
  }
  
  initLocalData() {
    const localGroups = localStorageUtil.getArray(config.localStorage.groups);
    if (localGroups.length <= 0) {
      fetch(`${config.apiUrl}/group`)
        .then(res => res.json())
        .then(
          (result) => {
            localStorageUtil.set(config.localStorage.groups, result);
            this.setState((state) => {
              state.groupFetch.isLoaded = true;
              return state;
            });
          },
          (error) => {
            this.setState((state) => {
              state.groupFetch.isLoaded = true;
              state.groupFetch.error = error;
              return state;
            });
          }
        );
    } else {
      this.setState((state) => {
        state.groupFetch.isLoaded = true;
      });
    }

    const localWords = localStorageUtil.getArray(config.localStorage.words);
    if (localWords.length <= 0) {
      fetch(`${config.apiUrl}/word`)
        .then(res => res.json())
        .then(
          (result) => {
            localStorageUtil.set(config.localStorage.words, result);
            this.setState((state) => {
              state.wordFetch.isLoaded = true;
              return state;
            });
          },
          (error) => {
            this.setState((state) => {
              state.wordFetch.isLoaded = true;
              state.wordFetch.error = error;
              return state;
            });
          }
        );
    } else {
      this.setState((state) => {
        state.wordFetch.isLoaded = true;
        return state;
      });
    }
  }

  // Using ref child component
  // const list = React.createRef();



  callShuffle() {
    //list.current.shuffle();
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
            <Nav />
            <Switch>
              <Route exact path="/" component={Dashboard} />
              <Route exact path="/learn/:id" component={Learn} />
              <Route component={Notfound} />
            </Switch>
            <NavMenu />
            <Footer />
          </div>
        </Router>
      );
    }
  }
}

export default App;
