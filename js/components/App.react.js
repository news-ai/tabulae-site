import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import Login from './Login';
import Breadcrumbs from 'react-breadcrumbs';
import Navigation from './pieces/Navigation.react';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: false
    };
  }

  componentWillMount() {
    this.props.getAuth();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isLogin && !this.state.isLogin) {
      this.setState({ isLogin: true });
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.isLogin !== this.state.isLogin) {
      const person = nextProps.person;
      // console.log('SET UP INTERCOM');
      // window.intercomSettings = {
      //   app_id: 'ur8dbk9e',
      //   email: person.email,
      //   name: `${person.firstname} ${person.lastname}`,
      //   user_id: person.id,
      // };
      // window.Intercom('boot', {
      //   email: person.email,
      //   name: `${person.firstname} ${person.lastname}`,
      //   user_id: person.id,
      // });
    } else {
    }
  }

  componentWillUnmount() {
    // if (this.state.isLogin) window.Intercom('shutdown');
  }

  render() {
    const { isLogin, logoutClick, person } = this.props;
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
    loginDidInvalidate: state.personReducer.didInvalidate,
    person: state.personReducer.person
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
