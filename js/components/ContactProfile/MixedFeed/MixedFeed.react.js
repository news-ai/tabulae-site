import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import * as mixedFeedActions from './actions';
import Tweet from '../Tweets/Tweet.react';
import HeadlineItem from '../Headlines/HeadlineItem.react';
import InfiniteScroll from '../../InfiniteScroll';
import InstagramItem from '../Instagram/InstagramItem.react';

import FlatButton from 'material-ui/FlatButton';
import {List, CellMeasurer, WindowScroller, AutoSizer} from 'react-virtualized';

const styleEmptyRow = {
  padding: 10,
  marginTop: 20,
  marginBottom: 50,
};

class MixedFeed extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.rowRenderer = this._rowRenderer.bind(this);
  }

  componentWillMount() {
    this.props.fetchMixedFeed(this.props.contactId);
  }

  _rowRenderer({key, index, style}) {
    const feedItem = this.props.mixedfeed[index];
    let row;
    switch (feedItem.type) {
      case 'headlines':
        row = <HeadlineItem {...feedItem} />;
        break;
      case 'tweets':
        row = <Tweet {...feedItem} />;
        break;
      case 'instagrams':
        row = <InstagramItem {...feedItem} />;
        break;
      default:
        row = <HeadlineItem {...feedItem} />;
    }
    let newStyle = style;
    if (newStyle) newStyle.padding = '0 18px';
    return (
      <div key={key} style={newStyle}>
        {row}
      </div>);
  }

  render() {
    const props = this.props;
    return (
      <div>
        {props.mixedfeed
          && !props.didInvalidate
          && props.mixedfeed.length === 0
          && <div className='row' style={styleEmptyRow}><p>No RSS/Tweets attached. Try clicking on 'Settings' to start seeing some headlines.</p></div>}
        {props.mixedfeed &&
          <WindowScroller>
          {({height, scrollTop}) => (
            <CellMeasurer
            cellRenderer={({rowIndex, ...rest}) => this.rowRenderer({index: rowIndex, ...rest})}
            columnCount={1}
            rowCount={props.mixedfeed.length}
            >
            {({getRowHeight}) => (
              <List
              width={props.containerWidth}
              height={height}
              scrollTop={scrollTop}
              rowCount={props.mixedfeed.length}
              rowHeight={getRowHeight}
              rowRenderer={this.rowRenderer}
              onScroll={(args) => {
                if (((args.scrollHeight - args.scrollTop) / args.clientHeight) < 2) props.fetchMixedFeed(props.contactId);
              }}
              />)}
            </CellMeasurer>
            )}
          </WindowScroller>}
        {props.didInvalidate
          && <div className='row' style={styleEmptyRow}><p>Something went wrong. Sorry about that. A bug has been filed. Check back in a while or use the bottom right Interm button to reach out and we'll try to resolve this for you.</p></div>}
        {props.offset !== null && <div className='horizontal-center'><FlatButton label='Load more' onClick={_ => this.props.fetchMixedFeed(this.props.contactId)} /></div>}
      </div>
      );
  }
}
const mapStateToProps = (state, props) => {
  const listId = props.listId;
  const contactId = props.contactId;
  return {
    listId,
    contactId,
    mixedfeed: state.mixedReducer[contactId] && state.mixedReducer[contactId].received,
    didInvalidate: state.mixedReducer.didInvalidate,
    offset: state.mixedReducer[contactId] && state.mixedReducer[contactId].offset
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchMixedFeed: contactId => dispatch(mixedFeedActions.fetchMixedFeed(contactId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MixedFeed);
