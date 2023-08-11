import * as React from 'react';
import Select, { Option } from 'react-select';
import VirtualizedSelect from 'react-virtualized-select';
import { FormikProps } from 'formik';

import { IWizardPageComponent, Application, SelectInput, ReactInjector } from '@spinnaker/core';

import {
  IAmazonServerGroupCommand,
  ICtyunForwardLoadBalancer,
  ICtyunLbListenerMap,
} from '../../serverGroupConfiguration.service';

import { IALBListener } from 'ctyun/domain';
import { SubnetSelectInput } from 'ctyun/subnet';

export interface IServerGroupZonesProps {
  app: Application;
  formik: FormikProps<IAmazonServerGroupCommand>;
}

export class ServerGroupAvailabilityZone extends React.Component<IServerGroupZonesProps>
  implements IWizardPageComponent<IAmazonServerGroupCommand> {
  public state = {
    refreshing: false,
  };

  public validate(values: IAmazonServerGroupCommand) {
    const errors: { [key: string]: string } = {};
    if (!values.mazInfoList || values.mazInfoList.length == 0 || !values.mazInfoList[0].masterId) {
      errors.mazInfo = 'Availability Zone required.';
    }
    return errors;
  }

  private updateAvailabilityZone(): void {
    const { setFieldValue, values } = this.props.formik;
    let tableStr = '';
    values.mazInfoList = values.mazInfoList.map((item, index) => ({
      ...item,
      index,
    }));
    setFieldValue('mazInfoList', values.mazInfoList);
    values.mazInfoList.map(item => {
      if (values.backingData.filtered.subnetPurposes) {
        if (item.masterId) {
          let checkSubnet = values.backingData.filtered.subnetPurposes.find(subnet => subnet.id == item.masterId);
          if (checkSubnet) {
            tableStr != '' && (tableStr += ',');
            tableStr += checkSubnet.name || '';
          }
        }
        if (item.optionId && item.optionId.length > 0) {
          item.optionId.map((optionItem: any) => {
            let checkOption = values.backingData.filtered.subnetPurposes.find(subnet => subnet.id == optionItem);
            if (checkOption) {
              tableStr != '' && (tableStr += ',');
              tableStr += checkOption.name || '';
            }
          });
        }
      }
    });
    setFieldValue('subnetTableStr', tableStr);
  }

  private addAvailabilityZone(): void {
    const { values } = this.props.formik;
    values.mazInfoList.push({
      azName: '',
      masterId: '',
      optionId: [],
    });
    this.updateAvailabilityZone();
  }

  private deleteAvailabilityZone(index: number): void {
    const { values } = this.props.formik;
    values.mazInfoList.splice(index, 1);
    this.updateAvailabilityZone();
  }

  private subnetChange(mazInfo: any, event: React.ChangeEvent<any>): void {
    mazInfo.masterId = event.target.value;
    mazInfo.optionId = '';
    this.updateAvailabilityZone();
  }

  private azNameChange(mazInfo: any, event: React.ChangeEvent<any>): void {
    mazInfo.azName = event.target.value;
    this.updateAvailabilityZone();
  }

  private optionIdChange(mazInfo: any, newValues: Array<{ label: string; value: string }>): void {
    mazInfo.optionId = newValues.map(sg => sg.value);
    this.updateAvailabilityZone();
  }

  public render() {
    const { app, formik } = this.props;
    const { errors, values } = formik;
    const readOnlyFields = values.viewState.readOnlyFields || {};
    if (
      values.optionZone &&
      values.optionZone.length > 0 &&
      values.mazInfoList.length > 0 &&
      values.mazInfoList[0].azName == ''
    ) {
      values.mazInfoList[0].azName = values.optionZone[0].name;
    }
    let optionIdList = values.backingData.filtered.subnetPurposes || [];
    optionIdList = optionIdList.map(subnet => ({
      label: `${subnet.name}`, // (${subnet.id})`,
      value: subnet.id,
    }));
    return (
      <div className="container-fluid form-horizontal">
        <div className="form-group">
          <table className="table table-condensed packed">
            <thead>
              <tr>
                <th className="col-md-4">Availability Zone</th>
                <th className="col-md-4">Main network card</th>
                <th className="col-md-4">Auxiliary network card</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {values.mazInfoList.map((mazInfo, index) => (
                <tr key={index}>
                  <td>
                    <SelectInput
                      inputClassName="form-control input-sm height36"
                      value={mazInfo.azName}
                      options={
                        values.optionZone ? values.optionZone.map(z => ({ label: z.displayName, value: z.name })) : []
                      }
                      onChange={(event: React.ChangeEvent<any>) => this.azNameChange(mazInfo, event)}
                    />
                  </td>
                  <td>
                    <SubnetSelectInput
                      application={app}
                      readOnly={false}
                      value={mazInfo.masterId}
                      subnets={values.backingData.filtered.subnetPurposes || []}
                      inputClassName="form-control input-sm height36"
                      credentials={values.credentials}
                      region={values.region}
                      onChange={(event: React.ChangeEvent<any>) => this.subnetChange(mazInfo, event)}
                    />
                  </td>
                  <td>
                    {/* <SelectInput
                      inputClassName="form-control input-sm width80"
                      value={mazInfo.optionId}
                      options={[
                        { value: '1', label: '拓展网卡1' },
                        { value: '2', label: '拓展网卡2' },
                        { value: '3', label: '拓展网卡3' },
                      ]}
                      onChange={(event: React.ChangeEvent<any>) => this.optionIdChange(mazInfo, event)}
                    /> */}
                    <VirtualizedSelect
                      value={mazInfo.optionId}
                      required={false}
                      clearable={false}
                      options={optionIdList.filter(subnet => subnet.value != mazInfo.masterId)}
                      onChange={(newValues: Array<{ label: string; value: string }>) =>
                        this.optionIdChange(mazInfo, newValues)
                      }
                      multi={true}
                    />
                  </td>
                  <td>
                    <div className="form-control-static">
                      <a className="clickable" onClick={() => this.deleteAvailabilityZone(index)}>
                        <span className="glyphicon glyphicon-trash" />
                        <span className="sr-only">Remove</span>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {values.mazInfoList.length < 5 ? (
            <div className="col-md-12">
              <table className="table table-condensed packed">
                <tbody>
                  <tr>
                    <td>
                      <button type="button" className="add-new col-md-12" onClick={() => this.addAvailabilityZone()}>
                        <span className="glyphicon glyphicon-plus-sign" />
                        Add New Availability Zone
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="form-control-static text-center">
              Up to 5 Availability Zones can be added for a server group
            </div>
          )}
        </div>
      </div>
    );
  }
}
