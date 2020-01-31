import React, { useState, useContext } from "react";
import uuid from "uuid/v4";

import TitleModule from "../../../../TitleModule";
import EditorTextarea from "../../../../Textarea/EditorTextarea";

import modelContext from '../../../../../Models/context';

const NewsViewPage = ({ listdata = null }) => {
    const [id] = useState(listdata ? listdata._id : uuid());
    const { schema = {} } = useContext(modelContext);
    return (
        <div className="newsView-page">
            <TitleModule classNameTitle="tittle_contactModule_pageNews" title={listdata && id ? id : "Новость"} />
            <div className="newsView-page__main">
                <EditorTextarea key={id} readOnly={true} contentState={listdata ? listdata : schema.getEditorJSON()} />
            </div>
        </div>
    );
};

export default NewsViewPage;
