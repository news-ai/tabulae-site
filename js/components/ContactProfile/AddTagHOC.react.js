import React, {Component} from 'react';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

class AddTagHOC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
    this.onRequestOpen = _ => this.setState({open: true});
    this.onRequestClose = _ => this.setState({open: false});
  }

  render() {
    const props = this.props;
    const state = this.state;

    const actions = [
      <FlatButton
      label='Cancel'
      onTouchTap={this.onRequestClose}
      />,
      <FlatButton
      label='Submit'
      primary
      keyboardFocused
      onTouchTap={this.onRequestClose}
    />,
    ];
    return (
      <div>
        <Dialog actions={actions} open={state.open} title='Add Tag' modal onRequestClose={this.onRequestClose}>
          ALOHA
        </Dialog>
        {props.children({
          onRequestOpen: this.onRequestOpen
        })}
      </div>);
  }
}


const mapStateToProps = (state, props) => {
  return {};
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(AddTagHOC);
