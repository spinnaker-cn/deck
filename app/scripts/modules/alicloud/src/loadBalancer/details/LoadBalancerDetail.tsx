import * as React from 'react'
import { Dropdown } from 'react-bootstrap';
import {
    HelpField,
    NgReact,
    SETTINGS,
    Application,
    ApplicationReader,
    LoadBalancerWriter,
    CollapsibleSection,
    ReactInjector,
    AccountTag,
} from '@spinnaker/core';
import { ConfigureLoadBalancerModal } from '../configure/ConfigureLoadBalancerModal';

export class LoadBalancerDetail extends React.Component {
    constructor(props: any) {
        super(props);
        const { app, loadBalancer }: any = this.props;
        let application: Application;
        const loadBalancerAppName = loadBalancer.name.split('-')[0];
        if (loadBalancerAppName === app.name) {
          application = app;
        } else {
          ApplicationReader.getApplication(loadBalancerAppName)
            .then((App: any) => {
              this.setState({ application: App });
            })
            .catch(() => {
              this.setState({ application: app });
            });
        }
        this.state = {
          application,
        };
    }

    public deleteLoadBalancer = (): void => {
        const { app, loadBalancer, loadBalancerFromParams }: any = this.props;
        if (loadBalancer.instances && loadBalancer.instances.length) {
          return;
        }
        const taskMonitor = {
          application: app,
          title: 'Deleting ' + loadBalancerFromParams.name,
        };
        const command: any = {
          cloudProvider: loadBalancer.cloudProvider,
          loadBalancerName: loadBalancer.name,
          regions: [loadBalancer.region],
          credentials: loadBalancer.account,
        };
        const submitMethod = () => LoadBalancerWriter.deleteLoadBalancer(command, app);
        ReactInjector.confirmationModalService.confirm({
          header: `Really delete ${loadBalancerFromParams.name} in ${loadBalancerFromParams.region}: ${loadBalancerFromParams.accountId}?`,
          buttonText: `Delete ${loadBalancerFromParams.name}`,
          provider: 'alicloud',
          account: loadBalancerFromParams.account,
          applicationName: app.name,
          taskMonitorConfig: taskMonitor,
          submitMethod,
        });
    };

    private entityTagUpdate = (): void => {
      const { app }: any = this.props;
      app.loadBalancers.refresh();
    };

    public editLoadBalancer = (): void => {
        const { loadBalancer, app }: any = this.props;
        const application = app;
        const loadBalancers: any = loadBalancer;
        const LoadBalancerModal = ConfigureLoadBalancerModal;
        LoadBalancerModal.show({ app: application, loadBalancer: loadBalancers });
    };

