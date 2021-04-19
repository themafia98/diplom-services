import { factory } from './Logger.utils';

const loggerInfoFactory = factory('info', undefined, false, false);
const loggerErrorFactory = factory('error', undefined, true, true);

export const loggerInfo = loggerInfoFactory.info.bind(loggerInfoFactory);
export const loggerError = loggerErrorFactory.error.bind(loggerErrorFactory);
