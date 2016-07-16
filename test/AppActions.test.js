// import expect from 'expect';
// import configureMockStore from 'redux-mock-store';
// import thunk from 'redux-thunk';
// import nock from 'nock';
// import * as loginActions from '../js/actions/loginActions';
// import * as types from '../js/constants/AppConstants';

// const middlewares = [ thunk ];
// const mockStore = confi

// describe('async actions', _ => {
// 	afterEach(_ => {
// 		nock.cleanAll();
// 	});

// 	it('creates RECEIVE_LOGIN when fetching person has been done', _ => {
// 		nock(`${CONTEXT_API_BASE}/users`)
// 		.get(`/me`)
// 		.reply(200, { body: {}});

// 		const expectedActions = [
// 		{ type: types.REQUEST_LOGIN },
// 		{ type: types.RECEIVE_LOGIN, body: {}}
// 		];

// 		const store = mockStore({});
// 		return store.dispatch(loginActions.fetchPerson())
// 		.then( _ => {
// 			expect(store.getActions()).toEqual(expectedActions);
// 		});
// 	})
// })
