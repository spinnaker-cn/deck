import * as React from 'react';
import { LoadBalancerReader } from '@spinnaker/core';
import  Select from 'react-select'
import { IQService } from 'angular';

export interface ISubnetOption {
  ref?: any,
  formik?: any,
  app?: any
}
export class LoadBalancers extends React.Component<ISubnetOption, {}> {
  constructor(props: ISubnetOption) {
    super(props);
    this.state = ({
      loadBalancers: [],
      selectedVnetSubnets: []
    })
    if (props.formik.values.vpcId) {
      this.getAsyncData(props.formik.values.vpcId)
    }
  }
  private $q: IQService;
  private getAsyncData = (vpcId: any) => {
    const { formik }: any = this.props;
    const { values }: any = formik;
    values.account = values.credentials
    const that = this;
    (new LoadBalancerReader(this.$q, {})).getLoadBalancerDetails('alicloud', values.credentials, values.region, values.application)
      .then(function(LBs: any) {
        if (LBs) {
          const lbs: any = LBs.map((item: any) => {
            if (vpcId === item.results.vpcId) {
              return item.results.loadBalancerId
            }
          })
          const selectedVnetSubnets: any = LBs.map((item: any) => {
            return item.results.vpcId
          })
          that.setState({
            loadBalancers: lbs,
            selectedVnetSubnets: selectedVnetSubnets
          })
        }
      });
  }

  public componentWillReceiveProps (e: any) {
    if (e.formik.values.vpcId && this.props.formik.values.vpcId !== e.formik.values.vpcId) {
      this.getAsyncData(e.formik.values.vpcId)
    }
  };

  private loadBalancerChanged = (val: any) => {
    const { formik }: any = this.props
    const { setFieldValue }: any = formik;
    let slb: any = [];
    slb.push(val.value)
    slb = JSON.stringify(slb)
    setFieldValue('loadBalancerIds', slb);
    setFieldValue('loadBalancers', val.value)
  }
  public render(): React.ReactElement {
    const { formik }: any = this.props;
    const { values }: any = formik
    const { loadBalancers }: any = this.state
    const loadBalancersId: any = [];
    loadBalancers.forEach((item: any) => {
      const obj: any = {};
      obj.value = item
      obj.label = item
      loadBalancersId.push(obj)
    })
    return (
        <>
        {values.vSwitchId === null && (
          <h5 className="text-center">Please select an subnet.</h5>
        )}
        {values.vSwitchId !== null && (
          <div>
            <div className="form-group">
              <div className="col-md-3 sm-label-right"><b>Load Balancers</b></div>
              <div className="col-md-7">
                <Select
                  value={values.loadBalancers[0] || ''}
                  className="form-control input-sm"
                  onChange={(e: any) => this.loadBalancerChanged(e)}
                  options={loadBalancersId}
                />
              </div>
            </div>
          </div>
        )}
        </>
    );
  }
}
