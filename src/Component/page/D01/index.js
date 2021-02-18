import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import gsap from 'gsap';
import { SmoothScroll, isInDevMode } from '../../../globalFunc';

import LightBox from './LightBox';
import VideoPlayer from './VideoPlayer';

import mapImg from '../../../images/d01/map.png';
import mapTopImg from '../../../images/d01/map_top.png';
import data from '../../../D01.json';


const D01 = props => {
    const language = useSelector(state => state.language);
    const dispatch = useDispatch();
    // const count = useSelector(state => state.count);
    // const [language, setLanguage] = useState('en');
    const [contentData, setContentData] = useState(data.contents[language]);
    const [filteredData, setFilteredData] = useState([]);
    const [category, setCategory] = useState(null);
    // const [dragging, setDragging] = useState(false);
    const [disableEvent, setDisableEvent] = useState(false);
    const [zoomValue, setZoomValue] = useState(0);
    // const [toparrow, setToparrow] = useState(false);
    // const [downarrow, setDownarrow] = useState(true);
    const [showDetails, setShowDetails] = useState(false);
    const [rangeValue, setRangeValue] = useState(0);
    const [batteryIdx, setBatteryIdx] = useState(null);
    const [openLightBox, setOpenLightBox] = useState(false);
    const [galleryIdx, setGalleryIdx] = useState(0);
    const [idle, setIdle] = useState(true);

    const topbarElem = useRef(null);
    const sidebarElem = useRef(null);
    const mapOuterWrapElem = useRef(null);
    const mapWrapElem = useRef(null);
    const mapTopElem = useRef(null);
    const mapElem = useRef(null);
    const getDisableFunc = useRef(null);
    const zoomToFunc = useRef(null);
    const getMarkersFunc = useRef(null);
    const resetPosFunc = useRef(null);

    useEffect(()=>{
        const map = {
            initWidth:0, initHeight:0, 
            pos:{x:-170, y:-170}, 
            ease:{x:-170, y:-170}, 
            offset:{left:0, top:0}
        };
        let markerElems = null;
        const mouse = {
            offset: {x:0, y:0},
            currentPos: {x:0, y:0},
            startPos: {x:0, y:0},
            lastPos: {x:0, y:0},
            delta: {x:0, y:0}
        }
        let zoom = 0;
        let startZoom = 0;
        const zoomRange = 20;
        let maxWidth = 0;
        let maxHeight = 0;
        let ratio = 0;
        let disable = false;
        let startFingerDist = 0;
        let fingerDist = 0;
        let timer = null;

        const idleMode = () => {
            setIdle(false);
            if(timer) clearTimeout(timer);
            timer = setTimeout(()=>{
                setIdle(true);
                setOpenLightBox(false);
                openDetailsPage(false);
            },1000 * 60 * 8); // 8 minutes
        }
        
        const onMouseDown = (event) => {
            let e = (event.touches? event.touches[0]: event);
            mouse.startPos = {x:e.clientX, y:e.clientY};
            mouse.lastPos = {x:0, y:0};
            
            idleMode();
            
            if(event.touches)
                if(event.touches.length > 1) { // if multiple touches
                    startZoom = zoom;
                    startFingerDist = get_distance(event);
                }

            document.addEventListener("mousemove", onMouseMove, false);
            document.addEventListener("touchmove", onTouchMove, false);
            document.addEventListener("mouseup", onMouseUp, false);
            document.addEventListener("touchend", onMouseUp, false);
        }

        const onMouseMove = (event) => {
            if(!disable){
                if(!event.touches) event.preventDefault();
                let e = (event.touches? event.touches[0]: event);

                mouse.currentPos.x = e.clientX - mouse.startPos.x;
                mouse.currentPos.y = e.clientY - mouse.startPos.y;

                mouse.delta.x = mouse.currentPos.x - mouse.lastPos.x;
                mouse.delta.y = mouse.currentPos.y - mouse.lastPos.y;

                mouse.lastPos.x = mouse.currentPos.x;
                mouse.lastPos.y = mouse.currentPos.y;

                map.pos.x += mouse.delta.x * 2;
                map.pos.y += mouse.delta.y * 2;
            }
        }
        
        const onTouchMove = (event) => {
            if(!disable){
                if(event.touches.length > 1){ // If pinch-zooming
                    fingerDist = get_distance(event);
                    const z = (startZoom+1) * (fingerDist/startFingerDist);
                    zoomTo(z-1);
                }
                else{
                    let e = (event.touches? event.touches[0]: event);

                    mouse.currentPos.x = e.clientX - mouse.startPos.x;
                    mouse.currentPos.y = e.clientY - mouse.startPos.y;

                    mouse.delta.x = mouse.currentPos.x - mouse.lastPos.x;
                    mouse.delta.y = mouse.currentPos.y - mouse.lastPos.y;

                    mouse.lastPos.x = mouse.currentPos.x;
                    mouse.lastPos.y = mouse.currentPos.y;

                    map.pos.x += mouse.delta.x * 2;
                    map.pos.y += mouse.delta.y * 2;
                }
            }
        }

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove, false);
            document.removeEventListener("touchmove", onTouchMove, false);
            document.removeEventListener('mouseup', onMouseUp, false);
            document.removeEventListener('touchend', onMouseUp, false);
        }

        const onMouseWheel = (e) => {
            if(!disable){
                zoomTo(e);
            }
        }

        const get_distance = (e) => {
            var diffX = e.touches[0].clientX - e.touches[1].clientX;
            var diffY = e.touches[0].clientY - e.touches[1].clientY;
            return Math.sqrt(diffX * diffX + diffY * diffY);
        }

        const zoomTo = (e) => {
            const offset = {left:mapWrapElem.current.offsetLeft, top:mapWrapElem.current.offsetTop};

            let x, y;
            if(typeof e === 'object'){
                x = e.clientX;
                y = e.clientY;
            }
            else{
                x = window.innerWidth/2;
                y = window.innerHeight/2;
            }
            const mx = (x - offset.left - map.pos.x) / (zoom * 2 + 1);
            const my = (y - topbarElem.current.offsetHeight - offset.top - map.pos.y) / (zoom * 2 + 1);

            const offsetBeforeZoom = {x:mx * (zoom * 2), y:my * (zoom * 2)};


            if(typeof e === 'object'){
                if(e.deltaY < 0)
                    zoom += 1 / zoomRange;
                else if(e.deltaY > 0)
                    zoom -= 1 / zoomRange;
            }
            else
                zoom = e;
            zoom = Math.min(1, Math.max(0, zoom));
            setZoomValue(zoom);
            setRangeValue(zoom);


            const offsetAfterZoom = {x:mx * (zoom * 2), y:my * (zoom * 2)};
            const space = {x: -offset.left - offsetBeforeZoom.x, y: -offset.top - offsetBeforeZoom.y};

            
            mapWrapElem.current.style.left = -(offsetAfterZoom.x + space.x) +'px';
            mapWrapElem.current.style.top = -(offsetAfterZoom.y + space.y) +'px';
        }
        zoomToFunc.current = {zoomTo}

        const resetPos = () => {
            zoomTo(0);
            map.pos.x = -170;
            map.pos.y = -170; 
            map.ease.x = -170;
            map.ease.y = -170;
            map.offset.left = 0;
            map.offset.top = 0;
            mapWrapElem.current.style.left = map.offset.left +'px';
            mapWrapElem.current.style.top = map.offset.top +'px';
        }
        resetPosFunc.current = {resetPos}

        const setMapSize = (w) => {
            maxWidth = w;
            maxHeight = maxWidth * ratio;
            mapWrapElem.current.style.width = maxWidth + 'px';
            mapWrapElem.current.style.height = maxHeight + 'px';
        }

        const movePos = () => {
            if(mapWrapElem.current){
                const offset = {left:mapWrapElem.current.offsetLeft, top:mapWrapElem.current.offsetTop};
                map.pos.x = Math.min(-offset.left, Math.max(-(map.initWidth * (zoom * 2+1)) + mapOuterWrapElem.current.offsetWidth - offset.left, map.pos.x));
                map.pos.y = Math.min(-offset.top, Math.max(-(map.initHeight * (zoom * 2+1)) + mapOuterWrapElem.current.offsetHeight - offset.top, map.pos.y));
            }
        }

        const moveMarkerPos = () => {
            for(let i=0; i<markerElems.length; i++){
                const marker = markerElems[i];
                marker.style.transform = `translate3d(0,0,0) scale(${zoom > .8 ? 1/(zoom * 2 + 1)+.1 : 1/(zoom * 2 + 1)})`;
            }
        }

        const update = () => {
            movePos();
            moveMarkerPos();
            map.ease.x += (map.pos.x - map.ease.x) * .1;
            map.ease.y += (map.pos.y - map.ease.y) * .1;
            if(mapWrapElem.current)
                mapWrapElem.current.style.transform = `translate3d(${map.ease.x}px,${map.ease.y}px,0) scale(${zoom * 2 + 1})`;
        }

        const render = () => {
            requestAnimationFrame(render);
            update();
        }
        
        const addEvent = () => {
            document.addEventListener("mousedown", onMouseDown, false);
            document.addEventListener("touchstart", onMouseDown, false);
            document.addEventListener("touchmove", (event)=>{if(!disable) event.preventDefault()}, {passive: false});
            document.addEventListener("mousewheel", onMouseWheel, false);
        }

        const removeEvent = () => {
            document.removeEventListener("mousedown", onMouseDown, false);
            document.removeEventListener("touchstart", onMouseDown, false);
            document.removeEventListener("mousewheel", onMouseWheel, false);
        }

        const loadImage = () => {
            const img = new Image();
            img.onload = function(){
                ratio = this.height/this.width;
                map.initWidth = window.innerWidth*1.2;//this.width * .205;
                map.initHeight = map.initWidth * ratio;
                setMapSize(map.initWidth);
                init();
            }
            img.src = mapImg;
        }

        const getMarkers = (elems) => {
            markerElems = elems;
        }
        getMarkersFunc.current = {getMarkers};

        const getDisable = (bool) => {
            disable = bool;
        }
        getDisableFunc.current = {getDisable}

        const init = () => {
            markerElems = document.querySelectorAll('.marker');
            addEvent();
            render();
        }

        loadImage();

        // return () => {
        //     removeEvent();
        // }
    },[])

    const onClickTutor = () => {
        setIdle(true);
    }
    
    useEffect(()=>{ 
        let smooth = new SmoothScroll('#scrollWrap',(s, y, h) => {});
        smooth.on();
        smooth.showScrollBar();

        let listsmooth = new SmoothScroll('#listWrap',(s, y, h) => {});
        listsmooth.on();
        listsmooth.showScrollBar();

        return () => {
            smooth.hideScrollBar();
            smooth.off();
            smooth = null;
            
            listsmooth.hideScrollBar();
            listsmooth.off();
            listsmooth = null;
        }
    },[batteryIdx])

    useEffect(()=>{
        getDisableFunc.current.getDisable(disableEvent);
    },[disableEvent]);

    useEffect(()=>{
        if(category){
            filteringData();
        }
    },[category]);
    
    useEffect(()=>{
        filteringData();
    },[contentData]);

    const filteringData = () => {
        let _filteredData = [];
        for(let i=0; i<contentData.batteries.length; i++){
            const _this = contentData.batteries[i];
            if(category >= _this.startDateOfCategory && category <= _this.endDateOfCategory){
                _filteredData.push(_this);
            }
        }
        setFilteredData(_filteredData);
    }

    const onUpdateLanguate = (lang) => {
        dispatch({type:'UPDATE_LANGUAGE', lang:lang});
        setContentData(data.contents[lang]);
    }

    const onChangeCategory = (cat) => {
        if(cat !== category){
            setCategory(cat);
            resetPosFunc.current.resetPos();
            
            setTimeout(()=>{
                const markers = document.querySelectorAll('.marker');
                // gsap.set('.marker', {scale:1/(0 * 2 + 1)});
                gsap.fromTo('.marker', .3, {autoAlpha:0}, {autoAlpha:1, stagger:.8/markers.length, ease:'power1.inOut'});
                gsap.fromTo('.marker', 1, {force3D:true, y:-100, scale:5}, {y:0, scale:1, stagger:.8/markers.length, ease:'power3.out'});
                // gsap.fromTo('.marker', 1, {force3D:true, y:-200}, {y:0, stagger:.8/markers.length, ease:'bounce.out'});
                getMarkersFunc.current.getMarkers(markers);
            },0)
        }
    }

    // const onScroll = () => {
    //     const scrollTop = sidebarElem.current.scrollTop;
    //     const ul = sidebarElem.current.querySelector('ul');
    //     if(scrollTop > ul.offsetHeight - sidebarElem.current.offsetHeight - 10){
    //         setDownarrow(false);
    //     }
    //     else{
    //         setDownarrow(true);
    //     }
        
    //     if(scrollTop > 10){
    //         setToparrow(true);
    //     }
    //     else{
    //         setToparrow(false);
    //     }
    // }

    const openDetailsPage = (bool, i) => {
        setTimeout(()=>{
            setShowDetails(bool);
        },bool?1000:0);
        setDisableEvent(bool);

        if(bool)
            setBatteryIdx(i);
        else{
            //resetPosFunc.current.resetPos();
            setBatteryIdx(null);
            setGalleryIdx(0);
        }
    }

    const onChangeZoom = (e) => {
        zoomToFunc.current.zoomTo(e.target.value);
    }

    const getNewPathname = (lang) => {
        return props.location.pathname.replace(language, lang)
    }

    const onClickGallery = () => {
        setOpenLightBox(true);
    }

    return (
        <div id="d01">
            {
                idle &&
                <div id="idleWrap">
                    <VideoPlayer
                        controls={false}
                        src={(!isInDevMode() ? '.' : '') + '/images/d01/HKMCD_tutorial.mp4'}
                        onReady={(player)=> player.loop(true)}
                    />
                </div>
            }
            <div id="idleBtn" onClick={onClickTutor}></div>
            <div ref={topbarElem} id="topbar"></div>
            <div ref={mapOuterWrapElem} id="mapOuterWrap" className={showDetails?'hide':''}>
                <div id="options">
                    <div id="zoomer" onMouseDown={()=>setDisableEvent(true)} onTouchStart={()=>setDisableEvent(true)} onMouseUp={()=>showDetails?false:setDisableEvent(false)} onTouchEnd={()=>showDetails?false:setDisableEvent(false)}>
                        <div id="wrap">
                            <p><span>100</span> <span>200</span> <span>300</span></p>
                            <div id="inputWrap"><input type="range" min="0" max="1" step={3/20/3} value={rangeValue} onChange={onChangeZoom} /></div>
                        </div>
                    </div>
                    <div id="language">
                        <Link id="tc" to={()=>getNewPathname('tc')} className={language === 'tc' ? 'active' : ''} onClick={()=>onUpdateLanguate('tc')}><span>中</span></Link>
                        <Link id="en" to={()=>getNewPathname('en')} className={language === 'en' ? 'active' : ''} onClick={()=>onUpdateLanguate('en')}><span>eng</span></Link>
                    </div>
                </div>
                <div id="sidebar">
                    <p dangerouslySetInnerHTML={{__html: contentData && language === 'en' ? contentData.global.selectDate : contentData.global.selectDate.replace(/[0-9]+(?![.0-9%])|[A-Za-z]+(?![^<>]*>)/g,'<span class="en">$&</span>').replace(/[\u{FA0E}\u{FA0F}\u{FA11}\u{FA13}\u{FA14}\u{FA1F}\u{FA21}\u{FA23}\u{FA24}\u{FA27}-\u{FA29}]|[\u{4E00}-\u{9FCC}]|[\u{3400}-\u{4DB5}]|[\u{20000}-\u{2A6D6}]|[\u{2A700}-\u{2B734}]|[\u{2B740}-\u{2B81D}]|[\u{2B820}-\u{2CEAF}]|[\u{2CEB0}-\u{2EBEF}]/gu,'<span class="fontScale">$&</span>')}}></p>
                    <div id="outerWrap">
                        <div ref={sidebarElem} id="wrap">
                            <ul>
                                {
                                    contentData && 
                                    contentData.menu.map((v,i)=>{
                                        return <li key={i} className={`item${' y'+v.category}${category === v.category?' active':''}`} onClick={()=>onChangeCategory(v.category)}>
                                            <div className="textWrap">
                                                <div className="year" dangerouslySetInnerHTML={{__html:language === 'en' ? v.year : v.year.replace(/[0-9]+(?![.0-9%])|[A-Za-z]+(?![^<>]*>)/g,'<span class="en">$&</span>').replace(/[\u{FA0E}\u{FA0F}\u{FA11}\u{FA13}\u{FA14}\u{FA1F}\u{FA21}\u{FA23}\u{FA24}\u{FA27}-\u{FA29}]|[\u{4E00}-\u{9FCC}]|[\u{3400}-\u{4DB5}]|[\u{20000}-\u{2A6D6}]|[\u{2A700}-\u{2B734}]|[\u{2B740}-\u{2B81D}]|[\u{2B820}-\u{2CEAF}]|[\u{2CEB0}-\u{2EBEF}]/gu,'<span class="fontScale">$&</span>')}}></div>
                                                {/* <div className="des" dangerouslySetInnerHTML={{__html:v.description}}></div> */}
                                            </div>
                                        </li>
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                </div>
                <div ref={mapWrapElem} id="mapWrap" onMouseDown={()=>showDetails?false:setDisableEvent(false)} onTouchStart={()=>showDetails?false:setDisableEvent(false)} >
                    {
                        filteredData && 
                        filteredData.map((v,i)=>{
                            if(category >= v.startDateOfCategory && category <= v.endDateOfCategory)
                                return <div key={i} className={`marker ${batteryIdx === i?'active':''} ${showDetails?'hide':''} ${`y${v.startDateOfCategory} ${`${v.endDateOfCategory === category ?'end':''}`}`} ${`level${Math.round(zoomValue*3)}`}`} 
                                style={{left:v.position.x+'%', top:v.position.y+'%'}}
                                onClick={()=>openDetailsPage(true, i)}
                                ><div className="wrap"><span><span dangerouslySetInnerHTML={{__html:v.name}}></span></span><div className={`triangle ${`level${Math.round(zoomValue*3)}`}`}></div></div></div>
                            else
                                return false;
                        })
                    }
                    <div ref={mapElem} id="map" className={batteryIdx !== null ? 'dim' : ''} style={{backgroundImage:`url(${mapImg})`}} />
                    <div ref={mapTopElem} id="mapTop" style={{backgroundImage:`url(${mapTopImg})`}} />
                </div>
            </div>
            <div id="detailsWrap" className={showDetails?'':'hide'}>
                <div id="bg" onClick={()=>openDetailsPage(false)}></div>
                <div id="wrap">
                    <div id="closeBtn" onClick={()=>openDetailsPage(false)}></div>
                    { batteryIdx > 0 &&<div id="prev" className="btn" onClick={()=>{setGalleryIdx(0); setBatteryIdx(batteryIdx-1 > 0 ? batteryIdx-1 : 0)}}></div> }
                    { batteryIdx < filteredData.length-1 && <div id="next" className="btn" onClick={()=>{setGalleryIdx(0); setBatteryIdx(batteryIdx+1 < filteredData.length-1 ? batteryIdx+1 : filteredData.length-1)}}></div> }
                    <div id="contentWrap">
                        <div id="contentLeft">
                            <div id="header">
                                {
                                    filteredData &&
                                    batteryIdx !== null &&
                                    <>
                                        <h1 id="year" className="alignC"><span className="en" dangerouslySetInnerHTML={{__html:filteredData[batteryIdx].year}}></span></h1>
                                        <h2 id="name" className="alignC cap" dangerouslySetInnerHTML={{__html:language === 'en' ? filteredData[batteryIdx].name.replace('<br/>', '&nbsp;') : filteredData[batteryIdx].name.replace(/[0-9]+(?![.0-9%])|[A-Za-z]+(?![^<>]*>)/g,'<span class="en">$&</span>').replace(/[\u{FA0E}\u{FA0F}\u{FA11}\u{FA13}\u{FA14}\u{FA1F}\u{FA21}\u{FA23}\u{FA24}\u{FA27}-\u{FA29}]|[\u{4E00}-\u{9FCC}]|[\u{3400}-\u{4DB5}]|[\u{20000}-\u{2A6D6}]|[\u{2A700}-\u{2B734}]|[\u{2B740}-\u{2B81D}]|[\u{2B820}-\u{2CEAF}]|[\u{2CEB0}-\u{2EBEF}]/gu,'<span class="fontScale">$&</span>').replace('<br/>', '&nbsp;') }}></h2>
                                    </>
                                }
                            </div>
                            <div id="listOuterWrap">
                                <div id="listWrap">
                                    <ul>
                                        {
                                            filteredData &&
                                            batteryIdx !== null &&
                                            filteredData[batteryIdx].details.list.map((v, i)=>{
                                                return <li key={i}>
                                                    <h3 dangerouslySetInnerHTML={{__html:language === 'en' ? v[0] : v[0].replace(/[0-9]+(?![.0-9%])|[A-Za-z]+(?![^<>]*>)/g,'<span class="en">$&</span>').replace(/[\u{FA0E}\u{FA0F}\u{FA11}\u{FA13}\u{FA14}\u{FA1F}\u{FA21}\u{FA23}\u{FA24}\u{FA27}-\u{FA29}]|[\u{4E00}-\u{9FCC}]|[\u{3400}-\u{4DB5}]|[\u{20000}-\u{2A6D6}]|[\u{2A700}-\u{2B734}]|[\u{2B740}-\u{2B81D}]|[\u{2B820}-\u{2CEAF}]|[\u{2CEB0}-\u{2EBEF}]/gu,'<span class="fontScale">$&</span>')}}></h3>
                                                    {
                                                        Array.isArray(v[1]) ?
                                                        <div>
                                                            {
                                                                v[1].map((w,j)=>{
                                                                    return <p key={j} dangerouslySetInnerHTML={{__html: language === 'en' ? w :w.replace(/[0-9]+(?![.0-9%])|[A-Za-z]+(?![^<>]*>)/g,'<span class="en">$&</span>').replace(/[\u{FA0E}\u{FA0F}\u{FA11}\u{FA13}\u{FA14}\u{FA1F}\u{FA21}\u{FA23}\u{FA24}\u{FA27}-\u{FA29}]|[\u{4E00}-\u{9FCC}]|[\u{3400}-\u{4DB5}]|[\u{20000}-\u{2A6D6}]|[\u{2A700}-\u{2B734}]|[\u{2B740}-\u{2B81D}]|[\u{2B820}-\u{2CEAF}]|[\u{2CEB0}-\u{2EBEF}]/gu,'<span class="fontScale">$&</span>')}}></p>
                                                                })
                                                            }
                                                        </div>
                                                        :
                                                        <div dangerouslySetInnerHTML={{__html:language === 'en' ? v[1] : v[1].replace(/[0-9]+(?![.0-9%])|[A-Za-z]+(?![^<>]*>)/g,'<span class="en">$&</span>').replace(/[\u{FA0E}\u{FA0F}\u{FA11}\u{FA13}\u{FA14}\u{FA1F}\u{FA21}\u{FA23}\u{FA24}\u{FA27}-\u{FA29}]|[\u{4E00}-\u{9FCC}]|[\u{3400}-\u{4DB5}]|[\u{20000}-\u{2A6D6}]|[\u{2A700}-\u{2B734}]|[\u{2B740}-\u{2B81D}]|[\u{2B820}-\u{2CEAF}]|[\u{2CEB0}-\u{2EBEF}]/gu,'<span class="fontScale">$&</span>')}}></div>
                                                    }
                                                </li>
                                            })
                                        }
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div id="contentRight">
                            <div id="mainContentWrap">
                                <div id="outerWrap">
                                    <div id="innerWrap">
                                        <div id="scrollWrap">
                                            {
                                                filteredData &&
                                                batteryIdx !== null &&
                                                <div id="content" dangerouslySetInnerHTML={{__html: language === 'en' ? filteredData[batteryIdx].details.description.replace(/[\u{FA0E}\u{FA0F}\u{FA11}\u{FA13}\u{FA14}\u{FA1F}\u{FA21}\u{FA23}\u{FA24}\u{FA27}-\u{FA29}]|[\u{4E00}-\u{9FCC}]|[\u{3400}-\u{4DB5}]|[\u{20000}-\u{2A6D6}]|[\u{2A700}-\u{2B734}]|[\u{2B740}-\u{2B81D}]|[\u{2B820}-\u{2CEAF}]|[\u{2CEB0}-\u{2EBEF}]/gu,'<span class="fontScale tc">$&</span>') : filteredData[batteryIdx].details.description.replace(/[0-9]+(?![.0-9%])|[A-Za-z]+(?![^<>]*>)/g,'<span class="en">$&</span>').replace(/[\u{FA0E}\u{FA0F}\u{FA11}\u{FA13}\u{FA14}\u{FA1F}\u{FA21}\u{FA23}\u{FA24}\u{FA27}-\u{FA29}]|[\u{4E00}-\u{9FCC}]|[\u{3400}-\u{4DB5}]|[\u{20000}-\u{2A6D6}]|[\u{2A700}-\u{2B734}]|[\u{2B740}-\u{2B81D}]|[\u{2B820}-\u{2CEAF}]|[\u{2CEB0}-\u{2EBEF}]/gu,'<span class="fontScale">$&</span>') }}></div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="galleryWrap">
                                {
                                    filteredData &&
                                    batteryIdx !== null &&
                                    filteredData[batteryIdx].details.gallery.images.length &&
                                    <>
                                        {galleryIdx > 0 && <div id="prev" className="btn" onClick={()=>setGalleryIdx(galleryIdx-1 > 0 ? galleryIdx-1 : 0)}></div>}
                                        {galleryIdx < filteredData[batteryIdx].details.gallery.images.length-1 && <div id="next" className="btn" onClick={()=>setGalleryIdx(galleryIdx+1 < filteredData[batteryIdx].details.gallery.images.length-1 ? galleryIdx+1 : filteredData[batteryIdx].details.gallery.images.length-1)}></div>}
                                    </>
                                }
                                <div id="gallery">
                                    <ul>
                                        {
                                            filteredData &&
                                            batteryIdx !== null &&
                                            <li className={filteredData[batteryIdx].details.gallery.video && galleryIdx === 0 ? 'video' : ''} style={{backgroundImage:`url('${ (!isInDevMode() ? '.' : '') + filteredData[batteryIdx].details.gallery.images[galleryIdx].src }')`}} onClick={onClickGallery}>
                                                {
                                                    filteredData[batteryIdx].details.gallery.images[galleryIdx].description &&
                                                    <div className="imgDes">
                                                        <p dangerouslySetInnerHTML={{__html:language === 'en' ? filteredData[batteryIdx].details.gallery.images[galleryIdx].description : filteredData[batteryIdx].details.gallery.images[galleryIdx].description.replace(/[0-9]+(?![.0-9%])|[A-Za-z]+(?![^<>]*>)/g,'<span class="en">$&</span>').replace(/[\u{FA0E}\u{FA0F}\u{FA11}\u{FA13}\u{FA14}\u{FA1F}\u{FA21}\u{FA23}\u{FA24}\u{FA27}-\u{FA29}]|[\u{4E00}-\u{9FCC}]|[\u{3400}-\u{4DB5}]|[\u{20000}-\u{2A6D6}]|[\u{2A700}-\u{2B734}]|[\u{2B740}-\u{2B81D}]|[\u{2B820}-\u{2CEAF}]|[\u{2CEB0}-\u{2EBEF}]/gu,'<span class="fontScale">$&</span>') }}></p>
                                                    </div>
                                                }
                                                {
                                                    filteredData[batteryIdx].details.gallery.images[galleryIdx].credit &&
                                                    <span id="credit" dangerouslySetInnerHTML={{__html: filteredData[batteryIdx].details.gallery.images[galleryIdx].credit }}></span>
                                                }
                                            </li>
                                        }
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {
                openLightBox && batteryIdx !== null && 
                <LightBox 
                    filteredData={filteredData} 
                    batteryIdx={batteryIdx} 
                    galleryIdx={galleryIdx}
                    setOpenLightBox={setOpenLightBox}
                />
            }
        </div>
    )
}

export default D01;