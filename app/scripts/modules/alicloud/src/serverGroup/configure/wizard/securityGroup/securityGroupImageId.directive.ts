'use strict';

const angular = require('angular');
import { API } from '@spinnaker/core';

export const ALICLOUD_SERVERGROUP_IMAGEID = 'spinnaker.alicloud.serverGroup.configure.securityGroupSelector.imageIddirective';
angular
  .module(ALICLOUD_SERVERGROUP_IMAGEID, [])
  .directive('alicloudSecurityImageIdDirective', function() {
    return {
      restrict: 'E',
      templateUrl: require('./securityGroupImageId.directive.html'),
      bindToController: {
        command: '=',
        laybel: '<',
        require: '<',
        mode: '<',
      },
      controllerAs: 'imageIdSelectorCtrl',
      controller: 'ImageIdSelectorCtrl',
    };
  })
  .controller('ImageIdSelectorCtrl', [
    '$scope',
    function($scope: any) {
      $scope.imageId = [];
      $scope.isimage = false;
      $scope.loading = null;
      $scope.laybel = this.laybel;
      $scope.imageName = null;
      $scope.searchImages = null;

      this.setfocus = function(event: any) {
        $scope.isimage = true;
        event = event || window.event;
        event.stopPropagation()
      };

      $(document).on('click', function () {
        $scope.isimage = false;
        $scope.$apply()
      });

      const myDiv = document.getElementById('enquiry_contact' );
      myDiv.addEventListener('click', function (event: any) {
        $scope.isimage = true;
        event = event || window.event;
        event.stopPropagation()
      });

      this.getfocus = function(event: any) {
        $scope.isimage = true;
        event = event || window.event;
        event.stopPropagation()
      };

      this.searchImage = function(images: any, event: any) {
        $scope.imageName = images.imageName;
        if (this.command.scalingConfigurations) {
          this.command.scalingConfigurations.imageId = images.attributes.imageId;
        } else {
          this.command.scalingConfiguration.imageId = images.attributes.imageId;
        }
        $scope.isimage = false;
        event = event || window.event;
        event.stopPropagation()
      };

      $scope.$watch('searchImages', function (newVal: any) {
        if (newVal) {
          $scope.loading = false;
          API.one('images/find?provider=alicloud')
            .withParams({ q: newVal })
            .get()
            .then(function(images: any) {
              $scope.loading = true;
              $scope.ImageId = images;
            })
        }
      });
    },
  ]);

