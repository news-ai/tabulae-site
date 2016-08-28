import { PropTypes } from 'react';

export const listPropTypes = PropTypes.shape({
  id: PropTypes.number,
  type: PropTypes.string,
  createBy: PropTypes.number,
  created: PropTypes.string,
  updated: PropTypes.string,
  name: PropTypes.string,
  client: PropTypes.string,
  contacts: PropTypes.arrayOf(PropTypes.number),
  fieldsmap: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.string,
    customfield: PropTypes.bool,
    hidden: PropTypes.bool
  }))
});
