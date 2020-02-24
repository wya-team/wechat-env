import connect from './connect';
import { Store } from './core';
import { mapActions } from './helper';
import createLogger from './plugins/logger';

export default connect;
export { Store, mapActions, createLogger };