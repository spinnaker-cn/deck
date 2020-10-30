'use strict';

const angular = require('angular');

module.exports = angular.module('spinnaker.core.notification.types.youdu', []).config([
  'notificationTypeConfigProvider',
  function(notificationTypeConfigProvider) {
    notificationTypeConfigProvider.registerNotificationType({
      label: 'Youdu',
      key: 'youdu',
      addressTemplateUrl: require('./additionalFields.html'),
    });
  },
]);
