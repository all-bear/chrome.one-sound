'use strict';

import {repository} from './lib/adapter-repository';
import {DEFAULT_SETTINGS} from './lib/helper/default-settings';
import {Settings} from '../bower_components/chrome-lib-settings/dist/js/settings'

Settings.defaults = DEFAULT_SETTINGS;
repository.init();