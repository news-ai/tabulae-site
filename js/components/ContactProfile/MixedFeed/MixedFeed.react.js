import React, {PropTypes, Component} from 'react';
import Tweet from '../Tweets/Tweet.react';
import HeadlineItem from '../Headlines/HeadlineItem.react';
import InstagramItem from '../Instagram/InstagramItem.react';
import GenericFeed from '../GenericFeed.react';

class MixedFeed extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.setRef = ref => {
      this._mixedList = ref;
    };
    this.rowRenderer = this._rowRenderer.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.containerWidth !== this.props.containerWidth) {
      if (this._mixedList) {
        this._mixedList.recomputeRowHeights(0);
      }
    }
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

    let newstyle = style;
    if (newstyle) newstyle.padding = '0 18px';
    return (
      <div className='vertical-center' key={key} style={newstyle}>
        {row}
      </div>);
  }

  render() {
    const props = this.props;
    return (
      <GenericFeed
      setRef={this.setRef}
      rowRenderer={this.rowRenderer}
      title='RSS/Twitter/Instagram'
      {...props}
      />);
  }
}

export default MixedFeed;
