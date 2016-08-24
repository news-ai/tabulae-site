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

  componentDidMount() {
    window.Intercom('boot', {
      app_id: 'ur8dbk9e'
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isLogin) this.setState({ isLogin: true });
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.isLogin !== this.state.isLogin) {
      const person = nextProps.person;
      window.Intercom('update', {
        email: person.data.email,
        name: `${person.data.firstname} ${person.data.lastname}`,
        created_at: Date.now(),
        user_id: person.data.id
      });
    }
  }

  componentWillUnmount() {
    if (this.state.isLogin) window.Intercom('shutdown');
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
