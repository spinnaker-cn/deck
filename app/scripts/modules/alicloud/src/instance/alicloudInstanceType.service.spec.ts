'use strict';
import { mock } from 'angular';
import { ALICLOUD_INSTANCE_SERVICE } from './alicloudInstanceType.service';

describe('Service: InstanceType', function() {
  beforeEach(function() {
    mock.module(ALICLOUD_INSTANCE_SERVICE);
  });

  beforeEach(
    mock.inject(function(_alicloudInstanceTypeService_: any) {
      this.alicloudInstanceTypeService = _alicloudInstanceTypeService_;
    }),
  );

  it('should instantiate the controller', function() {
    expect(this.alicloudInstanceTypeService).toBeDefined();
  });
});
