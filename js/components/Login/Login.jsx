import React from 'react';
import {connect} from 'react-redux';
import * as actions from './actions';
import RaisedButton from 'material-ui/RaisedButton';

const buttonStyle = {
	textTransform: 'none',
	margin: '0.1em'
};

const styles = {
	container: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: '50em'
	},
};

function Login({loginWithGoogleClick, loginClick, registerClick}) {
	return (
		<div style={styles.container}>
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
		loginWithGoogleClick: _ => dispatch(actions.loginWithGoogle()),
		registerClick: _ => dispatch(actions.register()),
		loginClick: _ => dispatch(actions.onLogin())
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
