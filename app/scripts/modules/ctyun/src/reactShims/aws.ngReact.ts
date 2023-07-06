import * as React from 'react';
import { angular2react } from 'angular2react';
import IInjectorService = angular.auto.IInjectorService;

import { ReactInject } from '@spinnaker/core';

import { scalingPolicyDetailsSummary } from 'ctyun/serverGroup/details/scalingPolicy/detailsSummary.component';
import { IScalingPolicySummaryProps } from 'ctyun/serverGroup/details/scalingPolicy/ScalingPolicySummary';
import { IViewScalingActivitiesLinkProps } from 'ctyun/serverGroup/details/scalingActivities/ViewScalingActivitiesLink';
import { viewScalingActivitiesLink } from 'ctyun/serverGroup/details/scalingActivities/viewScalingActivitiesLink.component';

// prettier-ignore
export class AwsNgReactInjector extends ReactInject {
  public $injectorProxy = {} as IInjectorService;

  // Reactified components
  public ScalingPolicySummary: React.ComponentClass<IScalingPolicySummaryProps> = angular2react('ctyunScalingPolicySummary', scalingPolicyDetailsSummary, this.$injectorProxy) as any;
  public ViewScalingActivitiesLink: React.ComponentClass<IViewScalingActivitiesLinkProps> = angular2react('viewScalingActivitiesLink', viewScalingActivitiesLink, this.$injectorProxy) as any;
  

  public initialize($injector: IInjectorService) {
    const realInjector: { [key: string]: Function } = $injector as any;
    const proxyInjector: { [key: string]: Function } = this.$injectorProxy as any;

    Object.keys($injector)
      .filter(key => typeof realInjector[key] === 'function')
      .forEach(key => proxyInjector[key] = realInjector[key].bind(realInjector));
  }
}

export const AwsNgReact = new AwsNgReactInjector();
