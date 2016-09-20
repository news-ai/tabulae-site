import React, { Component, PropTypes } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import {connect} from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import DropFile from '../ImportFile';

class DropFileWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listId: null,
      value: this.props.defaultValue || '',
    };
    this.onSetNameClick = this._onSetNameClick.bind(this);
  }

  _onSetNameClick() {
    this.props.createEmptyList(this.state.value)
    .then(response => this.setState({listId: response.data.id}));
  }

  render() {
    const state = this.state;
    const renderNode = state.listId === null ? (<div style={{marginTop: 40}}>
        <div className='row'>
          <div className='large-offset-1 columns'>
            <span>Give the uploaded list a name.</span>
          </div>
        </div>
        <div className='row'>
          <div className='large-offset-1 large-8 columns'>
            <TextField
            id='filedrop-textfield'
            fullWidth
            value={state.value}
            onKeyDown={e => e.keyCode === 13 ? this.onSetNameClick() : null}
            onChange={e => this.setState({value: e.target.value})} />
          </div>
          <div className='large-2 columns'>
            <RaisedButton label='Set Name' onClick={this.onSetNameClick} />
          </div>
        </div>
      </div>) : <DropFile listId={state.listId} />;

    return <div>{renderNode}</div>;
  }
}

const mapStateToProps = (state, props) => {
  return {};
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    createEmptyList: listname => dispatch(actionCreators.createEmptyList(listname))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(DropFileWrapper);
