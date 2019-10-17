import * as React from 'react';
import { HelpField, MapEditor } from '@spinnaker/core';

export interface ISubnetOption {
    formik?: any,
    app?: any,
    ref?: any
}
export class TagsSelectors extends React.Component<ISubnetOption, {}> {
    constructor (props: ISubnetOption) {
        super(props)
    }
    private handleChange = (event: any) => {
        const { formik }: any = this.props
        formik.setFieldValue('scalingConfigurations.tags', event);
    }
    public render(): React.ReactElement {
        const { formik }: any = this.props
        const { values } = formik;
        return (
            <div className="form-group">
                <div className="col-md-12" style={{ color: 'red' }}/>
                <div className="col-md-4 sm-label-left">
                    <b>Custom Tags</b>
                    <HelpField id="alicloud.serverGroup.customTags" />
                </div>
                <div className="col-md-12">
                    <MapEditor
                        model={values.scalingConfigurations.tags || {}}
                        add-button-label="Add New Tags"
                        allow-empty={true}
                        onChange={(e: any) => this.handleChange(e)}
                    />
                </div>
            </div>
        )
    }
}
