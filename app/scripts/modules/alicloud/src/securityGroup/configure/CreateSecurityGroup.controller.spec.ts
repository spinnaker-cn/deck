'use strict';

import { AccountService, API, SECURITY_GROUP_READER } from '@spinnaker/core';
import { mock } from 'angular';
import { ALICLOUD_SECURITY_CREATECTRL } from './CreateSecurityGroupCtrl';

describe('Controller: AliCloud.CreateSecurityGroup', function() {
  let $http: ng.IHttpBackendService;
  beforeEach(mock.module( SECURITY_GROUP_READER, ALICLOUD_SECURITY_CREATECTRL ));

  describe('filtering', function() {
    beforeEach(
      mock.inject(function($controller: any, $rootScope: any, $q: any, securityGroupReader: any, alicloudSecurityGroupWriter: any) {
        this.$scope = $rootScope.$new();
        this.$q = $q;
        this.securityGroupReader = securityGroupReader;
        this.securityGroupWriter = alicloudSecurityGroupWriter
        spyOn(AccountService, 'listAccounts').and.returnValues($q.when(['prod', 'test']));
        spyOn(AccountService, 'getRegionsForAccount').and.returnValues($q.when(['us-east-1', 'us-west-1']));
        spyOn(this.securityGroupReader, 'getAllSecurityGroups').and.returnValues(
          $q.when({
            prod: {
              alicloud: {
                'us-east-1': [
                  { name: 'group1', vpcId: null, id: '1' },
                  { name: 'group2', vpcId: null, id: '2' },
                  { name: 'group3', vpcId: 'vpc1-pe', id: '3' },
                ],
                'us-west-1': [{ name: 'group1', vpcId: null, id: '1' }, { name: 'group3', vpcId: 'vpc2-pw', id: '3' }],
              },
            },
            test: {
              alicloud: {
                'us-east-1': [
                  { name: 'group1', vpcId: null, id: '1' },
                  { name: 'group2', vpcId: 'vpc1-te', id: '2' },
                  { name: 'group3', vpcId: 'vpc1-te', id: '3' },
                  { name: 'group4', vpcId: 'vpc2-te', id: '4' },
                ],
                'us-west-1': [
                  { name: 'group1', vpcId: null, id: '1' },
                  { name: 'group3', vpcId: 'vpc1-tw', id: '3' },
                  { name: 'group3', vpcId: 'vpc2-tw', id: '3' },
                  { name: 'group5', vpcId: 'vpc2-tw', id: '5' },
                ],
              },
            },
          }),
        );

        this.initializeCtrl = function() {
          this.ctrl = $controller('alicloudCreateSecurityGroupCtrl', {
            $scope: this.$scope,
            $uibModalInstance: { result: this.$q.when(null) },
            securityGroupReader: this.securityGroupReader,
            securityGroupWriter: this.securityGroupWriter,
            application: {},
            securityGroup: { regions: [], securityGroupIngress: [] },
          });

          this.$scope.$digest();
        };
      }),
    );

    beforeEach(
      mock.inject(function($httpBackend: any) {
        $http = $httpBackend;
      }),
    );

    it('initializes with no firewalls available for ingress permissions', function() {
      $http.when('GET', API.baseUrl + '/subnets/alicloud').respond([]);
      this.initializeCtrl();
      expect(this.$scope.securityGroup.securityGroupIngress.length).toBe(0);
    });
  });
});
