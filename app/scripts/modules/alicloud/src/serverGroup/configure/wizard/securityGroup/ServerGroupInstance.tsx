'use strict';
import * as React from 'react';
import Select from 'react-select';

export interface ISubnetOption {
  laybel?: any,
  command?: any,
  require?: any,
  instancetype?: any,
  onChange?: any
}
export class ServerGroupInstance extends React.Component<ISubnetOption, {}> {
  constructor(props: ISubnetOption) {
    super(props);
    this.state = {
      instance: {
        value: props.command.scalingConfiguration ? props.command.scalingConfiguration.instanceType : props.command.scalingConfigurations.instanceType,
        label: props.command.scalingConfiguration ? props.command.scalingConfiguration.instanceType : props.command.scalingConfigurations.instanceType
      }
    };
  }
  private handleChange = (e: any) => {
    const { onChange }: any = this.props
    this.setState({
      instance: e.value
    })
    onChange(e.value)
  }

  public render(): React.ReactElement {
    const { laybel, command, require, instancetype }: any = this.props;
    const instancetypes: any[] = [];
    instancetype.forEach((item: any) => {
      const obj: any = {};
      obj.value = item;
      obj.label = item
      instancetypes.push(obj)
    })
    const { instance }: any = this.state;
    return (
      <>
        <div className="form-group row">
          {laybel === 3 ? (
            <>
              <div className="col-md-3 sm-label-right">
                InstanceType
              </div>
              {command.masterZoneId === null && (
                <h5 className="text-center col-md-7">(please select a zoneId)</h5>
              )}
            </>
          ) : (
            <>
            <div className="col-md-4 sm-label-right">
              InstanceType
            </div>
            {command.masterZoneId === null && (
              <h5 className="text-center col-md-6">(please select a zoneId)</h5>
            )}
            </>
          )}
          {(command.masterZoneId !== null) && (
            <div className="col-md-7">
                {laybel === 3 ? (
                    <Select
                        required={require}
                        className="form-control input-sm"
                        value={instance}
                        onChange={this.handleChange}
                        options={instancetypes}
                    />
                ) : (
                    <Select
                        required={require}
                        className="form-control input-sm"
                        value={instance}
                        onChange={this.handleChange}
                        options={instancetypes}
                    />
                )}
            </div>
          )}
        </div>
      </>
    )
  }
}

