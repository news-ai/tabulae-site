import React, {Component} from 'react';
import {connect} from 'react-redux';
import Select from 'react-select';
import * as actionCreators from '../../actions/AppActions';

import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';

class CopyOrMoveTo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      value: []
    };
  }

  componentWillMount() {
    this.props.fetchLists();
  }

  render() {
    const state = this.state;
    const props = this.props;
    return (
      <div>
        <Dialog
        title='Copy or Move to Another Table'
        open={state.open}
        modal={false}
        autoScrollBodyContent
        onRequestClose={_ => this.setState({open: false})}
        >
          <div style={{height: 500}}>
            <p>Select the List(s) to Copy these selected contacts to:</p>
            {props.lists &&
              <Select
              multi
              value={state.value}
              options={props.options}
              onChange={(value) => this.setState({value})}
              />}
          </div>
        </Dialog>
        {props.children({
          onRequestOpen: _ => this.setState({open: true})
        })}
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  const lists = state.listReducer.lists.map(id => state.listReducer[id]);
  return {
    lists,
    options: lists.map(list => ({label: list.name, value: list.id}))
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchLists: _ => dispatch(actionCreators.fetchLists())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CopyOrMoveTo);
