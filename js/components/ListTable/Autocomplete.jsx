import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import Popover, {PopoverAnimationVertical} from 'material-ui/Popover';
import MenuItem from 'material-ui/MenuItem';
import Menu from 'material-ui/Menu';

/*

<Autocomplete
searchText={}
onChange={}
options={}
maxSearchResults={}
labelGetter={}
/>

 */

class Autocomplete extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      anchorEl: undefined,
      searchText: '',
    };
    this.onChange = this.onChange.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.handleRequestClose = _ => this.setState({open: false});
    this.handleBlur = this.handleBlur.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
  }

  onChange(e, newValue) {
    e.preventDefault();
    console.log(e);
    console.log(newValue)
    this.props.onInputUpdate(newValue);
    this.setState({
      anchorEl: e.currentTarget,
      searchText: newValue,
      open: true
    });
  }

  onSelect(option) {
    let getter = label => label;
    if (this.props.labelGetter) getter = this.props.labelGetter;
    this.setState({searchText: getter(option), open: false});
  }

  handleBlur() {
    // this.setState({open: false});
  }

  handleFocus() {
    this.setState({open: true});
  }

  render() {
    const props = this.props;
    const state = this.state;
    let getter = label => label;
    let menu = props.options.map(
      (option, i) =>
        <MenuItem
          key={option + i}
          onTouchTap={_ => this.onSelect(option)}
          primaryText={option}
        />
      );
    if (props.maxSearchResults) {
      menu = menu.filter((option, i) => i < props.maxSearchResults);
    }
    console.log(state.open);

    return (
      <div>
        <TextField
        id='searchTextField'
        ref='searchTextField'
        autoComplete='off'
        onBlur={this.handleBlur}
        onFocus={this.handleFocus}
        onKeyDown={this.props.handleKeyDown}
        floatingLabelText={this.props.floatingLabelText}
        hintText={this.props.hintText}
        fullWidth={this.props.fullWidth}
        multiLine={false}
        value={state.searchText}
        onChange={this.onChange}
        />
        <Popover
        canAutoPosition={false}
        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        useLayerForClickAway={false}
        open={props.options.length > 0 && state.open}
        anchorEl={state.anchorEl}
        onRequestClose={this.handleRequestClose}
        animation={PopoverAnimationVertical}
        >
          <Menu>
            {menu}
          </Menu>
        </Popover>
        
      </div>
    );
  }
}

export default Autocomplete;
