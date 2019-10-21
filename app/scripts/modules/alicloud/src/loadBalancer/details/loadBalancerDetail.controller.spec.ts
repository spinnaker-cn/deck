import { ApplicationModelBuilder } from '@spinnaker/core';
import { ALICLOUD_LOADBALANCER_DETAILS } from './loadBalancerDetail.controller';
import { mock } from 'angular';

describe('Controller: alicloudLoadBalancerDetailsCtrl', function() {
  let controller: any;
  let $scope: any;
  let $state: any;
  const loadBalancer = {
    name: 'foo',
    region: 'us-west-1',
    account: 'test',
    accountId: 'test',
    vpcId: '1',
  };

  beforeEach(mock.module(ALICLOUD_LOADBALANCER_DETAILS));

  beforeEach(
    mock.inject(function($controller: any, $rootScope: any, _$state_: any) {
      $scope = $rootScope.$new();
      $state = _$state_;
      const app = ApplicationModelBuilder.createApplicationForTests('app', { key: 'loadBalancers', lazy: true });
      app.loadBalancers.data.push(loadBalancer);
      controller = $controller('alicloudLoadBalancerDetailsCtrl', {
        $scope: $scope,
        loadBalancer: loadBalancer,
        app: app,
        $state: $state,
    });
    }),
  );

  it('should have an instantiated controller', function() {
    expect(controller).toBeDefined();
  });
});





