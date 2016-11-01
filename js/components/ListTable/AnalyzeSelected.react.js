import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actionCreators from '../../actions/AppActions';
import withRouter from 'react-router/lib/withRouter';

import Dialog from 'material-ui/Dialog';


class AnalyzeSelected extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      value: []
    };
  }

  componentWillMount() {
  }

  componentWillReceiveProps(nextProps) {

  }

  render() {
    const state = this.state;
    const props = this.props;
    return (
      <div>
        <Dialog
        title='Analyze Selected'
        open={state.open}
        modal={false}
        autoScrollBodyContent
        onRequestClose={_ => this.setState({open: false})}
        >
          <div>
            
          </div>
        </Dialog>
        {props.children({
          onRequestOpen: _ => this.setState({open: true})
        })}
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  const instagramData = props.selected.map(id => state.instagramDataReducer[id]).filter(obj => obj);
  return {
    contacts: props.selected.map(id => state.contactReducer[id]),
    instagramData
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchLists: _ => dispatch(actionCreators.fetchLists()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(AnalyzeSelected));
