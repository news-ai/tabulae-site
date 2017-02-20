import React, {Component} from 'react';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import get from 'lodash/get';
import {yellow50} from 'material-ui/styles/colors';
import Link from 'react-router/lib/Link';

class SwitchEmailHOC extends Component {
  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  render() {
    const props = this.props;
    const state = this.state;
    const emails = props.emails.map((email, i) => <MenuItem key={`switch-email-${i}`} value={email} primaryText={email}/>);
    return (
      <div>
        <Dialog title='Switch From Email' autoScrollBodyContent open={state.open} onRequestClose={_ => this.setState({open: false})}>
          <div style={{margin: 10, padding: 10, backgroundColor: yellow50, fontSize: '0.9em'}}>
          You can add a different email to send from in Email Settings at <Link to='/settings'>Setting</Link>.
          </div>
          <DropDownMenu value={props.from} onChange={(e, i, value) => props.setFromEmail(value)}>
            {emails}
          </DropDownMenu>
        </Dialog>
        {props.children({onRequestOpen: _ => this.setState({open: true})})}
      </div>
      );
  }
}

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

export default connect(mapStateToProps, mapDispatchToProps)(SwitchEmailHOC);
