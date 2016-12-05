import React, {Component} from 'react';
import AnalyticsItem from './AnalyticsItem.react';
import InfiniteScroll from '../../InfiniteScroll';

class EmailsList extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchEmails();
  }

  render() {
    let style = {margin: '30px 0'};
    if (this.props.containerHeight) style.height = this.props.containerHeight;
    return (
      <InfiniteScroll onScrollBottom={this.props.fetchEmails}>
        <div style={style}>
          {this.props.emails.map((email, i) =>
            <AnalyticsItem
            key={i}
            {...email}
            />)}
          {this.props.emails.length === 0 && <span>No emails scheduled for delivery.</span>}
        </div>
      </InfiniteScroll>
      );
  }
}

export default EmailsList;
