import React, {Component} from 'react';
import ContactItemContainer from '../ContactFeed/ContactItemContainer.react';
import BucketContactItemContainer from './BucketContactItemContainer.react';
import FontIcon from 'material-ui/FontIcon';
import {grey500} from 'material-ui/styles/colors';

class BucketContactItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSelected: this.props.contacts.length > 0 ? this.props.contacts[0].id : undefined,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.contacts.length !== nextProps.contacts.length && nextProps.contacts.length > 0) {
      this.setState({currentSelected: nextProps.contacts[0].id});
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    console.log(props.contacts);
    console.log(state.currentSelected);

    return props.contacts.length > 0 ? (
      <div style={{margin: '10px 5px'}}>
        {props.contacts.map((contact, i) =>
          <BucketContactItemContainer
          key={`bucket-${i}`}
          selected={props.selected}
          onSelect={this.props.onSelect}
          currentSelected={state.currentSelected}
          onSwitch={contactId => this.setState({currentSelected: contactId})}
          {...contact}
          />
          )}
      </div>
      ) : null;
  }
}

export default BucketContactItem;
