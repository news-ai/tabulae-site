import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getInviteCount} from './actions';

import {cyan500, blueGrey900} from 'material-ui/styles/colors';
import Avatar from 'material-ui/Avatar';
import Invite from './Invite.react';

import Tabs, {TabPane} from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';

import BasicSettings from './BasicSettings.react';
import EmailSettings from './EmailSettings.react';

import * as actionCreators from '../../actions/AppActions';

const InviteSteps = props => <div style={{
  display: 'flex',
  justifyContent: 'space-around',
  margin: '20px 0',
  padding: 30
}}>
  <div>
    <Avatar backgroundColor={cyan500} size={30}><strong>1</strong></Avatar>
    <span style={{color: blueGrey900, margin: '0 5px'}}>Invite friends</span>
  </div>
  <div>
    <Avatar backgroundColor={cyan500} size={30}><strong>2</strong></Avatar>
    <span style={{color: blueGrey900, margin: '0 5px'}}>5 friends set up accounts</span>
  </div>
  <div>
    <Avatar backgroundColor={cyan500} size={30}><strong>3</strong></Avatar>
    <span style={{color: blueGrey900, margin: '0 5px'}}>You get 1 month FREE. Yay!</span>
  </div>
</div>;


class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      activeKey: '1',
    };
    this.onTabChange = activeKey => this.setState({activeKey});
    this.onTabClick = (key) => {
      if (key === this.state.activeKey) this.setState({activeKey: ''});
    };
  }

  componentWillMount() {
    this.props.getInviteCount().then(count => {
      this.setState({count});
    });
  }

  render() {
    const state = this.state;
    const props = this.props;

    return (
      <div style={{marginTop: 40}}>
        <Tabs
        defaultActiveKey='1'
        onChange={this.onTabChange}
        activeKey={state.activeKey}
        renderTabBar={() => <ScrollableInkTabBar onTabClick={this.onTabClick}/>}
        renderTabContent={() => <TabContent/>}
        tabBarPosition='top'
        >
          <TabPane placeholder={<span>PLACEHOLDER</span>} tab='Basics' key='1'>
            <BasicSettings/>
          </TabPane>
          <TabPane placeholder={<span>PLACEHOLDER</span>} tab='Email Settings' key='2'>
            <EmailSettings/>
          </TabPane>
          <TabPane placeholder={<span>PLACEHOLDER</span>} tab='Invite' key='3'>
            <div className='row horizontal-center'>
              <div className='large-8 medium-8 small-12 columns'>
                <InviteSteps/>
                <div className='horizontal-center'>
                  <span style={{fontSize: '0.8em'}}>{5 - state.count} friends away from a free month</span>
                </div>
                <div className='horizontal-center' style={{margin: '20px 0'}}>
                  <Invite className='vertical-center'/>
                </div>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  return {
    person: state.personReducer.person,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    patchPerson: body => dispatch(actionCreators.patchPerson(body)),
    getInviteCount: _ => dispatch(getInviteCount())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
