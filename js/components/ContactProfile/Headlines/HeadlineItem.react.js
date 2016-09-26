import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import * as AppActions from '../../../actions/AppActions';

const HeadlineItem = ({url, title, publishdate, summary, publisherName}) => {
  const date = new Date(publishdate);
  return (
  <div className='row' style={{marginBottom: 20}}>
    <div className='large-12 columns'>
      <a target='_blank' href={url}><h4>{title}</h4></a>
    </div>
    <div className='large-12 columns'>
      <span>{date.toDateString()}</span><span style={{marginLeft: 8}}>{date.toTimeString()}</span>
    </div>
    <div className='large-12 columns'>
      <span>{publisherName}</span>
    </div>
    <div className='large-12 columns'>
      <p>{summary}</p>
    </div>
  </div>
  );
};

class HeadlineItemContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const props = this.props;
    if (!props.publisherName && !props.isReceiving) {
      props.fetchPublication(props.publicationid);
    }
  }

  render() {
    return <HeadlineItem {...this.props} />;
  }
}

const mapStateToProps = (state, props) => {
  return {
    publisherName: state.publicationReducer[props.publicationid] && state.publicationReducer[props.publicationid].name,
    isReceiving: state.publicationReducer[props.publicationid] && state.publicationReducer[props.publicationid].isReceiving
  }
}

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchPublication: id => dispatch(AppActions.fetchPublication(id))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HeadlineItemContainer);

