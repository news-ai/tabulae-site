import React, {Component} from 'react';
import {connect} from 'react-redux';
import {List, AutoSizer, CellMeasurer, CellMeasurerCache, WindowScroller} from 'react-virtualized';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import ContactItemContainer from './ContactItemContainer.jsx';

// NO NEED FOR VIRTUALIZED IF PAGINATED
const cache = new CellMeasurerCache({fixedWidth: true});

class ContactTags extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.rowRenderer = this._rowRenderer.bind(this);
    this._listRef = this._listRef.bind(this);
    this.cellRenderer = ({rowIndex, ...rest}) => this.rowRenderer({index: rowIndex, ...rest});
    this.onResize = _ => {
      if (this._list) {
        this._list.recomputeRowHeights();
      }
    };
    window.onresize = _ => {
      this.onResize();
    }
  }

  componentWillMount() {
    if (this.props.tag) this.props.fetchContactsByTag();
    setTimeout(_ => this.onResize(), 3000);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selected.length !== this.props.selected.length) {
      this._list.forceUpdateGrid();
    }

    if (nextProps.contacts !== this.props.contacts) {
      console.log('hit not the smae');
      this.onResize();
    }
  }

  componentWillUnmount() {
    window.onresize = undefined;
  }

  _listRef(ref) {
    this._list = ref;
  }

  _rowRenderer({key, index, isScrolling, isVisible, style}) {
    const contact = this.props.contacts[index];
    const checked = this.props.selected.some(contactId => contactId === contact.id);
    const renderNode = <ContactItemContainer index={index} checked={checked} onSelect={this.props.onSelect} {...contact}/>

    return (
      <div style={Object.assign({}, style, {padding: 5})} key={key}>
      {renderNode}
      </div>);
  }

  render() {
    const props = this.props;
    const state = this.state;
    // console.log(props.contacts);
    return (
        <WindowScroller>
        {({height, isScrolling, scrollTop}) =>
          <AutoSizer disableHeight>
            {({width}) =>
              <List
              ref={this._listRef}
              autoHeight
              width={width}
              height={height}
              rowHeight={cache.rowHeight}
              rowCount={props.contacts.length}
              deferredMeasurementCache={cache}
              rowRenderer={rowProps => (
                <CellMeasurer
                cache={cache}
                columnIndex={0}
                key={rowProps.key}
                parent={rowProps.parent}
                rowIndex={rowProps.rowIndex}
                >
                {this.rowRenderer(rowProps)}
                </CellMeasurer>)
              }
              scrollTop={scrollTop}
              isScrolling={isScrolling}
              />
            }
            </AutoSizer>
          }
        </WindowScroller>
      );
  }
}
export default ContactTags;
