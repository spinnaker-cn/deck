import { module } from 'angular';

import { HeNgReact } from './hecloud.ngReact';
import { HeReactInjector } from './hecloud.react.injector';

export const HECLOUD_REACT_MODULE = 'spinnaker.hecloud.react';
module(HECLOUD_REACT_MODULE, []).run([
  '$injector',
  function($injector: any) {
    // Make angular services importable and (TODO when relevant) convert angular components to react
    HeReactInjector.initialize($injector);
    HeNgReact.initialize($injector);
  },
]);
