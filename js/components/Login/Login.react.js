import React from 'react';
import { connect } from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import RaisedButton from 'material-ui/RaisedButton';

function Login({ loginWithGoogleClick, loginClick, registerClick }) {
	return (
		<div className='container'>
			<RaisedButton style={{textTransform: 'none'}} label='Login with Google' onClick={loginWithGoogleClick} />
			<RaisedButton style={{textTransform: 'none'}} label='Register' onClick={registerClick} />
			<RaisedButton style={{textTransform: 'none'}} label='Login' onClick={loginClick} />
		</div>
		);
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
