import React from 'react';
import AnalyticsItem from './AnalyticsItem.react';

const EmailsLists = ({emails}) => {
  return (
    <div style={{margin: '30px 0'}}>
      {emails.map((email, i) =>
        <AnalyticsItem
        key={i}
        {...email}
        />)}
    </div>);
};

export default EmailsLists;
