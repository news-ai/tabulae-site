import React, {Component} from 'react';
import {connect} from 'react-redux';
import HeadlineItem from './HeadlineItem.jsx';
import * as headlineActions from './actions';
import GenericFeed from '../GenericFeed.jsx';
import {CellMeasurerCache, CellMeasurer} from 'react-virtualized';

class Headlines extends Component {
  constructor(props) {
    super(props);
    this.rowRenderer = this._rowRenderer.bind(this);
    this.setRef = ref => {
      this._headlineList = ref;
    };
    this._cache = new CellMeasurerCache({fixedWidth: true, minHeight: 50});
  }
  
  componentDidMount() {
    this.recomputeIntervalTimer = setInterval(_ => {
      if (this._headlineList) {
        this._headlineList.recomputeRowHeights();
      }
    }, 5000);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.containerWidth !== this.props.containerWidth) {
      // if (this._headlineList) this._headlineList.recomputeRowHeights();
    }

    if (this.props.feed && nextProps.feed && this.props.feed.length !== nextProps.feed.length) {
      if (this._headlineList) setTimeout(_ => this._headlineList.recomputeRowHeights(), 100);
    }
  }

  componentWillUnmount() {
    clearInterval(this.recomputeIntervalTimer);
  }

  _rowRenderer({key, index, style, parent}) {
    const feedItem = this.props.feed[index];
    const row = <HeadlineItem {...feedItem} />;

    let newstyle = Object.assign({}, style);
    if (newstyle) newstyle.padding = '0 18px';
    return (
      <CellMeasurer
      cache={this._cache}
      columnIndex={0}
      key={key}
      parent={parent}
      rowIndex={index}
      >
        <div className='vertical-center' key={key} style={newstyle}>
          {row}
        </div>
      </CellMeasurer>
      );
  }

  render() {
    const props = this.props;
    return (
      <GenericFeed
      setRef={this.setRef}
      rowRenderer={this.rowRenderer}
      title='RSS'
      cache={this._cache}
      {...props}
      />);
  }
}
const mapStateToProps = (state, props) => {
  const listId = props.listId;
  const contactId = props.contactId;
  const feed = state.headlineReducer[contactId]
  && state.headlineReducer[contactId].received
  && state.headlineReducer[contactId].received.map(id => state.headlineReducer[id]);
  return {
    listId,
    contactId,
    feed,
    isReceiving: state.headlineReducer.isReceiving,
    didInvalidate: state.headlineReducer.didInvalidate,
    offset: state.headlineReducer[contactId] && state.headlineReducer[contactId].offset
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchFeed: _ => dispatch(headlineActions.fetchContactHeadlines(props.contactId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Headlines);
