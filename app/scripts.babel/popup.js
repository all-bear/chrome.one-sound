'use strict';

import {chainUi} from './lib/ui/adapter-chain';

chainUi.init();

setInterval(() => {
  chainUi.reloadChain();
}, 300);
