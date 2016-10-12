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

  componentWillReceiveProps(nextProps) {
    if (nextProps.name !== this.state.name) this.setState({name: nextProps.name});
  }

  componentWillUpdate(nextProps, nextState) {
    if (!nextState.isTitleEditing && this.state.isTitleEditing) this.props.onBlur();
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
