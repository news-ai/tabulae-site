import React, {Component} from 'react';
import EmailPanel from './EmailPanel.react';

const positionStyle = {
  bottom: 0,
  left: 0,
  right: 0,
};

class EmailPanelBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emailInstances: [],
      minimizedInstances: []
    };
  }

  addEmailPanel() {
    const emailInstances = [...this.state.emailInstances, <EmailPanel minimized={false} {...this.props}/>];
    const minimizedInstances = [...this.state.minimizedInstances, false];
    this.setState({emailInstances, minimizedInstances});
  }

  render() {
    return(
      <div style={positionStyle}>
      </div>
      );
  }
}

export default EmailPanelBar;