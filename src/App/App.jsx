import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
// import component 
import Nav from '../nav/nav';
// import NavControl from '../nav-control/nav-control';
// import List from '../list/list';
import NavMenu from '../menu/menu';
import Footer from '../footer/footer';
import Dashboard from "../dashboard/dashboard";
import Learn from "../learn/learn";
import GrammarTense from "../grammar-tense/grammar-tense";
import LearnTracking from "../learn-tracking/learn-tracking";
import Notfound from "../notfound/notfound";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowMenu: false,
      scrollTop: 0
    };
  }

  componentDidMount() {

  }

  componentWillUnmount() {
  }

  render() {    
    if (window.location && window.location.pathname === "/learntracking") {
      return (
        <LearnTracking></LearnTracking>
      )
    } else {
      return (
        <Router>
          <div className="wrapper">
            <Nav onClickShowMenu={this.callOpenMenu.bind(this)} />
            <Switch>
              <Route exact path="/" component={Dashboard} />
              <Route exact path="/learn/:id" component={Learn} />
              <Route exact path="/grammar" component={GrammarTense} />
              <Route exact path="/learntracking" component={LearnTracking} />
              <Route component={Notfound} />
            </Switch>
  
            <NavMenu isShow={this.state.isShowMenu} onClose={this.onChange} />
  
            <Footer />
  
            {this.scrollTop()}
          </div>
        </Router>
      );
    }    
  }

  onChange = () => {
    this.setState(state => {
      state.isShowMenu = false
      return state
    })
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
