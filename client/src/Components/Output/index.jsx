import React from "react";
import PropTypes from "prop-types";
import { Tooltip } from "antd";
import _ from "lodash";

class Output extends React.PureComponent {
    state = {
        showTooltip: false,
        widthChild: null,
        widthParent: null
    };

    child = null;
    parent = null;
    childRef = node => (this.child = node);
    parentRef = node => (this.parent = node);

    componentDidMount = () => {
        const { showTooltip, widthChild, widthParent } = this.state;
        if (_.isNull(widthChild) && _.isNull(widthParent) && !showTooltip && this.child && this.parent) {
            const childW = this.child.getBoundingClientRect().width;
            const parentW = this.parent.getBoundingClientRect().width;
            this.setState({
                ...this.state,
                showTooltip: childW > parentW,
                widthChild: childW,
                widthParent: parentW
            });
        }
    };

    componentDidUpdate = () => {
        const { showTooltip, widthChild, widthParent } = this.state;
        if (!_.isNull(widthChild) && !_.isNull(widthParent) && this.child && this.parent) {
            const childW = this.child.getBoundingClientRect().width;
            const parentW = this.parent.getBoundingClientRect().width;
            const showTooltipUpdate = childW > parentW;
            if (showTooltipUpdate !== showTooltip) {
                return this.setState({
                    showTooltip: showTooltipUpdate,
                    widthChild: childW,
                    widthParent: parentW
                });
            }
        }
    };

    render() {
        const { className, children, type } = this.props;
        const { showTooltip } = this.state;
        if (type === "table") {
            const output = (
                <td>
                    <div className="output" ref={this.parentRef}>
                        <span ref={this.childRef} className={className ? className : null}>
                            {children}
                        </span>
                    </div>
                </td>
            );
            if (!showTooltip) return output;
            else
                return (
                    <Tooltip className="pointerTooltip" placement="topLeft" title={children}>
                        {output}
                    </Tooltip>
                );
        } else {
            const output = (
                <div className="output" ref={this.parentRef}>
                    <span ref={this.childRef} className={className ? className : null}>
                        {children}
                    </span>
                </div>
            );
            if (!showTooltip) return output;
            else
                return (
                    <Tooltip placement="topLeft" title={children}>
                        {output}
                    </Tooltip>
                );
        }
    }
}

Output.propTypes = {
    className: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.string, () => null]),
    type: PropTypes.string
};

export default Output;
