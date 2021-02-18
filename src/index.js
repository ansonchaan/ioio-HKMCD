import React from 'react';
import ReactDOM from 'react-dom';
import { Provider }  from 'react-redux';
import { createStore } from 'redux';
import * as serviceWorker from './serviceWorker';
import Reducer from './store/reducer';
import './scss/style.scss';

// Component
import App from './App';

// Setup redux
const store = createStore(
    Reducer,
    // enable DevTools
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

const Application = (props) => 
    <Provider store={store}>
        <App {...props} />
    </Provider>;

ReactDOM.render(<Application/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
