import React, {Component} from 'react';
import {connect} from 'react-redux';
import TextField from 'material-ui/TextField';
import {blue50, grey700} from 'material-ui/styles/colors';

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
          defaultValue={props.text}
          />
        </div>
        <div className='large-12 medium-12 small-12 columns'>
          <TextField
          hintText='Website Link'
          floatingLabelText='Website Link'
          />
        </div>
      </div>
    );
  }
}

export default PublicationForm;
