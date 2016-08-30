import React, {Component} from 'react';

// WIP - ca't match Popover position to currentTarget being passed down

import Popover from 'material-ui/Popover';
import MenuItem from 'material-ui/MenuItem';
import Menu from 'material-ui/Menu';

class PopoverMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMenuOpen: false,
      anchorEl: null
    };
    this.handleRequestMenuClose = _ => this.setState({isMenuOpen: false});
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isMenuOpen !== this.state.isMenuOpen) this.setState({isMenuOpen: nextProps.isMenuOpen});
    if (nextProps.anchorEl !== this.state.anchorEl) this.setState({isMenuOpen: nextProps.anchorEl});
  }

  render() {
    return(
      <Popover
        open={this.state.isMenuOpen}
        anchorEl={this.state.anchorEl}
        onRequestClose={this.handleRequestMenuClose}
        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
        targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
        >
          <Menu>
          {this.props.children}
          </Menu>
        </Popover>
      );
  }
}

export default PopoverMenu;