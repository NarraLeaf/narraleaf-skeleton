import React from 'react';
import "./src/base.css";
import {story} from "./src/story";

const App = (props: {children: React.ReactNode}) => {
    return (
        <React.Fragment>
            {props.children}
        </React.Fragment>
    );
};

export default App;
export {story};

