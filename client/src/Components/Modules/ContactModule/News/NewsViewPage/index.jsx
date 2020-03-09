import React, { useState, useContext } from "react";
import _ from "lodash";
import uuid from "uuid/v4";

import TitleModule from "../../../../TitleModule";
import EditorTextarea from "../../../../Textarea/EditorTextarea";

import modelContext from '../../../../../Models/context';

const NewsViewPage = ({ content: contentEntity = null, title = "", id: _id = uuid() }) => {

    const { schema = {} } = useContext(modelContext);
    const [id] = useState(_id ? _id : uuid());

    const getNormalizeContent = () => {
        const content = Object.keys(contentEntity).reduce((data, key) => {
            if (key.includes("entity") || key.includes("blocks")) {
                const isArray = _.isArray(contentEntity[key]);
                const isObject = _.isPlainObject(contentEntity[key]);
                data[key] = isArray ?
                    [...contentEntity[key]]
                    : isObject ?
                        { ...contentEntity[key] }
                        : contentEntity[key];
            }
            return data;
        }, {});

        if (_.isPlainObject(contentEntity) && !contentEntity.entityMap) {
            content.entityMap = {};
        }

        if (_.isPlainObject(contentEntity) && !contentEntity.blocks) {
            content.blocks = [];
        }

        return content;
    };

    return (
        <div className="newsView-page">
            <TitleModule
                classNameTitle="tittle_contactModule_pageNews"
                title={title ? title : `Новость № ${id}`}
            />
            <div className="newsView-page__main">
                <EditorTextarea
                    key={id}
                    readOnly={true}
                    contentState={contentEntity ? getNormalizeContent() : schema.getEditorJSON()} />
            </div>
        </div>
    );
};

export default NewsViewPage;
