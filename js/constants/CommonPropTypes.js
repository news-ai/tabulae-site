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

export const contactPropTypes = {
  blog: PropTypes.string.isRequired,
  created: PropTypes.string.isRequired,
  createdby: PropTypes.number.isRequired,
  customfields: PropTypes.array,
  email: PropTypes.string.isRequired,
  emailbounced: PropTypes.bool.isRequired,
  employers: PropTypes.array,
  id: PropTypes.number.isRequired,
  instagram: PropTypes.string.isRequired,
  ismastercontact: PropTypes.bool.isRequired,
  isoutdated: PropTypes.bool.isRequired,
  lastname: PropTypes.string.isRequired,
  linkedin: PropTypes.string.isRequired,
  linkedinupdated: PropTypes.string.isRequired,
  listid: PropTypes.number.isRequired,
  notes: PropTypes.string.isRequired,
  parent: PropTypes.number.isRequired,
  pastemployers: PropTypes.string,
  twitter: PropTypes.string.isRequired,
  website: PropTypes.string.isRequired
};
