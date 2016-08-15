import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import Dropzone from 'react-dropzone';
import Headers from './Headers.react';
import _ from 'lodash';

function Waiting({}) {
  return (
    <div>
      <i className='fa fa-spinner fa-spin fa-4x' aria-hidden='true'></i>
      <span>Waiting for Columns to be processed...</span>
    </div>
    );
}

class DropFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      isFileDropped: false,
      fileSubmitted: false
    };
    this._onDrop = this._onDrop.bind(this);
    this._submit = this._submit.bind(this);
    this._processHeaders = this._processHeaders.bind(this);
  }

  componentDidMount() {
    // TESTING USE ONLU
    const { dispatch, listId } = this.props;
    const fileId = 4869890812936192;
    dispatch(actionCreators.fetchHeaders(listId, fileId));
    console.log('REMOVE THIS AFTER TESTING');
  }

  _onDrop(files) {
    this.setState({ file: files[0], isFileDropped: true });
  }

  _submit() {
    const {dispatch, listId, headers} = this.props;
    let data = new FormData();
    data.append('file', this.state.file);
    this.setState({ fileSubmitted: true });
    dispatch(actionCreators.uploadFile(listId, data))
    .then( _ => dispatch(actionCreators.fetchHeaders(listId)));
  }

  _processHeaders(order) {
    const { dispatch, listId } = this.props;
    const fileId = 4869890812936192;
    dispatch(actionCreators.addHeaders(listId, order, fileId))
    .then( _ => dispatch(actionCreators.waitForServerProcess(listId)));
  }

  render() {
    const { listId, fileIsReceiving, fileReducer, isProcessWaiting } = this.props;
    const { file, isFileDropped, fileSubmitted } = this.state;
    const headers = fileReducer[listId] ? fileReducer[listId].headers : undefined;
    let renderNode;
    if (isProcessWaiting) {
      renderNode = <Waiting />;
    } else {
     
      if (isFileDropped) {
        if (fileSubmitted) {
          renderNode = (fileIsReceiving || !headers) ? 
          <i className='fa fa-spinner fa-spin fa-3x' aria-hidden='true'></i> :
          <Headers
          headers={headers}
          onProcessHeaders={this._processHeaders} />;
        } else {
          renderNode = (
            <div>
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
          );
        }
      } else {
      // TEMP TEST USE
      renderNode = (fileIsReceiving || !headers) ? 
          <i className='fa fa-spinner fa-spin fa-3x' aria-hidden='true'></i> :
          <Headers
          headers={headers}
          onProcessHeaders={this._processHeaders} />;
      // END TEMP TEST USE
        // renderNode = (
        //   <Dropzone onDrop={this._onDrop}>
        //     <div>Try dropping some files here, or click to select files to upload.</div>
        //   </Dropzone>);
      }
    }

    return (
      <div>
      {renderNode}
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    fileReducer: state.fileReducer,
    fileIsReceiving: state.fileReducer.isReceiving,
    headersWaiting: state.fileReducer.isProcessWaiting
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
