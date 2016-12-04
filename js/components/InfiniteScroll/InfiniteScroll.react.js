import React, { Component, PropTypes } from 'react';

class InfiniteScroll extends Component {
  constructor(props) {
    super(props);
    this.onScrollBottom = this._onScrollBottom.bind(this);
  }

  componentWillMount() {
    this.props.onScrollBottom();
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScrollBottom);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScrollBottom);
  }

  _onScrollBottom(ev) {
    ev.preventDefault();
    // console.log(window.innerHeight + window.scrollY + 20);
    // console.log(document.body.scrollHeight);
    // console.log('----------');
    if ((window.innerHeight + window.scrollY + 20) >= document.body.scrollHeight) {
      // console.log('scrolled');
      this.props.onScrollBottom();
    }
  }
  render() {
    return (
      <div className={this.props.className}>
        {this.props.children}
      </div>);
  }
}

InfiniteScroll.PropTypes = {
  onScrollBottom: PropTypes.func.isRequired
};

export default InfiniteScroll;
