import React, { Component } from 'react';
import PropTypes from 'prop-types';

class NavControl extends Component {
    constructor(props) {
        super(props);
    }


    render() {
        return (
            <div className="nav-control">
                <button className="button-icon" onClick={this.props.onClickSuffle}>
                    <i className="material-icons">
                        cached
                    </i>
                    <span>Shuffle</span>                    
                </button>
                <button className="button-icon">
                    <i className="material-icons">
                        save
                    </i>
                    <span>Save</span>
                </button>
                <button className="button-icon">
                    <i className="material-icons">
                        skip_next
                    </i>
                    <span>Next</span>
                    <span className="button-icon-badge">3</span>
                </button>
            </div>
        );
    }
}

NavControl.propTypes = {
    onClickShuffle: PropTypes.func,
};

export default NavControl;