    public render() {
        const { app, loadBalancer }: any = this.props;
        const { application }: any = this.state;
        const { AddEntityTagLinks } = NgReact;
        return (
            <>
                <Dropdown className="dropdown" id="load-balancer-actions-dropdown">
                    <Dropdown.Toggle className="btn btn-sm btn-primary dropdown-toggle">
                        <span>Load Balancer Actions</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="dropdown-menu">
                        <li className={!application ? 'disabled' : ''}>
                            <a className="clickable" onClick={this.editLoadBalancer}>
                                Edit Load Balancer
                            </a>
                        </li>
                        {!loadBalancer.instances.length && (
                        <li>
                            <a className="clickable" onClick={this.deleteLoadBalancer}>
                            Delete Load Balancer
                            </a>
                        </li>
                        )}
                        {loadBalancer.instances.length > 0 && (
                        <li className="disabled">
                            <a className="clickable" onClick={this.deleteLoadBalancer}>
                            Delete Load Balancer{' '}
                            <HelpField content="You must detach all instances before you can delete this load balancer." />
                            </a>
                        </li>
                        )}
                        {SETTINGS && SETTINGS.feature.entityTags && (
                            <AddEntityTagLinks
                                component={loadBalancer}
                                application={app}
                                entityType="loadBalancer"
                                onUpdate={this.entityTagUpdate}
                            />
                        )}
                    </Dropdown.Menu>
                </Dropdown>
                <div className="content">
                    <CollapsibleSection heading={'Load Balancer Details'}>
                    <dl className="dl-horizontal dl-flex">
                        <dt>Created</dt>
                        <dd>{loadBalancer.elb.results.createTimeStamp}</dd>
                        <dt>In</dt>
                        <dd>
                            <AccountTag account={ loadBalancer.account }/>
                            {loadBalancer.region}
                        </dd>
                        {loadBalancer.elb.results.attributes.addressType !== 'internet' && (
                            <>
                                <dt>VPC</dt>
                                <dd>{loadBalancer.elb.results.vpcId}</dd>
                                <dt>Subnet</dt>
                                <dd>
                                    {loadBalancer.elb.results.vswitchId}
                                </dd>
                            </>
                        )}
                    </dl>
                    <dl>
                        <dt>Address</dt>
                        <dd>{loadBalancer.elb.results.attributes.address}</dd>
                        <dt>AddressIPVersion</dt>
                        <dd>{loadBalancer.elb.results.attributes.addressIPVersion}</dd>
                        <dt>AddressType</dt>
                        <dd>{loadBalancer.elb.results.attributes.addressType}</dd>
                        <dt>LoadBalancerSpec</dt>
                        <dd>{loadBalancer.elb.results.attributes.loadBalancerSpec}</dd>
                    </dl>
                    {loadBalancer.serverGroups && (
                        <dl className="horizontal-when-filters-collapsed">
                            <dt>Server Groups</dt>
                            <dd>
                                <ul className="collapse-margin-on-filter-collapse">
                                    {loadBalancer.serverGroups.map((item: any) => {
                                        return (
                                            <>
                                            <li>
                                                <a
                                                    ui-sref="^.item({region: serverGroup.region,
                                                    accountId: item.account,
                                                    serverGroup: item.name,
                                                    provider: 'alicloud'})"
                                                >
                                                    {item.name}
                                                </a>
                                            </li>
                                            </>
                                        )
                                    })}
                                </ul>
                            </dd>
                        </dl>
                    )}
                    </CollapsibleSection>
                    <CollapsibleSection heading={'Listeners'}>
                        {loadBalancer.elb.results.attributes.listenerPortsAndProtocal.map(( loadBalancingRule: any ) => {
                            return(
                                <>
                                <dl style={{ borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                                    <dt>Load Balancer &rarr; Instance</dt>
                                    <dd>
                                    {loadBalancingRule.listenerProtocal}:{loadBalancingRule.listenerPort} &rarr;
                                    {loadBalancingRule.backendServerPort}
                                    </dd>
                                    <dt>Target</dt>
                                    <dd>{loadBalancingRule.listenerProtocal}</dd>
                                    <dt>Interval</dt>
                                    <dd>{loadBalancingRule.healthCheckInterval} seconds</dd>
                                    <dt>Unhealthy Threshold</dt>
                                    <dd>{loadBalancingRule.unhealthyThreshold}</dd>
                                    <dt>Timeout</dt>
                                    <dd>{loadBalancingRule.healthCheckTimeout} seconds</dd>
                                    {loadBalancingRule.cookie == null || !loadBalancingRule.cookie && (
                                        <>
                                            <dt>Cookie</dt>
                                            <dd>{loadBalancingRule.cookie}</dd>
                                        </>
                                    )}
                                    {loadBalancingRule.cookieTimeout == null || !loadBalancingRule.cookieTimeout && (
                                        <>
                                            <dt>CookieTimeout</dt>
                                            <dd>
                                                {loadBalancingRule.cookieTimeout} seconds
                                            </dd>
                                        </>
                                    )}
                                    {loadBalancingRule.gzip == null || !loadBalancingRule.gzip && (
                                        <>
                                            <dt>Gzip</dt>
                                            <dd>{loadBalancingRule.gzip}</dd>
                                        </>
                                    )}
                                    <dt>HealthCheckHttpCode</dt>
                                    <dd>{loadBalancingRule.healthCheckHttpCode}</dd>
                                    <dt>IdleTimeout</dt>
                                    <dd>{loadBalancingRule.idleTimeout} seconds</dd>
                                    {loadBalancingRule.stickySessionType == null || !loadBalancingRule.stickySessionType && (
                                        <>
                                        <dt>
                                            StickySessionType
                                        </dt>
                                        <dd>
                                            {loadBalancingRule.stickySessionType}
                                        </dd>
                                        </>
                                    )}
                                    {loadBalancingRule.requestTimeout == null || !loadBalancingRule.requestTimeout && (
                                        <>
                                            <dt>RequestTimeout</dt>
                                            <dd>
                                                {loadBalancingRule.requestTimeout} seconds
                                            </dd>
                                        </>
                                    )}
                                    <dt>Scheduler</dt>
                                    <dd>{loadBalancingRule.scheduler}</dd>
                                </dl>
                                </>
                            )
                        })}
                    </CollapsibleSection>
                </div>
            </>
        )
    }
}
