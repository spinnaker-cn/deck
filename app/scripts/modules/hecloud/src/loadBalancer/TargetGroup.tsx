import * as React from 'react';
import { isEqual, orderBy } from 'lodash';
import { LoadBalancerInstances, LoadBalancerServerGroup, API, IServerGroup } from '@spinnaker/core';

import { IHeCloudApplicationLoadBalancer, ITargetGroup } from 'hecloud/domain/IHeCloudLoadBalancer';

import './targetGroup.less';

export interface ITargetGroupProps {
  loadBalancer: IHeCloudApplicationLoadBalancer;
  targetGroup: ITargetGroup;
  showServerGroups: boolean;
  showInstances: boolean;
  mark: number;
}

interface ITargetGroupState {
  serverGroups: IServerGroup[];
}

export class TargetGroup extends React.Component<ITargetGroupProps, ITargetGroupState> {
  constructor(props: ITargetGroupProps) {
    super(props);
    this.state = {
      serverGroups: [],
    };
  }
  public componentDidMount(): void {
    this.callApi();
  }

  public componentWillReceiveProps(nextProps: ITargetGroupProps): void {
    if (!isEqual(nextProps.mark, this.props.mark)) {
      this.callApi();
    }
  }

  callApi = () => {
    const {
      loadBalancer: { application, id },
    } = this.props;
    API.one('applications')
      .one(application)
      .all('serverGroups')
      .getList()
      .then((serverGroups: IServerGroup[]) => {
        this.setState({
          serverGroups: serverGroups
            .filter(sg => sg.loadBalancers && sg.loadBalancers[0] === id)
            .map(sg => ({
              ...sg,
              detachedInstances: [],
              instances: sg.instances.map(i => ({
                ...i,
                cloudProvider: sg.cloudProvider,
              })),
            })),
        });
      });
  };

  public render(): React.ReactElement<TargetGroup> {
    const { showInstances, showServerGroups } = this.props;
    const { serverGroups } = this.state;
    const ServerGroups = orderBy(serverGroups, ['isDisabled', 'name'], ['asc', 'desc']).map(serverGroup => (
      <LoadBalancerServerGroup
        key={serverGroup.name}
        account={serverGroup.account}
        region={serverGroup.region}
        serverGroup={serverGroup}
        showInstances={showInstances}
      />
    ));
    return (
      <div className="target-group-container container-fluid no-padding">
        {showServerGroups && ServerGroups}
        {!showServerGroups && showInstances && (
          <LoadBalancerInstances
            serverGroups={serverGroups}
            instances={serverGroups.reduce((a, c) => a.concat(c.instances), [])}
          />
        )}
      </div>
    );
  }
}
