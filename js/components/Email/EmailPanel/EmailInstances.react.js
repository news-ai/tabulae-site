import React, {Component} from 'react';
import {connect} from 'react-redux';
import Radium from 'radium';
import EmailPanel from './EmailPanel.react';


class EmailInstances extends Component {
  constructor(props) {
    super(props);
    this.state = {
      instances: [],
      instanceNum: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.instanceNum !== this.state.instanceNum) {
      const instanceNumOffset = nextProps.instanceNum - this.state.instanceNum;
      const instances = this.state.instances.concat(Array(instanceNumOffset).fill(true));
      this.setState({instances});
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div>
        <div style={{
          backgroundColor: 'blue',
          height: '100%',
          width: 200,
          zIndex: 300,
          right: 0,
          position: 'fixed'
        }}></div>
        <div style={{
          backgroundColor: 'blue',
          height: 200,
          width: '100%',
          zIndex: 300,
          bottom: 0,
          position: 'fixed'
        }}></div>
        {props.children}

      </div>);
  }
}


const mapStateToProps = state => {
 return {};
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: action => dispatch(action)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Radium(EmailInstances));