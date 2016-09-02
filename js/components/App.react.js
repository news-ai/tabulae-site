import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import Login from './Login';
import Breadcrumbs from 'react-breadcrumbs';
import Navigation from './pieces/Navigation.react';
import RaisedButton from 'material-ui/RaisedButton';

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
    if (nextProps.isLogin && !this.state.isLogin && nextProps.person) {
      const firstTimeUserString = '?firstTimeUser=true';
      if (window.location.search.substring(0, firstTimeUserString.length) === '?firstTimeUser=true') this.props.setFirstTimeUser();
      const person = nextProps.person;
      this.setState({ isLogin: true });
    }
  }
  componentDidUpdate() {
    if (this.props.isLogin && this.props.person) {
      const person = this.props.person;
      window.Intercom('boot', {
        app_id: 'ur8dbk9e',
        // email: person.email,
        // user_id: person.id,
      });
      window.intercomSettings = {
        app_id: 'ur8dbk9e',
        email: person.email,
        user_id: person.id,
      };
      window.Intercom('update');
    }
  }

  componentWillUnmount() {
    // if (this.state.isLogin) window.Intercom('shutdown');
  }

  render() {
    const props = this.props;
    return (
      <div style={{width: '100%', height: '100%'}}>
      {props.isLogin ?
        <div>
          <Navigation>
            <div className='two columns'>
              <span style={{color: 'gray', float: 'right'}}>You are at: </span>
            </div>
            <div className='six columns'>
              <Breadcrumbs
              routes={props.routes}
              params={props.params}
              separator=' > '
              />
            </div>
            <div className='two columns'>
              {
                //<RaisedButton label='Email Analytics' labelStyle={{textTransform: 'none'}} onClick={_ => props.history.push('/emailstats')} />
              }
            </div>
            <div className='two columns'>
              <RaisedButton label='Logout' onClick={props.logoutClick} labelStyle={{textTransform: 'none'}} />
            </div>
          </Navigation>
          <div>
          {props.children}
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
    person: state.personReducer.person,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getAuth: _ => dispatch(actionCreators.fetchPerson()),
    logoutClick: _ => dispatch(actionCreators.logout()),
    setFirstTimeUser: _ => dispatch(actionCreators.setFirstTimeUser())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(App);
