import * as React from 'react';
import { FormikErrors, FormikProps } from 'formik';
import Select, { Option } from 'react-select';
import { IWizardPageComponent } from '@spinnaker/core';

import { IAmazonServerGroupCommand } from '../../serverGroupConfiguration.service';

export interface IServerGroupInstanceTypeProps {
  formik: FormikProps<IAmazonServerGroupCommand>;
}

export class ServerGroupInstanceType extends React.Component<IServerGroupRInstanceTypeProps>
  implements IWizardPageComponent<IAmazonServerGroupCommand> {
  public validate(values: IAmazonServerGroupCommand) {
    const errors: FormikErrors<IAmazonServerGroupCommand> = {};
    if (!values.instanceType && !values.instanceTypes) {
      errors.instanceType = 'Instance Type required.';
    }
    return errors;
  }

  private instanceTypeChanged = (options: Option[]) => {
    const { values } = this.props.formik;
    this.props.formik.setFieldValue('instanceTypes', options.map(o => o.value as string));
    this.props.formik.setFieldValue('instanceType', options.map(o => o.value as string).join());
    values.instanceTypeChanged(values);
  };

  public render() {
    const { values } = this.props.formik;
    // const showTypeSelector = !!(values.viewState.disableImageSelection || values.amiName);
    const {subnetPurposes} = values.backingData.filtered;
    const showTypeSelector = values.subnetIds;
    const selectedZoneList:string[] = [];
    const instanceTypeOptions = [];
    (subnetPurposes || []).forEach(item=>{
      if(showTypeSelector.includes(item.id) && !selectedZoneList.includes(item.zone)){
        selectedZoneList.push(item.zone);
      }
    })

    if (showTypeSelector&&showTypeSelector.length && values) {
      //   const instanceTypeOptions = (values.backingData.filtered.instanceTypes || []).map(instanceType => {
      //   const regionInstanceTypes = values.backingData.instanceTypes[values.region] || []
      //   const instanceTypeInfo = regionInstanceTypes.find(({ name }) => name === instanceType)
      //   return {
      //     label: instanceTypeInfo ? `${instanceType}(${instanceTypeInfo.cpu}Core ${instanceTypeInfo.mem}GB)` : instanceType,
      //     value: instanceType
      //   }
      // })
      const regionInstanceTypes = values.backingData.instanceTypes[values.region] || []
      regionInstanceTypes.forEach(item=>{
        if(selectedZoneList.includes(item.zone)){
          instanceTypeOptions.push({
            label: `${item.name}(${item.cpu}Core ${item.mem}GB)` ,
            value: item.name
          })
        }
      })

      return (
        <div className="container-fluid form-horizontal">
          <div className="form-group">
          <div className="col-md-3 sm-label-right">
              <b>Instance Type</b>
            </div>
          <div className="col-md-8">
            <Select
              value={values.instanceTypes}
              required={true}
              clearable={false}
              options={instanceTypeOptions}
              onChange={this.instanceTypeChanged}
              multi={true}
            />
          </div>
          </div>
        </div>
      );
    }

    return <h5 className="text-center">Please select an Subnet .</h5>;
  }
}
