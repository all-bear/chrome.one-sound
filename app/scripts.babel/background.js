'use strict';

import {chain} from './lib/adapter-chain';
import {DEFAULT_SETTINGS} from './lib/helper/default-settings'
import {Settings} from '../bower_components/chrome-lib-settings/dist/js/settings'

Settings.defaults = DEFAULT_SETTINGS;
chain.init();
