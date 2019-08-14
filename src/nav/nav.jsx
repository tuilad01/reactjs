import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './nav.css';

class Nav extends Component {
    render() {
        return (
            <nav>
                <div className="float-left hidden-visible">
                    <i className="material-icons nav-icon icon-clickable">
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

export default Nav;