'use strict';

import { Registry } from 'core/registry';

const angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.findImageFromNameStage', []).config(function() {
  Registry.pipeline.registerStage({
    useBaseProvider: true,
    key: 'findImageFromName',
    label: 'Find Image from Name',
    description: 'Finds an image to deploy from existing name',
  });
});

