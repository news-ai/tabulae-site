import React, {PropTypes, Component} from 'react';

import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import {List, CellMeasurer, WindowScroller, AutoSizer} from 'react-virtualized';

const styleEmptyRow = {
  padding: 10,
  marginTop: 20,
  marginBottom: 20,
};

class GenericFeed extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    this.props.fetchFeed();
  }
  
  render() {
    const props = this.props;
    const limitedHeightList = props.feed && (
      <CellMeasurer
      cellRenderer={({rowIndex, ...rest}) => props.rowRenderer({index: rowIndex, ...rest})}
      columnCount={1}
      rowCount={props.feed.length}
      width={props.containerWidth}
      >
      {({getRowHeight}) => (
        <List
        ref={ref => props.setRef(ref)}
        width={props.containerWidth || 500}
        height={props.containerHeight}
        rowCount={props.feed.length}
        rowHeight={getRowHeight}
        rowRenderer={props.rowRenderer}
        overscanRowCount={5}
        onScroll={args => {
          if (((args.scrollHeight - args.scrollTop) / args.clientHeight) < 2) props.fetchFeed();
        }}
        />)}
      </CellMeasurer>);
    const windowScrollableList = props.feed && (
       <WindowScroller>
        {({height, scrollTop}) => (
          <CellMeasurer
          cellRenderer={({rowIndex, ...rest}) => props.rowRenderer({index: rowIndex, ...rest})}
          columnCount={1}
          rowCount={props.feed.length}
          width={props.containerWidth}
          >
          {({getRowHeight}) => (
            <List
            ref={ref => props.setRef(ref)}
            width={props.containerWidth || 500}
            height={height}
            scrollTop={scrollTop}
            rowCount={props.feed.length}
            rowHeight={getRowHeight}
            rowRenderer={props.rowRenderer}
            overscanRowCount={5}
            onScroll={args => {
              if (((args.scrollHeight - args.scrollTop) / args.clientHeight) < 2) props.fetchFeed();
            }}
            />)}
          </CellMeasurer>
          )}
        </WindowScroller>);
    const renderNode = (
      <div>
        {props.feed
          && !props.didInvalidate
          && props.feed.length === 0
          && <div className='row' style={styleEmptyRow}><p>No {props.title} attached. Try clicking on 'Settings' to start seeing some headlines.</p></div>}
        {props.didInvalidate
          && <div className='row' style={styleEmptyRow}>
          <p>Something went wrong. Sorry about that. A bug has been filed. Check back in a while or use the bottom right chat button to leave us a message and we'll try to resolve this for you as fast as we can.</p>
          </div>
        }
        {props.feed && props.containerHeight && limitedHeightList}
        {props.feed && !props.containerHeight && windowScrollableList}
      </div>
      );
    
    return props.value === props.name ? renderNode : null;
  }
}

export default GenericFeed;
