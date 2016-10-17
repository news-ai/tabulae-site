import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actions from './actions';

import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';

class TwitterProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.open === false && this.state.open === true) {
      // onRequestOpen hit
      if (!this.props.profile) this.props.fetchTwitter();
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    const profile = props.profile;
    return (
      <div>
        <Dialog open={state.open} title='Twitter' onRequestClose={_ => this.setState({open: false})}>
          {props.isReceiving && <FontIcon className={'fa fa-spinner fa-spin'} />}
          {props.profile &&
            <div>
              <img src={profile.profile_image_url} />
              <a href={`https://twitter.com/${profile.Username}`} target='_blank'><p>{profile.Username}</p></a>
              <p>{profile.name}</p>
              <p>{profile.description}</p>
              <p>Favorites: {profile.favourites_count}</p>
              <p>Followers: {profile.followers_count}</p>
              <p>Following: {profile.friends_count}</p>
              <p>Location: {profile.location}</p>
              {profile.verified && <p>Verified</p>}
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
    profile: state.twitterProfileReducer[props.contactId],
    isReceiving: state.twitterProfileReducer.isReceiving,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchTwitter: _ => dispatch(actions.fetchTwitterProfile(props.contactId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TwitterProfile);
