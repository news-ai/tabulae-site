
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
    height: '600px',
    width: '900px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    padding: '10px',
    zIndex: 1000,
    overflow: 'scroll',
    transform: 'translate(-50%, -50%)'
  }
};

export const buttonStyle = {
  backgroundColor: 'white'
};
