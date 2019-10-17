import * as React from 'react';
import Select, { Option } from 'react-select';
import { Subject } from 'rxjs'

export interface ISubnetOption {
  ref?: any,
  formik?: any,
  app?: any,
  command?: any
}
export class AdvancedSettings extends React.Component<ISubnetOption, {}> {
  private mutiazpolicy = [{
    value: 'PRIORITY',
    label: 'PRIORITY'
  }, {
    value: 'COST_OPTIMIZED',
    label: 'COST_OPTIMIZED'
  }, {
    value: 'BALANCE',
    label: 'BALANCE'
  }];

  private scalingPolicy = [{
    value: 'recycle',
    label: 'recycle'
  }, {
    value: 'release',
    label: 'release'
  }];

  constructor(props: ISubnetOption) {
    super(props);
  }
  public sub$ = new Subject();

  private getmutiazpolicy = (option: Option) => {
    const { formik }: any = this.props;
    formik.setFieldValue('scalingConfigurations.multiAZPolicy', option.value);
  };

  private getscalingPolicy = (option: Option) => {
    const { formik }: any = this.props;
    formik.setFieldValue('scalingConfigurations.scalingPolicy', option.value);
  }
  public render(): React.ReactElement {
    const { formik }: any = this.props;
    const { values }: any = formik
    return (
      <div className="form-horizontal">
        <div className="form-group">
          <div className="form-group">
            <div className="col-md-3 sm-label-right">
              <label className="sm-label-right"> MultiAZPolicy </label>
            </div>
            <div className="col-md-3">
               <Select
                value={values.scalingConfigurations.multiAZPolicy}
                options={this.mutiazpolicy}
                onChange={this.getmutiazpolicy}
              />
            </div>
            <div className="col-md-2 form-inline">
              <label className="sm-label-right">
                ScalingPolicy
              </label>
            </div>
            <div className="col-md-3">
                <Select
                  value={values.scalingConfigurations.scalingPolicy}
                  options={this.scalingPolicy}
                  onChange={this.getscalingPolicy}
                />
              </div>
          </div>
        </div>
      </div>
    );
  }
}
