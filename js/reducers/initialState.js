export const initialState = {
  personReducer: {
    isReceiving: false,
    didInvalidate: false
  },
  contactReducer: {
    isReceiving: false
  },
  listReducer: {
    isReceiving: false,
    tempNewList: [],
    lists: []
  },
  stagingReducer: {
    isReceiving: false,
    previewEmails: []
  },
  publicationReducer: {
    isReceiving: false
  }
};
