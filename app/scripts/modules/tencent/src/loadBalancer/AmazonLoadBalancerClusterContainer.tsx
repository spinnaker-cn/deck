import * as React from 'react';
import { isEqual } from 'lodash';

import { ILoadBalancerClusterContainerProps, LoadBalancerClusterContainer } from '@spinnaker/core';

import { IAmazonApplicationLoadBalancer } from '../domain/IAmazonLoadBalancer';
import { TargetGroup } from './TargetGroup';

export class AmazonLoadBalancerClusterContainer extends React.Component<ILoadBalancerClusterContainerProps> {
  public shouldComponentUpdate(nextProps: ILoadBalancerClusterContainerProps) {
    const serverGroupsDiffer = () =>
      !isEqual((nextProps.serverGroups || []).map(g => g.name), (this.props.serverGroups || []).map(g => g.name));
    const targetGroupsDiffer = () =>
      !isEqual(
        ((nextProps.loadBalancer as IAmazonApplicationLoadBalancer).targetGroups || []).map(t => t.name),
        ((this.props.loadBalancer as IAmazonApplicationLoadBalancer).targetGroups || []).map(t => t.name),
      );
    return (
      nextProps.showInstances !== this.props.showInstances ||
      nextProps.showServerGroups !== this.props.showServerGroups ||
      nextProps.loadBalancer !== this.props.loadBalancer ||
      serverGroupsDiffer() ||
      targetGroupsDiffer()
    );
  }

  public render(): React.ReactElement<AmazonLoadBalancerClusterContainer> {
    const { loadBalancer, showInstances, showServerGroups } = this.props;
    const alb = loadBalancer as IAmazonApplicationLoadBalancer;
    const ServerGroups = alb.serverGroups ? alb.serverGroups.map(serverGroup => {
      return (
        <TargetGroup
          key={serverGroup.name}
          loadBalancer={loadBalancer as IAmazonApplicationLoadBalancer}
          serverGroup={serverGroup}
          showInstances={showInstances}
          showServerGroups={showServerGroups}
        />
      );
    }) : [];
    return <div className="cluster-container">{ServerGroups}</div>;
  }
}
