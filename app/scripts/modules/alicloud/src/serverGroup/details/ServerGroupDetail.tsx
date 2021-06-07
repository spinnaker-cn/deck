'use strict';
import * as React from 'react';
import { Spinner, CollapsibleSection, AccountTag, ServerGroupWarningMessageService, ReactInjector } from '@spinnaker/core';
import { AlicloudReScalingServerGroupModal } from './reScalingGroup/AlicloudReScalingServerGroupModal';
import { AlicloudResizeServerGroupModal } from './resize/AlicloudResizeServerGroupModal';
import { AlicloudRollbackServerGroupModal } from './rollback/AlicloudRollbackServerGroupModal';
import { AlicloudUpdateServerGroupModal } from './updateSecurityGroup/AlicloudUpdateServerGroupModal'
import * as _ from 'lodash';
const { $uibModal }: any = require('@uirouter/angularjs').default;

export class ServerGroupDetail extends React.Component {
    constructor(props: any) {
        super(props);
        this.state = { loading: true };
    };

    private enableServerGroup = () => {
        const { serverGroup, app }: any = this.props;
        serverGroup.scalingGroupName = serverGroup.serverGroupName
        const serverGroups = serverGroup;
        const taskMonitor = {
          application: app,
          title: 'Enabling ' + serverGroup.name,
        };
        const submitMethod = (params: any) => {
          return ReactInjector.serverGroupWriter.enableServerGroup(
            serverGroups,
            app,
            params,
          );
        };
        ReactInjector.confirmationModalService.confirm({
          header: 'Really enable ' + serverGroup.name + '?',
          buttonText: 'Enable ' + serverGroup.name,
          account: serverGroup.account,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
    };

    private cloneServerGroup = () => {
        const { serverGroup, app }: any = this.props;
        serverGroup.scalingGroupName = serverGroup.serverGroupName;
        serverGroup.application = serverGroup.result.application;
        serverGroup.credentials = serverGroup.result.account;
        serverGroup.region = serverGroup.result.regionId;
        serverGroup.scalingGroupName = serverGroup.moniker.cluster;
        serverGroup.name = serverGroup.moniker.cluster;
        serverGroup.minSize = serverGroup.capacity.min;
        serverGroup.maxSize = serverGroup.capacity.max;
        serverGroup.desired = serverGroup.capacity.desired;
        serverGroup.defaultCooldown = serverGroup.result.scalingGroup.defaultCooldown;
        serverGroup.cloudProvider = serverGroup.result.provider;
        serverGroup.selectedProvider = serverGroup.result.provider;
        serverGroup.loadBalancerIds = serverGroup.result.scalingGroup.loadBalancerIds;
        serverGroup.freeFormDetails = serverGroup.detail;
        serverGroup.viewState = {
          'mode': 'create'
        };
        serverGroup.source = {
          'asgName': serverGroup.moniker.cluster
        };
        serverGroup.vSwitchId = serverGroup.result.scalingGroup.vswitchId;
        serverGroup.vSwitchName = serverGroup.result.scalingGroup.vswitchName;
        serverGroup.systemDiskCategory = serverGroup.result.scalingConfiguration.systemDiskCategory;
        serverGroup.systemDiskSize = serverGroup.result.scalingConfiguration.systemDiskSize;
        serverGroup.scalingConfigurations = serverGroup.result.scalingConfiguration;
        const tags: any = {};
        serverGroup.scalingConfigurations.tags = serverGroup.scalingConfigurations.tags.map((item: any) => {
          const key: string = item.key;
          tags[key] = item.value;
          return tags;
        })
        serverGroup.scalingConfigurations.multiAZPolicy = serverGroup.result.scalingGroup.multiAZPolicy;
        serverGroup.scalingConfigurations.scalingPolicy = serverGroup.result.scalingGroup.scalingPolicy;
        const serverGroups = serverGroup;
        const taskMonitor = {
          application: app,
          title: 'Clone ' + serverGroup.name,
        };
        const submitMethod = () => ReactInjector.serverGroupWriter.cloneServerGroup(serverGroups, app);
        const confirmationModalParams = {
          header: 'Really clone ' + serverGroup.name + '?',
          buttonText: 'Clone ' + serverGroup.name,
          account: serverGroup.account,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        };
        ReactInjector.confirmationModalService.confirm(confirmationModalParams);
    };

    private resizeServerGroup = () => {
        const { serverGroup, app }: any = this.props;
        const serverGroups  = serverGroup;
        AlicloudResizeServerGroupModal.show({ application: app, serverGroup: serverGroups });
    };

    private disableServerGroup = () => {
        const { serverGroup, app }: any = this.props;
        const taskMonitor = {
          application: app,
          title: 'Disabling ' + serverGroup.name,
        };
        if (serverGroup.instanceCounts) {
          serverGroup.instanceCounts = {
            'up': 1
          }
        }
        const submitMethod = () => ReactInjector.serverGroupWriter.disableServerGroup(serverGroup, app);
        const confirmationModalParams = {
          header: 'Really disable ' + serverGroup.name + '?',
          buttonText: 'Disable ' + serverGroup.name,
          account: serverGroup.account,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        };
        ReactInjector.confirmationModalService.confirm(confirmationModalParams);
    };

    private rollbackServerGroup = () => {
        const { serverGroup, app }: any = this.props;
        const serverGroups = serverGroup;
        const cluster = _.find(app.clusters, {
          name: serverGroups.cluster,
          account: serverGroups.account,
          serverGroups: [],
        });
        const disableServerGroups =  _.filter(cluster.serverGroups, { isDisabled: true, region: serverGroups.region });
        AlicloudRollbackServerGroupModal.show({ application: app, serverGroup: serverGroups, disabledServerGroups: disableServerGroups, });
    };
    private reScalingGroupServerGroup = () => {
        const { serverGroup, app }: any = this.props;
        const serverGroups = serverGroup;
        AlicloudReScalingServerGroupModal.show({ application: app, serverGroup: serverGroups });
    }

    private destroyServerGroup = () => {
        const { serverGroup, app }: any = this.props;
        const serverGroups = serverGroup;
        const { $state }: any = ReactInjector;
        const taskMonitor = {
          application: app,
          title: 'Destroying ' + serverGroup.name,
        };
        const submitMethod = function() {
          return ReactInjector.serverGroupWriter.destroyServerGroup(serverGroups, app);
        };
        const stateParams = {
          name: serverGroup.name,
          accountId: serverGroup.account,
          region: serverGroup.region,
        };
        const confirmationModalParams = {
          header: 'Really destroy ' + serverGroup.name + '?',
          buttonText: 'Destroy ' + serverGroup.name,
          account: serverGroup.account,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
          onTaskComplete: function() {
            if ($state.includes('**.serverGroup', stateParams)) {
              $state.go('^');
            }
          },
        };
        ServerGroupWarningMessageService.addDestroyWarningMessage(app, serverGroup, confirmationModalParams);
        ReactInjector.confirmationModalService.confirm(confirmationModalParams);
    };

    private updateSecurityGroupServerGroup = () => {
        const { serverGroup, app }: any = this.props;
        const serverGroups = serverGroup;
        AlicloudUpdateServerGroupModal.show({ application: app, serverGroup: serverGroups });
    };

    private updateLaunchConfigServerGroup = () => {
        const { serverGroup, app }: any = this.props;
        const serverGroups = serverGroup;
        $uibModal.open({
          templateUrl: require('./updateLaunchConfig/updateLaunchConfigServerGroup.html'),
          controller: 'alicloudUpdateLaunchConfigServerGroupCtrl as ctrl',
          resolve: {
            serverGroup: () => serverGroups,
            application: () => app,
          },
        });
    };

    public render() {
        const { serverGroup }: any = this.props;
        const { loading }: any = this.state;
        return (
            <div className={`"details-panel", ${serverGroup.isDisabled} ? "disabled" : null`} >
                {loading ? (
                        <div className="header">
                            <div className="close-button">
                                <a className="btn btn-link" ui-sref="^">
                                    <span className="glyphicon glyphicon-remove"/>
                                </a>
                            </div>
                            <div className="horizontal center middle">
                                <Spinner size="small"/>
                            </div>
                        </div>
                    ) : (
                    <>
                    <div className="header">
                        <div className="close-button">
                            <a className="btn btn-link" ui-sref="^">
                                <span className="glyphicon glyphicon-remove"/>
                            </a>
                        </div>
                        <div className="header-text horizontal middle">
                            <span className="glyphicon glyphicon-th"/>
                            <h3 className="horizontal middle space-between flex-1">
                                {serverGroup.name}
                            </h3>
                        </div>
                        <div className={`"actions" ${serverGroup.insightActions.length} > 0 ? "insights" : null`} >
                            <div className="dropdown">
                                <button type="button" className="btn btn-sm btn-primary dropdown-toggle">
                                Server Group Actions <span className="caret"/>
                                </button>
                                <ul className="dropdown-menu" role="menu">
                                    <li><a onClick={this.rollbackServerGroup}>Rollback</a></li>
                                    {serverGroup.isDisabled ? (
                                        <li><a onClick={this.enableServerGroup}>Enable</a></li>
                                    ) : (
                                        <>
                                        <li><a onClick={this.cloneServerGroup}>Clone</a></li>
                                        <li><a onClick={this.resizeServerGroup}>Resize</a></li>
                                        <li><a onClick={this.disableServerGroup}>Disable</a></li>
                                        </>
                                    )}
                                    <li><a onClick={this.destroyServerGroup}>Destroy</a></li>
                                </ul>
                            </div>
                            {serverGroup.insightActions.length > 0  && (<div className="dropdown">
                                    <button type="button" className="btn btn-sm btn-default dropdown-toggle">
                                    Insight <span className="caret"/>
                                    </button>
                                    <ul className="dropdown-menu" role="menu">
                                    {serverGroup.insightActions.map((action: any) => {
                                        return(
                                            <>
                                                <li>
                                                    <a target="_blank" href={action.url}>{action.label}</a>
                                                </li>
                                            </>
                                        )
                                    })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="content">
                        {serverGroup.isDisabled && (
                            <h4 className="text-center">[SERVER GROUP IS DISABLED]</h4>
                        )}
                        {/* <RunningTasks/> */}
                        <CollapsibleSection heading={'Server Group Information'}>
                            <dl>
                                <dt>Created</dt>
                                <dd>{serverGroup.creationTime}</dd>
                                <dt>Region</dt>
                                <dd>
                                <AccountTag account={serverGroup.account} className="right" />
                                {serverGroup.region}
                                </dd>
                                <dt>ScalingGroupName</dt>
                                <dd>{serverGroup.result.scalingGroup.scalingGroupName}</dd>
                                <dt>VpcId</dt>
                                <dd>{serverGroup.result.scalingGroup.vpcId}</dd>
                                <dt>Subnet</dt>
                                <dd>{serverGroup.result.scalingGroup.vswitchId}</dd>
                                <dt>DefaultCooldown</dt>
                                <dd>{serverGroup.result.scalingGroup.defaultCooldown}</dd>
                                <button disabled={serverGroup.isDisabled} onClick={this.reScalingGroupServerGroup}>Edit ScalingGroup</button>
                            </dl>
                        </CollapsibleSection>

                        <CollapsibleSection heading={'Sizes'}>
                            <dl className="dl-horizontal dl-flex">
                                <dt>MaxSize</dt>
                                <dd>{serverGroup.capacity.max}</dd>
                                <dt>MinSize</dt>
                                <dd>{serverGroup.capacity.min}</dd>
                                <dt>Desired</dt>
                                <dd>{serverGroup.capacity.desired}</dd>
                            </dl>
                        </CollapsibleSection>

                        <CollapsibleSection heading={'Insatnce'}>
                            <dl>
                                <dt>InstanceType</dt>
                                <dd>{serverGroup.result.scalingConfiguration.instanceType}</dd>
                                <dt>InstanceGeneration</dt>
                                <dd>{serverGroup.result.scalingConfiguration.instanceGeneration}</dd>
                            </dl>
                        </CollapsibleSection>

                        <CollapsibleSection heading={'firewallsLabel'}>
                            <dl>
                                <dt>RamRoleName</dt>
                                <dd>{serverGroup.result.scalingConfiguration.ramRoleName}</dd>
                                <dt>ServerGroupConfigurationName</dt>
                                <dd>{serverGroup.result.scalingConfiguration.scalingConfigurationName}</dd>
                                <dt>ServerGroupConfigurationId</dt>
                                <dd>{serverGroup.result.scalingConfiguration.scalingConfigurationId}</dd>
                                <dt>SecurityGroupId</dt>
                                <dd>{serverGroup.result.scalingConfiguration.securityGroupId}</dd>
                                <button disabled={serverGroup.isDisabled} onClick={this.updateSecurityGroupServerGroup}>Update SecurityGroup</button>
                                <dt>ImageId</dt>
                                <dd>{serverGroup.result.scalingConfiguration.imageId}</dd>
                                <dt>InternetChargeType</dt>
                                <dd>PayByTraffic</dd>
                                <dt>SpotStrategy</dt>
                                <dd>{serverGroup.result.scalingConfiguration.spotStrategy}</dd>
                                {(serverGroup.result.scalingConfiguration.spotStrategy === 'SpotWithPriceLimit') && (
                                    <>
                                    <dt>SpotPriceLimit</dt>
                                    <dd>{serverGroup.result.scalingConfiguration.spotPriceLimit[0].priceLimit}</dd>
                                    </>
                                )}
                                <dt>InternetMaxBandwidthOut</dt>
                                <dd>{serverGroup.result.scalingConfiguration.internetMaxBandwidthOut}</dd>
                                <dt>InternetMaxBandwidthIn</dt>
                                <dd>{serverGroup.result.scalingConfiguration.internetMaxBandwidthIn}</dd>
                            </dl>
                        </CollapsibleSection>
                        <CollapsibleSection heading={'tag'}>
                            {( serverGroup.result.scalingConfiguration.tags !== [] || serverGroup.result.scalingConfiguration.tags !== null ) && (
                                <>
                                {serverGroup.result.scalingConfiguration.tags.map((item: any) => {
                                        return (
                                            <>
                                            <dt>{item.key}</dt>
                                            <dd>{item.value}</dd>
                                            </>
                                        )
                                    }
                                )}
                                </>
                            )}
                        </CollapsibleSection>

                        <CollapsibleSection heading={'ystemDisk'}>
                            <dl className="dl-horizontal dl-flex">
                                <dt>Category</dt>
                                <dd>{serverGroup.result.scalingConfiguration.systemDiskCategory}</dd>
                                <dt>Size</dt>
                                <dd>{serverGroup.result.scalingConfiguration.systemDiskSize}</dd>
                                <button disabled={serverGroup.isDisabled} onClick={this.updateLaunchConfigServerGroup}>UpdateLaunchConfig</button>
                            </dl>
                        </CollapsibleSection>

                        <CollapsibleSection heading={'dvancedSetting'}>
                            <dl>
                                <dt>ScalingPolicy</dt>
                                <dd>{serverGroup.result.scalingGroup.scalingPolicy}</dd>
                                <dt>MultiAZPolicy</dt>
                                <dd>{serverGroup.result.scalingGroup.multiAZPolicy}</dd>
                                <dt>RemovalPolicies</dt>
                                {serverGroup.result.scalingGroup.removalPolicies.map((item: any) => {
                                        return (
                                            <>
                                                <dd>{item}</dd>
                                            </>
                                        )
                                    })
                                }
                            </dl>
                        </CollapsibleSection>
                    </div>
                    </>
                )
            }
            </div>
        )
    }
}
