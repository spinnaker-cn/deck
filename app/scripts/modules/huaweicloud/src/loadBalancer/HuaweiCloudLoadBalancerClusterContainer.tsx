import * as React from 'react';
import { isEqual } from 'lodash';

import { ILoadBalancerClusterContainerProps, LoadBalancerClusterContainer } from '@spinnaker/core';

import { IHuaweiCloudApplicationLoadBalancer } from '../domain/IHuaweiCloudLoadBalancer';
import { TargetGroup } from './TargetGroup';

export class HuaweiCloudLoadBalancerClusterContainer extends React.Component<ILoadBalancerClusterContainerProps> {
  public shouldComponentUpdate(nextProps: ILoadBalancerClusterContainerProps) {
    const serverGroupsDiffer = () =>
      !isEqual((nextProps.serverGroups || []).map(g => g.name), (this.props.serverGroups || []).map(g => g.name));
    const targetGroupsDiffer = () =>
      !isEqual(
        ((nextProps.loadBalancer as IHuaweiCloudApplicationLoadBalancer).targetGroups || []).map(t => t.name),
        ((this.props.loadBalancer as IHuaweiCloudApplicationLoadBalancer).targetGroups || []).map(t => t.name),
      );
    return (
      nextProps.showInstances !== this.props.showInstances ||
      nextProps.showServerGroups !== this.props.showServerGroups ||
      nextProps.loadBalancer !== this.props.loadBalancer ||
      serverGroupsDiffer() ||
      targetGroupsDiffer()
    );
  }

  public render(): React.ReactElement<HuaweiCloudLoadBalancerClusterContainer> {
    const { loadBalancer, showInstances, showServerGroups } = this.props;
    const alb = loadBalancer as IHuaweiCloudApplicationLoadBalancer;
    const ServerGroups = alb.serverGroups ? alb.serverGroups.map(serverGroup => {
      return (
        <TargetGroup
          key={serverGroup.name}
          loadBalancer={loadBalancer as IHuaweiCloudApplicationLoadBalancer}
          serverGroup={serverGroup}
          showInstances={showInstances}
          showServerGroups={showServerGroups}
        />
      );
    }) : [];
    return <div className="cluster-container">{ServerGroups}</div>;
  }
}
