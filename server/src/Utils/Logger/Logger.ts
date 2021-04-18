import { factory } from './Logger.utils';

const loggerInfoFactory = factory('info', false, false);
const loggerErrorFactory = factory('error', true, true);

export const loggerInfo = loggerInfoFactory.info.bind(loggerInfoFactory);
export const loggerError = loggerErrorFactory.error.bind(loggerErrorFactory);
