import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Switch, Route, Redirect, HashRouter } from 'react-router-dom';
import { adjustFontSize } from './globalFunc';
import AsyncLoadComponent from './Component/AsyncLoadComponent';

// Async to load component
// const Nav = AsyncLoadComponent(import('./Component/Nav'));
const D01 = AsyncLoadComponent(import('./Component/page/D01'));
const LM01 = AsyncLoadComponent(import('./Component/page/LM01'));

const App = () => {
  const language = useSelector(state => state.language);

  const resize = () => {
    adjustFontSize();
  }

  useEffect(()=>{
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    }
  },[]);



  return (
    <HashRouter>
      <Route exact path="/:language?/:section?/"
        render={ props => {
          // if(!/^(en|tc)$/.test(props.match.params.language)){
          //   return <Redirect from="*" to={`/${language}/`} />
          // }

          return (
            <div id="bodyWrap" className={`body_wrap ${language}`}>
              <Switch>
                <Route exact path="/:language/d01/" component={D01} />
                <Route exact path="/:language/lm01/" component={LM01} />
                <Redirect from="*" to={`/${language}/lm01/`} />
              </Switch>
            </div>
          )
        }
      }>
      </Route>
    </HashRouter>
  );
}

export default App;
