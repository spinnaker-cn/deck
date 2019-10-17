'use strict';
import { mock } from 'angular';
import { ALICLOUD_INSTANCE_DETAILCTRL } from './instance.details.controller';

describe('Controller: gceInstanceDetailsCtrl', function() {
  let controller: any;
  let scope: any;

  beforeEach(mock.module(ALICLOUD_INSTANCE_DETAILCTRL));

  beforeEach(
    mock.inject(function($rootScope: any, $controller: any) {
      scope = $rootScope.$new();
      controller = $controller('alicloudInstanceDetailsCtrl', {
        $scope: scope,
        instance: {},
        moniker: {},
        environment: 'test',
        app: { isStandalone: true },
      });
    }),
  );

  it('should instantiate the controller', function() {
    expect(controller).toBeDefined();
  });
});
