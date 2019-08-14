import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './menu.css';

class Menu extends Component {
    render() {
        return (
            <section className="full-menu hidden">
                <main className="container">
                    <div className="split-horizon">
                        <a href="#" className="title-menu">voluptate repreh</a>
                    </div>
                    <ul>
                        <li><a href="#">Word</a></li>
                        <li><a href="#">Group</a></li>
                    </ul>
                </main>
            </section>
        );
    }
}

Menu.propTypes = {

};

export default Menu;