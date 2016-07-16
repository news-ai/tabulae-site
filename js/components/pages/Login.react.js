import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../../actions/AppActions';

class Login extends Component {
	render() {
		return (
			<div className='container'>
				<button onClick={this.props.loginClick}>Login with Google</button>
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
		loginClick: _ => dispatch(actionCreators.loginWithGoogle())
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps)(Login);
