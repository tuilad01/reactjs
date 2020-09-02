import React from "react";
import GroupName from "./group-name"
import GroupTypeIconAndTotalWords from "./group-type-icon-total-words"

import utilities from "./../../utilities"

function Row({ group }) {
    const { _id, name, description, words, percent, learnNumberTimes, lastLearnAt, priority } = group
    let clickTimeout = null;

    const handleTouch = () => {
        if (clickTimeout !== null) {
            // Here handle double touch
            doubleTouch();
            clearTimeout(clickTimeout);
            clickTimeout = null;
        } else {
            clickTimeout = setTimeout(() => {
                // Here handle single touch
                singleTouch();
                clearTimeout(clickTimeout);
                clickTimeout = null;
            }, 200);
        }
    }

    const singleTouch = () => { }

    const doubleTouch = () => {
        // TODO save new group to learn local
        window.location.href = `/learn/${_id}`
    }

    

    return (
        <li
            className={utilities.setColorRow(lastLearnAt)}
            onClick={() => handleTouch()}
            key={_id}
        >
            <GroupTypeIconAndTotalWords
                priority={priority}
                totalWords={words.length}
            />
            <div className="detail">
                <GroupName
                    name={name}
                    learnNumberTimes={learnNumberTimes}
                />

                <p>{description}</p>
                {lastLearnAt && <p className="last-learn-at">{utilities.toDate(lastLearnAt)}</p>}
            </div>
            <div className="margin-center">
                <div className={`c100 p${percent} blue`}>
                    <span>{percent}%</span>
                    <div className="slice">
                        <div className="bar"></div>
                        <div className="fill"></div>
                    </div>
                </div>
            </div>
        </li>
    )
}

export default Row