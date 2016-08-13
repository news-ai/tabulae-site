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
    }
    this._onDrop = this._onDrop.bind(this);
  }

  _onDrop(files) {
    console.log(files);
    this.setState({ file: files[0] });
  }

  render() {
    return (
      <div>
        { _.isEmpty(this.state.file) ?
        <Dropzone onDrop={this._onDrop}>
          <div>Try dropping some files here, or click to select files to upload.</div>
        </Dropzone> :
        <span>{this.state.file.name}</span>
        }
      </div>
      );
  }
}

export default DropFile;
