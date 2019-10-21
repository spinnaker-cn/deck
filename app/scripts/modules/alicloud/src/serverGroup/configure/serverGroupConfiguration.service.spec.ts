'use strict';
import { ALICLOUD_SERVERGROUP_CONFIGURATON } from './serverGroupConfiguration.service';
import { mock } from 'angular';
describe('Service: alicloudServerGroupConfiguration', function() {
  let service: any;

  beforeEach(mock.module( ALICLOUD_SERVERGROUP_CONFIGURATON ));

  beforeEach(
    mock.inject( function( _alicloudServerGroupConfigurationService_: any ) {
      service = _alicloudServerGroupConfigurationService_;
      this.allLoadBalancers = [
        {
          name: 'elb-1',
          accounts: [
            {
              name: 'test',
              regions: [
                {
                  name: 'us-east-1',
                  loadBalancers: [
                    { region: 'us-east-1', vpcId: null, name: 'elb-1' },
                    { region: 'us-east-1', vpcId: 'vpc-1', name: 'elb-1' },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'elb-2',
          accounts: [
            {
              name: 'test',
              regions: [
                {
                  name: 'us-east-1',
                  loadBalancers: [
                    { region: 'us-east-1', vpcId: null, name: 'elb-2' },
                    { region: 'us-east-1', vpcId: 'vpc-2', name: 'elb-2' },
                  ],
                },
                {
                  name: 'us-west-1',
                  loadBalancers: [{ region: 'us-west-1', vpcId: null, name: 'elb-2' }],
                },
              ],
            },
          ],
        },
      ];
    }),
  );

  describe('configureSecurityGroupOptions', function() {
    beforeEach(function() {
      this.allSecurityGroups = {
        alicloudcred1: {
          eastus: [
            {
              'onlyalicloud-web': {
                account: 'alicloud-cred1',
                accountName: 'alicloud-cred1',
                id: 'onlyalicloud-web',
                name: 'onlyalicloud-web',
                network: 'na',
                provider: 'alicloud',
                region: 'eastus',
              },
            },
            {
              'onlyalicloud-cache': {
                account: 'alicloud-cred1',
                accountName: 'alicloud-cred1',
                id: 'onlyalicloud-cache',
                name: 'onlyalicloud-cache',
                network: 'na',
                provider: 'alicloud',
                region: 'eastus',
              },
            },
          ],
          westus: [
            {
              'onlyalicloud-web': {
                account: 'alicloud-cred1',
                accountName: 'alicloud-cred1',
                id: 'onlyalicloud-web',
                name: 'onlyalicloud-web',
                network: 'na',
                provider: 'alicloud',
                region: 'westus',
              },
            },
          ],
        },
      };

      this.command = {
        backingData: {
          securityGroups: this.allSecurityGroups,
          filtered: {},
        },
        viewState: {
          securityGroupsConfigured: false,
        },
        credentials: 'alicloudcred1',
        region: 'westus',
      };
    });

    it('finds matching firewalls and assigns them to the filtered list the first time', function() {
      this.command.region = 'westus';
      const expected = this.allSecurityGroups.alicloudcred1['westus'];

      const result = service.configureSecurityGroupOptions(this.command);

      expect(this.command.backingData.filtered.securityGroups).toEqual(expected);
      expect(result).toEqual({ dirty: { securityGroups: true } });
      // expect(this.command.viewState.securityGroupConfigured).toBeTrue ;
    });

    it('finds matching firewalls, sets dirty flag for subsequent time', function() {
      this.command.region = 'eastus';
      this.command.backingData.filtered.securityGroups = this.allSecurityGroups.alicloudcred1['westus'];
      const expected = this.allSecurityGroups.alicloudcred1['eastus'];

      const result = service.configureSecurityGroupOptions(this.command);

      expect(this.command.backingData.filtered.securityGroups).toEqual(expected);
      expect(result).toEqual({ dirty: { securityGroups: true } });
      // expect(this.command.viewState.securityGroupConfigured).toBeTrue;
    });

    it('clears the selected securityGroup', function() {
      this.command.selectedSecurityGroup = {
        'onlyalicloud-web': {
          account: 'alicloud-cred1',
          accountName: 'alicloud-cred1',
          id: 'onlyalicloud-web',
          name: 'onlyalicloud-web',
          network: 'na',
          provider: 'alicloud',
          region: 'westus',
        },
      };
      this.command.region = 'eastus';

      const result = service.configureSecurityGroupOptions(this.command);

      // expect(this.command.selectedSecurityGroup).toBeNull;
      expect(result).toEqual({ dirty: { securityGroups: true } });
      // expect(this.command.viewState.securityGroupConfigured).toBeTrue;
    });

    it('returns no firewalls if none match', function() {
      this.command.region = 'eastasia';
      this.command.backingData.filtered.securityGroups = this.allSecurityGroups.alicloudcred1['westus'];

      const result = service.configureSecurityGroupOptions(this.command);

      // expect (this.command.selectedSecurityGroup).toBeUndefined;
      expect(result).toEqual({ dirty: { securityGroups: true } });
      expect(this.command.backingData.filtered.securityGroups).toEqual([]);
      // expect(this.command.viewState.securityGroupConfigured).toBeFalse;
    });

    it('returns empty zone list if region is not supported', function() {
      this.command.region = 'eastasia';
      this.command.backingData.credentialsKeyedByAccount = {};
      this.command.backingData.credentialsKeyedByAccount[this.command.credentials] = {
        regionsSupportZones: [],
        availabilityZones: ['1', '2', '3'],
      };

      service.configureZones(this.command);

      expect(this.command.backingData.filtered.zones).toEqual([]);
    });

    it('returns actual zone list if region is supported', function() {
      this.command.region = 'eastasia';
      this.command.backingData.credentialsKeyedByAccount = {};
      this.command.backingData.credentialsKeyedByAccount[this.command.credentials] = {
        regionsSupportZones: ['eastasia'],
        availabilityZones: ['1', '2', '3'],
      };

      service.configureZones(this.command);

      expect(this.command.backingData.filtered.zones).toEqual(
        this.command.backingData.credentialsKeyedByAccount[this.command.credentials].availabilityZones,
      );
    });

    it('does not return zone list if region is not specified', function() {
      this.command.region = null;
      this.command.backingData.credentialsKeyedByAccount = {};
      this.command.backingData.credentialsKeyedByAccount[this.command.credentials] = {
        regionsSupportZones: ['eastasia'],
        availabilityZones: ['1', '2', '3'],
      };

      service.configureZones(this.command);

      expect(this.command.backingData.filtered.zones).toBeUndefined();
    });
  });
});
