import React, { Component } from 'react';
import {connect} from 'react-redux';
import {actions as templateActions} from 'components/Email/Template';
import GeneralEditor from 'components/Email/GeneralEditor';
import Select from 'react-select';
import RaisedButton from 'material-ui/RaisedButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import Popover from 'material-ui/Popover';
import FontIcon from 'material-ui/FontIcon';
import Paper from 'material-ui/Paper';
import Collapse from 'react-collapse';
import alertify from 'utils/alertify';
import {blueGrey50, blueGrey100, blue500, blueGrey400} from 'material-ui/styles/colors';
import isJSON from 'validator/lib/isJSON';
import find from 'lodash/find';
import styled from 'styled-components';
import {convertToRaw} from 'draft-js';
import draftRawToHtml from 'components/Email/EmailPanel/utils/draftRawToHtml';

const ItemContainer = styled.div`
  height: 40px;
  background-color: ${blueGrey100};
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Menu = styled.ul`
  margin-left: 0px;
  padding-left: 0px;
  max-height: 200px;
  overflow: hidden;
  overflow-y: scroll;
`;

const MenuItem = styled.li`
  list-style: none;
  width: 100%;
  padding: 5px;
  cursor: pointer;
  font-size: 0.9em;
  &:hover {
    background-color: ${blueGrey100};
  }
