import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as publicationActions from './actions';
import * as actions from './DatabaseProfile/actions';
import isURL from 'validator/lib/isURL';
import {blue700, grey400, grey700, grey200} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';
import Waiting from 'components/Waiting';
import Organization from './Organization.react';

import alertify from 'alertifyjs';

const socialIconClassNames = {
  'facebook': 'fa fa-facebook',
  'instagram': 'fa fa-instagram',
  'angellist': 'fa fa-angellist',
  'pinterest': 'fa fa-pinterest',
  'linkedincompany': 'fa fa-linkedin',
  'twitter': 'fa fa-twitter'
  //'crunchbasecompany': 'fa fa-',
};

const panelStyle = {
  margin: '20px 0',
  padding: '10px 0',
  border: `solid 1px ${grey200}`
};

const Keywords = ({keywords}) => {
  return (
    <div className='row' style={panelStyle}>
      <div style={{margin: '5px'}} className='large-12 medium-12 small-12 columns'>
        <h5 style={{color: grey700}}>Keywords</h5>
      </div>
      <div className='large-12 medium-12 small-12 columns'>
        <span style={{fontSize: '0.9em', color: grey700}}>{keywords.filter((keyword, i) => i < 25).join(', ')}</span>
      </div>
    </div>
    );
};

const SocialProfile = ({url, typeName, typeId, followers}) => {
  return (
    <div className='large-4 medium-6 small-6 columns vertical-center' style={{marginBottom: 5}}>
      <a style={{color: grey700}} href={url} target='_blank'>
        <span style={{marginRight: 10}}>{typeName}</span>
      </a>
      <a style={{color: grey700}} href={url} target='_blank'>
        {typeId && socialIconClassNames[typeId] && <FontIcon style={{fontSize: '14px', marginRight: 7}} className={socialIconClassNames[typeId]}/>}
      </a>
      {followers && <span style={{fontSize: '0.9em'}}>{followers.toLocaleString()}</span>}
    </div>);
};

const SocialProfiles = ({socialProfiles}) => {
  return (
    <div className='row' style={panelStyle}>
      <div style={{margin: '5px'}} className='large-12 medium-12 small-12 columns'>
        <h5 style={{color: grey700}}>Social Profiles</h5>
      </div>
      {socialProfiles.map((profile, i) => <SocialProfile key={`socialprofile-${i}`} {...profile}/>)}
    </div>);
};

const Profile = ({organization, logo, socialProfiles}) => {
  return (
    <div className='row' style={{margin: '10px 0'}}>
      {organization &&
        <div className='large-6 medium-6 small-12 columns'>
          <Organization logo={logo} {...organization}/>
        </div>}
      {socialProfiles &&
        <div className='large-6 medium-6 small-12 columns'>
          <SocialProfiles socialProfiles={socialProfiles}/>
          {organization && organization.keywords &&
          <Keywords {...organization}/>}
        </div>}
    </div>
    );
};


const Publication = props => {
  const {publication, profile, patchPublication} = props;
  return (
    <div className='row' style={{marginTop: 40}}>
      <div className='large-12 medium-12 small-12 columns'>
        <span style={{fontSize: '2em'}}>{publication.name}</span>
      </div>
    {publication.url &&
      <div className='large-12 medium-12 small-12 columns'>
        <a href={publication.url} target='_blank'>
          <span style={{color: grey400, fontSize: '0.9em', marginRight: 5}}>{publication.url} <i className='fa fa-external-link'/></span>
        </a>
      </div>}
    {!publication.url &&
      <div className='large-12 medium-12 small-12 columns' style={{margin: '20px 0'}}>
        <span style={{marginRight: 5}}>
        No website filled in for this publication.
        We pull in information about this publication based on the website url.
        </span>
        <span
        onClick={() => {
          alertify.prompt(
            'Enter website URL',
            'https://',
            (e, url) => isURL(url) && patchPublication(Object.assign({}, publication, {url})),
            e => console.log('input cancelled')
            );
        }} className='pointer' style={{color: blue700}}>Fill one in now?</span>
      </div>}
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
    } else {
      this.props.fetchDatabaseProfile();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.publication && !this.props.publication.url && nextProps.publication.url) {
      // user just adde URL for a publication
      this.props.fetchDatabaseProfile();
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (props.isReceiving || !props.publication) ?
    <Waiting style={{margin: 40}} isReceiving={props.isReceiving} text='Loading...'/> :
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
    fetchPublication: _ => dispatch(publicationActions.fetchPublication(publicationId)),
    patchPublication: publicationBody => dispatch(publicationActions.patchPublication(publicationId, publicationBody)),
    fetchDatabaseProfile: _ => dispatch(actions.fetchDatabaseProfile(publicationId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PublicationContainer);
