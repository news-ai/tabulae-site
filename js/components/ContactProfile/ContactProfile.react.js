import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import withRouter from 'react-router/lib/withRouter';
import * as feedActions from './actions';
import * as AppActions from '../../actions/AppActions';
import * as headlineActions from './Headlines/actions';
import * as contactActions from '../../actions/contactActions';
import * as joyrideActions from '../Joyride/actions';
import {grey700, grey500, grey50} from 'material-ui/styles/colors';

import hopscotch from 'hopscotch';
import 'node_modules/hopscotch/dist/css/hopscotch.min.css';
import {tour} from './tour';

import IconButton from 'material-ui/IconButton';
import Dialog from 'material-ui/Dialog';
import AutoComplete from 'material-ui/AutoComplete';
import Textarea from 'react-textarea-autosize';
import RaisedButton from 'material-ui/RaisedButton';
import AddEmployerHOC from './AddEmployerHOC.react';

import TweetFeed from './Tweets/TweetFeed.react';
import MixedFeed from './MixedFeed/MixedFeedContainer.react';
import Headlines from './Headlines/Headlines.react';
import InstagramFeed from './Instagram/InstagramFeed.react';
import ContactEmails from './ContactEmails.react';
import ContactEmployerDescriptor from './ContactEmployerDescriptor.react';
import FeedsController from './FeedsController.react';
import ContactProfileDescriptions from './ContactProfileDescriptions.react';

import Tabs, {TabPane} from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
import 'rc-tabs/assets/index.css';

const styles = {
  smallIcon: {
    fontSize: 16,
    color: grey700
  },
  small: {
    width: 36,
    height: 36,
    padding: 2,
  },
};

const Placeholder = props => <div style={{height: 700}}><span>Placeholder</span></div>;

class ContactProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabContainerWidth: 800,
      firsttime: this.props.firstTimeUser,
      activeKey: 'all'
    };
    window.onresize = _ => {
      const node = ReactDOM.findDOMNode(this.refs.tabs);
      if (node) {
        let containerWidth = node.offsetWidth;
        const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
        if (screenWidth < containerWidth) containerWidth = screenWidth;
        this.setState({containerWidth});
      }
    };
    this.onTabChange = activeKey => this.setState({activeKey});
    this.onTabClick = key => key === this.state.activeKey && this.setState({activeKey: ''});
  }

  componentWillMount() {
    this.props.fetchContact(this.props.contactId)
    .then(_ => {
      const {contact} = this.props;
      this.setState({notes: contact.notes});
    });
    this.props.fetchContactFeeds(this.props.contactId);
  }

  componentWillReceiveProps(nextProps) {
    // if (nextProps.listDidInvalidate) window.location.href = window.location.origin + '/notfound';
    // if (nextProps.contactDidInvalidate) window.location.href = window.location.origin + '/notfound';
    const node = ReactDOM.findDOMNode(this.refs.tabs);
    if (node) {
      let containerWidth = node.offsetWidth;
      const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      if (screenWidth < containerWidth) containerWidth = screenWidth;
      this.setState({containerWidth});
    }
  }

  componentWillUnmount() {
    window.onresize = undefined;
  }

  render() {
    const state = this.state;
    const props = this.props;
  
    return (
      <div className='row horizontal-center'>
        {
          props.firstTimeUser &&
          <Dialog open={state.firsttime} modal onRequestClose={_ => this.setState({firsttime: false})}>
            <p><span style={{fontWeight: 'bold'}}>Profile</span> is generated for every contact in <span style={{fontWeight: 'bold'}}>Table</span>.</p>
            <div className='horizontal-center' style={{margin: '10px 0'}}>
              <RaisedButton primary label='OK' onClick={_ => {
                this.setState({firsttime: false});
                if (props.showUploadGuide) {
                  hopscotch.startTour(Object.assign({}, tour, {
                    steps: [
                      ...tour.steps,
                      {
                        title: 'Check out the Sample Table at Home',
                        content: 'Discover the full power of Tabulae when feeds are subscribed to on contacts. Check it out in the sample Table.',
                        target: 'breadcrumbs_hop',
                        placement: 'bottom'
                      }]}));
                } else if (props.showGeneralGuide) {
                  hopscotch.startTour(Object.assign({}, tour, {
                    steps: [
                      ...tour.steps,
                      {
                        title: 'That\'s it!',
                        content: 'Go back to Home and try it out by uploading one of your existing Excel sheets.',
                        target: 'breadcrumbs_hop',
                        placement: 'bottom'
                      }]}));
                }
                props.removeFirstTimeUser();
              }}/>
            </div>
          </Dialog>
        }
        <div className='large-9 medium-12 small-12 columns'>
          {props.contact && (
            <div className='row' style={{marginTop: 40}}>
              <ContactProfileDescriptions className='large-6 medium-12 small-12 columns' list={props.list} contact={props.contact} {...props} />
              <div className='large-6 medium-12 small-12 columns'>
                <div className='row'>
                  <div className='large-12 medium-12 small-12 columns'>
                    <h5>Notes</h5>
                  </div>
                  <div className='large-12 medium-12 small-12 columns'>
                    <Textarea
                    value={state.notes}
                    maxRows={7}
                    onChange={e => !props.contact.readonly && this.setState({notes: e.target.value})}
                    onBlur={_ => props.contact.notes !== state.notes ? !props.contact.readonly && props.patchContact(props.contactId, {notes: state.notes}) : null}
                    />
                    <span style={{color: grey500, margin: 5, fontSize: '0.7em', float: 'right'}}>{props.contact.notes !== state.notes ? 'Unsaved' : 'Saved'}</span>
                  </div>
                </div>
                <div className='large-12 medium-12 small-12 columns'>
                  <div className='row vertical-center' style={{marginTop: 20}}>
                    <h5>Current Publications/Employers</h5>
                    <AddEmployerHOC
                    title='Add Current Publication'
                    type='employers'
                    contact={props.contact}
                    >
                    {({onRequestOpen}) => (
                      <IconButton
                      disabled={props.contact.readonly}
                      iconStyle={styles.smallIcon}
                      style={styles.small}
                      iconClassName='fa fa-plus'
                      tooltip='Add Publication'
                      tooltipPosition='top-right'
                      onClick={onRequestOpen}
                      />)}
                    </AddEmployerHOC>
                  </div>
                  <div>
                    {props.employers && props.employers.map((employer, i) =>
                      <ContactEmployerDescriptor style={{margin: 4}} key={i} employer={employer} which='employers' contact={props.contact} />)}
                    {(props.employers.length === 0 || !props.employers) && <span>None added</span>}
                  </div>
                  <div style={{marginTop: 20}}>
                    <div className='row vertical-center'>
                    <div className='large-12 medium-12 small-12 columns'>
                    </div>
                      <h5>Past Publications/Employers</h5>
                      <AddEmployerHOC
                      title='Add Past Publication'
                      type='pastemployers'
                      contact={props.contact}
                      >
                      {({onRequestOpen}) => (
                        <IconButton
                        disabled={props.contact.readonly}
                        style={{marginLeft: 3}}
                        iconStyle={styles.smallIcon}
                        style={styles.small}
                        iconClassName='fa fa-plus'
                        tooltip='Add Publication'
                        tooltipPosition='top-right'
                        onClick={onRequestOpen}
                        />
                        )}
                      </AddEmployerHOC>
                    </div>
                  </div>
                  <div>
                    {props.pastemployers && props.pastemployers.map((employer, i) =>
                      <ContactEmployerDescriptor style={{margin: 4}} key={i} employer={employer} which='pastemployers' contact={props.contact} />)}
                    {(props.pastemployers.length === 0 || !props.pastemployers) && <span>None added</span>}
                  </div>
                </div>
              </div>
            </div>
            )}
          <div className='large-12 columns' style={{marginLeft: 8, marginRight: 8, marginTop: 20}}>
            <FeedsController {...props} />
              <Tabs
              ref='tabs'
              defaultActiveKey='/emailstats'
              activeKey={state.activeKey}
              onChange={this.onTabChange}
              renderTabBar={() => <ScrollableInkTabBar/>}
              renderTabContent={() => <TabContent/>}
              >
                <TabPane
                placeholder={<Placeholder/>}
                tab='All'
                key='all'>
                  <div style={{padding: 5}}>
                    <MixedFeed
                    containerHeight={700}
                    containerWidth={state.containerWidth}
                    contactId={props.contactId}
                    listId={props.listId}
                    />
                  </div>
                </TabPane>
                <TabPane
                placeholder={<Placeholder/>}
                tab='RSS Only'
                key='rss'>
                  <div style={{padding: 5}}>
                    <Headlines
                    refName='rss'
                    containerHeight={700}
                    containerWidth={state.containerWidth}
                    contactId={props.contactId}
                    listId={props.listId}
                    />
                  </div>
                </TabPane>
                <TabPane
                placeholder={<Placeholder/>}
                tab='Tweets Only'
                key='tweets'>
                  <div style={{padding: 5}}>
                    <TweetFeed
                    refName='twitter'
                    containerHeight={700}
                    containerWidth={state.containerWidth}
                    contactId={props.contactId}
                    listId={props.listId}
                    />
                  </div>
                </TabPane>
                <TabPane
                placeholder={<Placeholder/>}
                tab='Instagram Only'
                key='instagram'>
                  <div style={{padding: 5}}>
                    <InstagramFeed
                    refName='instagram'
                    containerHeight={700}
                    containerWidth={state.containerWidth}
                    contactId={props.contactId}
                    listId={props.listId}
                    />
                  </div>
                </TabPane>
                <TabPane
                placeholder={<span>Placeholder</span>}
                tab='Sent Emails'
                key='emails'>
                  <div style={{padding: 5}}>
                    <ContactEmails
                    refName='emails'
                    containerHeight={680}
                    containerWidth={state.containerWidth}
                    contactId={props.contactId}
                    listId={props.listId}
                    />
                  </div>
                </TabPane>
              </Tabs>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  const listId = parseInt(props.params.listId, 10);
  const contactId = parseInt(props.params.contactId, 10);
  const contact = state.contactReducer[contactId];
  const employers = contact && contact.employers !== null && contact.employers
  .filter(pubId => state.publicationReducer[pubId])
  .map(pubId => state.publicationReducer[pubId]);
  const pastemployers = contact && contact.pastemployers !== null && contact.pastemployers
  .filter(pubId => state.publicationReducer[pubId])
  .map(pubId => state.publicationReducer[pubId]);
  return {
    listId,
    contactId,
    contact,
    employers,
    pastemployers,
    list: state.listReducer[listId],
    firstTimeUser: state.personReducer.firstTimeUser,
    showUploadGuide: state.joyrideReducer.showUploadGuide,
    showGeneralGuide: state.joyrideReducer.showGeneralGuide,
    listDidInvalidate: state.listReducer.didInvalidate,
    contactDidInvalidate: state.contactReducer.didInvalidate
  };
}

function mapDispatchToProps(dispatch, props) {
  return {
    fetchFeed: contactid => dispatch(headlineActions.fetchContactHeadlines(contactid)),
    fetchContact: contactid => dispatch(contactActions.fetchContact(contactid)),
    patchContact: (contactId, body) => dispatch(contactActions.patchContact(contactId, body)),
    fetchContactFeeds: (contactId) => dispatch(feedActions.fetchContactFeeds(contactId)),
    fetchPublication: pubId => dispatch(AppActions.fetchPublication(pubId)),
    fetchList: listId => dispatch(AppActions.fetchList(listId)),
    removeFirstTimeUser: _ => dispatch(AppActions.removeFirstTimeUser()),
    turnOnGeneralGuide: _ => dispatch(joyrideActions.turnOnGeneralGuide())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(withRouter(ContactProfile));
