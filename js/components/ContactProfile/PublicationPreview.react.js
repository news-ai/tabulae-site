import React, {Component} from 'react';
import {connect} from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';

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
    const {text, publication} = props;
    return text.length > 0 ? (
      <div>
        {publication ? <div>
          <div>
            NAME: {publication.name}
          </div>
          <div>
            URL: {publication.url}
          </div>
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
