import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import spinner from './../spinner.svg';

class SpinnerLoading extends Component {
    render() {
        return (
            <section className="flex-center">
                <img src={spinner} alt=""/>
            </section>
        );
    }
}

// SpinnerLoading.propTypes = {

// };

export default SpinnerLoading;