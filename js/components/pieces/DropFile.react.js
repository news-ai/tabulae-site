import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import Dropzone from 'react-dropzone';
import _ from 'lodash';


class DropFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null
    };
    this._onDrop = this._onDrop.bind(this);
    this._submit = this._submit.bind(this);
    this._log = this._log.bind(this);
  }

  _onDrop(files) {
    console.log(files);
    this.setState({ file: files[0] });
  }

  _submit() {
    const {dispatch, listId} = this.props;
    console.log(this.state.file);
    let data = new FormData();
    data.append('file', this.state.file);
    console.log(data);
    dispatch(actionCreators.uploadFile(listId, data));
    // dispatch(actionCreators.uploadFile(listId, this.state.file));

  }

  _log() {
    var form = document.querySelector('form');
    var formData = new FormData(form);
    for (var [key, value] of formData.entries()) { 
      console.log(key, value);
    }
  }

  render() {
    return (
      <div>
        { _.isEmpty(this.state.file) ?
        <Dropzone onDrop={this._onDrop}>
          <div>Try dropping some files here, or click to select files to upload.</div>
        </Dropzone> :
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
        }
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
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
