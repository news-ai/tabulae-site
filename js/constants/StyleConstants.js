
export const globalStyles = {
  icon: {
    color: 'lightgray',
    float: 'right',
    ':hover': {
      color: 'gray',
      cursor: 'pointer'
    }
  },

};

export const skylightStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 999,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  dialog: {
    height: 600,
    width: 900,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    padding: 10,
    zIndex: 1000,
    overflow: 'scroll',
    transform: 'translate(-50%, -50%)'
  }
};

export const buttonStyle = {
  backgroundColor: '#ffffff'
};

export const iconStyle = {
  color: 'lightgray',
  marginLeft: 5,
  ':hover': {
    color: 'gray',
    cursor: 'pointer'
  }
};
