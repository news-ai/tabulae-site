import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

class Alert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
    this.handleClose = _ => this.setState({open: false});
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.open === true && !this.state.open) this.setState({open: true});
  }

  render() {
    const props = this.props;
    const actions = [
      <FlatButton
        label='Cancel'
        primary
        onTouchTap={_ => {
          props.handleCancel();
          this.handleClose();
        }}
      />,
      <FlatButton
        label='Submit'
        primary
        keyboardFocused
        onTouchTap={_ => {
          props.handleSubmit();
          this.handleClose();
        }}
      />,
    ];
    return (
      <Dialog
      title={props.title || 'Alert'}
      actions={actions}
      modal
      open={this.state.open}
      onRequestClose={this.handleClose}
      >{props.children}</Dialog>
      );
  }
}

export default Alert;
