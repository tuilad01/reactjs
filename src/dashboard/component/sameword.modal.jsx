import React, { Component } from "react";

import localStorageUtility from "./../../localStorageUtility";
import config from "./../../config";
import dataAccess from "./../../dataAccess";
import { similarity } from "./../../comparisonString";

class SameWordModal extends Component {
  state = {
    string: "",
    rate: 0.5,
    similarGroup: {},
    similarWords: [],
    tabSearchClass: "tab tab-active",
    tabGroupClass: "tab",
    contentSearchStyle: { display: "block" },
    contentGroupStyle: { display: "none" }
  };

  componentDidMount() {
    this.learnLocal = this.props.learnLocal
    const similarGroup = this.learnLocal[config.localStorage.similarGroup];

    this.setState({
      similarGroup: similarGroup || {}
    });
  }

  setActiveTab = tab => {
    if (tab === "search") {
      this.setState({
        tabSearchClass: "tab tab-active",
        tabGroupClass: "tab",
        contentSearchStyle: { display: "block" },
        contentGroupStyle: { display: "none" }
      });
    } else {
      this.setState({
        tabSearchClass: "tab",
        tabGroupClass: "tab tab-active",
        contentSearchStyle: { display: "none" },
        contentGroupStyle: { display: "block" }
      });
    }
  };

  updateInputValue = e => {
    this.setState({
      string: e.target.value
    });
  };

  updateInputRate = e => {
    const value = e.target.value;
    if (0 < value && value <= 1) {
      this.setState({
        rate: e.target.value
      });
    }
  };

  filterSimilarityWord = (string, rate, words) => {
    try {
      const result = words.filter(item => {
        const res = similarity(string, item.name);
        return res > +rate;
      });
      return result;
    } catch (error) {
      return [];
    }
  };

  onKeyPress = e => {
    if (e.charCode === 13) {
      const { string, rate } = this.state;
      const words = dataAccess.getWordHasGroup();
      const newWords = this.filterSimilarityWord(string, rate, words);
      this.setState({
        similarWords: newWords
      });
    }
  };

  deleteSimilarWord = id => {
    if (!id) return false;
    const { similarWords } = this.state;
    const newSimilarWords = similarWords.filter(d => d._id !== id);

    this.setState({
      similarWords: [...newSimilarWords]
    });
  };

  addSimilarGroup = word => {
    const { similarGroup } = this.state;

    if (similarGroup._id) {
      const index = similarGroup.words.findIndex(d => d._id === word._id);
      if (index === -1) {
        this.setState(
          state => {
            state.similarGroup.words = [word, ...state.similarGroup.words];
            return state;
          },
          () => this.deleteSimilarWord(word._id)
        );
      }
    }
  };

  deleteSimilarGroup = id => {
    if (!id) return false;
    const { similarGroup } = this.state;
    const newSimilarGroup = similarGroup.words.filter(d => d._id !== id);

    this.setState(state => ({
      similarGroup: {
        ...state.similarGroup,
        words: newSimilarGroup
      }
    }));
  };

  onOk = () => {
    let similarGroup = { ...this.state.similarGroup };

    similarGroup = this.prepareSetLearnLocal(similarGroup);
    this.learnLocal[config.localStorage.similarGroup] = similarGroup;

    localStorageUtility.set(config.localStorage.learn, this.learnLocal);

    this.props.onChange();
    this.props.onCloseModal();
  };

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

  render() {
    const { isShowModal, onCloseModal } = this.props;
    const {
      string,
      rate,
      similarGroup,
      similarWords,
      tabSearchClass,
      tabGroupClass,
      contentSearchStyle,
      contentGroupStyle
    } = this.state;
    const showModalStyle = isShowModal ? "block" : "none";

    return (
      <div
        className="modal"
        onClick={onCloseModal}
        style={{ display: showModalStyle }}
      >
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <span className="close" onClick={onCloseModal}>
              &times;
            </span>
            <p className="modal-title">+ Create same word</p>
          </div>
          <div className="modal-body">
            <div className="tabs">
              <div
                className={tabSearchClass}
                onClick={() => this.setActiveTab("search")}
              >
                <p>Search</p>
              </div>
              <div
                className={tabGroupClass}
                onClick={() => this.setActiveTab("group")}
              >
                <p>Group</p>
              </div>
            </div>

            <div className="content-tab" style={contentSearchStyle}>
              <label>
                Word:
                <input
                  type="text"
                  value={string}
                  onChange={e => this.updateInputValue(e)}
                  onKeyPress={this.onKeyPress}
                  className="input-text"
                  placeholder="your word..."
                />
              </label>

              <label>
                Rate:
                <input
                  type="number"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={rate}
                  onChange={e => this.updateInputRate(e)}
                  onKeyPress={this.onKeyPress}
                  className="input-text"
                  placeholder="your rate..."
                />
              </label>

              <div className="table-responsive">
                <table>
                  <tbody>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Operation</th>
                    </tr>
                    {similarWords.length <= 0 ? (
                      <tr>
                        <td>1</td>
                        <td>NONE</td>
                        <td>NONE</td>
                      </tr>
                    ) : (
                      similarWords.map((word, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{word.name}</td>
                          <td>
                            <i
                              className="material-icons icon-clickable"
                              onClick={() => this.addSimilarGroup(word)}
                            >
                              add
                            </i>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="content-tab" style={contentGroupStyle}>
              <div className="table-responsive">
                <table>
                  <tbody>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Operation</th>
                    </tr>
                    {!similarGroup.words || similarGroup.words.length <= 0 ? (
                      <tr>
                        <td>1</td>
                        <td>NONE</td>
                        <td>NONE</td>
                      </tr>
                    ) : (
                      similarGroup.words.map((word, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{word.name}</td>
                          <td>
                            <i
                              className="material-icons icon-clickable"
                              onClick={() => this.deleteSimilarGroup(word._id)}
                            >
                              clear
                            </i>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <div className="modal-group-button">
              <button className="button-icon" onClick={this.onOk}>
                Ok
              </button>
              <button className="button-icon" onClick={onCloseModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SameWordModal;
