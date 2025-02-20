import react from 'react';

const App = (props: {children: react.ReactNode}) => {
    return (
        <react.Fragment>
            {props.children}
        </react.Fragment>
    );
};

export default App;
