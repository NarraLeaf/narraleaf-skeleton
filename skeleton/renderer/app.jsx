import React from 'react';
import "./src/base.css";
import {story} from "../story/entry";

const App = (props) => {
    return (
        <React.Fragment>
            {props.children}
        </React.Fragment>
    );
};

export default App;
export {story};
