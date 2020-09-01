import React from 'react';
import dataAccess from './../../dataAccess'

function GroupTypeIconAndTotalWords({ priority, totalWords }) {
    let groupIcon = ""
    if (priority === dataAccess.Priorities.Pinned) {
        groupIcon = <i className="material-icons">warning</i>
    } else if (priority === dataAccess.Priorities.RemindGroup) {
        groupIcon = <i className="material-icons">notifications_active</i>
    }

    return (
        <div className="flex-center-column">
            {groupIcon}
            <span>{totalWords}</span>
        </div>
    )
}

export default GroupTypeIconAndTotalWords