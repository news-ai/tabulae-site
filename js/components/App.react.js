import React, {Component} from 'react';
import withRouter from 'react-router/lib/withRouter';
import {connect} from 'react-redux';
import intercomSetup from '../chat';

import * as actionCreators from 'actions/AppActions';
import * as joyrideActions from './Joyride/actions';

import Login from './Login';
import Breadcrumbs from 'react-breadcrumbs';

import RaisedButton from 'material-ui/RaisedButton';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Dialog from 'material-ui/Dialog';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import {grey700, blue600, blue300} from 'material-ui/styles/colors';

import {StyleRoot} from 'radium';

const navStyle = {
  position: 'fixed',
  backgroundColor: 'white',
  // border: '1px dotted black',
  boxShadow: '0px 0px 5px 3px rgba(0, 0, 0, 0.1)',
  top: 0,
  padding: 5,
  zIndex: 300
};

const noNavBarLocations = ['static'];
function matchNoNavBar(pathname) {
  const pathblocks = pathname.split('/');
  return noNavBarLocations.some(loc => loc === pathblocks[pathblocks.length - 1 ]);
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: false,
      isDrawerOpen: false,
      showNavBar: true,
      firstTimeUser: false,
      didScroll: false
    };
    this.toggleDrawer = _ => this.setState({isDrawerOpen: !this.state.isDrawerOpen});
    this.closeDrawer = _ => this.setState({isDrawerOpen: false});
  }

  componentWillMount() {
    this.props.getAuth();
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isLogin && !this.state.isLogin && nextProps.person) {
      intercomSetup({
        app_id: 'ur8dbk9e',
        email: nextProps.person.email,
        name: `${nextProps.person.firstname} ${nextProps.person.lastname}`,
        custom_launcher_selector: '#custom_intercom_launcher',
        user_id: nextProps.person.id
      });
      if (!window.isDev) {
        if (Raven.isSetup()) Raven.setUserContext({email: nextProps.person.email, id: nextProps.person.id});
        else Raven.config('https://c6c781f538ef4b6a952dc0ad3335cf61@sentry.io/100317').install();
      }

      if (nextProps.firstTimeUser) {
        this.props.setFirstTimeUser();
        this.setState({firstTimeUser: true});
      }
      this.props.fetchNotifications();
      this.setState({isLogin: true});
    }
    if (matchNoNavBar(nextProps.location.pathname) && nextProps.isLogin) {
      this.setState({showNavBar: false});
    } else {
      this.setState({showNavBar: true});
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    const NavBar = (state.showNavBar && props.person) && (
      <div>
        {
          props.firstTimeUser && <Dialog title={`Welcome, ${props.person.firstname}`} open={state.firstTimeUser}>
            <div style={{margin: '10px 0'}}>
              <div className='horizontal-center'>
                <RaisedButton primary style={{margin: 10}} label='Guide me through an existing sheet' onClick={_ => {
                  props.turnOnGeneralGuide();
                  this.setState({firstTimeUser: false});
                }} />
              </div>
              <div className='horizontal-center'>
                <RaisedButton primary style={{margin: 10}} label='Show me how to upload my first sheet' onClick={_ => {
                  props.turnOnUploadGuide();
                  this.setState({firstTimeUser: false});
                }} />
              </div>
            </div>
          </Dialog>
        }
        {
          props.isLogin &&
          <Dialog open={!props.person.isactive && props.location.pathname !== '/settings'} modal>
            <div className='horizontal-center'>
              <p>Your subscription is over. To re-subscribe please visit the our billing page.</p>
            </div>
            <div className='horizontal-center' style={{margin: 10}}>
              <RaisedButton primary label='Go to Billing' onClick={_ => (window.location.href = 'https://tabulae.newsai.org/api/billing')} />
            </div>
            <div className='horizontal-center' style={{margin: 10}}>
             <RaisedButton
              label='Invite friends, get 1 month'
              labelColor='white'
              backgroundColor={blue300}
              onClick={_ => props.router.push('/settings')}/>
            </div>
          </Dialog>
        }
        <Drawer
        containerClassName='noprint'
        docked={false}
        open={state.isDrawerOpen}
        onRequestChange={isDrawerOpen => this.setState({isDrawerOpen})}>
          <MenuItem onTouchTap={this.closeDrawer} onClick={_ => props.router.push('/')} rightIcon={<i className='fa fa-home' aria-hidden='true' />}>Home</MenuItem>
          <MenuItem onTouchTap={this.closeDrawer} onClick={_ => props.router.push('/clients')} rightIcon={<i className='fa fa-folder' aria-hidden='true' />}>Clients Directory</MenuItem>
          <MenuItem onTouchTap={this.closeDrawer} onClick={_ => props.router.push('/search')} rightIcon={<i className='fa fa-search' aria-hidden='true' />}>Search</MenuItem>
          <MenuItem onTouchTap={this.closeDrawer} onClick={_ => props.router.push('/emailstats')} rightIcon={<i className='fa fa-envelope' aria-hidden='true' />}>Email Analytics</MenuItem>
          <MenuItem onTouchTap={this.closeDrawer} onClick={_ => props.router.push('/settings')} rightIcon={<i className='fa fa-cogs' aria-hidden='true' />}>Settings</MenuItem>
          <MenuItem onTouchTap={this.closeDrawer} onClick={_ => (window.location.href = 'https://tabulae.newsai.org/api/billing')} rightIcon={<i className='fa fa-credit-card' aria-hidden='true' />}>Billing</MenuItem>
          <MenuItem onTouchTap={this.closeDrawer} onClick={_ => props.router.push('/public')} rightIcon={<i className='fa fa-table' aria-hidden='true' />}>Public Lists</MenuItem>
        </Drawer>
        <div className='u-full-width row noprint vertical-center' style={navStyle}>
          <div className='small-6 medium-1 large-1 columns vertical-center'>
            <IconButton iconStyle={{color: grey700}} onClick={this.toggleDrawer} iconClassName='fa fa-bars noprint' />
          </div>
          <div className='hide-for-small-only medium-4 large-6 columns vertical-center'>
            <div>
              <span style={{color: 'gray', marginRight: 8}}>You are at: </span>
            </div>
            <div id='breadcrumbs_hop' style={{marginTop: 16}}>
              <Breadcrumbs
              routes={props.routes}
              params={props.params}
              separator=' > '
              />
            </div>
          </div>
          <div className='hide-for-small-only medium-4 large-3 columns vertical-center horizontal-center clearfix'>
            <RaisedButton
            className='right'
            label='Invite friends, get 1 month'
            labelColor='white'
            backgroundColor={blue300}
            labelStyle={{textTransform: 'none'}}
            onClick={_ => props.router.push('/settings')}/>
          </div>
          <div className='small-6 medium-1 large-1 columns vertical-center horizontal-center clearfix'>
            <RaisedButton className='right' label='Logout' onClick={props.logoutClick} labelStyle={{textTransform: 'none'}} />
          </div>
        </div>
        <div style={{height: 60}}></div>
      </div>
      );
    return (
      <div style={{width: '100%', height: '100%'}}>
        <StyleRoot>
        {
          props.isLogin ?
            <div>
              {state.showNavBar && NavBar}
              {props.children}
              <FloatingActionButton
              id='custom_intercom_launcher'
              backgroundColor={blue600}
              style={{
                position: 'fixed',
                bottom: 20,
                right: 20
              }}
              iconClassName='fa fa-comment-o'
              />
            </div> : <Login />
        }
        </StyleRoot>
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    data: state,
    isLogin: state.personReducer.person ? true : false,
    loginDidInvalidate: state.personReducer.didInvalidate,
    person: state.personReducer.person,
    firstTimeUser: props.location.query.firstTimeUser || state.personReducer.firstTimeUser
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getAuth: _ => dispatch(actionCreators.fetchPerson()),
    logoutClick: _ => dispatch(actionCreators.logout()),
    setFirstTimeUser: _ => dispatch(actionCreators.setFirstTimeUser()),
    fetchNotifications: _ => dispatch(actionCreators.fetchNotifications()),
    turnOnUploadGuide: _ => dispatch(joyrideActions.turnOnUploadGuide()),
    turnOnGeneralGuide: _ => dispatch(joyrideActions.turnOnGeneralGuide()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(withRouter(App));
