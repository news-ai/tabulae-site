import React, {PropTypes, Component} from 'react';
import {grey400, grey50} from 'material-ui/styles/colors';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
const tweetStyle = {
  paddingTop: 10,
  paddingBottom: 10,
  marginTop: 10,
  marginBottom: 10,
  border: `dotted 1px ${grey400}`,
  borderRadius: '0.4em'
};

const imgContainerStyle = {
  marginBottom: 20,
  marginTop: 20,
  backgroundColor: grey50,
};

const InstagramItem = ({text, createdat, instagramcomments, instagramid, instagramlikes, instagramimage, instagramlink, instagramusername, instagramvideo}) => {
  const date = new Date(createdat);
  return (
    <div className='row' style={tweetStyle}>
      <div className='large-12 medium-12 small-12 columns'><span style={{fontSize: '0.8em', color: grey400}}>from Instagram</span></div>
      <div className='large-12 medium-2 small-12 columns'>
        <a target='_blank' style={{float: 'left'}} href={instagramlink}>{text ? text : instagramlink}</a>
        <span style={{float: 'right'}}>
          {instagramusername ? <a target='_blank' href={`https://instagram.com/${instagramusername}`}>{instagramusername}</a> : instagramusername}
        </span>
      </div>
      <div className='large-12 medium-12 small-12 columns' style={{fontSize: '0.8em'}}>
        <span>{date.toDateString()}</span><span style={{marginLeft: 8}}>{date.toTimeString()}</span>
      </div>
      {!instagramvideo && <div className='large-12 medium-12 small-12 columns horizontal-center' style={imgContainerStyle}>
        <img src={instagramimage} />
      </div>}
      {instagramvideo && <div className='large-12 medium-12 small-12 columns horizontal-center' style={imgContainerStyle}>
        <video src={instagramvideo} controls>
        Your browser does not support the <code>video</code> element.
        </video>
      </div>}
      <div className='large-12 medium-12 small-12 columns vertical-center horizontal-center' style={{marginTop: 10, marginBottom: 10}}>
        <Chip style={{margin: 5, float: 'right'}}>
          <Avatar size={30}>{instagramlikes}</Avatar>
          Likes
        </Chip>
        <Chip style={{margin: 5, float: 'right'}}>
          <Avatar size={30}>{instagramcomments}</Avatar>
          Comments
        </Chip>
      </div>
    </div>);
};

export default InstagramItem;
