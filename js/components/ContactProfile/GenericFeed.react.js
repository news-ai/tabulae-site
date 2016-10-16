import React, {PropTypes, Component} from 'react';

import RaisedButton from 'material-ui/RaisedButton';
import {List, CellMeasurer, WindowScroller, AutoSizer} from 'react-virtualized';

const styleEmptyRow = {
  padding: 10,
  marginTop: 20,
  marginBottom: 50,
};

class GenericFeed extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.setRef = ref => {
      this._GenericFeed = ref;
    };
  }

  componentWillMount() {
    this.props.fetchFeed();
  }

  
  render() {
    const props = this.props;
    const renderNode = (
      <div>
        {props.feed
          && !props.didInvalidate
          && props.feed.length === 0
          && <div className='row' style={styleEmptyRow}><p>No {props.title} attached. Try clicking on 'Settings' to start seeing some headlines.</p></div>}
        {props.feed &&
          <WindowScroller>
          {({height, scrollTop}) => (
            <CellMeasurer
            cellRenderer={({rowIndex, ...rest}) => props.rowRenderer({index: rowIndex, ...rest})}
            columnCount={1}
            rowCount={props.feed.length}
            >
            {({getRowHeight}) => (
              <List
              ref={ref => props.setRef(ref)}
              width={props.containerWidth}
              height={height}
              scrollTop={scrollTop}
              rowCount={props.feed.length}
              rowHeight={getRowHeight}
              rowRenderer={props.rowRenderer}
              onScroll={(args) => {
                if (((args.scrollHeight - args.scrollTop) / args.clientHeight) < 2) props.fetchFeed();
              }}
              />)}
            </CellMeasurer>
            )}
          </WindowScroller>}
        {props.didInvalidate
          && <div className='row' style={styleEmptyRow}><p>Something went wrong. Sorry about that. A bug has been filed. Check back in a while or use the bottom right Interm button to reach out and we'll try to resolve this for you.</p></div>}
        {props.offset !== null && <div className='horizontal-center'>
        <RaisedButton label='Load more' onClick={_ => this.props.fetchFeed()} />
        </div>}
      </div>
      );
    return props.value === props.name ? renderNode : null;
  }
}

export default GenericFeed;
