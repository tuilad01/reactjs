import React, { Component } from 'react';
// import PropTypes from 'prop-types';

import './menu.css';
import { withRouter } from 'react-router-dom';

import localStorageUtility from "../localStorageUtility";
import config from "../config";

class Menu extends Component {

    clearCache(event) {
        event.preventDefault();
        localStorageUtility.remove(config.localStorage.groups);
        localStorageUtility.remove(config.localStorage.words);
        window.location.reload();
    }


    render() {
        return (
            <section className="full-menu">
                <main className="container">
                    <div className="split-horizon">
                        <a href="#menupanel" className="title-menu">Menu panel</a>
                    </div>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="https://tuilad01.github.io/#/word">Word</a></li>
                        <li><a href="https://tuilad01.github.io/#/group">Group</a></li>
                        <li><a href="#clearcache" onClick={e => this.clearCache(e)}>Clear cache</a></li>
                    </ul>
                </main>
            </section>
        );
    }
}

// Menu.propTypes = {

// };

export default withRouter(Menu);