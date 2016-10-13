import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {invite} from './actions';

import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import isEmail from 'validator/lib/isEmail';

import alertify from 'alertifyjs';
import 'node_modules/alertifyjs/build/css/alertify.min.css';

class Invite extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorText: null,
      value: ''
    };
  }

  render() {
    const state = this.state;
    const props = this.props;
    return (
      <div>
        <div className='row'>
          <div className='large-12 columns'>
            <TextField
            value={state.value}
            onChange={e => this.setState({value: e.target.value})}
            errorText={state.errorText}
            hintText='Email' floatingLabelText='Email' />
          </div>
        </div>
        <div className='row'>
          <div className='large-12 columns'>
            <RaisedButton
            label='Invite a friend to the Beta'
            onClick={_ => {
              const email = state.value;
              let errorText = null;
              if (isEmail(email)) {
                props.onInvite(email).then(res => {
                  if (res) alertify.success(`Whee, invite sent to ${email}.`);
                  else alertify.error('Oops, something weird happened. Try again later.');
                });
              } else errorText = 'Not an Email';
              this.setState({errorText, value: ''});
            }}
            primary
            />
          </div>
        </div>
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
