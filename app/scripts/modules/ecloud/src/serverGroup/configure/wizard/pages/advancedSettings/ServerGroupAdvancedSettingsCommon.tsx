import * as React from 'react';
import { Field } from 'formik';
import Select, { Option } from 'react-select';

import { HelpField, MapEditor } from '@spinnaker/core';

import {
  IAmazonServerGroupCommand,
  IEcloudDisk,
} from 'ecloud/serverGroup/configure/serverGroupConfiguration.service';

import { IServerGroupAdvancedSettingsProps } from './ServerGroupAdvancedSettings';

export class ServerGroupAdvancedSettingsCommon extends React.Component<IServerGroupAdvancedSettingsProps> {
  private duplicateKeys = false;

  public validate = (values: IAmazonServerGroupCommand) => {
    const errors = {} as any;

    if (!values.terminationPolicy || !values.terminationPolicy.length) {
      errors.terminationPolicy = 'Termination Policies is required';
    }

    if (this.duplicateKeys) {
      errors.tags = 'Tags have duplicate keys.';
    }

    return errors;
  };

  private updateDataDisks = (): void => {
    const { setFieldValue, values } = this.props.formik;
    values.dataDisks = values.dataDisks.map((item, index) => ({
      ...item,
      index,
    }));
    setFieldValue('dataDisks', values.dataDisks);
  };

  private dataDiskTypeChange = (dataDisk: IEcloudDisk, value: string) => {
    dataDisk.diskType = value;
    this.updateDataDisks();
  };

  private dataDiskSizeChange = (dataDisk: IEcloudDisk, value: number) => {
    dataDisk.diskSize = value;
    this.updateDataDisks();
  };

  private dataDiskSnapshotIdChange = (dataDisk: IEcloudDisk, value: string) => {
    dataDisk.snapshotId = value;
    this.updateDataDisks();
  };

  private onDeleteDataDisk = (index: number): void => {
    const { values } = this.props.formik;
    values.dataDisks.splice(index, 1);
    this.updateDataDisks();
  };

  private onAddDataDisk = () => {
    const { values } = this.props.formik;
    values.dataDisks.push({
      diskSize: 50,
      diskType: 'CLOUD_PREMIUM',
    });
    this.updateDataDisks();
  };

  private tagsChanged = (tags: { [key: string]: string }, duplicateKeys: boolean) => {
    this.duplicateKeys = duplicateKeys;
    this.props.formik.setFieldValue('tags', tags);
  };

