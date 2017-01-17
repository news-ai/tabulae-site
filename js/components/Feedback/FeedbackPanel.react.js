import React, {Component} from 'react';
import {connect} from 'react-redux';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Textarea from 'react-textarea-autosize';
import RaisedButton from 'material-ui/RaisedButton';
import * as AppActions from 'actions/AppActions';

class FeedbackPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '---- n/a ----',
      text: ''
    };
    this.handleChange = (event, index, value) => this.setState({value});
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div>
        <div style={{margin: 10}}>
          <div className='vertical-center'>
            <span>Select a Reason below:</span>
          </div>
          <div className='vertical-center'>
            <DropDownMenu value={state.value} onChange={this.handleChange}>
              <MenuItem value='---- n/a ----' primaryText='---- n/a ----'/>
              <MenuItem value='Too expensive' primaryText='Too expensive'/>
              <MenuItem value='Found better solution' primaryText='Found better solution'/>
              <MenuItem value='Lacks features' primaryText='Lacks features'/>
              <MenuItem value='Usability issues' primaryText='Usability issues'/>
              <MenuItem value='Bad customer service' primaryText='Bad customer service'/>
            </DropDownMenu>
          </div>
        </div>
        <div style={{margin: 10}}>
          <div className='vertical-center'>
            <span>Feedback:</span>
          </div>
          <div className='vertical-center'>
            <Textarea
            placeholder='Wha'
            maxRows={5}
            value={state.text}
            onChange={e => this.setState({text: e.target.value})}
            />
          </div>
          <div className='horizontal-center' style={{marginTop: 10}}>
            <RaisedButton label='Submit' onClick={() => console.log(state.text)}/>
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
    postFeedback: (reason, feedback) => dispatch(AppActions.postFeedback(reason, feedback))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackPanel);
