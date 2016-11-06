import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

const ClientDirectory = props => {
  console.log(props.clientname);
  return (
    <div>CLIENT ITEM: {props.clientname}</div>
    );
};

const mapStateToProps = (state, props) => {
  const clientname = props.params.clientname;
  console.log(props);
  return {
    clientname
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ClientDirectory);
