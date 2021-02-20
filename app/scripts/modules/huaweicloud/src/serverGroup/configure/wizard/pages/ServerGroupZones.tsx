import * as React from 'react';
import { FormikProps } from 'formik';
import { IWizardPageComponent } from '@spinnaker/core';

import { IHuaweiCloudServerGroupCommand } from '../../serverGroupConfiguration.service';
import { AvailabilityZoneSelector } from '../../../AvailabilityZoneSelector';

export interface IServerGroupZonesProps {
  formik: FormikProps<IHuaweiCloudServerGroupCommand>;
}

export class ServerGroupZones extends React.Component<IServerGroupZonesProps>
  implements IWizardPageComponent<IHuaweiCloudServerGroupCommand> {
  public validate(values: IHuaweiCloudServerGroupCommand) {
    const errors = {} as any;

    if (!values.availabilityZones || values.availabilityZones.length === 0) {
      errors.availabilityZones = 'You must select at least one availability zone.';
    }
    return errors;
  }

  private handleAvailabilityZonesChanged = (zones: string[]): void => {
    const { values, setFieldValue } = this.props.formik;
    values.usePreferredZonesChanged(values);
    setFieldValue('availabilityZones', zones);
  };

  private rebalanceToggled = () => {
    const { values, setFieldValue } = this.props.formik;
    values.toggleSuspendedProcess(values, 'AZRebalance');
    setFieldValue('suspendedProcesses', values.suspendedProcesses);
    this.setState({});
  };

  public render() {
    const { values } = this.props.formik;
    return (
      <div className="container-fluid form-horizontal">
        <AvailabilityZoneSelector
          credentials={values.credentials}
          region={values.region}
          onChange={this.handleAvailabilityZonesChanged}
          selectedZones={values.availabilityZones}
          allZones={values.backingData.filtered.availabilityZones}
          usePreferredZones={values.viewState.usePreferredZones}
        />
      </div>
    );
  }
}
