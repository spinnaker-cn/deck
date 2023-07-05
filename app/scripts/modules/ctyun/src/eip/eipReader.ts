import { IPromise } from 'angular';
import { API } from '@spinnaker/core';

interface IEip {
  eipAddress: string;
  id: string;
  name: string;
  label?: string;
  value?: string;
  deprecated?: boolean;
}

export class eipReader {
  private static cache: IPromise<IEip[]>;

  public static listEipsByProvider(cloudProvider: string, account: string, region: string) {
    // return API.one(cloudProvider)
    //   .one(account)
    //   .one(region)
    //   .one('getEips')
    //   .getList();
    return API.one('subnets', cloudProvider).getList();
  }

  public static listEips(account: string, region: string): IPromise<IEip[]> {
    // if (this.cache) {
    //   return this.cache;
    // }
    // let eips1 = [{
    //   associationID: "",
    //   bandwidth: "1",
    //   createdAt: "2023-06-04T04:20:34Z",
    //   eipAddress: "221.229.106.144",//          ---- ip地址，下拉框展示这个就行
    //   id: "eip-4slsqo1qtb",//                            ----eipId 唯一编码
    //   name: "eip-441a",
    //   privateIpAddress: "",
    //   status: "DOWN",
    //   tags: "",
    //   updatedAt: "2023-06-04T04:20:57Z"
    // }]
    // return eips1.map(eip => {
    //   eip.label = eip.eipAddress;
    //   eip.value = eip.id;
    //   return eip;
    // });
    this.cache = this.listEipsByProvider('ctyun', account, region).then((eips: any[]) => {
      let newEips = [];
      if (eips.length > 0) {
        let subnetData = eips.find(item => item.region == region);
        newEips = subnetData ? subnetData.eips : [];
      }
      // let newEips = eips.length > 0 ? eips[0].eips : [];
      return newEips.map((eip: any) => {
        eip.label = eip.name;
        eip.value = eip.ID;
        return eip;
      });
    });
    return this.cache;
  }

  public static resetCache() {
    this.cache = null;
  }

  public static getEipName(id: string, account: string, region: string) {
    return this.listEips(account, region).then(eips => {
      const match = eips.find(test => {
        return test.id === id;
      });
      return match ? match.eipAddress : null;
    });
  }
}
