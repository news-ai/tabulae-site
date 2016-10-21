import React, {Component, PropTypes} from 'react';
import TextField from 'material-ui/TextField';
import withRouter from 'react-router/lib/withRouter';
import RaisedButton from 'material-ui/RaisedButton';
import {connect} from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import Dropzone from 'react-dropzone';
import Waiting from '../Waiting';
import Headers from '../ImportFile/Headers.react';
import Radium from 'radium';

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

class DropFileWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listId: null,
      value: this.props.defaultValue || '',
      isFileDropped: false,
      isFileSubmitted: false,
      file: null
    };
    this.onDrop = this._onDrop.bind(this);
    this.onUploadClick = this._onUploadClick.bind(this);
  }

  _onUploadClick() {
    const props = this.props;
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
          <div style={{height: 200}}>
          {state.isFileDropped ?
            <div className='row vertical-center' style={{marginBottom: 20}}>
              <span style={{marginRight: 20}}>{state.file.name} -- {state.file.size} bytes</span>
              <i style={[styles.icon]} onClick={ _ => this.setState({file: null, isFileDropped: false})} className='fa fa-close' aria-hidden='true'></i>
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
          <RaisedButton style={{float: 'right'}} label='Upload' onClick={this.onUploadClick} />
        </div>
        );
    } else {
      renderNode = state.isReceiving || !props.headerReducer[state.listId] ?
      <Waiting isReceiving={props.isReceiving || props.headerIsReceiving} textStyle={{marginTop: '10px'}} text='Waiting for Columns to be processed...' /> :
      <Headers listId={state.listId} />;
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
    headerReducer: state.headerReducer
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    createEmptyList: listname => dispatch(actionCreators.createEmptyList(listname)),
    uploadFile: (listId, file) => dispatch(actionCreators.uploadFile(listId, file)),
    fetchHeaders: listId => dispatch(actionCreators.fetchHeaders(listId)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(Radium(withRouter(DropFileWrapper)));
