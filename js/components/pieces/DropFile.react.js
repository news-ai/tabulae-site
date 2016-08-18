import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import Dropzone from 'react-dropzone';
import Headers from './Headers.react';
import _ from 'lodash';
import Radium from 'radium';

function Waiting({}) {
  return (
    <div>
      <i className='fa fa-spinner fa-spin fa-4x' aria-hidden='true'></i>
      <p>Waiting for Columns to be processed...</p>
    </div>
    );
}


const styles = {
  dropzone: {
    default: {
      borderWidth: 2,
      borderColor: 'black',
      borderStyle: 'dashed',
      borderRadius: 4,
      margin: 30,
      padding: 30,
      width: 200,
      transition: 'all 0.4s',
    },
    active: {
      borderStyle: 'solid',
      borderColor: '#4FC47F'
    },
    reject: {
      borderStyle: 'solid',
      borderColor: '#DD3A0A'
    }
  },
  icon: {
    color: 'lightgray',
    marginLeft: '7px',
    ':hover': {
      color: 'gray',
      cursor: 'pointer'
    }
  }
};

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

  _onDrop(files) {
    this.setState({ file: files[files.length - 1], isFileDropped: true });
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
    const { dispatch, listId, _forceRefresh } = this.props;
    dispatch(actionCreators.addHeaders(listId, order))
    .then( _ => dispatch(actionCreators.waitForServerProcess(listId)))
    .then( _ => window.location.reload());
    // must reload to set up handsontable again, think of a better way later maybe
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
              <div className='row' style={{marginBottom: '20px'}}>
                <span>{file.name} -- {file.size} bytes</span>
                <i style={[styles.icon]} onClick={ _ => this.setState({ file: null, isFileDropped: false })} className='fa fa-close' aria-hidden='true'></i>
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
      
        renderNode = (
          <Dropzone
          accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          style={styles.dropzone.default}
          activeStyle={styles.dropzone.active}
          rejectStyle={styles.dropzone.reject}
          onDrop={this._onDrop}
          multiple={false}
          >
            <div>Try dropping an Excel (.xlsx) file here, or click to select file to upload.</div>
          </Dropzone>);
      }
    }

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {renderNode}
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    fileReducer: state.fileReducer,
    fileIsReceiving: state.fileReducer.isReceiving,
    isProcessWaiting: state.fileReducer.isProcessWaiting
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
)(Radium(DropFile));
