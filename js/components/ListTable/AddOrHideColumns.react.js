import React, {Component} from 'react';
import {connect} from 'react-redux';

import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';

class AddOrHideColumns extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.open === false && this.state.open === true) {
      // onRequestOpen hit
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div>
        <Dialog open={state.open} title='Add or Hide Columns' onRequestClose={_ => this.setState({open: false})}>
          {props.isReceiving && <FontIcon className={'fa fa-spinner fa-spin'} />}
        </Dialog>
        {props.children({
          onRequestOpen: _ => this.setState({open: true})
        })}
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddOrHideColumns);
