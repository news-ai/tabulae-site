import React from 'react';
import FontIcon from 'material-ui/FontIcon';
import {grey800} from 'material-ui/styles/colors';

const emailPanelPauseOverlay = {
  backgroundColor: grey800,
  borderSizing: 'border-box',
  zIndex: 300,
  position: 'absolute',
  opacity: 0.7,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const styles = {
  container: {margin: 0},
  text: {color: '#ffffff', fontSize: '1.3em'},
  icon: {margin: '0 5px'}
};

const PauseOverlay = ({message, width, height}) => (
  <div style={Object.assign({}, {width, height}, emailPanelPauseOverlay)}>
    <div style={styles.container}>
      <span style={styles.text}>{message || 'Loading...'}</span>
      <FontIcon style={styles.icon} color='#ffffff' className='fa fa-spin fa-spinner' />
    </div>
  </div>);

export default PauseOverlay;
