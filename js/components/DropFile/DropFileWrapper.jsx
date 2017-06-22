import React, {Component} from 'react';
import TextField from 'material-ui/TextField';
import withRouter from 'react-router/lib/withRouter';
import RaisedButton from 'material-ui/RaisedButton';
import {connect} from 'react-redux';
import {actions as listActions} from 'components/Lists';
import {actions as fileActions} from 'components/ImportFile';
import Dropzone from 'react-dropzone';
import FontIcon from 'material-ui/FontIcon';

import Waiting from '../Waiting';
import {grey500, grey800} from 'material-ui/styles/colors';
import alertify from 'alertifyjs';

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
};

const FileDroppedIndicator = ({file, onClose}) => {
  return (
      <div className='row vertical-center' style={{margin: '20px 0'}}>
        <span style={{marginRight: 20}}>{file.name} -- {file.size} bytes</span>
        <FontIcon
        color={grey800}
        hoverColor={grey500}
        style={{fontSize: '16px'}}
        onClick={onClose}
        className='fa fa-close pointer'
        />
      </div>
    );
};

const FileDroppedError = ({error}) => {
  return (
    <div>
      <p>Oops. An error occurred in processing the file.</p>
      <ol>
        <li>The file was corrupt</li>
        <li>The file had hidden fields that we couldn't handle</li>
        <li>Our processing servers are experiencing downtime</li>
      </ol>
      <p>Here are a couple strategies that could potentially solve the problem.</p>
      <ol>
        <li>Refresh the page and try again</li>
        <li>Make sure that you are saving your Excel file with <code>.xlsx</code> format</li>
        <li>Open the Excel file you are uploading and copy the columns you need into a new Excel file to get rid of potentially hidden columns/formulas/etc</li>
        <li>Contact Support</li>
      </ol>
    </div>
    );
};

class DropFileWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listId: null,
      value: this.props.defaultValue || '',
      isFileDropped: false,
      isFileSubmitted: false,
      file: null,
      clicked: false
    };
    this.onDrop = this._onDrop.bind(this);
    this.onUploadClick = this._onUploadClick.bind(this);
    this.onFileClose = _ => this.setState({file: null, isFileDropped: false, value: this.props.defaultValue});
  }

  componentWillReceiveProps(nextProps) {
  }

  componentWillUnmount() {
    this.props.resetError();
  }

  _onUploadClick() {
    window.Intercom('trackEvent', 'uploaded_sheet');
    // create empty list first then upload file to populare the list
    this.setState({clicked: true});
    this.props.createEmptyList(this.state.value)
    .then(response => {
      this.setState({listId: response.data.id});
      return response.data.id;
    })
    .then(listId => {
      let data = new FormData();
      data.append('file', this.state.file);
      this.setState({isFileSubmitted: true});
      this.props.uploadFile(listId, data)
      .then(_ => {
        if (!this.props.didInvalidate) this.props.router.push(`/headersnaming/${listId}`);
      });
    });
  }

  _onDrop(files) {
    if (files.length > 0) {
      const file = files[files.length - 1];
      const fileExtensionArray = file.name.split('.');
      const fileExtension = fileExtensionArray[fileExtensionArray.length - 1];
      if (fileExtension === 'xlsx') {
        this.setState({
          file,
          isFileDropped: true,
          value: fileExtensionArray[0],
        });
      } else {
        alertify.alert('File Dropped', `File dropped but not of accepted file types. We only accept .xlsx file format. You dropped a .${fileExtension} file.`, function() {});
      }
    } else {
      alertify.alert('File Dropped', 'File dropped but not of accepted file types. We only accept .xlsx file format.', function() {});
    }
  }

  render() {
    const state = this.state;
    const props = this.props;
    let renderNode;
    if (!state.isFileSubmitted) {
      renderNode = (
        <div>
          <div className='row'>
            <span>Give the uploaded list a name.</span>
          </div>
          <div className='row'>
            <TextField
            id='filedrop-textfield'
            fullWidth
            value={state.value}
            onChange={e => this.setState({value: e.target.value})}
            />
          </div>
          <div style={{height: 180}}>
          {state.isFileDropped ?
            <div className='row vertical-center' style={{margin: '20px 0'}}>
              <FileDroppedIndicator file={state.file} onClose={this.onFileClose} />
            </div>
            : <Dropzone
              accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'
              style={styles.dropzone.default} activeStyle={styles.dropzone.active} rejectStyle={styles.dropzone.reject}
              onDrop={this.onDrop}
              multiple={false}
              >
              <div>Try dropping an Excel (xlsx) file here, or click to select file to upload.</div>
            </Dropzone>}
          </div>
          <div className='vertical-center horizontal-center'>
            <RaisedButton
            primary
            disabled={state.clicked || state.file === null}
            label='Upload'
            onClick={this.onUploadClick}
            />
          </div>
          <div className='vertical-center horizontal-center' style={{margin: '20px 0'}}>
            <span>For more details, you may refer to <a href='https://help.newsai.co/tabulae-how-to/how-to-upload-a-media-list' target='_blank'>Upload Guide</a>.</span>
          </div>
        </div>
        );
    } else {
      renderNode = (
        <div>
          <Waiting
          isReceiving={props.isReceiving || props.headerIsReceiving}
          textStyle={{marginTop: 20}}
          text='Waiting for Columns to be processed...'
          />
        </div>);
    }
    if (props.didInvalidate) {
      return <FileDroppedError error={props.error}/>;
    }
    return (
      <div className='horizontal-center' style={{marginTop: 40}}>
        {renderNode}
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  return {
    isProcessWaiting: state.fileReducer.isProcessWaiting,
    isReceiving: state.fileReducer.isReceiving,
    headerIsReceiving: state.headerReducer.isReceiving,
    headerReducer: state.headerReducer,
    didInvalidate: state.fileReducer.didInvalidate,
    errorMessage: state.fileReducer.error,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    createEmptyList: listname => dispatch(listActions.createEmptyList(listname)),
    uploadFile: (listId, file) => dispatch(fileActions.uploadFile(listId, file)),
    fetchHeaders: listId => dispatch(fileActions.fetchHeaders(listId)),
    resetError: _ => dispatch({type: 'RESET_FILE_REDUCER_ERROR'})
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(DropFileWrapper));
