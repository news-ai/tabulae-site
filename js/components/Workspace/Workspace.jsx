import React, { Component } from 'react';
import GeneralEditor from 'components/Email/GeneralEditor';

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
      <div>
        <div className='horizontal-center' style={{padding: 20}} >
          <div style={{border: '1px solid black'}} >
            <GeneralEditor
            onEditMode
            allowReplacement
            width={600}
            height={700}
            debounce={500}
            bodyContent={state.rawBodyContentState}
            rawBodyContentState={state.rawBodyContentState}
            subjectHtml={state.subject}
            controlsStyle={{zIndex: 0, marginBottom: 10}}
            controlsPosition='top'
            onBodyChange={this.updateBody}
            onSubjectChange={this.onSubjectChange}
            placeholder='Enter email signature here...'
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Workspace;
