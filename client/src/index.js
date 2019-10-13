import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import {Provider} from 'react-redux';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import store from './Redux/store';


ReactDOM.render(
<BrowserRouter basename = {'/'}>
    <Provider store = {store}>
        <App />
    </Provider>
</BrowserRouter>
, 
document.getElementById('root'));

serviceWorker.unregister();
