'use strict';
import { ALICLOUD_SERVERGROUP_IMAGE } from './image.regional.filter';
import * as _ from 'lodash';
import { mock } from 'angular';
describe('Filter: regional', function() {
  beforeEach(mock.module (ALICLOUD_SERVERGROUP_IMAGE));

  beforeEach(
    mock.inject ( function( _regionalFilter_: any ) {
      this.regionalFilter = _regionalFilter_;
      this._ = _;

      this.images = [
        {
          name: 'null',
          region: null,
        },
        {
          name: 'west',
          region: 'west',
        },
        {
          name: 'east',
          region: 'east',
        },
      ];
    }),
  );

  it('filters the images based on the selected region and null', function() {
    const noEast = [
      {
        name: 'null',
        region: null,
      },
      {
        name: 'west',
        region: 'west',
      },
    ];

    expect(this.regionalFilter(this.images, 'west')).toEqual(noEast);
  });
});
