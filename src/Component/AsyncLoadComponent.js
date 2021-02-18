import React from 'react';
import Loadable from 'react-loadable';

const AsyncLoadComponent = (getComponentPath) => {
    return Loadable({
        loader: () => getComponentPath,
        loading: (props) => {
            return <div>Loading...</div> 
        }
    });
}

export default AsyncLoadComponent;