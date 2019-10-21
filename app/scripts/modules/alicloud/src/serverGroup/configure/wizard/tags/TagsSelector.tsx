import * as React from 'react';
import { HelpField, MapEditor } from '@spinnaker/core';

export interface ISubnetOption {
    command?: any,
    onChange?: any,
}
export class TagsSelector extends React.Component<ISubnetOption, {}> {
    constructor (props: ISubnetOption) {
        super(props)
        const Tags: any = {};
        props.command.scalingConfiguration.tags.forEach((item: any) => {
            Tags[item.key] = item.value
        })
        this.state = ({
            tags: Tags,
        })
    }
    private handleChange = (e: any) => {
        const { onChange }: any = this.props
        this.setState({
            tags: e
        })
        onChange(e)
    }
    public render(): React.ReactElement {
        const { tags }: any = this.state
        return (
            <div className="form-group">
                <div className="col-md-12" style={{ color: 'red' }}/>
                <div className="col-md-4 sm-label-left">
                    <b>Custom Tags</b>
                    <HelpField id="alicloud.serverGroup.customTags" />
                </div>
                <div className="col-md-12">
                    <MapEditor
                        model={tags}
                        add-button-label="Add New Tags"
                        allow-empty={true}
                        onChange={(e: any) => this.handleChange(e)}
                    />
                </div>
            </div>
        )
    }
}
