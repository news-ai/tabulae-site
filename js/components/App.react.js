import React, { Component } from 'react';
import { withRouter } from 'react-router'
import { connect } from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import Login from './Login';
import Breadcrumbs from 'react-breadcrumbs';
import Navigation from './pieces/Navigation.react';
import RaisedButton from 'material-ui/RaisedButton';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import intercomSetup from '../chat';
import {grey700} from 'material-ui/styles/colors';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: false,
      isDrawerOpen: false
    };
    this.toggleDrawer = _ => this.setState({isDrawerOpen: !this.state.isDrawerOpen});
  }

  componentWillMount() {
    this.props.getAuth();
  }

  componentDidMount() {
    // intercomSetup();
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
      // window.intercomSettings = {
      //   app_id: 'ur8dbk9e',
      //   email: person.email,
      //   user_id: person.id,
      // };
      intercomSetup({
        app_id: 'ur8dbk9e',
        email: person.email,
        user_id: person.id,
      });
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    const welcomeMsg = props.firstTimeUser ? 'Hi, ' : 'Welcome back, ';
    return (
      <div style={{width: '100%', height: '100%'}}>
      {props.isLogin ?
        <div>
          <Drawer
          docked={false}
          open={state.isDrawerOpen}
          onRequestChange={isDrawerOpen => this.setState({isDrawerOpen})}
          >
            <MenuItem onClick={_ => props.router.push('/emailstats')}>Email Analytics</MenuItem>
          </Drawer>
          <Navigation>
            <div className='two columns' style={{display: 'flex', alignItems: 'center'}}>
              <IconButton iconStyle={{color: grey700}} onClick={this.toggleDrawer} iconClassName='fa fa-bars' />
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
  )(withRouter(App));
