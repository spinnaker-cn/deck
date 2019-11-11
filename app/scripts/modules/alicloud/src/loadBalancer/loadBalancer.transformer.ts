'use strict';
import { AliCloudProviderSettings } from '../alicloud.settings';
import { module, IQService } from 'angular';

export class AlicloudLoadBalancerTransformer {
  public static $inject = ['$q'];
  constructor(private $q: IQService) {}
  public normalizeLoadBalancer(loadBalancer: any): any {
    loadBalancer.serverGroups.forEach(function(serverGroup: any) {
      serverGroup.account = loadBalancer.account;
      serverGroup.region = loadBalancer.region;
      if (serverGroup.detachedInstances) {
        serverGroup.detachedInstances = serverGroup.detachedInstances.map(function(instanceId: any) {
          return { id: instanceId };
        });
        serverGroup.instances = serverGroup.instances.concat(serverGroup.detachedInstances);
      } else {
        serverGroup.detachedInstances = [];
      }
      serverGroup.instances.forEach((item: any) => {
        item.healthState = item.health.state
            ? item.health.state === 'healthy'
              ? 'Up'
              : item.health.state === 'unknown'
              ? 'Unknown'
              : 'Down'
            : 'Down';
      });
    });
    loadBalancer.provider = loadBalancer.type;
    return this.$q.resolve(loadBalancer);
  }

  public convertLoadBalancerForEditing(loadBalancer: any) {
    const toEdit: any = {
      region: loadBalancer.region,
      credentials: loadBalancer.account,
      name: loadBalancer.name,
      stack: loadBalancer.stack,
      detail: loadBalancer.detail,
      vnet: loadBalancer.vnet,
      masterZoneId: loadBalancer.masterZoneId,
      address: loadBalancer.elb.results.attributes.address,
      addressIPVersion: loadBalancer.elb.results.attributes.addressIPVersion,
      addressType: loadBalancer.elb.results.attributes.addressType,
      deleteProtection: loadBalancer.elb.results.attributes.deleteProtection,
      loadBalancerSpec: loadBalancer.elb.results.attributes.loadBalancerSpec,
      vSwitchId: loadBalancer.elb.results.vswitchId,
      vSwitchName: loadBalancer.elb.results.vswitchName || '',
      subnet: loadBalancer.subnet,
      probes: [],
      loadBalancingRules: [],
      listenerPortsAndProtocal: loadBalancer.elb.results.attributes.listenerPortsAndProtocal,
      listeners: loadBalancer.elb.results.attributes.listenerPortsAndProtocal,
    };
    if (loadBalancer.elb) {
      const elb: any = loadBalancer.elb;
      toEdit.securityGroups = elb.securityGroups;
      toEdit.vnet = elb.vnet;
      toEdit.probes = elb.probes;
    }
    return toEdit;
  }

  public constructNewLoadBalancerTemplate(application: any) {
    const defaultCredentials: string =
        application.defaultCredentials.alicloud || AliCloudProviderSettings.defaults.account,
      defaultRegion: string = application.defaultRegions.alicloud || AliCloudProviderSettings.defaults.region;
    return {
      stack: '',
      detail: 'frontend',
      credentials: defaultCredentials,
      region: defaultRegion,
      cloudProvider: 'alicloud',
      vnet: '',
      subnetId: '',
      masterZoneId: '',
      vSwitchId: '',
      vSwitchName: '',
      address: '',
      addressIPVersion: 'ipv4',
      addressType: 'intranet',
      deleteProtection: 'on',
      loadBalancerSpec: 'slb.s1.small',
      probes: [
        {
          probeName: '',
          probeProtocol: 'HTTP',
          probePort: 'www.bing.com',
          probePath: '/',
          probeInterval: 30,
          unhealthyThreshold: 8,
          timeout: 120,
        },
      ],
      listeners: [
        {
          listenerProtocal: 'HTTP',
          healthCheck: 'on',
          healthCheckTimeout: 5,
          unhealthyThreshold: 4,
          healthyThreshold: 4,
          healthCheckInterval: 2,
          healthCheckURI: '',
          listenerPort: 80,
          bandwidth: -1,
          stickySession: 'on',
          backendServerPort: 80,
          gzip: 'on',
          stickySessionType: 'server',
          cookie: '',
          cookieTimeout: 500,
          scheduler: 'wrr',
          requestTimeout: 60,
          idleTimeout: 15,
          healthCheckHttpCode: 'http_2xx',
        },
      ],
      loadBalancingRules: [
        {
          ruleName: '',
          protocol: 'HTTP',
          externalPort: 80,
          backendPort: 80,
          probeName: '',
          persistence: 'None',
          idleTimeout: 4,
        },
      ],
    };
  }
}

export const ALICLOUD_LOADBALANCER_BALANCER = 'spinnaker.alicloud.loadBalancer.transformer';
module(ALICLOUD_LOADBALANCER_BALANCER, []).service('alicloudLoadBalancerTransformer', AlicloudLoadBalancerTransformer);
