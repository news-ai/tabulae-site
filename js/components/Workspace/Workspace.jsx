import React, { Component } from 'react';
import GeneralEditor from 'components/Email/GeneralEditor';
import RaisedButton from 'material-ui/RaisedButton';

class Workspace extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subject: '',
      rawBodyContentState: ''
    }
    this.updateBody = (html, raw) => {
      // console.log(html);
      this.setState({body: html, rawBodyContentState: raw});
    };
    this.onSubjectChange = (editorState) => {
      const subject = editorState.getCurrentContent().getBlocksAsArray()[0].getText();
      this.setState({subject});
    };
  }

  render() {
    const state = this.state;
    return (
      <div style={{border: '1px solid blue', display: 'flex', justifyContent: 'space-around', marginTop: 15}} >
        <div style={{width: 100, height: 100, border: '1px solid green'}} >

        </div>
        <div style={{padding: 10, border: '1px solid red'}} >
          <div style={{border: '1px solid black', padding: 15}} >
            <GeneralEditor
            onEditMode
            width={600}
            height={530}
            debounce={500}
            rawBodyContentState={state.rawBodyContentState}
            subjectHtml={state.subject}
            controlsStyle={{zIndex: 0, marginBottom: 10}}
            controlsPosition='top'
            onBodyChange={this.updateBody}
            onSubjectChange={this.onSubjectChange}
            placeholder='Start building your template here'
            />
          </div>
        </div>
        <div>
          <RaisedButton primary label='Save' />
        </div>
      </div>
    );
  }
}

export default Workspace;
