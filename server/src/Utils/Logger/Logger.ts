import { factory } from './Logger.utils';

export const loggerInfo = factory('info', false, false).info;
export const loggerError = factory('error', true, true).error;
