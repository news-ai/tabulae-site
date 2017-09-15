import React, {Component} from 'react';
import MenuItem from 'material-ui/MenuItem';
import find from 'lodash/find';
import DropDownMenu from 'material-ui/DropDownMenu';
import TextField from 'material-ui/TextField';
import findAllFontSizesInSelection from 'components/Email/EmailPanel/editorUtils/findAllFontSizesInSelection';

const PLACEHOLDER = '---';
const FONT_PREFIX = 'SIZE-';

class FontSizeControls extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      value: ''
    };
    this.onChange = e => this.setState({value: e.target.value});
    this.onKeyDown = e => {
      if (e.keyCode === 13) this.onSubmit();
    };
    this.onSubmit = e => {
      const value = parseFloat(this.state.value);
      if (!value) this.setState({value: '', show: false});
      const selectStyle = `SIZE-${value}`;
      this.props.onToggle(selectStyle);
      this.setState({value: '', show: false});
    }
  }

  render() {
    const props = this.props;
    const {inlineStyles} = props;
    const currentFontSizes = findAllFontSizesInSelection(props.editorState);
    let value = '10.5';
    let currentType = {label: '10.5', value: 'SIZE-10.5'};
    // filling in custom sizing to dropdown from pasted HTML if found
    const leftover = currentFontSizes
    .map(font => font.split(FONT_PREFIX)[1])
    .filter(size => inlineStyles.filter(style => style.label === size).length === 0);
    const inlineStylesWithExtraStyles = [
    ...inlineStyles,
    ...leftover.map(size => ({inlineType: 'size', label: size, style: `SIZE-${size}`}))
    ].sort((a, b) => parseFloat(a.label) - parseFloat(b.label));
    
    if (currentFontSizes.length > 1) {
      // more than one fontSize selected
      value = PLACEHOLDER;
      currentType = undefined;
    } else if (currentFontSizes.length === 1) {
      currentType = find(inlineStylesWithExtraStyles, type => currentFontSizes[0] === type.style);
      value = currentType.label;
    }

    const menuItems = [
      <MenuItem
      key={`fontsize-select-default`}
      value={PLACEHOLDER}
      labelStyle={{paddingLeft: 0}}
      primaryText={PLACEHOLDER}
      label={PLACEHOLDER}
      />,
      <MenuItem
      key={`fontsize-select-custom`}
      value='custom'
      labelStyle={{paddingLeft: 0}}
      primaryText='Custom'
      label='Custom Size'
      />,
      ...inlineStylesWithExtraStyles.map(type =>
        <MenuItem
        key={`fontsize-select-${type.label}`}
        value={type.label}
        primaryText={type.label}
        label={type.label}
        />)
    ];

    const renderNodes = this.state.show ? (
      <TextField
      id='fontsize-custom'
      value={this.state.value}
      onChange={this.onChange}
      onKeyDown={this.onKeyDown}
      onBlur={this.onSubmit}
      style={{width: 23}}
      />
      ) : (
        <DropDownMenu
        style={{fontSize: '0.9em'}}
        underlineStyle={{display: 'none', margin: 0}}
        value={value}
        onChange={(e, index, newValue) => {
          if (newValue === '---') return;
          if (newValue === 'custom') {
            this.setState({show: true});
            return;
          }
          const selectStyle = `SIZE-${newValue}`;
          props.onToggle(selectStyle);
        }}
        >
        {menuItems}
        </DropDownMenu>
      );

    return renderNodes;
  }
}

export default FontSizeControls;

