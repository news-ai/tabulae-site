import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import Login from './Login';
import Breadcrumbs from 'react-breadcrumbs';
import Navigation from './pieces/Navigation.react';
import RaisedButton from 'material-ui/RaisedButton';
require('../chat');
// (function() {
//     var w = window;
//     var ic = w.Intercom;
//     if (typeof ic === "function") {
//       ic('reattach_activator');
//       ic('update', intercomSettings);
//     } else {
//       var d = document;
//       var i = function() {
//         i.c(arguments);
//       };
//       i.q=[];
//       i.c = function(args) {
//         i.q.push(args);
//       };
//       w.Intercom = i;
//       function l() {
//         var s = d.createElement('script');
//         s.type = 'text/javascript';
//         s.async = true;
//         s.src = 'https://widget.intercom.io/widget/ur8dbk9e';
//         var x = d.getElementsByTagName('script')[0];
//         x.parentNode.insertBefore(s, x);
//       }
//       if (w.attachEvent) {
//         w.attachEvent('onload', l);
//       } else {
//         w.addEventListener('load', l, false);
//       }
//     }
//     })();

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
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.isLogin !== this.props.isLogin && this.props.person) {
      const person = this.props.person;
      window.Intercom('boot', {
        app_id: 'ur8dbk9e',
        email: person.email,
        user_id: person.id,
      });
    }
  }

  render() {
    const props = this.props;
    const welcomeMsg = props.firstTimeUser ? 'Hi, ' : 'Welcome back, ';
    return (
      <div style={{width: '100%', height: '100%'}}>
      {props.isLogin ?
        <div>
          <Navigation>
            <div className='two columns'>
              <span style={{color: 'gray', float: 'right'}}>You are at: </span>
            </div>
            <div className='five columns'>
              <Breadcrumbs
              routes={props.routes}
              params={props.params}
              separator=' > '
              />
            </div>
            <div className='three columns'>
              {
                //<RaisedButton label='Email Analytics' labelStyle={{textTransform: 'none'}} onClick={_ => props.history.push('/emailstats')} />
              }
              <span style={{color: 'gray', float: 'right'}}>{welcomeMsg}{props.person.firstname}</span>
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
    firstTimeUser: state.personReducer.firstTimeUser
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
