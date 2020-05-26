import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

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

    archiveIt(event) {
        event.preventDefault();
        confirmAlert({
            title: 'Confirm Archive It',
            message: 'Are you sure?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        const strLearn = localStorageUtility.get(config.localStorage.learn)

                        // push server
                        fetch(`${config.apiUrl}/archive`, {
                            method: "PUT",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({text: strLearn})
                        })
                            .then(res => res.json())
                            .then(result => {
                                if (result && result._id) {
                                    window.location.reload()
                                }
                            })
                            .catch(error => {
                                console.error(error);
                            })
                    }
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ]
        })
    }

    syncIt(event) {
        event.preventDefault();

        confirmAlert({
            title: 'Confirm Sync It',
            message: 'Are you sure?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        // get from server 
                        fetch(`${config.apiUrl}/archive`)
                            .then(res => res.json())
                            .then(result => {
                                if (result && result._id) {
                                    localStorageUtility.set(config.localStorage.learn, JSON.parse(result.text))
                                    window.location.reload()
                                }
                            })
                            .catch(error => {
                                console.error(error);
                            })
                    }
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ]
        })
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
                        <li><a href="/grammar">Grammar</a></li>
                        <li><a href="https://tuilad01.github.io/#/word">Word</a></li>
                        <li><a href="https://tuilad01.github.io/#/group">Group</a></li>
                        <li><a href="#clearcache" onClick={e => this.clearCache(e)}>Clear cache</a></li>
                        <li><a href="#archiveit" onClick={e => this.archiveIt(e)}>Archive it</a></li>
                        <li><a href="#syncdata" onClick={e => this.syncIt(e)}>Sync it</a></li>

                    </ul>
                </main>
            </section>
        );
    }
}

// Menu.propTypes = {

// };

export default withRouter(Menu);
