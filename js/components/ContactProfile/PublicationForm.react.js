import React, {Component} from 'react';
import TextField from 'material-ui/TextField';
import {blue50, grey700} from 'material-ui/styles/colors';
import isURL from 'validator/lib/isURL';

class ValidationHOC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showErrorMessage: false,
      errorMessage: ''
    };
    this.validateChildValue = this._validateChildValue.bind(this);
  }

  _validateChildValue(value) {
    const rules = this.props.rules;
    for (var i = 0; i < rules.length; i++) {
      const {validator, errorMessage} = rules[i];
      if (!validator(value)) {
        this.setState({showErrorMessage: true, errorMessage});
        return;
      }
    }
    this.setState({showErrorMessage: false, errorMessage: ''});
  }

  render() {
    return this.props.children({
      errorMessage: this.state.showErrorMessage ? this.state.errorMessage : '',
      onValueChange: value => this.validateChildValue(value)
    });
  }
}

class PublicationForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div className='row' style={{padding: 5, margin: 5, backgroundColor: blue50}}>
        <span className='pointer right' onClick={props.onHide} style={{fontSize: '0.9em', color: grey700}}>Close</span>
        <div className='large-12 medium-12 small-12 columns'>
        Publication Form
        </div>
        <div className='large-12 medium-12 small-12 columns'>
          <TextField
          hintText='Publication Name'
          floatingLabelText='Publication Name'
          value={props.publicationObj.name}
          onChange={e => props.onValueChange(e.target.value, 'name')}
          />
        </div>
        <div className='large-12 medium-12 small-12 columns'>
          <ValidationHOC
          rules={[{validator: isURL, errorMessage: 'Not a valid url.'}]}
          >
          {({onValueChange, errorMessage}) => (
            <TextField
            errorText={errorMessage}
            hintText='Website Link'
            floatingLabelText='Website Link'
            value={props.publicationObj.url}
            onChange={e => {
              onValueChange(e.target.value);
              props.onValueChange(e.target.value, 'url');
            }}
            />)}
          </ValidationHOC>
        </div>
      </div>
    );
  }
}

export default PublicationForm;
