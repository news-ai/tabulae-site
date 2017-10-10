import React, {Component} from 'react';
import Tooltip from 'material-ui/internal/Tooltip';

class TooltipWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hover: false
    };
  }

  render() {
    const state = this.state;
    const {children, label} = this.props;
    return (
      <div style={{marginBottom: 36}}>
        <Tooltip
        ref='tooltip'
        show={state.hover}
        style={{
          boxSizing: 'border-box',
          fontSize: 10,
          lineHeight: '22px',
          position: 'relative',
          marginBottom: 36
        }}
        label={label}
        />
        {children({
          onMouseEnter: _ => this.setState({hover: true}),
          onMouseOut: _ => this.setState({hover: false})
        })}
      </div>);
  }

}

export default TooltipWrapper;
