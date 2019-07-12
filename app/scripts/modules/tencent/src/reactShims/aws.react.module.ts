import { module } from 'angular';

import { AwsNgReact } from './aws.ngReact';
import { AwsReactInjector } from './aws.react.injector';

export const TENCENT_REACT_MODULE = 'spinnaker.tencent.react';
module(TENCENT_REACT_MODULE, []).run([
  '$injector',
  function($injector: any) {
    // Make angular services importable and (TODO when relevant) convert angular components to react
    AwsReactInjector.initialize($injector);
    AwsNgReact.initialize($injector);
  },
]);
