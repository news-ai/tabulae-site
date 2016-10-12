import React, {PropTypes, Component} from 'react';

class ToggleableEditInputHOC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isTitleEditing: false,
      name: '' || this.props.name,
    };
    this.onToggleTitleEdit = _ => this.setState({isTitleEditing: !this.state.isTitleEditing, dirty: true});
    this.onUpdateName = e => this.setState({name: e.target.value});
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.isTitleEditing && !this.state.isTitleEditing) {
      this.props.onBlur(this.state.name);
    }
  }

  render() {
    const {isTitleEditing, name} = this.state;
    const {children} = this.props;
    return children({
      isTitleEditing,
      name,
      onToggleTitleEdit: this.onToggleTitleEdit,
      onUpdateName: this.onUpdateName,
    });
  }
}

export default ToggleableEditInputHOC;