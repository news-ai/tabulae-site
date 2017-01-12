import React, {Component} from 'react';

class ValidationHOC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showErrorMessage: false,
      errorMessage: ''
    };
    this.validateChildValue = this._validateChildValue.bind(this);
  }

  _validateChildValue(value) {
    const rules = this.props.rules;
    if (value.length === 0) {
      this.setState({showErrorMessage: false, errorMessage: ''});
      return;
    }
    for (var i = 0; i < rules.length; i++) {
      const {validator, errorMessage} = rules[i];
      if (!validator(value)) {
        this.setState({showErrorMessage: true, errorMessage});
        return;
      }
    }
    this.setState({showErrorMessage: false, errorMessage: ''});
  }

  render() {
    return this.props.children({
      errorMessage: this.state.showErrorMessage ? this.state.errorMessage : '',
      onValueChange: value => this.validateChildValue(value)
    });
  }
}

export default ValidationHOC;
