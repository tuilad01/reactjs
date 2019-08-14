import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './nav.css';

import { withRouter } from 'react-router-dom';

class Nav extends Component {
    constructor(props) {
        super(props);
        
    }
    
    render() {
        const {location, history} = this.props;

        const hiddenVisible = location.pathname.indexOf("/learn") >= 0 ? "" : "hidden-visible";
        return (
            <nav>
                <div className={`float-left ${hiddenVisible}`}>
                    <i className="material-icons nav-icon icon-clickable" onClick={history.goBack}>
                        keyboard_arrow_left
                    </i>
                </div>
                <div className="text-center">
                    <p className="title">Word</p>
                </div>

                <div className="float-right text-right hidden-visible">
                    <i className="material-icons nav-icon icon-clickable">
                        menu
                    </i>
                </div>
            </nav>
        );
    }
}

Nav.propTypes = {

};

export default withRouter(Nav);