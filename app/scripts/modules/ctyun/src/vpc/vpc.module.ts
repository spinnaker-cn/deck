import { module } from 'angular';

export const VPC_MODULE = 'spinnaker.ctyun.vpc';
module(VPC_MODULE, [require('./vpcTag.directive').name]);
