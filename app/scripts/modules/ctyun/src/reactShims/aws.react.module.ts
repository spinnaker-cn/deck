import { module } from 'angular';

import { AwsNgReact } from './aws.ngReact';
import { AwsReactInjector } from './aws.react.injector';

export const CTYUN_REACT_MODULE = 'spinnaker.ctyun.react';
module(CTYUN_REACT_MODULE, []).run([
  '$injector',
  function($injector: any) {
    // Make angular services importable and (TODO when relevant) convert angular components to react
    AwsReactInjector.initialize($injector);
    AwsNgReact.initialize($injector);
  },
]);
