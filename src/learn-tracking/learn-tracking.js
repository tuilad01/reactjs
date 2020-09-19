import React, { useState, useEffect } from "react"
import './learn-tracking.css'
import dataAccess from './../dataAccess'

let updateTrackingTimeout = null
let holdModifyInterval = null

const trackingId = date => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function LearnTracking() {
    const _now = new Date()
    const _dateTrackingId = trackingId(_now)
    const _barSectors = dataAccess.getTrackingBarSectorsLocal()
    const _trackingLocal = dataAccess.getTrackingLocal()

    if (!_trackingLocal.tracking) {
        _trackingLocal.tracking = []
    }

    if (!_trackingLocal.listenMinutes) {
        _trackingLocal.listenMinutes = 0
    }

    const _tracking = _trackingLocal.tracking[_dateTrackingId] ? _trackingLocal.tracking[_dateTrackingId] : _barSectors.map(_ => { return { id: _.id, value: 0 } })

    const [state, setState] = useState({
        consecutiveDays: _trackingLocal.consecutiveDays || 0,
        listenHours: Math.ceil(_trackingLocal.listenMinutes / 60),
        tracking: _tracking,
    })

    const _arrDateTracking = []
    for (let i = 1; i < 10; i++) {
        const previousDay = new Date()
        previousDay.setDate(new Date().getDate() - i)
        const previousDayTrackingId = trackingId(previousDay)
        const previousDayTracking = _trackingLocal.tracking[previousDayTrackingId]

        _arrDateTracking.unshift({
            id: previousDayTrackingId,
            tracking: previousDayTracking ? previousDayTracking : dataAccess.createModalTrackingSectors()
        })
    }

    useEffect(() => {
        const chartBar = document.querySelector(".chart-bar")
        const chartBarScrollWidth = chartBar.scrollWidth

        if (chartBar.scrollLeft !== chartBarScrollWidth) {
            chartBar.scrollTo(chartBarScrollWidth, 0);
        }
    })

    const modifySectorById = (sectorId, value) => {
        setState(state => {
            const tracking = [...state.tracking]
            const sector = tracking.find(_ => _.id == sectorId)
            if (sector) {
                sector.value += value
                if (sector.value < 0) sector.value = 0
            } else {
                state.tracking.push({
                    id: sectorId,
                    value: value < 0 ? 0 : 1
                })
            }
            tracking.sort((a,b) => b.value - a.value)
            return { ...state, tracking: tracking }
        })

        updateTracking(state.tracking)
    }

    const startModifySectorById = (event, sectorId, value) => {
        event.preventDefault()
        modifySectorById(sectorId, value)

        if (holdModifyInterval === null) {
            holdModifyInterval = setInterval(() => {
                modifySectorById(sectorId, value)
            }, 100)
        }
    }
    const cancelModifySectorById = event => {
        event.preventDefault()
        clearInterval(holdModifyInterval)
        holdModifyInterval = null
    }

    const updateTracking = () => {
        if (updateTrackingTimeout) {
            clearTimeout(updateTrackingTimeout)
            updateTrackingTimeout = null
        }

        updateTrackingTimeout = setTimeout(() => {
            const trackingNew = dataAccess.updateTracking(state.tracking)
            setState(state => {
                const listenHoursNew = Math.ceil(trackingNew.listenMinutes / 60)
                return { ...state, consecutiveDays: trackingNew.consecutiveDays, listenHours: listenHoursNew }
            })

            // Clear timeout
            clearTimeout(updateTrackingTimeout)
            updateTrackingTimeout = null
        }, 1500) // 1.5 seconds
    }

    const getStyleSector = (tracking, sectorIndex, barSector) => {
        const sector = tracking[sectorIndex]

        return {
            '--sector-height': sector ? `${sector.value * 3}px` : 0,
            '--sector-index': sectorIndex,
            '--sector-color': barSector.color
        }
    }

    const onBackToDashboard = () => {
        window.location.href = '/'
    }

    return (
        <div className="container--learn_tracking">
            <div className="mobile-screen">
                <section className="banner" style={{ backgroundImage: "url('/banner.jpg')" }}>
                    <nav className="nav-bar">
                        <div className="left" onClick={onBackToDashboard}>
                            <span className="material-icons">
                                chevron_left
                            </span>
                            <p className="back-name">Dashboard</p>
                        </div>
                        <div className="mid">
                            <h1>Tracking</h1>
                        </div>
                        <div className="right">
                            <div className="avatar">
                                <img src="/avatar.png" alt="avatar"></img>
                            </div>
                        </div>
                    </nav>
                    <div className="task-statistic">
                        <div>
                            <div className="task--statistic__left">
                                <span className="task--statistic__number">{state.consecutiveDays}</span>
                                <p className="task--statistic__name">Consecutive days</p>
                            </div>

                            <div className="task--statistic__right">
                                <span className="task--statistic__number">{state.listenHours}</span>
                                <p className="task--statistic__name">Listen hours</p>
                            </div>
                        </div>

                    </div>
                </section>

                <section className="task">
                    <ul className="task-list">
                        {_barSectors.map(sector => (
                            <li className="task-item" key={sector.id}>
                                <div className="thumb-icon">
                                    <span className="material-icons" style={{ color: sector.color }}>
                                        {sector.icon}
                                    </span>
                                </div>
                                <div className="details">
                                    <p className="description">{sector.name}</p>
                                    <span className="task-number">+ {state.tracking.find(_ => _.id === sector.id).value}</span>
                                </div>

                                <div className="up--down__button">
                                    <div className="up-button" onMouseDown={e => startModifySectorById(e, sector.id, 1)} onMouseUp={e => cancelModifySectorById(e)} onTouchStart={e => startModifySectorById(e, sector.id, 1)} onTouchEnd={e => cancelModifySectorById(e)}></div>
                                    <div className="down-button" onMouseDown={e => startModifySectorById(e, sector.id, -1)} onMouseUp={e => cancelModifySectorById(e)} onTouchStart={e => startModifySectorById(e, sector.id, -1)} onTouchEnd={e => cancelModifySectorById(e)}></div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>


                <section className="chart">
                    <div style={{ '--bar-height': '300px' }}>
                        <div className="chart-type">
                            <div className="chart-title">
                                {monthNames[_now.getMonth()]}
                            </div>
                            <div className="more-button">
                                <label htmlFor="more-button">
                                    <span className="material-icons">
                                        more_vert
                                    </span>
                                </label>

                                <input type="checkbox" id="more-button" className="hidden" />
                                <ul className="more-dropdown">
                                    <li className="more--dropdown__item">
                                        Date
                                    </li>
                                    <li className="more--dropdown__item">
                                        Month
                                    </li>
                                    <li className="more--dropdown__item">
                                        Year
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <ul className="chart-bar">
                            {/* Previous days */}
                            {_arrDateTracking.map(dateTracking => {
                                const tracking = [...dateTracking.tracking]
                                tracking.sort((a, b) => a.value - b.value)

                                return (
                                    <li className="bar-item" key={dateTracking.id}>
                                        <div className="bar">
                                            {_barSectors.map(barSector => {
                                                // get sector index from tracking array
                                                const sectorIndex = tracking.findIndex(_ => _.id === barSector.id)
                                                // get style for sector
                                                const style = getStyleSector(tracking, sectorIndex, barSector)
                                                // get value for sector
                                                const value = tracking[sectorIndex] ? tracking[sectorIndex].value : 0

                                                return (
                                                    <div className="sector" style={style} key={barSector.id}>
                                                        <span className="sector-value">{value}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <p className="chart--bar__date">{dateTracking.id.split('-')[2]}</p>
                                    </li>
                                )
                            })}

                            {/* Today */}
                            <li className="bar-item">
                                <div className="bar today">
                                    {_barSectors.map(barSector => {
                                        // get sector index from tracking array
                                        const tracking = state.tracking
                                        const sectorIndex = tracking.findIndex(_ => _.id === barSector.id)
                                        // get style for sector
                                        const style = getStyleSector(tracking, sectorIndex, barSector)
                                        // get value for sector
                                        const value = tracking[sectorIndex] ? tracking[sectorIndex].value : 0

                                        return (
                                            <div className="sector" style={style} key={barSector.id}>
                                                <span className="sector-value">{value}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                                <p className="chart--bar__date">{_now.getDate()}</p>
                            </li>

                            <li>&nbsp;&nbsp;&nbsp;</li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    )

}

export default LearnTracking