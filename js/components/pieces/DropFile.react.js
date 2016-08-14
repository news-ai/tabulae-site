import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import Dropzone from 'react-dropzone';
import Headers from './Headers.react';
import _ from 'lodash';


class DropFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null
    };
    this._onDrop = this._onDrop.bind(this);
    this._submit = this._submit.bind(this);
  }

  componentDidMount() {
    // TESTING USE ONLU
    const { dispatch, listId } = this.props;
    const fileId = 4869890812936192;
    dispatch(actionCreators.fetchHeaders(listId, fileId));
    console.log('REMOVE THIS AFTER TESTING');
  }

  _onDrop(files) {
    this.setState({ file: files[0] });
  }

  _submit() {
    const {dispatch, listId, headers} = this.props;
    let data = new FormData();
    data.append('file', this.state.file);
    dispatch(actionCreators.uploadFile(listId, data))
    .then( _ => dispatch(actionCreators.fetchHeaders(listId)));
  }

  render() {
    const { listId, fileIsReceiving, fileReducer } = this.props;
    const headers = fileReducer[listId] ? fileReducer[listId].headers : undefined;
    return (
      <div>
        { headers ? <Headers headers={headers} /> : <i className='fa fa-spinner fa-spin fa-3x' aria-hidden='true'></i> }
        { _.isEmpty(this.state.file) ?
        <Dropzone onDrop={this._onDrop}>
          <div>Try dropping some files here, or click to select files to upload.</div>
        </Dropzone> :
        <div>
          {
            fileIsReceiving ?
            <i className='fa fa-spinner fa-spin fa-3x' aria-hidden='true'></i> :
            <div className='row'>
            { headers ? <Headers headers={headers} /> : <i className='fa fa-spinner fa-spin fa-3x' aria-hidden='true'></i> }
            </div>
          }
          <div className='row'>
            <span>{this.state.file.name}</span>
          </div>
          <div className='row'>
            <button
            className='button'
            onClick={this._submit}
            >Upload</button>
          </div>
        </div>
        }
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    fileReducer: state.fileReducer,
    fileIsReceiving: state.fileReducer.isReceiving
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: action => dispatch(action)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DropFile);
