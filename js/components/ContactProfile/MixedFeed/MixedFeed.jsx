
import React, {Component} from 'react';
import Tweet from '../Tweets/Tweet.jsx';
import HeadlineItem from '../Headlines/HeadlineItem.jsx';
import InstagramItem from '../Instagram/InstagramItem.jsx';
import GenericFeed from '../GenericFeed.jsx';
import {CellMeasurerCache, CellMeasurer} from 'react-virtualized';

class MixedFeed extends Component {
  constructor(props) {
    super(props);
    this.rowRenderer = this._rowRenderer.bind(this);
    this.setRef = ref => (this._list = ref);
    this._cache = new CellMeasurerCache({fixedWidth: true, minHeight: 50});
    window.onresize = () => {
      console.log('resize');
      this._cache.clearAll();
      if (this._list) this._list.recomputeRowHeights();
    }
  }
  
  componentDidMount() {
    this._cache.clearAll();
    if (this._list) this._list.recomputeRowHeights();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.containerWidth !== this.props.containerWidth) {
      this._cache.clearAll();
      if (this._list) this._list.recomputeRowHeights();
    }

    if (this.props.feed.length !== nextProps.feed.length) {
      setTimeout(_ => {
        this._cache.clearAll();
        if (this._list) this._list.recomputeRowHeights();
      }, 1000);
    }
  }

  componentWillUnmount() {
    window.onresize = undefined;
  }

  _rowRenderer({key, index, style, parent}) {
    const feedItem = this.props.feed[index];
    let row;
    switch (feedItem.type) {
      case 'headlines':
        row = <HeadlineItem screenWidth={this.props.containerWidth} style={this.props.rowStyle} {...feedItem} />;
        break;
      case 'tweets':
        row = <Tweet screenWidth={this.props.containerWidth} style={this.props.rowStyle} {...feedItem} />;
        break;
      case 'instagrams':
        row = <InstagramItem screenWidth={this.props.containerWidth} style={this.props.rowStyle} {...feedItem} />;
        break;
      default:
        row = <HeadlineItem screenWidth={this.props.containerWidth} style={this.props.rowStyle} {...feedItem} />;
    }

    let newstyle = Object.assign({}, style, {padding: '0 18px'});
    return (
      <CellMeasurer
      cache={this._cache}
      columnIndex={0}
      key={key}
      rowIndex={index}
      parent={parent}
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
      title='RSS/Twitter/Instagram'
      cache={this._cache}
      {...props}
      />);
  }
}

export default MixedFeed;