  public render() {
    const { setFieldValue, values } = this.props.formik;
    const keyPairs = values.backingData.filtered.keyPairs || [];

    return (
      <div className="container-fluid form-horizontal">
        {/* <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Cooldown</b>
          </div>
          <div className="col-md-2">
            <Field type="text" required={true} name="cooldown" className="form-control input-sm no-spel" />
          </div>{' '}
          seconds
        </div> */}
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Termination Policies</b>
          </div>
          <div className="col-md-6">
            <Select
              required={true}
              clearable={false}
              value={values.terminationPolicy}
              options={values.backingData.terminationPolicy.map(m => ({ label: m, value: m }))}
              onChange={(option: Option) => setFieldValue('terminationPolicy', option.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Key Name</b>
          </div>
          <div className="col-md-6">
            <Select
              value={values.keyPair}
              clearable={false}
              options={keyPairs.map(t => ({ label: `${t.keyName}(${t.keyId})`, value: t.keyId }))}
              onChange={(option: Option) => setFieldValue('keyPair', option.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Role Name </b>
            <HelpField id="aws.serverGroup.RoleName" />
          </div>
          <div className="col-md-6">
            <Field type="text" className="form-control input-sm no-spel" name="roleName" />
          </div>
        </div>
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Security Reinforce </b>
            <HelpField id="aws.serverGroup.securityService" />
          </div>

          <div className="col-md-6 checkbox">
            <label>
              <input
                type="checkbox"
                checked={values.enhancedService.securityService.enabled}
                onChange={e =>
                  setFieldValue('enhancedService', {
                    ...values.enhancedService,
                    securityService: {
                      enabled: e.target.checked,
                    },
                  })
                }
              />{' '}
              Enable Sercurity Reinforce{' '}
            </label>
          </div>
        </div>
        {/* <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Instance Monitoring </b>
            <HelpField id="aws.serverGroup.instanceMonitoring" />
          </div>

          <div className="col-md-6 checkbox">
            <label>
              <input
                type="checkbox"
                checked={values.enhancedService.monitorService.enabled}
                onChange={e =>
                  setFieldValue('enhancedService', {
                    ...values.enhancedService,
                    monitorService: {
                      enabled: e.target.checked,
                    },
                  })
                }
              />{' '}
              Enable Instance Monitoring{' '}
            </label>
          </div>
        </div> */}
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Associate Public Ip</b>
          </div>
          <div className="col-md-2 radio">
            <label>
              <input
                name='internet.usePublicIp'
                type="radio"
                checked={values.internet&&values.internet.usePublicIp === true}
                onChange={() =>
                  setFieldValue('internet', { ...values.internet, usePublicIp: true })
                }
                id="associatePublicIpAddressTrue"
                required
              />
              Yes
            </label>
          </div>
          <div className="col-md-2 radio">
            <label>
              <input
                name='internet.usePublicIp'
                type="radio"
                checked={values.internet&&values.internet.usePublicIp === false}
                onChange={() =>
                  setFieldValue('internet', { ...values.internet, usePublicIp: false })
                }
                id="associatePublicIpAddressFalse"
                required
              />
              No
            </label>
          </div>
        </div>
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Charge Type</b>
          </div>
          <div className="col-md-3 radio">
            <label>
              <input
                type="radio"
                name='internet.chargeType'
                required={values.internet&&values.internet.usePublicIp}
                checked={values.internet&&values.internet.chargeType === 'BANDWIDTH'}
                onChange={() =>
                  setFieldValue('internet', {
                    ...values.internet,
                    chargeType: 'BANDWIDTH',
                  })
                }
              />
              BANDWIDTH
            </label>
          </div>
          <div className="col-md-2 radio">
            <label>
              <input
                type="radio"
                name='internet.chargeType'
                required={values.internet&&values.internet.usePublicIp}
                checked={values.internet&&values.internet.chargeType === 'TRAFFIC'}
                onChange={() =>
                  setFieldValue('internet', {
                    ...values.internet,
                    chargeType: 'TRAFFIC',
                  })
                }
              />
              TRAFFIC
            </label>
          </div>
        </div>

        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Bandwidth Size</b>
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className="form-control input-sm"
              value={values.internet&&values.internet.bandwidthSize}
              min={2}
              max={500}
              onChange={e =>
                setFieldValue('internet', {
                  ...values.internet,
                  bandwidthSize: e.target.value,
                })
              }
              required={values.internet&&values.internet.usePublicIp}
            />
          </div>{' '}
          Mbps
        </div>


        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>System disk</b>
          </div>
          <div className="col-md-3" style={{ paddingRight: 0 }}>
            <Select
              required={true}
              clearable={false}
              value={values.systemDisk.diskType}
              // options={values.backingData.diskTypes.map(m => ({ label: m, value: m }))}
              options={[{ label: '高性能型', value: 'highPerformance' },{ label: '性能优化型', value: 'performanceOptimization' }]}
              onChange={(option: Option) =>
                setFieldValue('systemDisk', { ...values.systemDisk, diskType: option.value })
              }
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className="form-control input-sm"
              value={values.systemDisk.diskSize}
              min={40}
              max={1024}
              onChange={e => setFieldValue('systemDisk', { ...values.systemDisk, diskSize: e.target.value })}
              required={true}
            />
          </div>{' '}
          GB
        </div>
        <div className="form-group">
          <div className="sm-label-left">
            <b>Data disk (optional)</b>
          </div>
          <div>
            <table className={`table table-condensed packed`}>
              <thead>
                <tr>
                  <th className="col-md-4">Disk Type</th>
                  <th className="col-md-4">Disk Size(GB)</th>
                  {/* <th className="col-md-4">Snapshot ID</th> */}
                  <th />
                </tr>
              </thead>
              <tbody>
                {values.dataDisks.map((dataDisk, index) => (
                  <tr key={index}>
                    <td>

                      <Select
                        required={true}
                        clearable={false}
                        value={dataDisk.diskType}
                        // options={values.backingData.diskTypes.map(m => ({ label: m, value: m }))}
                        options={[{ label: '容量型', value: 'capebs' },{ label: '性能优化型', value: 'ssdebs' },{ label: '高性能', value: 'ssd' }]}
                        onChange={(option: Option) => this.dataDiskTypeChange(dataDisk, option.value as string)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control input-sm"
                        value={dataDisk.diskSize}
                        min={10}
                        max={1024}
                        onChange={e => this.dataDiskSizeChange(dataDisk, parseInt(e.target.value, 10))}
                        required={true}
                      />
                    </td>
                    {/* <td>
                      <input
                        className="form-control input input-sm"
                        type="text"
                        value={dataDisk.snapshotId}
                        onChange={e => this.dataDiskSnapshotIdChange(dataDisk, e.target.value)}
                      />
                    </td> */}
                    <td>
                      <div className="form-control-static">
                        <a className="clickable" onClick={() => this.onDeleteDataDisk(index)}>
                          <span className="glyphicon glyphicon-trash" />
                          <span className="sr-only">Remove Data Disk</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}>
                    <button type="button" className="btn btn-block btn-sm add-new" onClick={this.onAddDataDisk}>
                      <span className="glyphicon glyphicon-plus-sign" />
                      {'Add Data Disk'}
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <div className="form-group">
          <div className="sm-label-left">
            <b>Tags (optional)</b>
            <HelpField id="aws.serverGroup.tags" />
          </div>
          <MapEditor model={values.tags as any} allowEmpty={true} onChange={this.tagsChanged} />
        </div>
      </div>
    );
  }
}
