import React, {Component} from 'react';
import Tweet from '../Tweets/Tweet.jsx';
import HeadlineItem from '../Headlines/HeadlineItem.jsx';
import InstagramItem from '../Instagram/InstagramItem.jsx';
import GenericFeed from '../GenericFeed.jsx';
import {CellMeasurerCache, CellMeasurer} from 'react-virtualized';

class MixedFeed extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.setRef = ref => {
      this._mixedList = ref;
    };
    this.rowRenderer = this._rowRenderer.bind(this);
    this._cache = new CellMeasurerCache({fixedWidth: true, minHeight: 50});
  }

  componentDidMount() {
    this.recomputeIntervalTimer = setInterval(_ => {
      if (this._mixedList) {
        this._mixedList.recomputeRowHeights();
      }
    }, 5000);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.containerWidth !== this.props.containerWidth) {
      if (this._mixedList && this._mixedListCellMeasurer) {
        this._mixedList.recomputeRowHeights();
      }
    }

    if (this.props.feed && nextProps.feed && this.props.feed.length !== nextProps.feed.length) {
      this._mixedList.recomputeRowHeights();
    }
  }

  componentWillUnmount() {
    clearInterval(this.recomputeIntervalTimer);
  }

  _rowRenderer({key, index, style}) {
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
      title='RSS/Twitter/Instagram'
      cache={this._cache}
      {...props}
      />);
  }
}

export default MixedFeed;
