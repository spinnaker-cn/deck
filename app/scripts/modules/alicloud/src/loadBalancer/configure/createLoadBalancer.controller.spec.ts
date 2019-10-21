import { IControllerService, IRootScopeService, mock, noop } from 'angular';
import { API, ApplicationModelBuilder } from '@spinnaker/core';
import { ALICLOUD_LOADBALANCER_CREATE } from './createLoadBalancer.controller';
import { ALICLOUD_LOADBALANCER_BALANCER } from '../loadBalancer.transformer';

describe('Controller: alicloudCreateLoadBalancerCtrl', function() {
  let $http: ng.IHttpBackendService;
  beforeEach(mock.module(ALICLOUD_LOADBALANCER_CREATE, ALICLOUD_LOADBALANCER_BALANCER));
  beforeEach(
    mock.inject(function($controller: IControllerService, alicloudLoadBalancerTransformer: any, $rootScope: IRootScopeService) {
      const app = ApplicationModelBuilder.createApplicationForTests('app', { key: 'loadBalancers', lazy: true });
      this.$scope = $rootScope.$new();
      this.ctrl = $controller('alicloudCreateLoadBalancerCtrl', {
        $scope: this.$scope,
        $uibModalInstance: { dismiss: noop, result: { then: noop } },
        application: app,
        loadBalancer: null,
        isNew: true,
        alicloudLoadBalancerTransformer: alicloudLoadBalancerTransformer,
      });
    }),
  );

  beforeEach(
    mock.inject(function($httpBackend: ng.IHttpBackendService) {
      $http = $httpBackend;
    }),
  );

  it('correctly creates a default loadbalancer', function() {
    const lb = this.$scope.loadBalancer;
    expect(lb.listeners.length).toEqual(1);
    expect(lb.loadBalancingRules.length).toEqual(1);
    expect(lb.loadBalancingRules[0].protocol).toEqual('HTTP');
    expect(this.$scope.existingLoadBalancerNames).toEqual(undefined);
    expect(lb.providerType).toEqual(undefined);
  });

  it('makes the expected REST calls for data for a new loadbalancer', function() {
    $http.when('GET', API.baseUrl + '/networks').respond([]);
    $http.when('GET', API.baseUrl + '/securityGroups').respond({});
    $http.when('GET', API.baseUrl + '/credentials?expand=true').respond([]);
    $http.when('GET', API.baseUrl + '/subnets').respond([]);
  });
});
