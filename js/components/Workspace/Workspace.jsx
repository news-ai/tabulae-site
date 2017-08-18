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
import alertify from 'alertifyjs';

import 'node_modules/alertifyjs/build/css/alertify.min.css';
import {blueGrey100, blue500, blueGrey400} from 'material-ui/styles/colors';
import isJSON from 'validator/lib/isJSON';
import find from 'lodash/find';
import styled from 'styled-components';
import {convertToRaw} from 'draft-js';

const ItemContainer = styled.div`
  height: 40px;
  background-color: ${blueGrey100};
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

alertify.promisifyConfirm = (title, description) => new Promise((resolve, reject) => {
  alertify.confirm(title, description, resolve, reject);
});

alertify.promisifyPrompt = (title, description, defaultValue) => new Promise((resolve, reject) => {
    alertify.prompt(title, description, defaultValue, (e, value) => resolve(value), reject);
  });

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

class Workspace extends Component {
  constructor(props) {
    super(props);
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
      useExisting: false
    };
    this.onSubjectChange = this.onSubjectChange.bind(this);
    this.onBodyChange = this.onBodyChange.bind(this);
    this.handleTemplateChange = this.handleTemplateChange.bind(this);
    this.onClearEditor = this.onClearEditor.bind(this);
    this.onSaveNewTemplateClick = this.onSaveNewTemplateClick.bind(this);
    this.onSaveCurrentTemplateClick = this.onSaveCurrentTemplateClick.bind(this);
  }

  componentWillMount() {
    this.props.fetchTemplates();
  }

  onBodyChange(html, raw) {
    this.setState({mutatingBody: html, bodyContentState: raw});
  }

  onClearEditor() {
    this.setState({
      subject: '', // original
      mutatingSubject: '', // editted
      subjectContentState: '', // current contentstate
      body: '',
      mutatingBody: '',
      bodyContentState: '',
      useExisting: false,
      currentTemplateId: null
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
      <div style={{
        // border: '1px solid blue',
        display: 'flex',
        justifyContent: 'space-around',
        marginTop: 10
      }} >
        <Paper zDepth={2} style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          flexGrow: 1,
          padding: 10,
          flexBasis: 200,
          maxWidth: 300
          // border: '1px solid green',
          // justifyContent: 'space-between'
        }} >
          <div>
            <ItemContainer>
            {!!state.currentTemplateId &&
              <span className='text'>{currentTemplate.name || currentTemplate.subject}</span>}
            </ItemContainer>
            <RaisedButton
            label='Load Existing'
            style={{marginBottom: 5, width: '100%'}}
            backgroundColor={blue500}
            labelStyle={{textTransform: 'none', color: '#ffffff'}}
            labelPosition='right'
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
        </Paper>
        <div style={{
          display: 'flex',
          flexGrow: 1,
          justifyContent: 'center',
        }} >
          <div style={{
            border: `5px solid ${blueGrey100}`,
            padding: 15
          }} >
            <GeneralEditor
            onEditMode
            allowReplacement
            allowGeneralizedProperties
            width={600}
            height={530}
            debounce={500}
            bodyContent={state.body}
            rawBodyContentState={state.bodyContentState}
            subjectHtml={state.subject}
            subjectParams={{allowGeneralizedProperties: true}}
            controlsStyle={{zIndex: 0, marginBottom: 15}}
            controlsPosition='top'
            onBodyChange={this.onBodyChange}
            onSubjectChange={this.onSubjectChange}
            placeholder='Start building your template here...'
            />
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
