import React, { useContext } from "react";
import EditorTextarea from "../../../../Textarea/EditorTextarea";
import _ from "lodash";
import { Card, Button } from "antd";

import modelContext from '../../../../../Models/context';

const NewsCard = ({ onClick = null, className = null, data = {} }) => {

    const { schema = {} } = useContext(modelContext);

    const getNormalizeContent = (content) => {
        const contentNormalize = Object.keys(content).reduce((data, key) => {
            if (key.includes("entity") || key.includes("blocks")) {
                const isArray = _.isArray(content[key]);
                const isObject = _.isPlainObject(content[key]);
                data[key] = isArray ?
                    [...content[key]]
                    : isObject ?
                        { ...content[key] }
                        : content[key];
            }
            return data;
        }, {});

        if (_.isPlainObject(contentNormalize) && !contentNormalize.entityMap) {
            contentNormalize.entityMap = {};
        }

        if (_.isPlainObject(contentNormalize) && !contentNormalize.blocks) {
            contentNormalize.blocks = [];
        }

        return contentNormalize;
    };

    if (!data || _.isEmpty(data)) return null;
    else
        return (
            <Card
                className={["news-card", className ? className : null].join(" ")}
                title={data.title ? data.title : data._id ? data._id : null}
                extra={
                    <Button onClick={onClick} type="primary">
                        Читать
                    </Button>
                }
            >
                {'Препросмотр временно недоступен. Нажмите "читать" для просмотра новости.'}
                {/* {data.content ? (
                    <EditorTextarea
                        key={data?._id}
                        readOnly={true}
                        contentState={getNormalizeContent(data.content)}
                    />\
                ) : "Содержание отсутствует."}
                 */}
            </Card>
        );
};

export default NewsCard;
