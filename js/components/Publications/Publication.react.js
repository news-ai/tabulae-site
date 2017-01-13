import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as AppActions from 'actions/AppActions';
import * as actions from './DatabaseProfile/actions';
import ContactDescriptor from '../ContactProfile/ContactDescriptor.react';
import isURL from 'validator/lib/isURL';
import {blue700} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';

const Organization = ({approxEmployees, contactInfo, founded, images, keywords, links}) => {
  return (
  <div className='row' style={{margin: '10px 0'}}>
    <div className='large-12 medium-12 small-12 columns'>
      <span style={{marginRight: 10}}>Approx. Employees:</span><span>{approxEmployees}</span>
    </div>
    <div className='large-12 medium-12 small-12 columns'>
      <span style={{marginRight: 10}}>Founded:</span><span>{founded}</span>
    </div>
  </div>);
};

const SocialProfile = ({url, typeName, followers}) => {
  return (
    <div className='large-12 medium-12 small-12 columns' style={{marginBottom: 5}}>
      <a href={url} target='_blank'><span style={{marginRight: 10, color: blue700}}>{typeName}</span></a>
      {followers && <span>{followers.toLocaleString()}</span>}
    </div>);
};

const SocialProfiles = ({socialProfiles}) => {
  return (
    <div className='row'>
      {socialProfiles.map((profile, i) => <SocialProfile key={`socialprofile-${i}`} {...profile}/>)}
    </div>);
};

const Profile = ({organization, logo, socialProfiles, className}) => {
  return (
    <div className={className} style={{margin: '10px 0'}}>
      {logo && <div className='row' style={{margin: '20px 0'}}><img src={logo}/></div>}
      {organization && <Organization {...organization}/>}
      {socialProfiles && <SocialProfiles socialProfiles={socialProfiles}/>}
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
        className='large-6 medium-6 small-12 columns'
        content={publication.url}
        contentTitle='Website Link'
        onBlur={url => {
          if (isURL(url)) patchPublication({url});
        }}/>
        {profile && <Profile className='large-6 medium-6 small-12 columns' {...profile}/>}
      </div>
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
