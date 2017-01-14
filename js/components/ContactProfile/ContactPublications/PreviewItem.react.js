import React from 'react';
import {connect} from 'react-redux';
import ContactDescriptor from '../ContactDescriptor.react';
import {blue50} from 'material-ui/styles/colors';
import isURL from 'validator/lib/isURL';
import * as AppActions from 'actions/AppActions';

const PreviewItem = ({name, url, patchPublication}) => (
  <div
  style={{
    backgroundColor: blue50,
    margin: '15px 5px',
    padding: 10
  }}>
    <div className='row' style={{margin: '0 10px'}}>
      <span>{name}</span>
    </div>
    <div className='row' style={{margin: '3px 0'}}>
      <ContactDescriptor
      iconClassName='fa fa-external-link'
      className='large-12 medium-12 small-12 columns'
      content={url}
      contentTitle='Website Link'
      onBlur={url => {
        if (isURL(url)) patchPublication({url});
      }}/>
    </div>
  </div>
  );

const mapStateToProps = (state, props) => {
  return {
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    patchPublication: publicationBody => dispatch(AppActions.patchPublication(props.id, publicationBody)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PreviewItem);
