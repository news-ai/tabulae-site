import React, {Component} from 'react';
import {connect} from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import {blue50, grey800, grey600} from 'material-ui/styles/colors';

const PreviewItem = ({name, url}) => (
  <div
  style={{
    backgroundColor: blue50,
    margin: 5,
    padding: 10
  }}>
    <div className='row'>
      <span style={{fontWeight: 'bold'}}>{name}</span>
    </div>
    <div className='row'>
      {url ?
        <span style={{color: grey800, fontSize: '0.9em'}}>{url}</span> :
        <span className='pointer' style={{color: grey600, fontSize: '0.9em'}}>No website url added for this publication. Add one?</span>}
    </div>
  </div>
  );

class PublicationPreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  render() {
    const props = this.props;
    const state = this.state;
    return props.text.length > 0 ? (
      <div>
        {props.publication ?
          <div>
          <span style={{fontSize: '0.9em'}}>Selected:</span>
          <PreviewItem {...props.publication}/>
        </div> : <div>
          {!state.open &&
            <div>
              No such publication in our database.
              <RaisedButton
              label='Add'
              onClick={props.onOpenForm}
              />
            </div>}
        </div>}
      </div>) : null;
  }
}

const mapStateToProps = (state, props) => {
  const pubId = state.publicationReducer[props.text];
  return {
    publication: pubId ? state.publicationReducer[pubId] : undefined
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(PublicationPreview);
