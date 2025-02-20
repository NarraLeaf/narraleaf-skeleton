import React from 'react';
import "./src/base.css";

const App = (props) => {
    return (
        <React.Fragment>
            {props.children}
        </React.Fragment>
    );
};

export default App;
