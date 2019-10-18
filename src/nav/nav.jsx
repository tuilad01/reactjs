import React, { Component } from 'react';
import './nav.css';

import { withRouter } from 'react-router-dom';

class Nav extends Component {
    
    render() {
        const {location, history} = this.props;

        const hiddenVisible = location.pathname.indexOf("/learn") >= 0 || location.pathname.indexOf("/grammar") >= 0 ? "" : "hidden-visible";
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

                <div className="float-right text-right">
                    <i className="material-icons nav-icon icon-clickable" onClick={this.props.onClickShowMenu}>
                        menu
                    </i>
                </div>
            </nav>
        );
    }
}

export default withRouter(Nav);