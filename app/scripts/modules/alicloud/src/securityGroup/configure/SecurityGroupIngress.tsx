import * as React from 'react'
import {
  HelpField,
} from '@spinnaker/core';

export interface ISubnetOption {
  ref?: any,
  formik?: any,
  app?: any
}

export class SecurityGroupIngress extends React.Component<ISubnetOption, {}> {
  constructor(props: ISubnetOption) {
    super(props);
  }
  private updateIngress(): void {
    const { formik }: any = this.props
    const { values, setFieldValue }: any = formik;
    setFieldValue('securityGroupIngress', values.securityGroupIngress);
  }
  private sourceIPCIDRUpdated(rule: any, newPort: string) {
    rule.sourceCidrIp = newPort;
    this.updateIngress();
  }
  private sourceIngressUpdated(rule: any, newPort: string) {
    rule.ipProtocol = newPort;
    if (newPort !== 'tcp' && newPort !== 'udp') {
      rule.startPortRange = -1;
      rule.endPortRange = -1;
    } else {
      rule.startPortRange = null;
      rule.endPortRange = null
    }
    this.updateIngress();
  }
  private startPortRangeChange(rule: any, newPort: string) {
    rule.startPortRange = newPort;
    this.updateIngress();
  }
  private endPortRangeChange(rule: any, newPort: string) {
    rule.endPortRange = newPort;
    this.updateIngress();
  }
  private addRule(ruleset: any) {
    const { formik }: any = this.props
    const { values, setFieldValue }: any = formik;
    ruleset.push({
      name: values.name + '-Rule' + ruleset.length,
      priority: ruleset.length === 0 ? 100 : 100 * (ruleset.length + 1),
      ipProtocol: 'tcp',
      portRange: '',
      sourceCidrIp: '',
    });
    setFieldValue('securityGroupIngress', ruleset);
  };
  private removeRule(ruleset: any, index: number) {
    const { formik }: any = this.props
    const { setFieldValue }: any = formik;
    ruleset.splice(index, 1);
    setFieldValue('securityGroupIngress', ruleset);
  };

  private moveUp(ruleset: any, index: number) {
    if (index === 0) {
      return;
    } else {
      this.swapRules(ruleset, index, index - 1);
    }
  };

  private moveDown(ruleset: any, index: number) {
    if (index === ruleset.length - 1) {
      return;
    } else {
      this.swapRules(ruleset, index, index + 1)
    }
  };
  private swapRules(ruleset: any, a: any, b: any) {
    let temp, priorityA, priorityB;
    temp = ruleset[b];
    priorityA = ruleset[a].priority;
    priorityB = ruleset[b].priority;
    ruleset[b] = ruleset[a];
    ruleset[a] = temp;
    ruleset[a].priority = priorityA;
    ruleset[b].priority = priorityB;
  }
  private maxSizePattern(rule: any) {
    const { formik }: any = this.props
    const { setFieldValue }: any = formik;
    if (rule.endPortRange) {
      if (rule.startPortRange >= rule.endPortRange) {
        rule.startPortRange = null
        setFieldValue('securityGroupIngress', rule);
      }
    }
  };
  private minSizePattern(rule: any) {
    const { formik }: any = this.props
    const { setFieldValue }: any = formik;
    if (rule.startPortRange) {
      if (rule.startPortRange >= rule.endPortRange) {
        rule.endPortRange = null
        setFieldValue('securityGroupIngress', rule);
      }
    }
  };

