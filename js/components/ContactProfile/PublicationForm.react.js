import React, {Component} from 'react';
import TextField from 'material-ui/TextField';
import {blue50, blue800, grey700} from 'material-ui/styles/colors';
import isURL from 'validator/lib/isURL';
import ValidationHOC from './ValidationHOC.react';

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
          hintStyle={{color: blue800}}
          underlineStyle={{color: blue800}}
          underlineFocusStyle={{color: blue800}}
          floatingLabelFocusStyle={{color: blue800}}
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
            hintStyle={{color: blue800}}
            underlineStyle={{color: blue800}}
            underlineFocusStyle={{color: blue800}}
            floatingLabelFocusStyle={{color: blue800}}
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
