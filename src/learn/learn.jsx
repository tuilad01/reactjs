import React, { Component } from 'react';
import PropTypes from 'prop-types';

import localStorageUtility from '../localStorageUtility';
import config from '../config';

// import component 
import NavControl from '../nav-control/nav-control';
import List from '../list/list';
import SpinnerLoading from '../spinner-loading/spinner-loading';

//Data mock
//import mockData from './../mockdata';

class Learn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            data: []         
        }
        this.list = React.createRef();
    }
    componentDidMount() {
        const strLearn = localStorageUtility.get(config.localStorage.learn);
        if (strLearn) {
            const learn = JSON.parse(strLearn);
            if (learn.words && learn.words.length) {
                this.setState({
                    data: learn.words,
                    isLoaded: true
                })
            }
        }
    }

    callShuffle() {
        this.list.current.shuffle();
        //alert("hell")
    }

    render() {
        const {error, isLoaded, data} = this.state;
        if (error) {
            return <section class="flex-center color-red">Error: {error.message}</section>;
        }
        else if (!isLoaded) {
            return <SpinnerLoading />;
        } else {
            return (
                <div>
                    <NavControl onClickSuffle={this.callShuffle.bind(this)} />
                    <List ref={this.list} data={data} />
                </div>
            );
        }        
    }
}

Learn.propTypes = {

};

export default Learn;