import React, {PropTypes, Component} from 'react';
import {grey400} from 'material-ui/styles/colors';
const tweetStyle = {
  paddingTop: 10,
  paddingBottom: 10,
  marginTop: 10,
  marginBottom: 10,
  border: `dotted 1px ${grey400}`,
  borderRadius: '0.4em'
};
const Tweet = ({text, username, createdat, tweetidstr}) => {
  const date = new Date(createdat);
  return <div className='row' style={tweetStyle}>
    <div className='large-10 medium-9 small-8 columns'><span>{text}</span></div>
    <div className='large-2 medium-3 small-4 columns'>
      <span style={{float: 'right'}}>
        {tweetidstr ? <a target='_blank' href={`https://twitter.com/statuses/${tweetidstr}`}>{username}</a> : username}
      </span>
    </div>
     <div className='large-12 medium-12 small-12 columns' style={{fontSize: '0.8em'}}>
      <span>{date.toDateString()}</span><span style={{marginLeft: 8}}>{date.toTimeString()}</span>
    </div>
  </div>;
};

export default Tweet;