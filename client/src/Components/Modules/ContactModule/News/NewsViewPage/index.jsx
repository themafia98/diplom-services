import React, { useState } from "react";
import _ from "lodash";
import uuid from "uuid/v4";

import { getEditorJSON } from "../../../../../Utils/schema";
import TitleModule from "../../../../TitleModule";
import EditorTextarea from "../../../../Textarea/EditorTextarea";

const NewsViewPage = ({ listdata = null }) => {
    const [id] = useState(listdata ? listdata._id : uuid());
    return (
        <div className="newsView-page">
            <TitleModule classNameTitle="tittle_contactModule_pageNews" title={listdata && id ? id : "Новость"} />
            <div className="newsView-page__main">
                <EditorTextarea key={id} readOnly={true} contentState={listdata ? listdata : getEditorJSON()} />
            </div>
        </div>
    );
};

export default NewsViewPage;
