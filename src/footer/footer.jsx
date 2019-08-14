import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './footer.css';

class Footer extends Component {
    render() {
        return (
            <footer className="footer text-center">
                <p>Copyright @ 2019 TPHCM VIETNAM, DTRUONGTAN Company, Inc.</p>
                <p>All rights reserved.</p>
            </footer>
        );
    }
}

Footer.propTypes = {

};

export default Footer;