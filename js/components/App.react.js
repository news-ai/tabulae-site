import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import Login from './pages/Login.react';
import Breadcrumbs from 'react-breadcrumbs';
import { Notification } from 'react-notification';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      noticeIsActive: false,
      noticeMessage: 'Oops. It looks like the application is not available right now. Let us know what happened and we can fix it for you. Email at julie@newsai.org.'
    };
  }

  componentDidMount() {
    this.props.getAuth();
  }

  componentWillReceiveProps(nextProps) {
    const { loginDidInvalidate } = nextProps;
    this.setState({ noticeIsActive: loginDidInvalidate });
  }

  render() {
    const { isLogin, logoutClick } = this.props;
    return (
      <div className='wrapper'>
      <Notification
        isActive={this.state.noticeIsActive}
        message={this.state.noticeMessage}
        action='Dismiss'
        barStyle={{zIndex: 140}}
        activeBarStyle={{zIndex: 140}}
        actionStyle={{zIndex: 140}}
        onClick={ _ => this.setState({ noticeIsActive: false, noticeMessage: 'DEFAULT' })}
      />
      { isLogin ?
        <div>
          <div className='u-full-width row' style={{
            position: 'fixed',
            height: '60px',
            backgroundColor: 'red',
            top: 0,
            display: 'flex',
            alignItems: 'center'
          }}>
            <div className='offset-by-one nine columns'>
              <Breadcrumbs
              routes={this.props.routes}
              params={this.props.params}
              />
            </div>
            <div className='three columns'>
              <button onClick={logoutClick}>Logout</button>
            </div>
          </div>
          <div style={{height: '80px'}}></div>
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
