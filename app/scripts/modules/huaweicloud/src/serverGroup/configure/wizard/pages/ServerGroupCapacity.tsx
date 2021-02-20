import * as React from 'react';
import { Field, FormikProps } from 'formik';

import { IServerGroupCommand, IWizardPageComponent } from '@spinnaker/core';

import { CapacitySelector } from '../capacity/CapacitySelector';
import { MinMaxDesired } from '../capacity/MinMaxDesired';
import { IHuaweiCloudServerGroupCommand } from '../../serverGroupConfiguration.service';

export interface IServerGroupCapacityProps {
  formik: FormikProps<IServerGroupCommand>;
  hideTargetHealthyDeployPercentage?: boolean;
}

export class ServerGroupCapacity extends React.Component<IServerGroupCapacityProps>
  implements IWizardPageComponent<IHuaweiCloudServerGroupCommand> {
  public validate(values: IServerGroupCommand): { [key: string]: string } {
    const errors: { [key: string]: string } = {};

    if (values.capacity.min < 0 || values.capacity.max < 0 || values.capacity.desired < 0) {
      errors.capacity = 'Capacity min, max, and desired all have to be non-negative values.';
    }
    return errors;
  }

  public render() {
    const { hideTargetHealthyDeployPercentage } = this.props;
    const { setFieldValue, values } = this.props.formik;

    return (
      <div className="container-fluid form-horizontal">
        <div className="row">
          <div className="col-md-12">
            <CapacitySelector command={values} setFieldValue={setFieldValue} MinMaxDesired={MinMaxDesired} />
          </div>
        </div>
      </div>
    );
  }
}
