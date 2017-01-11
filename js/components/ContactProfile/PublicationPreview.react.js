import React from 'react';
import {connect} from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';

const PublicationPreview = ({text, publication}) => {
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
        No such publication in our database. <RaisedButton label={`Add ${text} as Publication`} />
      </div>}
    </div>
    ) : null;
};

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
