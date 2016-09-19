import React, {Component} from 'react';
import withRouter from 'react-router/lib/withRouter';
import {connect} from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import Login from './Login';
import Breadcrumbs from 'react-breadcrumbs';
import RaisedButton from 'material-ui/RaisedButton';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import {grey700} from 'material-ui/styles/colors';
import {StyleRoot} from 'radium';

const verticalCenter = {
  display: 'flex',
  alignItems: 'center',
  textAlign: 'center'
};

const navStyle = {
  position: 'fixed',
  backgroundColor: 'white',
  // border: '1px dotted black',
  boxShadow: '0px 0px 5px 3px rgba(0, 0, 0, 0.1)',
  top: 0,
  display: 'flex',
  alignItems: 'center',
  padding: '5px',
  zIndex: 300
};

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
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isLogin && !this.state.isLogin && nextProps.person) {
      if (nextProps.firstTimeUser) this.props.setFirstTimeUser();
      const person = nextProps.person;
      if (window.Intercom) {
        // window.Intercom('update', {
        //   email: person.email,
        //   user_id: person.id,
        //   name: `${person.firstname} ${person.lastname}`
        // });
      }
      this.setState({isLogin: true});
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    const welcomeMsg = props.firstTimeUser ? 'Hi, ' : 'Welcome back, ';
    return (
      <div style={{width: '100%', height: '100%'}}>
        <StyleRoot>
        {props.isLogin ?
          <div>
            <Drawer
            ontainerClassName='noprint'
            docked={false}
            open={state.isDrawerOpen}
            onRequestChange={isDrawerOpen => this.setState({isDrawerOpen})}>
              <MenuItem onClick={_ => props.router.push('/')} rightIcon={<i className='fa fa-home' aria-hidden='true' />}>Home</MenuItem>
              <MenuItem onClick={_ => props.router.push('/emailstats')} rightIcon={<i className='fa fa-envelope' aria-hidden='true' />}>Email Analytics</MenuItem>
              <MenuItem onClick={_ => props.router.push('/search')} rightIcon={<i className='fa fa-search' aria-hidden='true' />}>Search</MenuItem>
            </Drawer>
           <div className='u-full-width row noprint' style={navStyle}>
              <div className='small-8 medium-3 large-2 columns' style={verticalCenter}>
                <IconButton iconStyle={{color: grey700}} onClick={this.toggleDrawer} iconClassName='fa fa-bars noprint' />
                <span style={{color: 'gray', float: 'right'}}>You are at: </span>
              </div>
              <div className='hide-for-small-only medium-4 large-5 columns'>
                <div style={{marginTop: '13px'}}>
                  <Breadcrumbs
                  routes={props.routes}
                  params={props.params}
                  separator=' > '
                  />
                </div>
              </div>
              <div className='hide-for-small-only medium-3 large-3 columns' style={verticalCenter}>
                <span style={{color: 'gray', float: 'right'}}>{welcomeMsg}{props.person.firstname}</span>
              </div>
              <div className='small-4 medium-2 large-2 columns' style={verticalCenter}>
                <RaisedButton label='Logout' onClick={props.logoutClick} labelStyle={{textTransform: 'none'}} />
              </div>
              </div>
            <div style={{height: '60px'}}></div>
            {props.children}
          </div> :
        <Login />
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
    setFirstTimeUser: _ => dispatch(actionCreators.setFirstTimeUser())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(withRouter(App));
