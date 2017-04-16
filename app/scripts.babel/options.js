'use strict';

import {DEFAULT_SETTINGS} from './lib/helper/default-settings';
import {InlineI18n} from '../bower_components/chrome-lib-inline-i18n/dist/js/i18n';
import {Settings} from '../bower_components/chrome-lib-settings/dist/js/settings';
import {SettingsUI} from '../bower_components/chrome-lib-settings/dist/js/settings-ui';

Settings.defaults = DEFAULT_SETTINGS;
SettingsUI.init();
InlineI18n.render();
