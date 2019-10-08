import React, { Component } from 'react';
import PropTypes from 'prop-types';

class NavControl extends Component {
    constructor(props) {
        super(props);
        this.state = {
            state: props.state
        };
    }
    componentWillReceiveProps({state}) {
        this.setState({
            state: state
        })
      }

    render() {        
        const pinIcon = this.props.isPin ? 'clear' : 'warning'
        const pinText = this.props.isPin ? 'UnPin' : 'Pin'
        return (
            <div className="nav-control">
                <button className="button-icon" onClick={this.props.onClickShuffle}>
                    <i className="material-icons">
                        cached
                    </i>
                    <span>Shuffle</span>                    
                </button>
                <button className="button-icon" onClick={this.props.onClickPinGroup}>
                    <i className="material-icons">
                        {pinIcon}
                    </i>
                    <span>{pinText}</span>
                </button>
                <button className="button-icon" onClick={this.props.onClickNext}>
                    <i className="material-icons">
                        skip_next
                    </i>
                    <span>Next</span>
                    <span className="button-icon-badge">{this.props.state}</span>
                </button>
            </div>
        );
    }
}

NavControl.propTypes = {
    onClickShuffle: PropTypes.func,
    onClickSave: PropTypes.func,
    onClickNext: PropTypes.func,
    state: PropTypes.number,
};

export default NavControl;