export const initialState = {
  personReducer: {
    isReceiving: false,
    didInvalidate: false
  },
  contactReducer: {
    isReceiving: false,
    didInvalidate: false
  },
  listReducer: {
    isReceiving: false,
    didInvalidate: false,
    tempNewList: [],
    lists: []
  },
  stagingReducer: {
    isReceiving: false,
    didInvalidate: false,
    previewEmails: []
  },
  publicationReducer: {
    isReceiving: false,
    didInvalidate: false
  },
  fileReducer: {
    isReceiving: false,
    didInvalidate: false,
    isProcessWaiting: false
  }
};