  public render() {
    const { formik }: any = this.props;
    const { values }: any = formik;
    return (
      <>
        <div className="col-md-12">
          <div className="form-group">
            <div className="col-md-12">
              <table className="table table-condensed packed">
                <thead>
                  <tr>
                    <th style={{ width: '21%' }}>Protocol</th>
                    <th style={{ width: '32%' }}>
                      Source IP/CIDR ranges<HelpField id="alicloud.securityGroup.ingress.sourceIPCIDRRanges" />
                    </th>
                    <th style={{ width: '16%' }}>
                      Start Port ranges<HelpField id="alicloud.securityGroup.ingress.destPortRanges" />
                    </th>
                    <th style={{ width: '16%' }}>
                      End Port ranges<HelpField id="alicloud.securityGroup.ingress.destPortRanges" />
                    </th>
                    <th style={{ width: '15%' }}>Actions<HelpField id="alicloud.securityGroup.ingress.actions" /></th>
                  </tr>
                </thead>
                <tbody>
                  {values.securityGroupIngress.map( (rule: any, index: number) => {
                    return (
                      <tr key={index}>
                        <td>
                          <select
                            className="form-control input-sm"
                            value={rule.ipProtocol}
                            onChange={event =>
                              this.sourceIngressUpdated(rule, event.target.value)
                            }
                          >
                            <option value="tcp">TCP</option>
                            <option value="udp">UDP</option>
                            <option value="icmp">ICMP</option>
                            <option value="gry">GRY</option>
                            <option value="*">ALL</option>
                          </select>
                        </td>
                        <td>
                          <input
                            className="form-control input-sm"
                            type="text"
                            pattern="^\*$|^((25[0-5]|2[0-4]\d|[01]?\d\d?)[.]){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)(\/([1-9]|[1-2]\d|3[0-2]))?(,((25[0-5]|2[0-4]\d|[01]?\d\d?)[.]){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)(\/([1-9]|[1-2]\d|3[0-2]))?)*$"
                            value={rule.sourceCidrIp}
                            onChange={event =>
                              this.sourceIPCIDRUpdated(rule, event.target.value)
                            }
                            required={true}
                          />
                        </td>
                        {(rule.ipProtocol === 'tcp' || rule.ipProtocol === 'udp')  && (
                          <>
                            <td>
                              <input
                                className="form-control input-sm"
                                type="number"
                                min="1"
                                max="65536"
                                name="minSize"
                                value={rule.startPortRange}
                                onChange={event =>
                                  this.startPortRangeChange(rule, event.target.value)
                                }
                                required={true}
                                onBlur={() => this.maxSizePattern(rule)}
                              />
                            </td>
                            <td>
                              <input
                                className="form-control input-sm"
                                type="number"
                                min="1"
                                max="65536"
                                name="maxSize"
                                value={rule.endPortRange}
                                onChange={event =>
                                  this.endPortRangeChange(rule, event.target.value)
                                }
                                required={true}
                                onBlur={() => this.minSizePattern(rule)}
                              />
                            </td>
                          </>
                        )}
                        {(rule.ipProtocol === 'icmp' || rule.ipProtocol === 'gry' || rule.ipProtocol === '*') && (
                          <>
                            <td>
                              <input
                                className="form-control input-sm"
                                type="number"
                                min="-1"
                                max="-1"
                                value={rule.startPortRange}
                                onChange={event =>
                                  this.startPortRangeChange(rule, event.target.value)
                                }
                                required={true}
                              />
                            </td>
                            <td>
                              <input
                                className="form-control input-sm"
                                type="number"
                                min="-1"
                                max="-1"
                                value={rule.endPortRange}
                                onChange={event =>
                                  this.endPortRangeChange(rule, event.target.value)
                                }
                                required={true}
                              />
                            </td>
                          </>
                        )}
                        <td>
                          <a className="btn-link sm-label" onClick={() => this.moveUp(values.securityGroupIngress, index)}
                            ><span className="glyphicon glyphicon-arrow-up" />
                          </a>
                          <a className="btn-link sm-label" onClick={() => this.moveDown(values.securityGroupIngress, index)}
                            ><span className="glyphicon glyphicon-arrow-down" />
                          </a>
                          <a className="btn-link sm-label" onClick={() => this.removeRule(values.securityGroupIngress, index)}
                            ><span className="glyphicon glyphicon-trash" />
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="form-group small" style={{ marginTop: '20px' }}>
            <div className="col-md-12">
              <button className="add-new col-md-12" onClick={() => this.addRule(values.securityGroupIngress)}>
                <span className="glyphicon glyphicon-plus-sign" /> Add new SecurityGroup Rule
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }
}
