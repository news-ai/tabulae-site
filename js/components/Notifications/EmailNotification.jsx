import React, {Component} from 'react';
import {connect} from 'react-redux';
import {grey300, grey700} from 'material-ui/styles/colors';
import Link from 'react-router/lib/Link';
import FontIcon from 'material-ui/FontIcon';

const styles = {
  container: {padding: 10, borderBottom: `1px dotted ${grey300}`},
  text: {color: grey700}
}

class EmailNotification extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchEmail();
  }

  render() {
    const {resourceName, resourceId, resourceAction, data, email, isReceiving} = this.props;
    return (
      <div style={styles.container} >
        <div className='vertical-center horizontal-center'>
          <span className='smalltext' style={styles.text}>{data.to} {`${resourceAction}ed`} on link from <strong>{data.subject}</strong></span>
        </div>
        {isReceiving || !email ? <FontIcon className='fa fa-spin fa-spinner' /> :
          <div>
            <span style={{margin: '0 5px'}} className='smalltext'>Clicked: {email.clicked}</span>
            <span style={{margin: '0 5px'}} className='smalltext'>Opens: {email.opened}</span>
          </div>}
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    email: state.stagingReducer[props.resourceId],
    isReceiving: state.stagingReducer.isReceiving
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchEmail: _ => dispatch({type: 'EMAIL_REQUEST', id: props.resourceId})
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailNotification);
