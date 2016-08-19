import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import Login from './pages/Login.react';
import Breadcrumbs from 'react-breadcrumbs';
import Navigation from './pieces/Navigation.react';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    this.props.getAuth();
  }

  render() {
    const { isLogin, logoutClick } = this.props;
    return (
      <div className='wrapper'>
      { isLogin ?
        <div>
          <Navigation>
            <div className='offset-by-one two columns'>
              <span style={{color: 'gray'}}>You are at: </span>
            </div>
            <div className='seven columns'>
              <Breadcrumbs
              routes={this.props.routes}
              params={this.props.params}
              separator=' > '
              />
            </div>
            <div className='three columns'>
              <button onClick={logoutClick}>Logout</button>
            </div>
          </Navigation>
          <div>
          {this.props.children}
          </div>
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
    loginDidInvalidate: state.personReducer.didInvalidate
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
