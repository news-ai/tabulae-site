import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import Dropzone from 'react-dropzone';
import Headers from './Headers.react';
import _ from 'lodash';
import Radium from 'radium';
import Waiting from '../Waiting';

const styles = {
  dropzone: {
    default: {
      borderWidth: 2,
      borderColor: 'black',
      borderStyle: 'dashed',
      borderRadius: 4,
      margin: 30,
      padding: 30,
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

  componentWillUnmount() {
    this.props.clearReducer();

  }

  _onDrop(files) {
    this.setState({ file: files[files.length - 1], isFileDropped: true });
  }

  _submit() {
    const props = this.props;
    let data = new FormData();
    data.append('file', this.state.file);
    this.setState({fileSubmitted: true});
    props.uploadFile(props.listId, data)
    .then( _ => props.fetchHeaders(props.listId));
  }

  _processHeaders(order) {
    const props = this.props;
    props.addHeaders(props.listId, order)
    .then(_ => console.log('COMPLETED!'));
    // must reload to set up handsontable again, think of a better way later maybe
  }

  render() {
    const {listId, fileIsReceiving, fileReducer, isProcessWaiting, headers} = this.props;
    const {file, isFileDropped, fileSubmitted} = this.state;
    let renderNode;

    if (headers) renderNode = <Headers headers={headers} onProcessHeaders={this._processHeaders} />;
    if (isProcessWaiting) {
      renderNode = <Waiting isReceiving={isProcessWaiting} text='Waiting for Columns to be processed...' />;
    } else {
      if (isFileDropped) {
        if (fileSubmitted) {
          if (fileIsReceiving) {
            renderNode = <Waiting isReceiving={fileIsReceiving}/>;
          } else {
            if (fileReducer[listId].didInvalidate) {
              renderNode = <div><span>Something went wrong. Upload failed. Please try later.</span></div>
            }
          }
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
            <div>Try dropping an Excel (xlsx, xls, csv) file here, or click to select file to upload.</div>
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
    isProcessWaiting: state.fileReducer.isProcessWaiting,
    headers: state.fileReducer[props.listId] ? state.fileReducer[props.listId].headers : undefined
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: action => dispatch(action),
    uploadFile: (listId, file) => dispatch(actionCreators.uploadFile(listId, file)),
    fetchHeaders: listId => dispatch(actionCreators.fetchHeaders(listId)),
    addHeaders: (listId, order) => dispatch(actionCreators.addHeaders(listId, order)),
    waitForServerProcess: _ => dispatch(actionCreators.waitForServerProcess()),
    clearReducer: _ => dispatch({type: 'CLEAR_FILE_REDUCER'})
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Radium(DropFile));
