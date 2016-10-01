import React, { Component, PropTypes } from 'react';

class InfiniteScroll extends Component {
  constructor(props) {
    super(props);
    this.onScrollBottom = this._onScrollBottom.bind(this);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScrollBottom);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScrollBottom);
  }

  _onScrollBottom(ev) {
    ev.preventDefault();
    if ((window.innerHeight + window.scrollY + 20) >= document.body.scrollHeight) {
      this.props.onScrollBottom();
    }
  }
  render() {
    return (
      <div>
        {this.props.children}
      </div>);
  }
}

InfiniteScroll.PropTypes = {
  onScrollBottom: PropTypes.func.isRequired
};

export default InfiniteScroll;
