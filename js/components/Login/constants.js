import { generateConstants } from '../../constants/generateConstants';
import { commonTypes } from '../../constants/AppConstants';

export const loginConstant = generateConstants(commonTypes, 'LOGIN');
export const SET_FIRST_TIME_USER = 'SET_FIRST_TIME_USER';
