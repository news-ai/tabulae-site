import React, {Component} from 'react';
import {connect} from 'react-redux';
import isEmail from 'validator/lib/isEmail';
import ValidationHOC from 'components/ContactProfile/ContactPublications/ValidationHOC.react';
import {blue800} from 'material-ui/styles/colors';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';

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
    return (
      <div>
        <ValidationHOC rules={[{validator: isEmail, errorMessage: 'Not a valid email.'}]}>
        {({onValueChange, errorMessage}) => (
          <TextField
          hintStyle={{color: blue800}}
          underlineStyle={{color: blue800}}
          underlineFocusStyle={{color: blue800}}
          floatingLabelFocusStyle={{color: blue800}}
          errorText={errorMessage}
          hintText='Email'
          floatingLabelText='Email'
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
        disabled={!isEmail(state.value) || props.person.externalemail || props.person.gmais}
        iconStyle={{color: blue800, fontSize: '16px'}}
        iconClassName='fa fa-chevron-right'
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
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(AddMultipleEmails);

