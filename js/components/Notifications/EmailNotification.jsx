import React, {Component} from 'react';
import {connect} from 'react-redux';
import {grey300, grey500, grey700, blue500} from 'material-ui/styles/colors';
import Link from 'react-router/lib/Link';
import FontIcon from 'material-ui/FontIcon';

const styles = {
  container: {padding: '8px 10px', borderBottom: `1px dotted ${grey300}`},
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
    const style = {margin: '0 5px', color: grey700, padding: '1px 8px', border: `1px solid ${grey500}`, borderRadius: '1.1em'};
    return (
      <div style={styles.container} >
        <div className='vertical-center horizontal-center'>
          <span className='smalltext' style={styles.text}>
            <FontIcon color={blue500} style={{fontSize: '0.9em', marginRight: 5}} className={resourceAction === 'click' ? 'fa fa-mouse-pointer' : 'fa fa-envelope-open'} />
            <strong>{data.to}</strong> {`${resourceAction}ed`} on email from <strong>{data.subject}</strong>
          </span>
        </div>
        {isReceiving || !email ? <FontIcon color={grey500} className='fa fa-spin fa-spinner' /> :
          <div className='vertical-center' style={{justifyContent: 'space-around', marginTop: 5}} >
            <span style={style} className='smalltext'>Clicks: {email.clicked}</span>
            <span style={style} className='smalltext'>Opens: {email.opened}</span>
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
