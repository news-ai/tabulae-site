import React, {Component} from 'react';
import {connect} from 'react-redux';
import withRouter from 'react-router/lib/withRouter';
import ContactFeed from 'components/Contacts/ContactFeed/ContactFeed.react';
import * as actions from './actions';

const styles = {
  container: {marginTop: 20, marginBottom: 10},
  text: {fontSize: '2em', marginRight: '10px'}
};

class ContactTags extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    if (this.props.tag) this.props.fetchContactsByTag();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.tag !== nextProps.tag) {
      nextProps.fetchContactsByTag();
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div className='row align-center'>
        <div className='large-10 medium-10 small-12 columns'>
          <div style={styles.container}>
            <span style={styles.text}>Contact Tag: {props.tag}</span>
          </div>
          <ContactFeed contacts={props.contacts}/>
          {props.contacts.length === 0 && <div>None found</div>}
        </div>
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  const tag = props.router.location.query.tag;
  let contacts = [];
  if (tag && state.contactTagReducer[tag]) {
    contacts = state.contactTagReducer[tag].received.map(id => state.contactReducer[id]);
  }
  return {
    contacts,
    tag,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const tag = props.router.location.query.tag;
  return {
    fetchContactsByTag: _ => dispatch(actions.fetchContactsByTag(tag)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ContactTags));
