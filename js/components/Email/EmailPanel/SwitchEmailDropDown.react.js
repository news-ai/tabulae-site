import React, {Component} from 'react';
import {connect} from 'react-redux';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import get from 'lodash/get';
import {yellow50, grey500} from 'material-ui/styles/colors';
import Link from 'react-router/lib/Link';
import FlatButton from 'material-ui/FlatButton';

class SwitchEmailDropDown extends Component {
  constructor(props) {
    super(props);
    this.state = {open: false};
    this.onChange = this._onChange.bind(this);
  }

  _onChange(e) {
    window.Intercom('trackEvent', 'switch_email');
    this.props.setFromEmail(e.target.value);
  }

  render() {
    const props = this.props;
    const state = this.state;
    const emails = props.emails.map((email, i) => <option style={{fontSize: '0.9em'}} key={`switch-email-${i}`} value={email}>{email}</option>);
    const disableSwitching = props.person.gmail || props.person.outlook || props.person.externalemail;
    return (
      <select style={styles.select} disabled={disableSwitching} value={props.from} onChange={this.onChange} >
        {emails}
      </select>);
  }
}

const styles = {
  warningText: {color: grey500},
  warningContainer: {margin: 10},
  description: {margin: 10, padding: 10, backgroundColor: yellow50},
  select: {
    height: 'auto',
    width: 'auto',
    padding: 'auto',
    appearance: 'menulist',
    MozAppearance: 'menulist',
    WebkitAppearance: 'menulist',
  },
};

const mapStateToProps = (state, props) => {
  const person = state.personReducer.person;
  let emails = [person.email];
  if (person.sendgridemails !== null) emails = emails.concat(person.sendgridemails);
  return {
    person,
    emails,
    from: get(state, `emailDraftReducer[${props.listId}].from`) || state.personReducer.person.email,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    setFromEmail: email => dispatch({type: 'SET_FROM_EMAIL', from: email, listId: props.listId})
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SwitchEmailDropDown);
