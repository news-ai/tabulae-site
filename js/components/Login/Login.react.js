import React from 'react';
import { connect } from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import RaisedButton from 'material-ui/RaisedButton';

const buttonStyle = {
	textTransform: 'none',
	margin: '0.1em'
};

function Login({loginWithGoogleClick, loginClick, registerClick}) {
	return (
			<div style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: '50em'
			}}>
				<div>
					<RaisedButton style={buttonStyle} label='Login with Google' onClick={loginWithGoogleClick} />
					<RaisedButton style={buttonStyle} label='Register' onClick={registerClick} />
					<RaisedButton style={buttonStyle} label='Login' onClick={loginClick} />
				</div>
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
