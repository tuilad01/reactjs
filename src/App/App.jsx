import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import dataAccess from '../dataAccess';

// import component 
import Nav from '../nav/nav';
// import NavControl from '../nav-control/nav-control';
// import List from '../list/list';
import NavMenu from '../menu/menu';
import Footer from '../footer/footer';
import Dashboard from "../dashboard/dashboard";
import Learn from "../learn/learn";
import GrammarTense from "../grammar-tense/grammar-tense";
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

    this.learnLocal = dataAccess.getLearnLocal()
  }

  componentDidMount() {
    this.initLocalData();

    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll.bind(this));
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
              <Route exact path="/grammar" component={GrammarTense} />
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

  initLocalData() {
    dataAccess.getGroup()
    this.setState(state => { state.groupFetch.isLoaded = true; return state });
    dataAccess.getTotalNumberWord()
    this.setState(state => { state.wordFetch.isLoaded = true; return state });

    dataAccess.createSimilarGroup()
    dataAccess.createForgetGroup()
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
}

export default App;
