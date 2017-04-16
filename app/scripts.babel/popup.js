'use strict';

import {chainUi} from './lib/ui/adapter-chain';
import {DEFAULT_SETTINGS} from './lib/helper/default-settings';
import {Settings} from '../bower_components/chrome-lib-settings/dist/js/settings';

Settings.defaults = DEFAULT_SETTINGS;
chainUi.init();
