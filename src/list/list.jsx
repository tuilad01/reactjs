import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './list.css';

class List extends Component {
  constructor(props, ) {
    super(props);
    this.state = {
      data: this.props.data.map(word => {
        return {
          _id: word._id,
          name: word.name,
          mean: word.mean,
          flipped: false,
          display: true
        }
      })
    };
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
  data: PropTypes.array.isRequired,
};

export default List;