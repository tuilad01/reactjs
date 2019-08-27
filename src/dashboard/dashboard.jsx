import React, { Component } from 'react';
// import PropTypes from 'prop-types';


// Config
import localStorageUtility from '../localStorageUtility';
import config from './../config';

// import component 
import SpinnerLoading from '../spinner-loading/spinner-loading';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            groups: []
        };
        this.learnLocal = this.getLearnLocal();
        this.wordLocal = this.getWordLocal();
        this.groupLocal = this.getGroupLocal();
        this.numberWordRemember = this.getNumberWordRemember.call(this);
        this.percentProgressBar = Math.round((this.numberWordRemember * 100) / this.wordLocal.count);


    }

    componentWillMount() {
        this.clickTimeout = null;
    }

    componentDidMount() {
        const groups = localStorageUtility.getArray(config.localStorage.groups);
        this.setState({
            isLoaded: true,
            groups: groups
        });
    }

    getLearnLocal() {
        let learnLocal = {};
        const strLearnLocal = localStorageUtility.get(config.localStorage.learn);
        if (strLearnLocal) {
            learnLocal = JSON.parse(strLearnLocal);            
        }
        return learnLocal;
    }

    getWordLocal() {
        var word = localStorageUtility.get(config.localStorage.words);
        if (word) return JSON.parse(word);
        return {
            count: 0
        }
    }
    getGroupLocal() {
        return localStorageUtility.getArray(config.localStorage.groups);
    }

    getNumberWordRemember() {
        let number = 0;
        for (const key in this.learnLocal) {
            if (this.learnLocal.hasOwnProperty(key)) {
                const element = this.learnLocal[key];
                number += element.state3.length
            }
        }
        return number;
    }

    handleTouch(group) {
        if (this.clickTimeout !== null) {
            // Here handle double touch            
            this.doubleTouch(group);
            clearTimeout(this.clickTimeout)
            this.clickTimeout = null
        } else {
            this.clickTimeout = setTimeout(() => {
                // Here handle single touch
                this.singleTouch();
                clearTimeout(this.clickTimeout)
                this.clickTimeout = null
            }, 200)
        }
    }

    singleTouch() {
    }

    doubleTouch(group) {
        this.setLocalLearn(group);
        this.props.history.push({
            pathname: `/learn/${group._id}`
        })
        // debugger
        // window.location.hash(`/learn/${group._id}`);
    }

    setLocalLearn(group) {
        if (!this.learnLocal[group._id]) {
            this.learnLocal[group._id] = this.prepareSetLearnLocal(group);
        }

        localStorageUtility.set(config.localStorage.learn, this.learnLocal);
    }

    prepareSetLearnLocal(group) {
        group.state = 1;
        group.state1 = group.words || [];
        group.state2 = [];
        group.state3 = [];
        group.percent = 1;
        group.lastLearnAt = Date.now();
        return group;
    }

    render() {
        const { error, isLoaded, groups } = this.state;

        if (error) {
            return <section class="flex-center color-red">Error: {error.message}</section>;
        } else if (!isLoaded) {
            return <SpinnerLoading />;
        } else {
            return (
                <div>
                    <section>
                        <main>
                            <div className="box-container">
                                <div className="box">
                                    <p>{this.wordLocal.count}</p>
                                    <p>words</p>
                                </div>
                                <div className="box">
                                    <p>{this.groupLocal.length}</p>
                                    <p>groups</p>
                                </div>
                                <div className="box">
                                    <span>0</span>
                                    <p>Week word</p>
                                </div>
                                <div className="box">
                                    <span>0</span>
                                    <p>Week group</p>
                                </div>
                                <div className="box">
                                    <span>0</span>
                                    <p>Day word</p>
                                </div>
                                <div className="box">
                                    <span>0</span>
                                    <p>Day group</p>
                                </div>
                            </div>
                            <div>
                                <div className="number-progress-bar">
                                    <span>{`${this.numberWordRemember}/${this.wordLocal.count}`}</span>
                                </div>
                                <div className="progress-bar margin-center">
                                    <div style={{ width: `${this.percentProgressBar}%` }}>
                                        <div></div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </section>

                    <section>
                        <main>
                            <ul className="list">
                                {this.state.groups.map((group, index) => {
                                    const _group = this.learnLocal[group._id];
                                    let percent = 1;
                                    if (_group) {
                                        percent = _group.percent > 0 ? _group.percent : 1;
                                    }

                                    return (
                                        <li onClick={this.handleTouch.bind(this, group)} key={index}>
                                            <div>
                                                <span>{group.words.length || 0}</span>
                                            </div>
                                            <div className="detail">
                                                <p>{group.name}</p>
                                                <p>{group.description}</p>
                                            </div>
                                            <div className="margin-center">
                                                <div className={`c100 p${percent} blue`}>
                                                    <span>{percent}%</span>
                                                    <div className="slice">
                                                        <div className="bar"></div>
                                                        <div className="fill"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}

                            </ul>
                        </main>
                    </section>
                </div>
            );
        }

    }
}

// Dashboard.propTypes = {

// };

export default Dashboard;