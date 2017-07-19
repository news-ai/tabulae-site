import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import Popover, {PopoverAnimationVertical} from 'material-ui/Popover';
import MenuItem from 'material-ui/MenuItem';
import Menu from 'material-ui/Menu';
import debounce from 'lodash/debounce';

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
    this.setState({
      anchorEl: e.currentTarget,
      searchText: newValue,
    }, debounce(_ => this.props.onInputUpdate(newValue), 300));
    debounce(_ => {
      if (this.state.searchText.length > 0) this.setState({open: true}, _ => this.handleFocus());
    }, 500)();
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
    // this.setState({open: true});
    // console.log('focus');
    this.searchTextField.focus();
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

    return (
      <div>
        <TextField
        id='searchTextField'
        ref={ref => this.searchTextField = ref}
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
