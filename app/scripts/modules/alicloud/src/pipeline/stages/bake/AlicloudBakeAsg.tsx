import * as React from 'react';
import { get } from 'lodash';
import { FormField, CheckboxInput, HelpField, ITriggerTemplateComponentProps } from '@spinnaker/core'

export class AlicloudBakeAsg extends React.Component<ITriggerTemplateComponentProps> {
  private handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const checked = target.checked;
    this.props.updateCommand('trigger.rebake', checked);
    this.setState({});
  };

  public render() {
    const force = get(this.props.command, 'trigger.rebake', false);

    return (
      <FormField
        label="Rebake"
        onChange={this.handleChange}
        value={force}
        help={<HelpField id="execution.forceRebake" />}
        input={ (props: any) => <CheckboxInput {...props} text="Force Rebake" />}
      />
    );
  }
}
