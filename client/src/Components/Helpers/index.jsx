import React, { useState, useEffect } from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import { Route, Redirect } from "react-router-dom";
import Loader from "../Loader";

export const PrivateRoute = ({ component: Component, rest, onLogoutAction, ...routeProps }) => {
    let timer = null;
    let counterError = 0;
    const [route, setRoute] = useState(<Loader />);
    const [status, setStatus] = useState(null);
    const [init, setInit] = useState(null);

    const getRouters = async () => {
        await rest
            .authCheck()
            .then(res => {
                if (res.status === 200) {
                    if (res.status !== status) {
                        counterError = 0;
                        setRoute(<Component rest={rest} />);
                        setStatus(res.status);
                    }
                } else {
                    rest.restartApp();
                }
            })
            .catch(err => {
                rest.restartApp();
            });
    };

    const debounceGetRouters = _.debounce(getRouters, 1000);

    useEffect(() => {
        if (!init) {
            setInit(true);
            debounceGetRouters();
        }
        if (status !== "error") {
            timer = setInterval(() => {
                debounceGetRouters();
            }, 20000);
        }
        return () => clearInterval(timer);
    }, [""]);
    return <Route exact {...routeProps} render={props => route} />;
};

PrivateRoute.propTypes = {
    component: PropTypes.object.isRequired
};
