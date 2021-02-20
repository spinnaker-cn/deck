import { module } from 'angular';

import { HuaweiNgReact } from './huaweicloud.ngReact';
import { HuaweiReactInjector } from './huaweicloud.react.injector';

export const HUAWEICLOUD_REACT_MODULE = 'spinnaker.huaweicloud.react';
module(HUAWEICLOUD_REACT_MODULE, []).run([
  '$injector',
  function($injector: any) {
    // Make angular services importable and (TODO when relevant) convert angular components to react
    HuaweiReactInjector.initialize($injector);
    HuaweiNgReact.initialize($injector);
  },
]);
