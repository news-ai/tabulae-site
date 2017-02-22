import React, {Component} from 'react';
import {
  Editor,
  EditorState,
  CompositeDecorator,
  ContentState,
  Modifier
} from 'draft-js';

import Link from './components/Link';
import CurlySpan from './components/CurlySpan.react';
import {curlyStrategy, findEntities} from './utils/strategies';
import {grey500, grey700} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

const MAX_LENGTH = 255;

class Subject extends Component {
  constructor(props) {
    super(props);
    const decorator = new CompositeDecorator([
      {
        strategy: findEntities.bind(null, 'LINK'),
        component: Link
      },
      {
        strategy: curlyStrategy,
        component: CurlySpan
      }
    ]);

    this.state = {
      editorState: EditorState.createEmpty(decorator),
      subjectHtml: null,
      subjectLength: 0,
      variableMenuOpen: false,
      variableMenuAnchorEl: null
    };
    this.truncateText = this._truncateText.bind(this);
    this.insertText = this._insertText.bind(this);

    this.onChange = (editorState) => {
      const subject = editorState.getCurrentContent().getBlocksAsArray()[0].getText();
      const subjectLength = subject.length;
      if (subject.length > MAX_LENGTH) {
        const newEditorState = this.truncateText(editorState, MAX_LENGTH);
        this.props.onSubjectChange(newEditorState);
        this.setState({editorState: newEditorState, subjectLength});
      } else {
        this.props.onSubjectChange(editorState);
        this.setState({editorState, subjectLength});
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.subjectHtml !== this.state.subjectHtml) {
      const content = ContentState.createFromText(nextProps.subjectHtml);
      // const editorState = EditorState.push(this.state.editorState, content, 'insert-fragment');
      const editorState = EditorState.push(this.state.editorState, content, 'insert-fragment');
      this.setState({subjectHtml: nextProps.subjectHtml});
      this.onChange(editorState);
    }
  }

  _truncateText(editorState, charCount) {
    const contentState = editorState.getCurrentContent();
    const blocks = contentState.getBlockMap();

    let count = 0;
    let isTruncated = false;
    const truncatedBlocks = [];
    blocks.forEach((block) => {
      if (!isTruncated) {
        const length = block.getLength();
        if (count + length > charCount) {
          isTruncated = true;
          const truncatedText = block.getText().slice(0, charCount - count);
          const state = ContentState.createFromText(truncatedText);
          truncatedBlocks.push(state.getFirstBlock());
        } else {
          truncatedBlocks.push(block);
        }
        count += length + 1;
      }
    });

    if (isTruncated) {
      const state = ContentState.createFromBlockArray(truncatedBlocks);
      return EditorState.createWithContent(state);
    }

    return editorState;
  }

  _insertText(replaceText) {
    const {editorState} = this.state;
    const content = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const newContent = Modifier.insertText(content, selection, '{' + replaceText + '}');
    const newEditorState = EditorState.push(editorState, newContent, 'insert-fragment');
    this.onChange(newEditorState);
  }

  render() {
    const {editorState, subjectLength} = this.state;
    const state = this.state;
    const props = this.props;
    return (
      <div
      style={{marginTop: 12}}
      className='vertical-center'
      >
        <div
        className='subject-draft-container'
        style={{
          width: this.props.width,
          height: 32,
          overflowX: 'scroll',
          marginRight: 5,
        }}>
        <Popover
        open={state.variableMenuOpen}
        anchorEl={state.variableMenuAnchorEl}
        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        onRequestClose={_ => this.setState({variableMenuOpen: false})}
        >
          <Menu desktop>
          {props.fieldsmap
            .filter(field => !field.hidden)
            .map((field, i) =>
            <MenuItem key={i} primaryText={field.name} onClick={_ => {
              this.insertText(field.name);
              this.setState({variableMenuOpen: false});
            }} />)}
          </Menu>
        </Popover>
          <Editor
          editorState={editorState}
          onChange={this.onChange}
          handleReturn={e => 'handled'}
          placeholder='Subject...'
          />
        </div>
        <div
        style={{width: 40, height: 32}}>
          <span style={{fontSize: '0.9em', color: grey500}}>{subjectLength}</span>
          <FontIcon
          className='pointer'
          style={{fontSize: '0.9em', margin: '0 2px'}}
          color={grey500}
          hoverColor={grey700}
          className='fa fa-chevron-down'
          onClick={e => this.setState({variableMenuOpen: true, variableMenuAnchorEl: e.currentTarget})}
          />
        </div>
      </div>
    );
  }
}

export default Subject;

