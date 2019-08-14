import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

// Config
import localStorageUtility from '../localStorageUtility';
import config from './../config';

// import component 
import Nav from '../nav/nav';
import NavControl from '../nav-control/nav-control';
import List from '../list/list';
import NavMenu from '../menu/menu';
import Footer from '../footer/footer';
import SpinnerLoading from '../spinner-loading/spinner-loading';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            groups: []
        };
    }
    componentWillMount() {
        this.clickTimeout = null;
    }

    componentDidMount() {
        fetch("https://wordgroup123.herokuapp.com/group")
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        groups: result
                    });
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            );
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
        localStorageUtility.set(config.localStorage.learn, group);
        this.props.history.push({
            pathname: `/learn/${group._id}`
        })
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
                                    <p>2000</p>
                                    <p>words</p>
                                </div>
                                <div className="box">
                                    <p>200</p>
                                    <p>groups</p>
                                </div>
                                <div className="box">
                                    <span>23</span>
                                    <p>Week word</p>
                                </div>
                                <div className="box">
                                    <span>3</span>
                                    <p>Week group</p>
                                </div>
                                <div className="box">
                                    <span>10</span>
                                    <p>Day word</p>
                                </div>
                                <div className="box">
                                    <span>2</span>
                                    <p>Day group</p>
                                </div>
                            </div>
                            <div>
                                <div className="number-progress-bar">
                                    <span>223/1000</span>
                                    <i className="material-icons">
                                        star_rate
                            </i>
                                </div>
                                <div className="progress-bar margin-center">
                                    <div style={{ width: "20%" }}>
                                        <div></div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </section>

                    <section>
                        <main>
                            <ul className="list">
                                {this.state.groups.map(group => {
                                    return (
                                        <li onClick={this.handleTouch.bind(this, group)}>
                                            <div>
                                                <span>40</span>
                                            </div>
                                            <div className="detail">
                                                <p>{group.name}</p>
                                                <p>{group.description}</p>
                                            </div>
                                            <div className="margin-center">
                                                <div className="c100 p85 blue">
                                                    <span>85%</span>
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

Dashboard.propTypes = {

};

export default Dashboard;