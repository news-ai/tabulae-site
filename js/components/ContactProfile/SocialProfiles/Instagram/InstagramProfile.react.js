import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actions from './actions';

import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';

class InstagramProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.open === false && this.state.open === true) {
      // onRequestOpen hit
      if (!this.props.profile) this.props.fetchInstagram();
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    const profile = props.profile;
    return (
      <div>
        <Dialog open={state.open} title='Instagram' onRequestClose={_ => this.setState({open: false})}>
          {props.isReceiving && <FontIcon className={'fa fa-spinner fa-spin'} />}
          {props.profile &&
            <div>
              <img src={profile.profile_picture} />
              <a href={`https://instagram.com/${profile.Username}`} target='_blank'><p>{profile.Username}</p></a>
              <p>{profile.full_name}</p>
              <p>{profile.bio}</p>
              <p>Followers: {profile.counts.followed_by}</p>
              <p>Following: {profile.counts.follows}</p>
              <p>Media: {profile.counts.media}</p>
              <p>Website: {profile.website}</p>
            </div>}
        </Dialog>
        {props.children({
          onRequestOpen: _ => this.setState({open: true})
        })}
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    profile: state.instagramProfileReducer[props.contactId],
    isReceiving: state.instagramProfileReducer.isReceiving,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchInstagram: _ => dispatch(actions.fetchInstagramProfile(props.contactId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(InstagramProfile);
