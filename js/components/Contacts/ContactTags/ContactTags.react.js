import React, {Component} from 'react';
import {connect} from 'react-redux';
import {List, AutoSizer, CellMeasurer, WindowScroller} from 'react-virtualized';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import withRouter from 'react-router/lib/withRouter';
import ContactItem from 'components/Search/ContactItem.react';
import * as actions from './actions';

class ContactTags extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.rowRenderer = this._rowRenderer.bind(this);
    this._listRef = this._listRef.bind(this);
    this._listCellMeasurerRef = this._listCellMeasurerRef.bind(this);
    this.cellRenderer = ({rowIndex, ...rest}) => this.rowRenderer({index: rowIndex, ...rest});
    window.onresize = () => {
      if (this._list) {
        this._listCellMeasurer.resetMeasurements();
        this._list.recomputeRowHeights();
      }
    };
  }

  componentWillMount() {
    if (this.props.tag) this.props.fetchContactsByTag();
    setTimeout(_ => {
      if (this._list) {
        this._listCellMeasurer.resetMeasurements();
        this._list.recomputeRowHeights();
      }
    }, 2000);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.tag !== nextProps.tag) {
      nextProps.fetchContactsByTag();
    }
  }

  componentWillUnmount() {
    window.onresize = undefined;
  }

  _listRef(ref) {
    this._list = ref;
  }

  _listCellMeasurerRef(ref) {
    this._listCellMeasurer = ref;
  }

  _rowRenderer({key, index, isScrolling, isVisible, style}) {
    const rightNow = new Date();
    const contact = this.props.contacts[index];
    const renderNode = <ContactItem {...contact}/>

    return (
      <div style={style} key={key}>
      {renderNode}
      </div>);
  }

  render() {
    const props = this.props;
    const state = this.state;
    console.log(props.contacts);
    return (
      <div>
        CONTACT PAGE
        <WindowScroller>
        {({height, isScrolling, scrollTop}) =>
          <AutoSizer disableHeight>
            {({width}) =>
              <CellMeasurer
              ref={this._listCellMeasurerRef}
              cellRenderer={this.cellRenderer}
              columnCount={1}
              rowCount={props.contacts.length}
              width={width}
              >
              {({getRowHeight}) =>
                <List
                ref={this._listRef}
                autoHeight
                width={width}
                height={height}
                rowHeight={getRowHeight}
                rowCount={props.contacts.length}
                rowRenderer={this.rowRenderer}
                scrollTop={scrollTop}
                isScrolling={isScrolling}
                />
              }
              </CellMeasurer>
            }
            </AutoSizer>
          }
        </WindowScroller>
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  const tag = props.router.location.query.tag;
  let contacts = [];
  console.log(state.contactTagReducer[tag]);
  if (tag && state.contactTagReducer[tag]) {
    contacts = state.contactTagReducer[tag].received.map(id => state.contactReducer[id]);
  }
  return {
    contacts,
    tag,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const tag = props.router.location.query.tag;
  return {
    fetchContactsByTag: _ => dispatch(actions.fetchContactsByTag(tag)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ContactTags));
