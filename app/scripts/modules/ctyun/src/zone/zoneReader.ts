import { IPromise } from 'angular';
import { API } from '@spinnaker/core';

interface IZone {
  account: string;
  id: string;
  name: string;
  region: string;
  cloudProvider: string;
  label?: string;
  deprecated?: boolean;
}

export class zoneReader {
  private static cache: any = {}; // {string: IPromise<IZone[]>};

  public static listZonesByProvider(cloudProvider: string, account: string, region: string) {
    // return API.one(cloudProvider)
    //   .one(account)
    //   .one(region)
    //   .one('getZones')
    //   .getList();
    return API.one('subnets', cloudProvider).getList();
  }

  public static listZones(account: string, region: string): IPromise<IZone[]> {
    if (this.cache && this.cache[region]) {
      return this.cache[region];
    }
    this.cache[region] = this.listZonesByProvider('ctyun', account, region).then((zones: any[]) => {
      let newZones = [];
      if (zones.length > 0) {
        let subnetData = zones.find(item => item.region == region);
        newZones = subnetData ? subnetData.myAllZones : [];
      }
      // let newZones = zones.length > 0 ? zones[0].myAllZones : [];
      return newZones.map((zone: any) => {
        zone.label = zone.name;
        return zone;
      });
    });
    return this.cache[region];
  }

  public static resetCache() {
    this.cache = null;
  }
}
