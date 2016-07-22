import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../actions/AppActions';
import Login from './pages/Login.react';

class App extends Component {
  componentDidMount() {
    this.props.getAuth();
  }

  render() {
    const { isLogin } = this.props;
    return (
      <div className='wrapper'>
      { isLogin ?
        this.props.children :
      <Login />
      }
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
      dispatch(actionCreators.fetchPerson());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(App);
