import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './list.css';

import { mergeArray, splitByArray } from './../arrayUtility';
import localStorageUtility from '../localStorageUtility';
import config from '../config';

class List extends Component {
  constructor(props, ) {
    super(props);

    const { data } = this.props;

    const _data = data.state === 1 ? data.state1 :
      data.state === 2 ? data.state2 :
        data.state3;

    this.state = {
      _id: data._id,
      state: data.state,
      state1: data.state1,
      state2: data.state2,
      state3: data.state3,
      data: _data.map(word => {
        return {
          _id: word._id,
          name: word.name,
          mean: word.mean,
          flipped: false,
          display: true
        }
      })
    };

    this.gFlip = false;
    
  }

  componentWillMount() {
    this.clickTimeout = null;
  }

  componentDidMount() {
    //this.shuffle.call(this);

  }

  hidden(word) {
    this.setState(state => {
      const _word = state.data.find(_ => _._id === word._id);
      if (!_word) return false;
      _word.display = false;
      return _word;
    });
  }

  flip(word) {
    this.setState(state => {
      const _word = state.data.find(_ => _._id === word._id);
      if (!_word) return false;
      _word.flipped = !_word.flipped;
      return _word;
    });
  }

  handleTouch(word) {
    if (this.clickTimeout !== null) {
      this.hidden(word);
      clearTimeout(this.clickTimeout)
      this.clickTimeout = null
    } else {
      this.clickTimeout = setTimeout(() => {
        this.flip(word);
        clearTimeout(this.clickTimeout)
        this.clickTimeout = null
      }, 200)
    }
  }

  shuffle() {
    this.setState(state => {
      state.data = this.shuffleArray(state.data);
      // state.data.map(word => {
      //   word.display = true;
      //   return word;
      // });
      return state.data;
    });
  }

  shuffleArray(array) {
    let i = array.length - 1;
    for (; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  save() {
    debugger    
    const { _id, state, state1, state2, state3 } = this.state;
    const strLearnLocal = localStorageUtility.get(config.localStorage.learn);
    if (strLearnLocal) {
      const learnLocal = JSON.parse(strLearnLocal);
      const group = learnLocal[_id];
      group.state = state;
      group.state1 = state1;
      group.state2 = state2;
      group.state3 = state3;
      group.percent = Math.round((state3 * 100) / group.word.length);      
    }
  }

  next() {
    let { state, state1, state2, state3, data } = this.state;
    const propId = "_id";
    const propDisplay = "display";

    switch (state) {
      case 1:
        state2 = mergeArray(splitByArray(data, state1, propDisplay, false, propId), state2, propId);
        state1 = data.filter(_ => _.display);
        data = mergeArray(state1, state2, propId).map(_ => {
          _.display = true;
          _.flipped = this.gFlip;
          return _;
        });
        state++;        
        break;

      case 2:
        state1 = data.filter(_ => _.display);
        state2 = data.filter(_ => !_.display);
        data = mergeArray(mergeArray(state1, state3, propId), state2, propId).map(_ => {
          _.display = true;
          _.flipped = this.gFlip;
          return _;
        });
        state++;
        break;

      case 3:
        state3 = mergeArray(splitByArray(data, state2, propDisplay, false, propId), splitByArray(data, state3, propDisplay, false, propId));
        state2 = splitByArray(data, state1, propDisplay, false, propId);
        state1 = data.filter(_ => _.display);

        data = state1.map(_ => {
          _.display = true;
          _.flipped = this.gFlip;
          return _;
        });
        state = 1;
        break;

      default:
        break;
    }
    this.setState(gstate => {
      gstate.state = state;
      gstate.state1 = state1;
      gstate.state2 = state2;
      gstate.state3 = state3;      
      gstate.data =  data;
      return gstate;
    })
    this.props.onClickChangeState(state);
  }


  render() {
    return (
      <section>
        <main className="square-container">
          {this.state.data.map((word, index) => {
            return (
              <div className={"square " + (word.display ? '' : 'hidden')} onClick={this.handleTouch.bind(this, word)} key={index}>
                <p className={word.flipped ? "hidden" : ""}>{word.name}</p>
                <p className={word.flipped ? "" : "hidden"}>{word.mean}</p>
              </div>
            );
          })}
        </main>
      </section>
    );
  }
}

List.propTypes = {
  data: PropTypes.object.isRequired,
};

export default List;