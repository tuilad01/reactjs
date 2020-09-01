import React from 'react';
import Row from './row'
import dataAccess from '../../dataAccess'

function List({ learnLocal }) {
    const arrLearnLocal = Object.values(learnLocal)
    dataAccess.sortByPriority(arrLearnLocal)

    return (
        <section>
            <main>
                <ul className="list">
                    {arrLearnLocal.map(group => {
                        return (
                            <Row group={group} key={group._id} />
                        )
                    })}
                </ul>
            </main>
        </section>
    )
}

export default List