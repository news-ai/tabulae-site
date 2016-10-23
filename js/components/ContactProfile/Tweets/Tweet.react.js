import React, {PropTypes, Component} from 'react';
import {grey400} from 'material-ui/styles/colors';

const defaultStyle = {
  paddingTop: 10,
  paddingBottom: 10,
  marginTop: 10,
  marginBottom: 10,
  border: `dotted 1px ${grey400}`,
  borderRadius: '0.4em',
  minHeight: 100
};

const Tweet = ({style, text, username, createdat, tweetidstr, screenWidth}) => {
  const date = new Date(createdat);
  const containerStyle = style ? Object.assign({}, defaultStyle, style) : Object.assign({}, defaultStyle);
  return (
    <div className='row' style={containerStyle}>
      <div className='large-12 medium-12 small-12 columns'><span style={{fontSize: '0.8em', color: grey400}}>from Twitter</span></div>
      <div className='large-12 medium-12 small-12 columns'>
        <span style={{float: 'right'}}>
          {tweetidstr ? <a target='_blank' href={`https://twitter.com/statuses/${tweetidstr}`}>{username}</a> : username}
        </span>
      </div>
      <div className='large-10 medium-9 small-12 columns'><span>{text}</span></div>
      <div className='large-12 medium-12 small-12 columns' style={{fontSize: '0.8em'}}>
        <span>{date.toDateString()}</span><span style={{marginLeft: 8}}>{date.toTimeString()}</span>
      </div>
    </div>);
};

export default Tweet;
