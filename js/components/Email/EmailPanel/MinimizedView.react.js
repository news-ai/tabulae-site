import React from 'react';
import Paper from 'material-ui/Paper';
import Radium from 'radium';
import {grey50} from 'material-ui/styles/colors';

const iconStyle = {
  color: 'lightgray',
  ':hover': {
    color: 'gray',
  }
};

function MinimizedView(props) {
  return (
      <Paper zDepth={2} style={{
        width: 300,
        height: 50,
        backgroundColor: grey50,
        zIndex: 200,
        display: 'inline-block',
        textAlign: 'center'
      }}>
        <i
        style={[iconStyle]}
        key={props.name}
        className='fa fa-chevron-up fa-3x pointer'
        aria-hidden='true'
        onClick={props.toggleMinimize}
        />
      </Paper>);
}

export default Radium(MinimizedView);
