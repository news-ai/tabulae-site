import React, {Component} from 'react';
import {connect} from 'react-redux';
import EmailSignatureEditor from './EmailSignatureEditor.react';
import GeneralEditor from 'components/Email/GeneralEditor/GeneralEditor2.react';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

class EmailSignature extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentEmail: this.props.person.email,
      bodyHtml: props.body,
      rawBodyContentState: undefined,
      subjectHtml: props.subject,
      onEditMode: false
    };
    this.handleChange = (e, i, newEmail) => this.setState({currentEmail: newEmail});
    this.updateBodyHtml = (html, raw) => {
      // console.log(html);
      this.setState({body: html, rawBodyContentState: raw});
    };
    this.onSubjectChange = (editorState) => {
      const subject = editorState.getCurrentContent().getBlocksAsArray()[0].getText();
      this.setState({subject});
    };
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
        <DropDownMenu
        value={state.currentEmail}
        onChange={this.handleChange}
        >
        {items}
        </DropDownMenu>
        <GeneralEditor
        width={500}
        height={350}
        onEditMode
        rawBodyContentState={state.rawBodyContentState}
        subjectHtml={''}
        onBodyChange={this.updateBodyHtml}
        onSubjectChange={this.onSubjectChange}
        debounce={500}
        />
      </div>
      );
  }
}


const mapStateToProps = (state, props) => {
  return {
    person: state.personReducer.person
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailSignature);
