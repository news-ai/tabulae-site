import React, {Component} from 'react';
import {connect} from 'react-redux';
import EmailSignatureEditor from './EmailSignatureEditor.react';
import {actions as loginActions} from 'components/Login';
import GeneralEditor from 'components/Email/GeneralEditor/GeneralEditor2.react';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import isJSON from 'validator/lib/isJSON';

class EmailSignature extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentEmail: this.props.person.email,
      bodyContent: this.props.signature,
      rawBodyContentState: undefined,
      onEditMode: false
    };
    this.handleChange = this._handleChange.bind(this);
    this.updateBody = (html, raw) => {
      console.log(html);
      console.log(raw);
      this.setState({body: html, rawBodyContentState: raw});
    };
    this.onSubjectChange = (editorState) => {
      const subject = editorState.getCurrentContent().getBlocksAsArray()[0].getText();
      this.setState({subject});
    };
    this.onSaveClick = this._onSaveClick.bind(this);
  }

  _handleChange(e, i, newEmail) {
    this.setState({currentEmail: newEmail});
  }

  _onSaveClick() {
    const data = JSON.stringify({
      type: 'DraftEditorState',
      data: this.state.rawBodyContentState,
      resource: 'signature',
      email: this.state.currentEmail,
    });
    let emailsignatures = this.props.person.emailsignatures;
    if (emailsignatures === null) emailsignatures = [data];
    else {
      emailsignatures = emailsignatures.map(signature => {
        if (isJSON(signature)) {
          const json = JSON.parse(signature);
          if (json.email === this.state.currentEmail) {
            return data;
          }
        }
        return signature;
      });
    }

    const oldPerson = this.props.person;
    const person = {
      firstname: oldPerson.firstname,
      lastname: oldPerson.lastname,
      getdailyemails: oldPerson.getdailyemails,
      emailsignatures
    };
    this.props.patchPerson(person);
  }

  render() {
    const props = this.props;
    const state = this.state;
    let items = [<MenuItem key={props.person.email} value={props.person.email} primaryText={props.person.email}/>];
    if (props.person.sendgridemails !== null) {
      items = [
        ...items,
        ...props.person.sendgridemails.map(email => <MenuItem key={email} value={email} primaryText={email}/>)
      ];
    }
    return (
      <div>
        <div className='vertical-center'>
          <DropDownMenu
          value={state.currentEmail}
          onChange={this.handleChange}
          >
          {items}
          </DropDownMenu>
          <FlatButton label='Save'/>
        </div>
        <div style={{display: 'block', border: '1px dotted black'}}>
          <GeneralEditor
          width={550}
          height={350}
          onEditMode
          allowReplacement
          bodyContent={state.bodyContent}
          rawBodyContentState={state.rawBodyContentState}
          onBodyChange={this.updateBody}
          debounce={500}
          placeholder='Enter email signature here...'
          />
        </div>
      </div>
      );
  }
}


const mapStateToProps = (state, props) => {
  return {
    person: state.personReducer.person,
    signature: state.personReducer.person.emailsignature || null
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    patchPerson: body => dispatch(loginActions.patchPerson(body)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailSignature);
