'use strict';
import { ALICLOUD_SERVERGROUP_TRANSFORMER } from './serverGroup.transformer';
import { mock } from 'angular';
describe('alicloudServerGroupTransformer', function() {
  let transformer: any;

  beforeEach( mock.module (ALICLOUD_SERVERGROUP_TRANSFORMER) );

  beforeEach(function() {
    mock.inject(function( _alicloudServerGroupTransformer_: any ) {
      transformer = _alicloudServerGroupTransformer_;
    });
  });

  describe('command transforms', function() {
    it('sets name correctly with no stack or detail', function() {
      const base = {
        application: 'myApp',
        sku: {
          capacity: 1,
        },
        selectedImage: {
          publisher: 'Microsoft',
          offer: 'Windows',
          sku: 'Server2016',
          version: '12.0.0.1',
        },
        viewState: {
          mode: 'create',
        },
        scalingConfigurations: {
          tags: {}
        }
      };

      const transformed = transformer.convertServerGroupCommandToDeployConfiguration(base);

      expect(transformed.name).toBe('myApp');
    });

    it('it sets name correctly with only stack', function() {
      const command = {
        stack: 's1',
        application: 'theApp',
        sku: {
          capacity: 1,
        },
        selectedImage: {
          publisher: 'Microsoft',
          offer: 'Windows',
          sku: 'Server2016',
          version: '12.0.0.1',
        },
        viewState: {
          mode: 'create',
        },
        scalingConfigurations: {
          tags: {}
        }
      };

      const transformed = transformer.convertServerGroupCommandToDeployConfiguration(command);

      expect(transformed.name).toBe('theApp-s1');
    });

    it('it sets name correctly with only detail', function() {
      const command = {
        freeFormDetails: 'd1',
        application: 'theApp',
        sku: {
          capacity: 1,
        },
        selectedImage: {
          publisher: 'Microsoft',
          offer: 'Windows',
          sku: 'Server2016',
          version: '12.0.0.1',
        },
        scalingConfigurations: {
          tags: { 'key': 'value' }
        },
        viewState: {
          mode: 'create',
        },
      };

      const transformed = transformer.convertServerGroupCommandToDeployConfiguration(command);

      expect(transformed.name).toBe('theApp-d1');
    });

    it('it sets name correctly with both stack and detail', function() {
      const command = {
        stack: 's1',
        freeFormDetails: 'd1',
        application: 'theApp',
        sku: {
          capacity: 1,
        },
        selectedImage: {
          publisher: 'Microsoft',
          offer: 'Windows',
          sku: 'Server2016',
          version: '12.0.0.1',
        },
        viewState: {
          mode: 'create',
        },
        scalingConfigurations: {
          tags: {}
        }
      };

      const transformed = transformer.convertServerGroupCommandToDeployConfiguration(command);

      expect(transformed.name).toBe('theApp-s1-d1');
    });

    it('it sets the Advanced Settings correctly when provided', function() {
      const command = {
        stack: 's1',
        freeFormDetails: 'd1',
        application: 'theApp',
        sku: {
          capacity: 1,
        },
        selectedImage: {
          publisher: 'Microsoft',
          offer: 'Windows',
          sku: 'Server2016',
          version: '12.0.0.1',
        },
        viewState: {
          mode: 'create',
        },
        customScriptsSettings: {
          fileUris: 'file1',
          commandToExecute: 'do_this',
        },
        scalingConfigurations: {
          tags: { 'key': 'value' }
        }
      };

      const transformed = transformer.convertServerGroupCommandToDeployConfiguration(command);
      expect(transformed.stack).toEqual(command.stack);
    });

    it('it sets the Advanced Settings correctly when not provided', function() {
      const command = {
        stack: 's1',
        freeFormDetails: 'd1',
        application: 'theApp',
        sku: {
          capacity: 1,
        },
        selectedImage: {
          publisher: 'Microsoft',
          offer: 'Windows',
          sku: 'Server2016',
          version: '12.0.0.1',
        },
        viewState: {
          mode: 'create',
        },
        scalingConfigurations: {
          tags: { 'key': 'value' }
        }
      };

      const transformed = transformer.convertServerGroupCommandToDeployConfiguration(command);
      expect(transformed.application).toBe('theApp');
    });

    it('it sets the freeFormDetails information', function() {
      const command = {
        zonesEnabled: true,
        zones: ['1', '3'],
        stack: 's1',
        freeFormDetails: 'd1',
        application: 'theApp',
        sku: {
          capacity: 1,
        },
        selectedImage: {
          publisher: 'Microsoft',
          offer: 'Windows',
          sku: 'Server2016',
          version: '12.0.0.1',
        },
        viewState: {
          mode: 'create',
        },
        scalingConfigurations: {
          tags: { 'key': 'value' }
        }
      };

      const transformed = transformer.convertServerGroupCommandToDeployConfiguration(command);

      expect(transformed.freeFormDetails).toEqual(command.freeFormDetails);
    });

    it('it should not set the zones information if zonesEnabled is false', function() {
      const command = {
        zonesEnabled: false,
        masterZoneId: ['1', '3'],
        stack: 's1',
        freeFormDetails: 'd1',
        application: 'theApp',
        sku: {
          capacity: 1,
        },
        selectedImage: {
          publisher: 'Microsoft',
          offer: 'Windows',
          sku: 'Server2016',
          version: '12.0.0.1',
        },
        viewState: {
          mode: 'create',
        },
        scalingConfigurations: {
          tags: { 'key': 'value' }
        }
      };

      const transformed = transformer.convertServerGroupCommandToDeployConfiguration(command);

      expect(transformed.masterZoneId).toEqual(['1', '3']);
    });

    it('sets instance tags correctly when provided', function() {
      const imap = new Map();
      const base = {
        application: 'myApp',
        sku: {
          capacity: 1,
        },
        selectedImage: {
          publisher: 'Microsoft',
          offer: 'Windows',
          sku: 'Server2016',
          version: '12.0.0.1',
        },
        viewState: {
          mode: 'create',
        },
        scalingConfigurations: {
          tags: { 'key': 'value' }
        },
        instanceTags: imap,
      };

      const transformed = transformer.convertServerGroupCommandToDeployConfiguration(base);

      expect(transformed.instanceTags).toEqual({});
    });
  });
});
