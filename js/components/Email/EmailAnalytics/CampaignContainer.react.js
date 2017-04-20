import React, {Component} from 'react';
import {connect} from 'react-redux';

class CampaignContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div>
        
      </div>);
  }
}


const mapStateToProps = (state, props) => {
  return {};
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(CampaignContainer);
