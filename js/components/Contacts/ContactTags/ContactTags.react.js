import React, {Component} from 'react';
import {connect} from 'react-redux';
import withRouter from 'react-router/lib/withRouter';
import ContactFeed from 'components/Contacts/ContactFeed/ContactFeed.react';
import * as actions from './actions';

const styles = {
  container: {marginTop: 20, marginBottom: 10},
  text: {fontSize: '2em', marginRight: '10px'}
};

// utility wrapper to avoid grid confusion
const Centering = ({children}) => <div className='row align-center'><div className='large-10 medium-10 small-12 columns'>{children}</div></div>;

class ContactTags extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: []
    };
    this.onSelect = this._onSelect.bind(this);
  }

  componentWillMount() {
    if (this.props.tag) this.props.fetchContactsByTag();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.tag !== nextProps.tag) {
      nextProps.fetchContactsByTag();
    }
  }

  _onSelect(contactId) {
    let newSelected = [];
    let seen = false;
    this.state.selected.forEach(id => {
      if (id !== contactId) {
        newSelected.push(id);
      } else {
        seen = true;
        return false;
      }
    });
    if (!seen) newSelected.push(contactId);
    this.setState({selected: newSelected});
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <Centering>
        <div className='row' style={styles.container}>
          <div className='large-12 medium-12 small-12 columns'>
            <span style={styles.text}>Contact Tag: {props.tag}</span>
          </div>
          <div className='large-12 medium-12 small-12 columns'>
            <span className='smalltext'>selected {state.selected.length} contact{state.selected.length > 1 ? 's' : null} </span>
          </div>
        </div>
        <ContactFeed selected={state.selected} onSelect={this.onSelect} contacts={props.contacts}/>
        {props.contacts.length === 0 && <div>None found</div>}
      </Centering>
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
