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
    return (
      <InfiniteScroll onScrollBottom={this.props.fetchEmails}>
        <div style={{margin: '30px 0'}}>
          {this.props.emails.map((email, i) =>
            <AnalyticsItem
            key={i}
            {...email}
            />)}
        </div>
      </InfiniteScroll>
      );
  }
}

export default EmailsList;
