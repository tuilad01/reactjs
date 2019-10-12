import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { similarity } from './../comparisonString'

// Config
import localStorageUtility from '../localStorageUtility';
import config from './../config';

// import component 
import SpinnerLoading from '../spinner-loading/spinner-loading';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            groups: [],
            string: '',
            rate: 0.5,
            similarWords: [],
            similarGroup: {},
            forgetGroup: {},
            isShowModal: false,
            tabActive: 'search'
        };
        this.learnLocal = this.getLearnLocal();
        this.wordLocal = this.getWordLocal();
        this.groupLocal = this.getGroupLocal();
        this.numberWordRemember = this.getNumberWordRemember.call(this);
        this.percentProgressBar = Math.round((this.numberWordRemember * 100) / this.wordLocal.count);

    }

    componentWillMount() {
        this.clickTimeout = null;
    }

    componentDidMount() {
        const groups = localStorageUtility.getArray(config.localStorage.groups);
        const similarGroup = this.learnLocal[config.localStorage.similarGroup]
        const forgetGroup = this.learnLocal[config.localStorage.forgetGroup]

        this.setState({
            isLoaded: true,
            groups: groups,
            similarGroup: similarGroup || {},
            forgetGroup: forgetGroup || {}
        });
    }

    getLearnLocal() {
        let learnLocal = {};
        const strLearnLocal = localStorageUtility.get(config.localStorage.learn);
        if (strLearnLocal) {
            learnLocal = JSON.parse(strLearnLocal);
        }
        return learnLocal;
    }

    getWordLocal() {
        var word = localStorageUtility.get(config.localStorage.words);
        if (word) return JSON.parse(word);
        return {
            count: 0
        }
    }

    getGroupLocal() {
        return localStorageUtility.getArray(config.localStorage.groups);
    }

    getNumberWordRemember() {
        let number = 0;
        for (const key in this.learnLocal) {
            if (this.learnLocal.hasOwnProperty(key)) {
                const element = this.learnLocal[key];
                number += element.state3.length
            }
        }
        return number;
    }

    handleTouch(group) {
        if (this.clickTimeout !== null) {
            // Here handle double touch            
            this.doubleTouch(group);
            clearTimeout(this.clickTimeout)
            this.clickTimeout = null
        } else {
            this.clickTimeout = setTimeout(() => {
                // Here handle single touch
                this.singleTouch();
                clearTimeout(this.clickTimeout)
                this.clickTimeout = null
            }, 200)
        }
    }

    singleTouch() {
    }

    doubleTouch(group) {
        this.setLocalLearn(group);
        this.props.history.push({
            pathname: `/learn/${group._id}`
        })
    }

    setLocalLearn(group) {
        if (!this.learnLocal[group._id]) {
            this.learnLocal[group._id] = this.prepareSetLearnLocal(group);
        }

        localStorageUtility.set(config.localStorage.learn, this.learnLocal);
    }

    prepareSetLearnLocal(group) {
        group.state = 1;
        group.state1 = group.words || [];
        group.state2 = [];
        group.state3 = [];
        group.percent = 1;
        group.learnNumberTimes = 0;
        //group.lastLearnAt = Date.now();
        return group;
    }

    getDayOfWeek(number) {
        switch (number) {
            case 0:
                return 'Su';
            case 1:
                return 'Mo';
            case 2:
                return 'Tu';
            case 3:
                return 'We';
            case 4:
                return 'Th';
            case 5:
                return 'Fr';
            case 6:
                return 'Sa';
            default:
                return 'Not in earth';
        }
    }

    toDate(date) {
        return this.getDayOfWeek(date.getDay()) + ', ' + date.toLocaleString();
    }

    learnRecent(date) {
        let learnRecent = {
            class: "",
            date: ""
        };
        const now = new Date();
        const getMin = (time) => ((now.getTime() - date) / 1000 / 60);
        const getDay = (time) => ((now.getTime() - date) / 1000 / 60 / 60 / 24);

        if (typeof (date) === "number") {
            if (getMin(date) < 5) {
                learnRecent.class = "learn-recent";
            } else if (getMin(date) < 60) {
                learnRecent.class = "learn-recent-1hour";
            } else if (getDay(date) > 1) {
                learnRecent.class = "learn-recent-1day";
            }

            learnRecent.date = this.toDate(new Date(date));
        }

        return learnRecent;
    }

    _renderGroupName = (name, learnNumberTimes) => {
        if (!learnNumberTimes) {
            return (
                <p>
                    {name}
                </p>
            )
        }

        return (
            <p>
                {name} <i className="material-icons">flag</i> {learnNumberTimes}
            </p>
        )
    }


    _uniqueName = (value, index, self) => {
        return self.findIndex(d => d.name === value.name) === index
    }

    _getWord = () => {
        try {
            const { string: word, rate } = this.state
            const groups = this.getGroupLocal()
            const words = groups.map(d => d.words)

            const result = words.flat().filter(item => {
                const res = similarity(word, item.name)
                return res > +rate
            });
            return result
        } catch (error) {
            return []
        }
    }

    onKeyPress = (e) => {
        if (e.charCode === 13) {
            const words = this._getWord();
            this.setState({
                similarWords: words
            })
        }
    }

    onOk = () => {
        let similarGroup = { ...this.state.similarGroup }

        similarGroup = this.prepareSetLearnLocal(similarGroup)
        this.learnLocal[config.localStorage.similarGroup] = similarGroup

        localStorageUtility.set(config.localStorage.learn, this.learnLocal)
        this.closeModal()
    }

    openModal = () => {
        this.setState({
            isShowModal: true
        })
    }

    closeModal = () => {
        this.setState({
            isShowModal: false,
        })
    }

    updateInputValue = (e) => {
        this.setState({
            string: e.target.value
        })
    }

    updateInputRate = (e) => {
        const value = e.target.value
        if (0 < value && value <= 1) {
            this.setState({
                rate: e.target.value
            })
        }
    }

    addForgetGroup = () => {
        const learnLocal = this.learnLocal
        let forgetGroup = { ...this.state.forgetGroup };
        let wordsForgetGroup = []
        for (const key in learnLocal) {
            if (key === config.localStorage.similarGroup ||
                key === config.localStorage.forgetGroup)
                continue

            if (learnLocal.hasOwnProperty(key)) {
                const group = learnLocal[key];
                wordsForgetGroup = [...wordsForgetGroup, ...group.state1]
            }
        }

        forgetGroup.words = wordsForgetGroup
        forgetGroup = this.prepareSetLearnLocal(forgetGroup)
        this.learnLocal[config.localStorage.forgetGroup] = forgetGroup

        localStorageUtility.set(config.localStorage.learn, this.learnLocal)

        this.setState({
            forgetGroup: forgetGroup
        })
    }

    delteSimilarWord = (id) => {
        if (!id) return false
        const { similarWords } = this.state
        const newSimilarWords = similarWords.filter(d => d._id !== id)

        this.setState({
            similarWords: [...newSimilarWords]
        })

    }

    addSimilarGroup = (word) => {
        const { similarGroup } = this.state

        if (similarGroup._id) {
            const index = similarGroup.words.findIndex(d => d._id === word._id)
            if (index === -1) {
                this.setState(state => {
                    state.similarGroup.words = [word, ...state.similarGroup.words]
                    return state
                }, () => this.delteSimilarWord(word._id))
            }
        }
    }

    delteSimilarGroup = (id) => {
        if (!id) return false
        const { similarGroup } = this.state
        const newSimilarGroup = similarGroup.words.filter(d => d._id !== id)

        this.setState(state => ({
            similarGroup: {
                ...state.similarGroup,
                words: newSimilarGroup
            }
        }))

    }

    _prepareGroupProperties = (group) => {
        const groupLearn = this.learnLocal[group._id];
        const properties = {
            _id: group._id,
            name: group.name,
            description: group.description,
            wordCount: group.words.length,
            percent: 1,
            learnNumberTimes: 0,
            isPin: false,
            learnRecent: {
                class: "",
                date: ""
            },
            group: group
        }

        if (groupLearn) {
            properties.percent = groupLearn.percent > 0 ? groupLearn.percent : 1;
            properties.learnRecent = this.learnRecent(groupLearn.lastLearnAt);
            properties.learnNumberTimes = groupLearn.learnNumberTimes
            properties.isPin = groupLearn.isPin
        }

        return properties
    }

    renderGroupItem = (properties) => (
        <li className={properties.learnRecent.class} onClick={this.handleTouch.bind(this, properties.group)} key={properties._id}>
            <div className="flex-center-column">
                {properties.isPin &&
                    <i className="material-icons">
                        warning
                                                    </i>
                }
                <span>{properties.wordCount || 0}</span>
            </div>
            <div className="detail">
                {this._renderGroupName(properties.name, properties.learnNumberTimes)}
                <p>{properties.description}</p>
                <p className="last-learn-at">{properties.learnRecent.date}</p>
            </div>
            <div className="margin-center">
                <div className={`c100 p${properties.percent} blue`}>
                    <span>{properties.percent}%</span>
                    <div className="slice">
                        <div className="bar"></div>
                        <div className="fill"></div>
                    </div>
                </div>
            </div>
        </li>
    )

    sortByPin = (a, b) => {
        const _groupA = this.learnLocal[a._id],
            _groupB = this.learnLocal[b._id]
        let isPinA = _groupA && _groupA.isPin ? true : false,
            isPinB = _groupB && _groupB.isPin ? true : false

        if (isPinA === isPinB) return 0;
        if (isPinA) return -1;
        return 0;
    }

    render() {
        const { error, isLoaded, groups, isShowModal, string, rate, similarWords, tabActive, similarGroup, forgetGroup } = this.state;
        const showModalStyle = isShowModal ? "block" : 'none'
        const isSearchTab = tabActive === 'search'
        const isGroupTab = tabActive === 'group'

        if (error) {
            return <section className="flex-center color-red">Error: {error.message}</section>;
        } else if (!isLoaded) {
            return <SpinnerLoading />;
        } else {
            groups.sort(this.sortByPin)

            return (
                <div>
                    <section>
                        <main>
                            <div className="box-container">
                                <div className="box">
                                    <p>{this.wordLocal.count}</p>
                                    <p>words</p>
                                </div>
                                <div className="box">
                                    <p>{this.groupLocal.length}</p>
                                    <p>groups</p>
                                </div>
                                <div className="box">
                                    <span>0</span>
                                    <p>Week word</p>
                                </div>
                                <div className="box box-clickable" onClick={this.openModal}>
                                    <p><i className="material-icons">add</i> Same</p>
                                </div>
                                <div className="box box-clickable" onClick={this.addForgetGroup}>
                                    <p><i className="material-icons">add</i> Forget</p>
                                </div>
                                {/* <div className="box">
                                    <span>0</span>
                                    <p>Week word</p>
                                </div>
                                <div className="box">
                                    <span>0</span>
                                    <p>Week group</p>
                                </div>
                                <div className="box">
                                    <span>0</span>
                                    <p>Day word</p>
                                </div>
                                <div className="box">
                                    <span>0</span>
                                    <p>Day group</p>
                                </div> */}
                            </div>
                            <div>
                                <div className="number-progress-bar">
                                    <span>{`${this.numberWordRemember}/${this.wordLocal.count}`}</span>
                                </div>
                                <div className="progress-bar margin-center">
                                    <div style={{ width: `${this.percentProgressBar}%` }}>
                                        <div></div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </section>

                    <section>
                        <main>
                            <ul className="list">
                                {forgetGroup._id && forgetGroup.words.length > 0 && this.renderGroupItem(this._prepareGroupProperties(forgetGroup))}
                                {similarGroup._id && similarGroup.words.length > 0 && this.renderGroupItem(this._prepareGroupProperties(similarGroup))}

                                {groups.map((group, index) => {
                                    const properties = this._prepareGroupProperties(group);
                                    return this.renderGroupItem(properties)
                                })}

                            </ul>
                        </main>
                    </section>

                    <div className="modal" onClick={this.closeModal} style={{ display: showModalStyle }}>

                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <span className="close" onClick={this.closeModal}>&times;</span>
                                <p className="modal-title">+ Create same word</p>
                            </div>
                            <div className="modal-body">
                                <div className="tabs">
                                    <div className={isSearchTab ? 'tab tab-active' : 'tab'} onClick={() => this.setState({ tabActive: 'search' })}>
                                        <p>Search</p>
                                    </div>
                                    <div className={isGroupTab ? 'tab tab-active' : 'tab'} onClick={() => this.setState({ tabActive: 'group' })}>
                                        <p>Group</p>
                                    </div>
                                </div>

                                <div className="content-tab" style={{ display: isSearchTab ? 'block' : 'none' }}>
                                    <label>Word:
                                        <input type="text" value={string} onChange={e => this.updateInputValue(e)} onKeyPress={this.onKeyPress} className="input-text" placeholder="your word..." />
                                    </label>

                                    <label>Rate:
                                        <input type="number" min="0.1" max="1" step="0.1" value={rate} onChange={e => this.updateInputRate(e)} onKeyPress={this.onKeyPress} className="input-text" placeholder="your rate..." />
                                    </label>

                                    <div className="table-responsive">
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Operation</th>
                                                </tr>
                                                {similarWords.length <= 0 ?
                                                    (<tr>
                                                        <td>1</td>
                                                        <td>NONE</td>
                                                        <td>NONE</td>
                                                    </tr>) :
                                                    similarWords.map((word, index) => (
                                                        <tr key={index}>
                                                            <td>{index + 1}</td>
                                                            <td>{word.name}</td>
                                                            <td>
                                                                <i className="material-icons icon-clickable" onClick={() => this.addSimilarGroup(word)}>
                                                                    add
                                                    </i>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="content-tab" style={{ display: isGroupTab ? 'block' : 'none' }}>
                                    <div className="table-responsive">
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Operation</th>
                                                </tr>
                                                {!similarGroup.words || similarGroup.words.length <= 0 ?
                                                    (<tr>
                                                        <td>1</td>
                                                        <td>NONE</td>
                                                        <td>NONE</td>
                                                    </tr>) :
                                                    similarGroup.words.map((word, index) => (
                                                        <tr key={index}>
                                                            <td>{index + 1}</td>
                                                            <td>{word.name}</td>
                                                            <td>
                                                                <i className="material-icons icon-clickable" onClick={() => this.delteSimilarGroup(word._id)}>
                                                                    delete_outline
                                                    </i>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>


                            <div className="modal-footer">
                                <div className="modal-group-button">
                                    <button className="button-icon" onClick={this.onOk}>Ok</button>
                                    <button className="button-icon" onClick={this.closeModal}>Cancel</button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            );
        }

    }
}

export default Dashboard;