import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './list.css';
import { useSwipeable, Swipeable } from 'react-swipeable';

import { mergeArray, splitByArray } from './../arrayUtility';
import localStorageUtility from '../localStorageUtility';
import config from '../config';

class List extends Component {
  constructor(props, ) {
    super(props);

    const { data } = this.props;

    const _data = data.state === 1 ? data.state1 :
      data.state === 2 ? [...data.state1, ...data.state2] :
        [...data.state1, ...data.state2, ...data.state3];

    this.state = {
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
      }),
      popup: {
        isOpen: false,
        text: "world",
        rd: 0
      }
    };

    this.gFlip = false;

  }

  componentWillMount() {
    this.clickTimeout = null;
    this.holdMouse = null;
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

  onMouseDown(text) {
    clearInterval(this.holdMouse);
    this.holdMouse = setInterval(() => {
      window.open(`https://translate.google.com.vn/?client=t&sl=en&tl=vi&text=${encodeURI(text)}`, '_blank');
      clearInterval(this.holdMouse);
      this.holdMouse = null;
    }, 1000);
  }

  onMouseUp() {
    clearInterval(this.holdMouse);
  }

  shuffle() {
    this.gFlip = !this.gFlip;
    this.setState(state => {
      state.data = this.shuffleArray(state.data);
      state.data.map(_ => {
        _.flipped = this.gFlip;
        return _;
      })
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
    const { state, state1, state2, state3 } = this.state;
    const strLearnLocal = localStorageUtility.get(config.localStorage.learn);
    if (strLearnLocal) {
      const learnLocal = JSON.parse(strLearnLocal);
      const group = learnLocal[this.props.data._id];
      group.state = state;
      group.state1 = state1;
      group.state2 = state2;
      group.state3 = state3;
      group.percent = Math.round((state3.length * 100) / group.words.length);
      group.lastLearnAt = new Date().getTime();

      localStorageUtility.set(config.localStorage.learn, learnLocal);
    }
  }

  next() {
    let { state, state1, state2, state3, data } = this.state;
    const propId = "_id";
    const propDisplay = "display";

    switch (state) {
      case 1:
        state1 = [...data.filter(_ => _.display)];
        state2 = [...data.filter(_ => !_.display), ...state2];
        data = [...state1, ...state2].map(_ => {
          _.display = true;
          _.flipped = this.gFlip;
          return _;
        });
        state++;
        break;

      case 2:
        state1 = [...data.filter(_ => _.display)];
        state2 = [...data.filter(_ => !_.display)];
        data = [...state1, ...state2, ...state3].map(_ => {
          _.display = true;
          _.flipped = this.gFlip;
          return _;
        });
        state++;
        break;

      case 3:
        const remember = data.filter(_ => !_.display);

        state3 = [...remember.filter(rem => state2.find(sta2 => sta2._id === rem._id) || state3.find(sta3 => sta3._id === rem._id))];
        state2 = [...remember.filter(rem => state1.find(sta1 => sta1._id === rem._id))];
        state1 = [...data.filter(_ => _.display)];

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
      gstate.data = data;
      return gstate;
    }, this.save);
    this.props.onClickChangeState(state);
  }

random (min, max) {
    return Math.floor(Math.random() * (+max - +min)) + +min; 
}

  openPopup(word) {
    this.setState(() => ({
      popup: {
        isOpen: true,
        text: word,
        rd: this.random(1,9999999)
      }    
    }))
  }


  closePopup() {
    this.setState(() => ({
      popup: {
        isOpen: false,
        text: "",
        rd: 0
      }
    }))
  }


  render() {
    const config = {
      delta: 20,                             // min distance(px) before a swipe starts
      preventDefaultTouchmoveEvent: true,   // preventDefault on touchmove, *See Details*
      trackTouch: true,                      // track touch input
      trackMouse: true,                     // track mouse input
      rotationAngle: 0,                      // set a rotation angle
    }

    // const handlers = useSwipeable({
    //   onSwipedRight: (eventData) => {
    //     console.log("swipe right");
    //   }, ...config
    // });

    return (
      <section>
        <main className="square-container">
          {/* <button onClick={() => {this.setState((state) => {
            state.data.map(d => d.display = false);
            return state;
          })}}>click here</button> */}

          {this.state.data.map((word, index) => {
            return (

              <div className={"square " + (word.display ? '' : 'hidden')}
                onClick={this.handleTouch.bind(this, word)}
                onMouseDown={this.onMouseDown.bind(this, word.name)}
                onMouseUp={this.onMouseUp.bind(this)}
                key={index}>
                <Swipeable onSwipedRight={this.openPopup.bind(this, word.name)} {...config}>
                  <p className={word.flipped ? "hidden" : ""}>{word.name}</p>
                  <p className={word.flipped ? "" : "hidden"}>{word.mean}</p>
                </Swipeable>

              </div>

            );
          })}
        </main>

        <div className={"popup-link " + (this.state.popup.isOpen ? '' : 'hidden')} onClick={event => {
          if (event.target.tagName !== "A") {
            this.closePopup.call(this);
          }
        }}>
          <audio id="audio-speech" controls src={this.state.popup.isOpen ? `http://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURI(this.state.popup.text)}&rd=${this.state.popup.rd}` : ''}></audio>          
        </div>

      </section>
    );
  }
}

List.propTypes = {
  data: PropTypes.object.isRequired,
};

export default List;