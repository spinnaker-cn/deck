import { module } from 'angular';

import { AWS_FOOTER_COMPONENT } from './footer.component';

export const COMMON_MODULE = 'spinnaker.ecloud.common';
module(COMMON_MODULE, [AWS_FOOTER_COMPONENT]);