`;

function createMarkUp(html) {
  return { __html: html };
}

const fontSizes = [5, 6, 7.5, 8, 9, 10, 10.5, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
const generateFontSizeStyleMap = fonts => fonts.reduce((acc, font) => {
  acc[`SIZE-${font}`] = ({fontSize: `${font + 4}pt`});
  return acc;
}, {});
const customFontSizes = generateFontSizeStyleMap(fontSizes);

const DEFAULT_PADDING = 65 + 100 + 40; //top bar height + utility bar height + padding
const MIN_WIDTH = 600;
const MAX_WIDTH = 900;
const MIN_HEIGHT = 530;
class Workspace extends Component {
  constructor(props) {
    super(props);

    const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    let height = Math.floor(screenHeight - DEFAULT_PADDING);
    if (height < MIN_HEIGHT) height = MIN_HEIGHT; // set some minimal height
    console.log(screenWidth)
    console.log(screenHeight);
    this.state = {
      subject: '', // original
      mutatingSubject: '', // editted
      subjectContentState: '', // current contentstate
      body: '',
      mutatingBody: '',
      bodyContentState: '',
      currentTemplateId: null,
      open: false,
      anchorEl: null,
      useExisting: false,
      showToolbar: true,
      width: 600,
      height: height,
      mode: 'writing'
    };
    this.onSubjectChange = this.onSubjectChange.bind(this);
    this.onBodyChange = this.onBodyChange.bind(this);
    this.handleTemplateChange = this.handleTemplateChange.bind(this);
    this.onClearEditor = this.onClearEditor.bind(this);
    this.onSaveNewTemplateClick = this.onSaveNewTemplateClick.bind(this);
    this.onSaveCurrentTemplateClick = this.onSaveCurrentTemplateClick.bind(this);

    // window.onresize = _ => {
    //   const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    //   const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    //   this.setState({screenWidth, screenHeight});
    // };
  }

  componentWillMount() {
    this.props.fetchTemplates();
  }

  componentWillUnmount() {
    // window.onresize = undefined;
  }

  onBodyChange(html, raw) {
    this.setState({mutatingBody: html, bodyContentState: raw});
  }

  onClearEditor() {
    this.setState({
      subject: 'clear', // original
      mutatingSubject: '', // editted
      subjectContentState: '', // current contentstate
      body: 'clear',
      mutatingBody: '',
      bodyContentState: '',
      useExisting: false,
      currentTemplateId: null
    },
    _ => {
      // Hack!! add something to editor then clearing it to triggle in componentWillReceiveProps
      this.setState({subject: '', body: ''});
    });
  }

  handleTemplateChange(value) {
    const templateId = value || null;
    this.setState({currentTemplateId: value});

    if (!!templateId) {
      const template = find(this.props.templates, tmp => templateId === tmp.id);
      let subject = template.subject;
      this.setState({subject, mutatingSubject: subject, useExisting: true});
      if (isJSON(template.body)) {
        const templateJSON = JSON.parse(template.body);
        if (templateJSON.subjectData) subject = templateJSON.subjectData;
        this.setState({body: templateJSON.data, subject});;
      } else {
        this.setState({body: template.body});
      }
    }
  }

  onSubjectChange(contentState) {
    const subjectContent = contentState;
    const subjectBlock = contentState.getBlocksAsArray()[0];
    const subject = subjectBlock.getText();
    let mutatingSubject = '';
    let lastOffset = 0;
    subjectBlock.findEntityRanges(
      (character) => {
        const entityKey = character.getEntity();
        if (entityKey === null) return false;
        return (contentState.getEntity(entityKey).getType() === 'PROPERTY');
      },
      (start, end) => {
        const {property} = subjectContent.getEntity(subjectBlock.getEntityAt(start)).getData();
        mutatingSubject += (subject.slice(lastOffset, start) + `<%= ${property} %>`);
        lastOffset = end;
      });
    mutatingSubject += subject.slice(lastOffset, subject.length);
    const subjectContentState = convertToRaw(subjectContent);

    this.setState({mutatingSubject, subjectContentState});
  }
  
  onSaveNewTemplateClick() {
    alertify.promisifyPrompt(
      '',
      'Name the New Email Template',
      ''
      )
    .then(
      name => {
        this.props.createTemplate(
          name,
          this.state.mutatingSubject,
          JSON.stringify({type: 'DraftEditorState', data: this.state.bodyContentState, subjectData: this.state.subjectContentState})
          )
        .then(currentTemplateId => this.setState({currentTemplateId}));
      },
      _ => console.log('template saving cancelled')
      );
  }

  onSaveCurrentTemplateClick() {
    this.props.saveCurrentTemplate(
      this.state.currentTemplateId,
      this.state.mutatingSubject,
      JSON.stringify({type: 'DraftEditorState' , data: this.state.bodyContentState, subjectData: this.state.subjectContentState})
      );
  }

  render() {
    const state = this.state;
    const props = this.props;

    const options = props.templates
    .filter((template) => !(isJSON(template.body) && JSON.parse(template.body).date))
    .map((template, i) =>
      <MenuItem
      key={template.id}
      onClick={_ => {
        this.handleTemplateChange(template.id);
        this.setState({open: false});
      }}
      >
      {template.name.length > 0 ? template.name : template.subject}
      </MenuItem>
      );
    const currentTemplate = find(this.props.templates, tmp => state.currentTemplateId === tmp.id);
    return (
      <div>
        <div style={{
          // border: '1px solid blue',
          display: 'flex',
          // justifyContent: 'space-around',
          paddingTop: 15
        }}>
          <div style={{padding: 5, zIndex: 200, order: -1, position: 'fixed'}}>
            <i
            onClick={_ => this.setState({showToolbar: !state.showToolbar})}
            className={`pointer fa fa-angle-double-${state.showToolbar ? 'left' : 'right'}`}
            />
            <span
            onClick={_ => this.setState({showToolbar: !state.showToolbar})}
            className='smalltext pointer'
            style={{marginLeft: 5, userSelect: 'none'}}
            >{state.showToolbar ? 'Hide Tools' : 'Show Tools'}</span>
          </div>
          <div style={{
            display: state.showToolbar ? 'flex' : 'none',
            flexGrow: 1,
            flexBasis: 170,
            maxWidth: 200,
            order: -1,
            zIndex: 100
          }}>
          {state.showToolbar &&
            <Paper zDepth={2} style={{
              // textAlign: 'center',
              height: 600,
              position: 'fixed',
              display: 'flex',
              flexDirection: 'column',
              order: 1
            }} >
              <div style={{marginTop: 50}} >
                <div style={{display: 'flex', marginBottom: 15}} >
                  <span
                  onClick={_ => this.setState({mode: 'writing'})}
                  className='smalltext pointer'
                  style={{
                    flex: 1,
                    border: state.mode === 'writing' && '1px solid blue',
                    textAlign: 'center'
                  }}>Writing Mode</span>
                  <span
                  onClick={_ => this.setState({mode: 'preview'})}
                  className='smalltext pointer'
                  style={{
                    flex: 1,
                    border: state.mode === 'preview' && '1px solid blue',
                    textAlign: 'center'
                  }}>Preview</span>
                </div>
                <RaisedButton
                label='Load Existing'
                style={{marginBottom: 5, width: '100%'}}
                backgroundColor={blue500}
                labelStyle={{textTransform: 'none', color: '#ffffff'}}
                labelPosition='after'
                icon={<FontIcon color='#ffffff' className={state.open ? 'fa fa-minus-square-o' : 'fa fa-plus-square-o'} />}
                onTouchTap={e => this.setState({open: !state.open})}
                />
                <Collapse isOpened={state.open}>
                  <Menu>
                  {options}
                  </Menu>
                </Collapse>
              </div>
              <div style={{marginTop: 'auto'}} >
                <ItemContainer>
                {!!state.currentTemplateId &&
                  <span className='text'>{currentTemplate.name || currentTemplate.subject}</span>}
                </ItemContainer>
                <RaisedButton
                primary
                style={{marginBottom: 5, width: '100%'}}
                disabled={!state.useExisting}
                label='Save'
                labelStyle={{textTransform: 'none'}}
                onTouchTap={this.onSaveCurrentTemplateClick}
                />
                <RaisedButton
                primary
                style={{marginBottom: 5, width: '100%'}}
                label='Save New...'
                labelStyle={{textTransform: 'none'}}
                onTouchTap={this.onSaveNewTemplateClick}
                />
                <RaisedButton
                secondary
                style={{marginBottom: 5, width: '100%'}}
                label='Clear Editor'
                labelStyle={{textTransform: 'none'}}
                onTouchTap={this.onClearEditor}
                />
              </div>
            </Paper>}
          </div>
          <div style={{
            display: 'flex',
            flexGrow: 2,
            justifyContent: 'center',
            order: 1,
          }} >
          {state.mode === 'writing' &&
           <GeneralEditor
            onEditMode
            allowReplacement
            allowGeneralizedProperties
            allowToolbarDisappearOnBlur
            containerClassName='RichEditor-editor-workspace'
            width={600}
            height='unlimited'
            debounce={500}
            bodyContent={state.body}
            rawBodyContentState={state.bodyContentState}
            subjectHtml={state.subject}
            subjectParams={{allowGeneralizedProperties: true, style: {marginTop: 60, marginBottom: 15}}}
            controlsStyle={{zIndex: 100, marginBottom: 15, position: 'fixed', backgroundColor: '#ffffff'}}
            controlsPosition='top'
            onBodyChange={this.onBodyChange}
            onSubjectChange={this.onSubjectChange}
            placeholder='Start building your template here...'
            extendStyleMap={customFontSizes}
            />}
          {state.mode === 'preview' &&
            <div style={{marginTop: 60}} >
              <div
              style={{width: state.width, borderBottom: '2px solid gray', paddingBottom: 10, marginBottom: 10}}
              dangerouslySetInnerHTML={createMarkUp(state.mutatingSubject)}
              />
              <div
              style={{width: state.width}}
              dangerouslySetInnerHTML={createMarkUp(state.mutatingBody)}
              />
            </div>}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    templates: state.templateReducer.received.map(id => state.templateReducer[id]).filter(template => !template.archived)
  }),
  dispatch => ({
    fetchTemplates: _ => dispatch(templateActions.getTemplates()),
    saveCurrentTemplate: (id, subject, body) => dispatch(templateActions.patchTemplate(id, subject, body)),
    createTemplate: (name, subject, body) => dispatch(templateActions.createTemplate(name, subject, body)),
  })
  )(Workspace);
