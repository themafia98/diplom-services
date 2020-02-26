import React, { useState, useContext } from "react";
import _ from "lodash";
import uuid from "uuid/v4";

import TitleModule from "../../../../TitleModule";
import EditorTextarea from "../../../../Textarea/EditorTextarea";

import modelContext from '../../../../../Models/context';

const NewsViewPage = ({ listdata = null }) => {


    const { schema = {} } = useContext(modelContext);
    const [id] = useState(listdata ? listdata._id : uuid());

    const getNormalizeContent = () => {
        const content = Object.keys(listdata).reduce((data, key) => {
            if (key.includes("entity") || key.includes("blocks")) {
                const isArray = _.isArray(listdata[key]);
                const isObject = _.isPlainObject(listdata[key]);
                data[key] = isArray ?
                    [...listdata[key]]
                    : isObject ?
                        { ...listdata[key] }
                        : listdata[key];
            }
            return data;
        }, {});

        if (_.isPlainObject(content) && !content.entityMap) {
            content.entityMap = {};
        }

        if (_.isPlainObject(content) && !content.blocks) {
            content.blocks = [];
        }

        return content;
    };

    return (
        <div className="newsView-page">
            <TitleModule
                classNameTitle="tittle_contactModule_pageNews"
                title={listdata && id ? id : "Новость"}
            />
            <div className="newsView-page__main">
                <EditorTextarea
                    key={id}
                    readOnly={true}
                    contentState={listdata ? getNormalizeContent() : schema.getEditorJSON()} />
            </div>
        </div>
    );
};

export default NewsViewPage;
