import React from "react";

function GroupName({ name, learnNumberTimes }) {
    if (learnNumberTimes) {
        return (
            <p> {name} <i className="material-icons">flag</i> {learnNumberTimes} </p>
        )
    } else {
        return (
            <p> {name} </p>
        )
    }
}

export default GroupName