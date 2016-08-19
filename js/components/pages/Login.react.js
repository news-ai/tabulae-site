import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from 'actions/AppActions';

class Login extends Component {
	render() {
		const { loginWithGoogleClick, loginClick, registerClick } = this.props;
		return (
			<div className='container'>
				<button onClick={loginWithGoogleClick}>Login with Google</button>
				<button onClick={registerClick}>Register</button>
				<button onClick={loginClick}>Login</button>
			</div>
			);
	}
}

const mapStateToProps = state => {
	return {
		person: state.personReducer.person
	};
};

const mapDispatchToProps = dispatch => {
	return {
		loginWithGoogleClick: _ => dispatch(actionCreators.loginWithGoogle()),
		registerClick: _ => dispatch(actionCreators.register()),
		loginClick: _ => dispatch(actionCreators.onLogin())
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps)(Login);
