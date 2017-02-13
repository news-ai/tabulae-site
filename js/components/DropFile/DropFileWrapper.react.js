import React, {Component, PropTypes} from 'react';
import TextField from 'material-ui/TextField';
import withRouter from 'react-router/lib/withRouter';
import RaisedButton from 'material-ui/RaisedButton';
import {connect} from 'react-redux';
import {actions as listActions} from 'components/Lists';
import {actions as fileActions} from 'components/ImportFile';
import Dropzone from 'react-dropzone';
import Radium from 'radium';
import FontIcon from 'material-ui/FontIcon';

import Waiting from '../Waiting';
import {grey500, grey800} from 'material-ui/styles/colors';

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
  }

  _onUploadClick() {
    const props = this.props;
    this.setState({clicked: true});
    props.createEmptyList(this.state.value)
    .then(response => {
      this.setState({listId: response.data.id});
      return response.data.id;
    })
    .then(listId => {
      let data = new FormData();
      data.append('file', this.state.file);
      this.setState({isFileSubmitted: true});
      props.uploadFile(listId, data)
      .then(_ => props.router.push(`/headersnaming/${listId}`));
    });
  }

  _onDrop(files) {
    this.setState({file: files[files.length - 1], isFileDropped: true});
  }

  _onProcessHeaders(order) {
    this.props.addHeaders(this.state.listId, order)
    .then(_ => console.log('COMPLETED!'));
  }

  render() {
    const state = this.state;
    const props = this.props;
    let renderNode;
    if (!state.isFileSubmitted) {
      renderNode = (
        <div style={{marginTop: 40}}>
          <div className='row'>
            <span>Give the uploaded list a name.</span>
          </div>
          <div className='row'>
            <TextField
            id='filedrop-textfield'
            fullWidth
            value={state.value}
            onKeyDown={e => e.keyCode === 13 ? this.onSetNameClick() : null}
            onChange={e => this.setState({value: e.target.value})} />
          </div>
          <div style={{height: 180}}>
          {state.isFileDropped ?
            <div className='row vertical-center' style={{margin: '20px 0'}}>
              <span style={{marginRight: 20}}>{state.file.name} -- {state.file.size} bytes</span>
              <FontIcon color={grey800} hoverColor={grey500} style={{fontSize: '16px'}} onClick={ _ => this.setState({file: null, isFileDropped: false})} className='fa fa-close pointer'/>
            </div>
            : <Dropzone
              accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'
              style={styles.dropzone.default}
              activeStyle={styles.dropzone.active}
              rejectStyle={styles.dropzone.reject}
              onDrop={this.onDrop}
              multiple={false}
              >
              <div>Try dropping an Excel (xlsx) file here, or click to select file to upload.</div>
            </Dropzone>}
          </div>
          <div className='vertical-center horizontal-center'>
            <RaisedButton primary disabled={state.clicked || state.file === null} style={{float: 'right'}} label='Upload' onClick={this.onUploadClick} />
          </div>
          <div className='vertical-center horizontal-center' style={{margin: '20px 0'}}>
            <span>For more details, you may refer to <a href='https://help.newsai.co/tabulae-how-to/how-to-upload-a-media-list' target='_blank'>Upload Guide</a>.</span>
          </div>
        </div>
        );
    } else {
      renderNode = (
        <div>
          <Waiting isReceiving={props.isReceiving || props.headerIsReceiving} textStyle={{marginTop: 20}} text='Waiting for Columns to be processed...' />
        </div>);
    }
    return (
      <div className='horizontal-center'>
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
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    createEmptyList: listname => dispatch(listActions.createEmptyList(listname)),
    uploadFile: (listId, file) => dispatch(fileActions.uploadFile(listId, file)),
    fetchHeaders: listId => dispatch(fileActions.fetchHeaders(listId)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(Radium(withRouter(DropFileWrapper)));