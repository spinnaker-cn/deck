'use strict';

const angular = require('angular');

export const ALICLOUD_SUBNET = 'spinnaker.alicloud.subnet.subnetSelectField.directive';
angular
  .module(ALICLOUD_SUBNET, [])
  .directive('alicloudSubnetSelectField', function() {
    return {
      restrict: 'E',
      templateUrl: require('./subnetSelectField.directive.html'),
      scope: {
        subnets: '=',
        component: '=',
        field: '@',
        region: '=',
        onChange: '&',
        labelColumns: '@',
        helpKey: '@',
        readOnly: '=',
      },
      link: function(scope: any) {
        function setSubnets() {
          const subnets = scope.subnets || [];
          scope.activeSubnets = subnets.filter(function(subnet: any) {
            return !subnet.deprecated;
          });
          scope.deprecatedSubnets = subnets.filter(function(subnet: any) {
            return subnet.deprecated;
          });
        }
        scope.$watch('subnets', setSubnets);
      },
    };
  });
