import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {invite, getInviteCount} from './actions';

import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import isEmail from 'validator/lib/isEmail';
import Snackbar from 'material-ui/Snackbar';

class Invite extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorText: null,
      value: '',
      snackbar: false,
      msg: '',
    };
    this.onInvite = this._onInvite.bind(this);
  }

  _onInvite() {
    const email = this.state.value;
    let errorText = null;
    if (isEmail(email)) {
      this.props.onInvite(email)
      .then(res => {
        if (res) this.setState({msg: `Whee, invite sent to ${email}`, snackbar: true});
        else this.setState({msg: 'Something went wrong. Let us know and we can help you resolve this issue.', snackbar: true});
      });
    } else errorText = 'Not an Email';
    this.setState({errorText, value: ''});
  }

  render() {
    const state = this.state;
    const props = this.props;
    return (
      <div className={props.className}>
        <TextField
        value={state.value}
        onChange={e => this.setState({value: e.target.value})}
        errorText={state.errorText}
        hintText='Email'
        />
        <div>
          <RaisedButton
          label='Invite a friend'
          onClick={this.onInvite}
          primary
          />
        </div>
        <Snackbar
        onRequestClose={_ => this.setState({snackbar: false})}
        open={state.snackbar}
        message={state.msg}
        autoHideDuration={4000}/>
      </div>);
  }
}


const mapStateToProps = (state, props) => {
  return {};
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    onInvite: email => dispatch(invite(email)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Invite);
