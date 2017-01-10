import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as AppActions from '../../actions/AppActions';

import FontIcon from 'material-ui/FontIcon';

const Publication = ({publication}) => {
  const {name} = publication;
  return (
    <div style={{marginTop: 40}}>
      <div className='row'>
        <h1>{name}</h1>
      </div>
      <div className='row horizontal-center'>
        <div className='large-12 columns'>
        </div>
      </div>
    </div>
    );
};

class PublicationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    if (!this.props.publication) this.props.fetchPublication();
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (props.isReceiving || !props.publication) ? <FontIcon className='fa fa-loading fa-spin'/> : <Publication {...props}/>;
  }
}

const mapStateToProps = (state, props) => {
  const publicationId = parseInt(props.params.publicationId, 10);
  return {
    publicationId,
    publication: state.publicationReducer[publicationId],
    isReceiving: state.publicationReducer.isReceiving
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const publicationId = parseInt(props.params.publicationId, 10);
  return {
    fetchPublication: _ => dispatch(AppActions.fetchPublication(publicationId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PublicationContainer);
