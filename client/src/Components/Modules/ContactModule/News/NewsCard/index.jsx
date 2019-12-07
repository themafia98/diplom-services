import React from "react";
import _ from "lodash";
import { Card, Button } from "antd";
const NewsCard = ({ onClick = null, className = null, data = {} }) => {
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
                {data.content ? data.content : "Содержание отсутствует."}
            </Card>
        );
};

export default NewsCard;
