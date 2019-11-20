import React from "react";
import { connect } from "react-redux";
import { Pagination } from "antd";
import { middlewareCaching } from "../../../../Redux/actions/publicActions/middleware";
import NewsCard from "./NewsCard";
import TitleModule from "../../../TitleModule";

/** Dealy data for tests */
const newsArray = [
    {
        id: Math.random(),
        author: "Павел Петрович",
        title: "Версия 0.0.1 обновлена.",
        content: "В список изменении вошли..."
    },
    {
        id: Math.random(),
        author: "Павел Петрович",
        title: "Версия 0.0.2 обновлена.",
        content: "В список изменении вошли..."
    },
    {
        id: Math.random(),
        author: "Павел Петрович",
        title: "Версия 0.0.3 обновлена.",
        content: "В список изменении вошли..."
    },
    {
        id: Math.random(),
        author: "Павел Петрович",
        title: "Версия 0.0.4 обновлена.",
        content: "В список изменении вошли..."
    },
    {
        id: Math.random(),
        author: "Павел Петрович",
        title: "Версия 0.0.5 обновлена.",
        content: "В список изменении вошли..."
    },
    {
        id: Math.random(),
        author: "Павел Петрович",
        title: "Версия 0.0.6 обновлена.",
        content: "В список изменении вошли..."
    },

    {
        id: Math.random(),
        author: "Павел Петрович",
        title: "Версия 0.0.7 обновлена.",
        content: "В список изменении вошли..."
    },
    {
        id: Math.random(),
        author: "Павел Петрович",
        title: "Версия 0.0.8 обновлена.",
        content: "В список изменении вошли..."
    },
    {
        id: Math.random(),
        author: "Павел Петрович",
        title: "Версия 0.0.9 обновлена.",
        content: "В список изменении вошли..."
    },
    {
        id: Math.random(),
        author: "Павел Петрович",
        title: "Версия 0.0.10 обновлена.",
        content: "В список изменении вошли..."
    },
    {
        id: Math.random(),
        author: "Павел Петрович",
        title: "Версия 0.0.11 обновлена.",
        content: "В список изменении вошли..."
    },
    {
        id: Math.random(),
        author: "Павел Петрович",
        title: "Версия 0.0.12 обновлена.",
        content: "В список изменении вошли..."
    },
    {
        id: Math.random(),
        author: "Павел Петрович",
        title: "Версия 0.0.13 обновлена.",
        content: "В список изменении вошли..."
    },
    {
        id: Math.random(),
        author: "Павел Петрович",
        title: "Версия 0.0.14 обновлена.",
        content: "В список изменении вошли..."
    },
    {
        id: Math.random(),
        author: "Павел Петрович",
        title: "Версия 0.0.15 обновлена.",
        content: "В список изменении вошли..."
    },
    {
        id: Math.random(),
        author: "Павел Петрович",
        title: "Версия 0.0.16 обновлена.",
        content: "В список изменении вошли..."
    },
    {
        id: Math.random(),
        author: "Павел Петрович",
        title: "Версия 0.0.17 обновлена.",
        content: "В список изменении вошли..."
    }
];

class News extends React.PureComponent {
    state = {
        isLoading: false,
        currentPage: 1,
        newsArray: [...newsArray],
        counter: newsArray.length < 8 ? newsArray.length : 8,
        intialDefault: newsArray.length < 8 ? newsArray.length : 8,
        load: false
    };

    componentDidMount = () => {
        const { storeCache = null } = this.props;
    };

    componentDidUpdate = () => {
        const { load, isLoading } = this.state;
        if (load && isLoading) {
            this.setState({
                ...this.state,
                load: true
            });
        }
    };

    renderNewsBlock = currentPage => {
        const {
            path = "",
            storeCache: {
                [path]: {
                    /** newsArray = [] */
                } = {}
            } = {}
        } = this.props;
        const { counter, intialDefault, newsArray = [] } = this.state;
        const arrayCards = [...newsArray];
        const normalizeDatalist =
            currentPage === 1
                ? arrayCards.slice(0, intialDefault)
                : arrayCards.slice(
                      currentPage * 4,
                      currentPage * 8 > arrayCards.length ? arrayCards.length : currentPage * 8
                  );
        return normalizeDatalist
            .slice(currentPage === 1 ? 0 : 0, currentPage === 1 ? intialDefault : counter)
            .map(it => {
                return <NewsCard className="card" key={it.id} data={it} />;
            })
            .filter(Boolean);
    };

    onChange = pageNumber => {
        this.setState({
            ...this.state,
            currentPage: pageNumber
        });
    };

    render() {
        const { currentPage } = this.state;
        return (
            <div className="news">
                <TitleModule classNameTitle="mainModuleTitle" title="Информация по предприятию" />
                <div className="news__main">
                    <div className="col-fullscreen">{this.renderNewsBlock(currentPage)}</div>
                </div>
                <Pagination
                    className="pagination-news"
                    onChange={this.onChange}
                    pageSize={5}
                    defaultCurrent={currentPage}
                    total={newsArray.length}
                />
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        storeCache: state.publicReducer.caches
    };
};

const mapDispathToProps = dispatch => {
    return {
        onCaching: async (data, primaryKey, type, pk, store) =>
            await dispatch(middlewareCaching({ data, primaryKey, type, pk, store }))
    };
};

export default connect(mapStateToProps, mapDispathToProps)(News);
