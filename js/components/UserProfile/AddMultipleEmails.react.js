import React, {Component} from 'react';
import {connect} from 'react-redux';
import isEmail from 'validator/lib/isEmail';
import ValidationHOC from 'components/ContactProfile/ContactPublications/ValidationHOC.react';
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
  }

  render() {
    const props = this.props;
    const state = this.state;
    const disabledInput = !isEmail(state.value);
    const NoAccess = props.person.externalemail || props.person.gmail;
    return (
      <div className='vertical-center'>
        <ValidationHOC rules={[{validator: isEmail, errorMessage: 'Not a valid email.'}]}>
        {({onValueChange, errorMessage}) => (
          <TextField
          disabled={NoAccess}
          errorText={errorMessage}
          hintText={NoAccess ? 'Must disable Gmail or SMTP to activate' : 'Email'}
          floatingLabelText={NoAccess ? 'Disable Gmail/SMTP to activate' : 'Email'}
          value={state.value}
          onChange={e => {
            // for validation
            onValueChange(e.target.value);
            // for updating value
            this.setState({value: e.target.value});
          }}
          />)}
        </ValidationHOC>
        <IconButton
        tooltip='Add Email'
        tooltipPosition='top-center'
        disabled={NoAccess && disabledInput}
        iconStyle={{color: disabledInput ? grey500 : cyan500, fontSize: '16px'}}
        iconClassName='fa fa-chevron-right'
        onClick={_ => props.addExtraEmail(state.value).then(_ => this.setState({value: ''}))}
        />
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  return {
    person: state.personReducer.person
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    addExtraEmail: email => dispatch(loginActions.addExtraEmail(email))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddMultipleEmails);

