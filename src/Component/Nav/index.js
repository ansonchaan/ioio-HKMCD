import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
// import './nav.scss';

const Nav = props => {
    const language = useSelector(state => state.language);
    const dispatch = useDispatch();

    const getNewPathname = () => {
        return props.location.pathname.replace(language, language === 'en' ? 'zh' : 'en')
    }

    const changeLanguage = () => {
        dispatch({type:'UPDATE_LANGUAGE'});
    }

    return (
        <ul id="nav"className="cap">
            <li><Link to={`/${language}/`}>Home</Link></li>
            <li><Link to={`/${language}/about/`}>About</Link></li>
            <li><Link to={getNewPathname} onClick={changeLanguage}>{language === 'en' ? 'zh' : 'en'}</Link></li>
            <li><button onClick={()=>dispatch({type:'ADD_COUNT'})}>add</button></li>
        </ul>
    )
}

export default Nav;