import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {grey700} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import * as contactActions from '../../actions/contactActions';

const styles = {
  smallIcon: {
    fontSize: 16,
    color: grey700
  },
  small: {
    width: 36,
    height: 36,
    padding: 2,
  },
};

class ContactEmployerDescriptor extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const props = this.props;
    const contactEmployers = props.contact[props.which].filter(id => id !== props.employer.id);
    const contactBody = {};
    contactBody[props.which] = contactEmployers;
    return (
      <div className={props.className} style={{display: 'flex', alignItems: 'center'}}>
      <span>{props.employer.name}</span>
      <IconButton
        style={{marginLeft: 3}}
        iconStyle={styles.smallIcon}
        style={styles.small}
        iconClassName='fa fa-minus'
        tooltip='Delete Publication'
        tooltipPosition='top-right'
        onClick={_ => props.patchContact(props.contact.id, contactBody)}
        />
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {};
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    patchContact: (contactId, body) => dispatch(contactActions.patchContact(contactId, body)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(ContactEmployerDescriptor);