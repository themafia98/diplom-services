import React, { useState } from "react";
import PropTypes from "prop-types";
import moment from "moment";

const Comment = ({ onDelete, rules, it }) => {
    const [key] = useState(it.id ? it.id : Math.random());

    const onDeleteEvent = event => {
        onDelete(event, key);
    };

    return (
        <p className="block-comment">
            {rules ? (
                <span className="commentControllers">
                    <span className="editComment icon-edit"></span>
                    <span onClick={onDeleteEvent} className="deleteComment icon-trash-empty"></span>
                </span>
            ) : null}
            <span className="aboutCommentSender">
                <span className="timeComment">&nbsp;{moment(it.time).format("DD.MM.YYYY HH:mm")}.</span>
                &nbsp;<span className="sender_name">{`${it.username}`}</span> написал:
            </span>
            <span className="commentContet">{it.message}</span>
        </p>
    );
};

Comment.propTypes = {
    rules: PropTypes.bool.isRequired,
    it: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default Comment;
