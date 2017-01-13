import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as AppActions from 'actions/AppActions';
import * as actions from './DatabaseProfile/actions';
import ContactDescriptor from '../ContactProfile/ContactDescriptor.react';
import isURL from 'validator/lib/isURL';

import FontIcon from 'material-ui/FontIcon';

const Organization = ({approxEmployees, contactInfo, founded, images, keywords, links}) => {
  return (
  <div className='large-12 medium-12 small-12 columns' style={{margin: '10px 0'}}>
    <div className='row' style={{margin: '10px 5px'}}>
      <span style={{marginRight: 10}}>Approx. Employees:</span><span>{approxEmployees}</span>
    </div>
    <div className='row' style={{margin: '10px 5px'}}>
      <span style={{marginRight: 10}}>Founded:</span><span>{founded}</span>
    </div>
  </div>);
};

const Profile = ({organization, logo}) => {
  return (
    <div className='row' style={{margin: '10px 0'}}>
      {logo && <div style={{margin: '10px 0'}}><img src={logo}/></div>}
      {organization && <Organization {...organization}/>}
    </div>
    );
};

const Publication = props => {
  const {publication, profile, patchPublication} = props;
  return (
    <div style={{marginTop: 40}}>
      <div className='row'>
        <h1>{publication.name}</h1>
      </div>
      <div className='row'>
        <ContactDescriptor
        iconClassName='fa fa-external-link'
        className='large-12 medium-12 small-12 columns'
        content={publication.url}
        contentTitle='Website Link'
        onBlur={url => {
          if (isURL(url)) patchPublication({url});
        }}/>
      </div>
      {profile && <Profile {...profile}/>}
    </div>
    );
};

class PublicationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    if (!this.props.publication) {
      this.props.fetchPublication()
      .then(_ => this.props.fetchDatabaseProfile());
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    console.log(props.profile);
    return (props.isReceiving || !props.publication) ?
    <FontIcon className='fa fa-loading fa-spin'/> :
    <Publication {...props}/>;
  }
}

const mapStateToProps = (state, props) => {
  const publicationId = parseInt(props.params.publicationId, 10);
  return {
    publicationId,
    publication: state.publicationReducer[publicationId],
    profile: state.publicationProfileReducer[publicationId],
    isReceiving: state.publicationReducer.isReceiving || state.publicationProfileReducer.isReceiving
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const publicationId = parseInt(props.params.publicationId, 10);
  return {
    fetchPublication: _ => dispatch(AppActions.fetchPublication(publicationId)),
    patchPublication: publicationBody => dispatch(AppActions.patchPublication(publicationId, publicationBody)),
    fetchDatabaseProfile: _ => dispatch(actions.fetchDatabaseProfile(publicationId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PublicationContainer);
