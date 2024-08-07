import * as React from 'react';
import { chain, find } from 'lodash';
import { UISref } from '@uirouter/react';

import { CollapsibleSection, ISecurityGroup, FirewallLabels } from '@spinnaker/core';

import { IAmazonServerGroupDetailsSectionProps } from './IAmazonServerGroupDetailsSectionProps';

export interface ISecurityGroupsDetailsSectionState {
  securityGroups: ISecurityGroup[];
}

export class SecurityGroupsDetailsSection extends React.Component<
  IAmazonServerGroupDetailsSectionProps,
  ISecurityGroupsDetailsSectionState
> {
  constructor(props: IAmazonServerGroupDetailsSectionProps) {
    super(props);

    this.state = { securityGroups: this.getSecurityGroups(props) };
  }

  private getSecurityGroups(props: IAmazonServerGroupDetailsSectionProps): ISecurityGroup[] {
    let securityGroups: ISecurityGroup[];
    const { app, serverGroup } = props;
    if (props.serverGroup.launchConfig && serverGroup.launchConfig.securityGroupIds) {
      securityGroups = chain(serverGroup.launchConfig.securityGroupIds)
        .map((id: string) => {
          return (
            find(app.securityGroups.data, { accountName: serverGroup.account, region: serverGroup.region, id }) ||
            find(app.securityGroups.data, { accountName: serverGroup.account, region: serverGroup.region, name: id })
          );
        })
        .compact()
        .value();
    }

    return securityGroups;
  }

  public componentWillReceiveProps(nextProps: IAmazonServerGroupDetailsSectionProps): void {
    this.setState({ securityGroups: this.getSecurityGroups(nextProps) });
  }

  public render(): JSX.Element {
    const { serverGroup } = this.props;
    const { securityGroups } = this.state;
    return (
      <CollapsibleSection heading={FirewallLabels.get('Firewalls')}>
        <ul>
          {securityGroups && securityGroups.map(sg => (
            <li key={sg.id}>
              <UISref
                to="^.firewallDetails"
                params={{
                  name: sg.name,
                  accountId: serverGroup.accountName,
                  region: serverGroup.region,
                  vpcId: serverGroup.asg.vpcId,
                  provider: serverGroup.type,
                }}
              >
                <a>
                {sg.name} ({sg.id})
                </a>
              </UISref>
            </li>
          ))}
        </ul>
      </CollapsibleSection>
    );
  }
}
