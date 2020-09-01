import React, { Component } from "react"
import Statistic from "./component/statistic"
import SameWordModal from "./component/sameword.modal"
import List from "./component/list"
import SpinnerLoading from "../spinner-loading/spinner-loading"

import dataAccess from "./../dataAccess"

class Dashboard extends Component {
  constructor(props) {
    super(props)
        
    this.state = {
      error: null,
      isLoaded: true,
      learnLocal: {},
      isShowModal: false,
    };
  }

  componentDidMount() {
    this._initLocalData()
  }

  render() {
    const { error, isLoaded, learnLocal, isShowModal } = this.state;

    if (error) {
      return (
        <section className="flex-center color-red">
          Error: {error.message}
        </section>
      );
    } else if (!isLoaded) {
      return <SpinnerLoading />;
    } else {
      return (
        <div>
          <Statistic
            onOpenModal={this.openModal}
            onAddForgetGroup={this.addForgetGroup}
          />

          <List
            learnLocal={learnLocal}
          />

          <SameWordModal
            learnLocal={learnLocal}
            isShowModal={isShowModal}
            onCloseModal={this.closeModal}
            onChange={this.onChange}
          />
        </div>
      );
    }
  }

  _initLocalData = async () => {
    this.setState({isLoaded: false})
    await dataAccess.getGroup()
    await dataAccess.getTotalNumberWord()
    
    dataAccess.remindGroup()
    const learnLocal = dataAccess.getLearnLocal()
    this.setState({isLoaded: true, learnLocal: learnLocal})

    dataAccess.createSimilarGroup()
    dataAccess.createForgetGroup()
  }

  addForgetGroup = () => {
    const learnLocal = dataAccess.addWordToForgetGroup();

    if (learnLocal) {
      this.setState({ learnLocal: learnLocal });
    }
  }

  openModal = () => {
    this.setState({
      isShowModal: true
    });
  };

  closeModal = () => {
    this.setState({
      isShowModal: false
    });
  };

  onChange = (learnLocal) => {
    this.setState({ learnLocal: learnLocal })
  }

}

export default Dashboard;