import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../actions/AppActions';
import Login from './pages/Login.react';

class App extends Component {
  componentDidMount() {
    this.props.getAuth();
  }

  render() {
    const { isLogin, logoutClick } = this.props;
    return (
      <div className='wrapper'>
      { isLogin ?
        <div>
          <button onClick={logoutClick}>Logout</button>
          {this.props.children}
        </div> :
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
    getAuth: _ => dispatch(actionCreators.fetchPerson()),
    logoutClick: _ => dispatch(actionCreators.logout()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(App);
