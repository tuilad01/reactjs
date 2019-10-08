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
            data: {}        
        }
        this.list = React.createRef();
        
    }
    componentDidMount() {        
        const { match } = this.props;
        const strLearn = localStorageUtility.get(config.localStorage.learn);
        if (strLearn) {
            const learn = JSON.parse(strLearn);
            if (learn[match.params.id]) {
                this.setState({
                    data: learn[match.params.id],
                    isLoaded: true
                })
            }
        }
    }

    callShuffle() {
        this.list.current.shuffle();
        //console.log(this.list);
        //alert("a");
    }

    callPinGroup() {        
        const isPin = this.list.current.pinGroup();
        this.setState(state => ({
            data: {
                ...state.data,
                isPin: isPin
            }            
        }))
    }

    callNext() {
        this.list.current.next();
    }

    callChangeState(stateNumber) {
        //this.state.data.state = state;
        this.setState(state => {
            state.data.state = stateNumber;
            return state;
        })
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
                    <NavControl onClickShuffle={this.callShuffle.bind(this)} onClickPinGroup={this.callPinGroup.bind(this)} onClickNext={this.callNext.bind(this)} state={this.state.data.state} isPin={this.state.data.isPin}/>
                    <List ref={this.list} data={data} onClickChangeState={this.callChangeState.bind(this)}/>
                </div>
            );
        }        
    }
}

Learn.propTypes = {

};

export default Learn;