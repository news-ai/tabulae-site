import React, {Component} from 'react';
import {connect} from 'react-redux';
import isEmail from 'validator/lib/isEmail';
import ValidationHOC from 'components/ValidationHOC';
import {grey500, cyan500} from 'material-ui/styles/colors';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import {actions as loginActions} from 'components/Login';

class AddMultipleEmails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };
    this.onAddEmailClick = _ => {
      if (this.state.value.length > 2) this.props.addExtraEmail(this.state.value).then(_ => this.setState({value: ''}));
    };
  }

  render() {
    const props = this.props;
    const state = this.state;
    const disabledInput = !isEmail(state.value);
    const NoAccess = props.person.externalemail || props.person.gmail || props.person.outlook;
    let hintText = NoAccess ? 'Disable Integration to activate' : `${props.leftover} emails left`;
    let floatingLabelText = NoAccess ? 'Disable Integrations to activate' : 'Email';
    if (props.ontrial) floatingLabelText = 'Upgrade to Pro plan to add emails';
    return (
      <div className='vertical-center'>
      {props.leftover > 0 &&
        <ValidationHOC rules={[{validator: isEmail, errorMessage: 'Not a valid email.'}]}>
        {({onValueChange, errorMessage}) => (
          <TextField
          disabled={NoAccess}
          errorText={errorMessage}
          hintText={hintText}
          floatingLabelText={floatingLabelText}
          value={state.value}
          onChange={e => {
            // for validation
            onValueChange(e.target.value);
            // for updating value
            this.setState({value: e.target.value});
          }}
          />)}
        </ValidationHOC>}
        {props.leftover === 0 &&
          <span style={{color: grey500}}>Max'd out the number of external emails. Please upgrade or remove emails to add another.</span>}
        <IconButton
        tooltip='Add Email'
        tooltipPosition='top-center'
        disabled={NoAccess && disabledInput && props.ontrial}
        iconStyle={{color: disabledInput ? grey500 : cyan500, fontSize: '16px'}}
        iconClassName='fa fa-chevron-right'
        onClick={this.onAddEmailClick}
        />
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  const person = state.personReducer.person;
  const allowance = state.personReducer.allowance;
  let leftover = allowance;
  if (allowance && person.sendgridemails !== null) {
    leftover = allowance - person.sendgridemails.length;
  }
  return {
    person,
    allowance,
    leftover,
    ontrial: state.personReducer.ontrial
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    addExtraEmail: email => dispatch(loginActions.addExtraEmail(email))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddMultipleEmails);

