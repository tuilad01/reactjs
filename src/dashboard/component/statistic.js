import React from "react"
import dataAccess from "./../../dataAccess"

function Statistic({onOpenModal, onAddForgetGroup }) {
    const wordLocal = dataAccess.getWordLocal()
    const wordCount = wordLocal ? wordLocal.count : 0
    const groupCount = dataAccess.getGroupLocal().length

    const rememberWordCount = dataAccess.getNumberWordRemember();
    const percent = Math.ceil(
        (rememberWordCount * 100) / wordCount
    );

    return (
        <section>
            <main>
                <div className="box-container">
                    <div className="box">
                        <p>{wordCount}</p>
                        <p>words</p>
                    </div>
                    <div className="box">
                        <p>{groupCount}</p>
                        <p>groups</p>
                    </div>
                    <div className="box">
                        <span>0</span>
                        <p>Week word</p>
                    </div>
                    <div className="box box-clickable" onClick={onOpenModal}>
                        <p>
                            <i className="material-icons">add</i> Same
                          </p>
                    </div>
                    <div
                        className="box box-clickable"
                        onClick={onAddForgetGroup}
                    >
                        <p>
                            <i className="material-icons">add</i> Forget
                          </p>
                    </div>
                </div>
                <div>
                    <div className="number-progress-bar">
                        <span>{`${rememberWordCount}/${wordCount}`}</span>
                    </div>
                    <div className="progress-bar margin-center">
                        <div style={{ width: `${percent}%` }}>
                            <div></div>
                        </div>
                    </div>
                </div>
            </main>
        </section>
    )
}

export default Statistic
