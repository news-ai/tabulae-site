import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../actions/AppActions';
import Login from './pages/Login.react';

class App extends Component {
  componentDidMount() {
    // this.props.getAuth();
  }

  render() {
    return (
      <div className='wrapper'>
        {this.props.children}
      </div>
      );
  }
}

const mapStateToProps = state => {
  return {
    data: state,
    isLogin: state.personReducer.person ? true : false,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getAuth: _ => {
      dispatch(actionCreators.fetchPerson())
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(App);
