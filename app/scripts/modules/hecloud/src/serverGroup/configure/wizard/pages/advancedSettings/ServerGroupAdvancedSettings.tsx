import * as React from 'react';
import { FormikProps } from 'formik';

import { Application, IWizardPageComponent } from '@spinnaker/core';

import { IHeCloudServerGroupCommand } from '../../../serverGroupConfiguration.service';
import { ServerGroupAdvancedSettingsInner } from './ServerGroupAdvancedSettingsInner';

export interface IServerGroupAdvancedSettingsProps {
  app: Application;
  formik: FormikProps<IHeCloudServerGroupCommand>;
}

export class ServerGroupAdvancedSettings extends React.Component<IServerGroupAdvancedSettingsProps>
  implements IWizardPageComponent<IHeCloudServerGroupCommand> {
  private ref: any = React.createRef();

  public validate(values: IHeCloudServerGroupCommand) {
    if (this.ref && this.ref.current) {
      return this.ref.current.validate(values);
    }
    return {};
  }

  public render() {
    const { app, formik } = this.props;
    if (formik.initialValues.instanceTypes) {
      formik.initialValues.instanceType = formik.initialValues.instanceTypes.join();
    }
    return <ServerGroupAdvancedSettingsInner formik={formik} app={app} ref={this.ref} />;
  }
}
