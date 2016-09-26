import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';

const HeadlineItem = ({url, title, publishdate, summary, publicationid}) => {
  const date = new Date(publishdate);
  return (
  <div style={{marginBottom: 20}}>
    <a target='_blank' href={url}><h4>{title}</h4></a>
    <span>{date.toDateString()}</span><span style={{marginLeft: 8}}>{date.toTimeString()}</span>
    <p>{summary}</p>
  </div>
  );
};

const mapStateToProps = (state, props) => {
  return {


  }
}

const mapDispatchToProps = (dispatch, props) => {
  return {

  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HeadlineItem);

