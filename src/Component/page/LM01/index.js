import React, { useEffect, useState, useRef } from 'react';
// import { useSelector } from 'react-redux';
import gsap from 'gsap';
import { SmoothScroll, isInDevMode } from '../../../globalFunc';
import Flickity from 'react-flickity-component';
import data from '../../../LM01.json';
import LightBox from './LightBox';
import { setLogData } from '../../../ipc/log';

import map1 from '../../../images/lm01/1.png';
import map2 from '../../../images/lm01/2.png';
import map3 from '../../../images/lm01/3.png';
import map4 from '../../../images/lm01/4.png';
import map5 from '../../../images/lm01/5.png';
import map6 from '../../../images/lm01/6.png';
import map7 from '../../../images/lm01/7.png';
import map8 from '../../../images/lm01/8.png';
import map9 from '../../../images/lm01/9.png';
import map10 from '../../../images/lm01/10.png';
import map11 from '../../../images/lm01/11.png';
import map12 from '../../../images/lm01/12.png';
import map13 from '../../../images/lm01/13.png';
import map14 from '../../../images/lm01/14.png';
import map15 from '../../../images/lm01/15.png';
import map16 from '../../../images/lm01/16.png';
import map17 from '../../../images/lm01/17.png';
import map18 from '../../../images/lm01/18.png';
import map19 from '../../../images/lm01/19.png';
import map20 from '../../../images/lm01/20.png';


const LM01 = props => {
    // const count = useSelector(state => state.count);
    const [start, setStart] = useState(false);
    const [minimize, setMinimize] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSource, setSelectedSource] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedItemKeys, setSelectedItemKeys] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const [categoryItems, setCategoryItems] = useState(null);
    const [photoList, setPhotoList] = useState(null);
    const [imageIdx, setImageIdx] = useState(0);
    const [markerKey, setMarkerKey] = useState(null);
    const [mapIdx, setMapIdx] = useState(0);
    const [showMap, setShowMap] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [idle, setIdle] = useState(true);
    // const [zoomValue, setZoomValue] = useState(0);
    const [disableEvent, setDisableEvent] = useState(true);
    const [goLeftMap, setGoLeftMap] = useState(false);
    const [goRightMap, setGoRightMap] = useState(false);
    const [goTopMap, setGoTopMap] = useState(false);
    const [goBottomMap, setGoBottomMap] = useState(false);
    const [openLightBox, setOpenLightBox] = useState(false);
    const [margin, setMargin] = useState(false);

    
    const mapOuterWrapElem = useRef(null);
    const mapWrapElem = useRef(null);
    const mapElem = useRef(null);
    const getDisableFunc = useRef(null);
    // const zoomToFunc = useRef(null);
    // const getMarkersFunc = useRef(null);
    const resetPosFunc = useRef(null);
    const startIconAnimFunc = useRef(null);
    const stopIconAnimFunc = useRef(null);
    const centerMapFunc = useRef(null);
    const flickityElem = useRef(null);
    const updateMapSizeFunc = useRef(null);
    
    const imagesSrc = [map1,map2,map3,map4,map5,map6,map7,map8,map9,map10,map11,map12,map13,map14,map15,map16,map17,map18,map19,map20];

    useEffect(()=>{
        const icons = document.querySelectorAll('.iconBlock');
        let tl = [];

        const initAnimIcon = () => {
            for(let i=0; i<icons.length; i++){
                const icon = icons[i];
                createTimeline(icon, i)
            }
        }

        const createTimeline = (elem, i) => {
            tl[i] = gsap.timeline({
                delay:gsap.utils.random(1, 20),
                onComplete:function(){
                    createTimeline(elem);
                }
            })
            tl[i].set(elem, { zIndex:2 });
            tl[i].to(elem, gsap.utils.random(1, 1.3), { force3D:true, scale:gsap.utils.random(1.2, 1.5), ease:'elastic.out(1, 0.3)' });
            tl[i].to(elem, 1, { scale:1, ease:'power4.out' });
            tl[i].set(elem, { zIndex:1 });
        }

        const startIconAnim = () => {
            // for(let i=0; i<icons.length; i++){
            //     const icon = icons[i];
            //     gsap.set(icons[i], {clearProps:true})
            //     createTimeline(icon, i)
            // }
        }
        startIconAnimFunc.current = {startIconAnim}

        const stopIconAnim = () => {
            // for(let i=0; i<icons.length; i++){
            //     tl[i].kill();
            // }
        }
        stopIconAnimFunc.current = {stopIconAnim}

        initAnimIcon();

        // return () => {
        // }
    },[])

    useEffect(()=>{
        let ratio = 0;//1824/2736;
        const map = {
            initWidth:window.innerWidth*2, initHeight:window.innerWidth*2 * ratio, 
            pos:{x:0, y:0}, 
            ease:{x:0, y:0}, 
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
        let disable = true;
        let startFingerDist = 0;
        let fingerDist = 0;
        let timer = null;
        const imagesRatio = [];

        const idleMode = () => {
            setIdle(false);
            if(timer) clearTimeout(timer);
            timer = setTimeout(()=>{
                setStart(false);
                setSelectedItem(null);
                setSelectedCategory(null);
                setMinimize(false);
                setIdle(true);
                setOpenLightBox(false);
                setShowDetails(false);
                setShowMap(false);
                setDisableEvent(false);
                setSelectedSource(null);
                // startIconAnimFunc.current.startIconAnim();
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

                map.pos.x += mouse.delta.x * 1;
                map.pos.y += mouse.delta.y * 1;

                update();
            }
        }
        
        const onTouchMove = (event) => {
            if(!disable){
                if(event.touches.length > 1){ // If pinch-zooming
                    fingerDist = get_distance(event);
                    const z = (startZoom+1) * (fingerDist/startFingerDist);
                    // zoomTo(z-1);
                }
                else{
                    let e = (event.touches? event.touches[0]: event);

                    mouse.currentPos.x = e.clientX - mouse.startPos.x;
                    mouse.currentPos.y = e.clientY - mouse.startPos.y;

                    mouse.delta.x = mouse.currentPos.x - mouse.lastPos.x;
                    mouse.delta.y = mouse.currentPos.y - mouse.lastPos.y;

                    mouse.lastPos.x = mouse.currentPos.x;
                    mouse.lastPos.y = mouse.currentPos.y;

                    map.pos.x += mouse.delta.x * 1;
                    map.pos.y += mouse.delta.y * 1;
                }
                update();
            }
        }

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove, false);
            document.removeEventListener("touchmove", onTouchMove, false);
            document.removeEventListener('mouseup', onMouseUp, false);
            document.removeEventListener('touchend', onMouseUp, false);
        }

        // const onMouseWheel = (e) => {
        //     if(!disable){
        //         zoomTo(e);
        //     }
        // }

        const get_distance = (e) => {
            var diffX = e.touches[0].clientX - e.touches[1].clientX;
            var diffY = e.touches[0].clientY - e.touches[1].clientY;
            return Math.sqrt(diffX * diffX + diffY * diffY);
        }

        // const zoomTo = (e) => {
        //     const offset = {left:mapWrapElem.current.offsetLeft, top:mapWrapElem.current.offsetTop};

        //     let x, y;
        //     if(typeof e === 'object'){
        //         x = e.clientX;
        //         y = e.clientY;
        //     }
        //     else{
        //         x = window.innerWidth/2;
        //         y = window.innerHeight/2;
        //     }
        //     const mx = (x - offset.left - map.pos.x) / (zoom * 2 + 1);
        //     const my = (y - offset.top - map.pos.y) / (zoom * 2 + 1);

        //     const offsetBeforeZoom = {x:mx * (zoom * 2), y:my * (zoom * 2)};


        //     if(typeof e === 'object'){
        //         if(e.deltaY < 0)
        //             zoom += 1 / zoomRange;
        //         else if(e.deltaY > 0)
        //             zoom -= 1 / zoomRange;
        //     }
        //     else
        //         zoom = e;
        //     zoom = Math.min(1, Math.max(0, zoom));
        //     // console.log(window.width, window.length, e.clientX, e.clientY)
        //     // setZoomValue(zoom);
        //     // setRangeValue(zoom);


        //     const offsetAfterZoom = {x:mx * (zoom * 2), y:my * (zoom * 2)};
        //     const space = {x: -offset.left - offsetBeforeZoom.x, y: -offset.top - offsetBeforeZoom.y};

            
        //     mapWrapElem.current.style.left = -(offsetAfterZoom.x + space.x) +'px';
        //     mapWrapElem.current.style.top = -(offsetAfterZoom.y + space.y) +'px';
        // }
        // zoomToFunc.current = {zoomTo}

        const centerMap = (x,y) => {
            if(x > 50)
                map.pos.x = -map.initWidth * (x/100) + (window.innerWidth * .4974415) + (window.innerWidth * .4974415)/2;
            else
                map.pos.x = -map.initWidth * (x/100) + (window.innerWidth * .4974415)/2;
            map.pos.y = -map.initHeight * (y/100) + window.innerHeight/2;

            update();
        }
        centerMapFunc.current = {centerMap}

        const resetPos = (x,y) => {
            // zoomTo(0);
            map.pos.x = x !== undefined ? -x : map.pos.x;//-map.initWidth/2 + window.innerWidth/2;
            map.pos.y = y !== undefined ? y > 0 ? 0 : -window.innerWidth*2*ratio : map.pos.y;//-map.initHeight/2 + window.innerHeight/2; 
            map.ease.x = map.pos.x;
            map.ease.y = map.pos.y;
            map.offset.left = 0;
            map.offset.top = 0;
            // mapWrapElem.current.style.left = map.offset.left +'px';
            // mapWrapElem.current.style.top = map.offset.top +'px';
            update();
            gsap.to(map.pos, 1, {x:-map.initWidth/2 + window.innerWidth/2, y:-map.initHeight/2 + window.innerHeight/2, ease:'power3.inOut',
                onUpdate:function(){
                    update();
                }
            })
        }
        resetPosFunc.current = {resetPos}

        const setMapSize = (w, _ratio) => {
            maxWidth = w;
            maxHeight = maxWidth * _ratio;
            mapWrapElem.current.style.width = maxWidth + 'px';
            mapWrapElem.current.style.height = maxHeight + 'px';

            map.initHeight = maxHeight;
        }

        const movePos = () => {
            if(mapWrapElem.current){
                const offset = {left:mapWrapElem.current.offsetLeft, top:mapWrapElem.current.offsetTop};
                map.pos.x = Math.min(-offset.left, Math.max(-(map.initWidth * (zoom * 2+1)) + mapOuterWrapElem.current.offsetWidth - offset.left, map.pos.x));
                map.pos.y = Math.min(-offset.top, Math.max(-(map.initHeight * (zoom * 2+1)) + mapOuterWrapElem.current.offsetHeight - offset.top, map.pos.y));
            }
        }

        const updateMarkerPos = () => {
            for(let i=0; i<markerElems.length; i++){
                const marker = markerElems[i];
                marker.style.transform = `translate3d(0,0,0) scale(${1/(zoom * 2 + 1)})`;
            }
        }

        const checkNextMapIdx = () => {
            const offset = {left:mapWrapElem.current.offsetLeft, top:mapWrapElem.current.offsetTop};
            if(map.pos.x > -offset.left - 10)
                setGoLeftMap(true);
            else
                setGoLeftMap(false);

            if(map.pos.x < -(map.initWidth * (zoom * 2+1)) + mapOuterWrapElem.current.offsetWidth - offset.left + 10)
                setGoRightMap(true);
            else
                setGoRightMap(false);

            if(map.pos.y > -offset.top - 10)
                setGoTopMap(true);
            else
                setGoTopMap(false);

            if(map.pos.y < -(map.initHeight * (zoom * 2+1)) + mapOuterWrapElem.current.offsetHeight - offset.top + 10)
                setGoBottomMap(true);
            else
                setGoBottomMap(false);
        }

        const update = () => {
            movePos();
            updateMarkerPos();
            if(mapWrapElem.current)
                checkNextMapIdx();
            map.ease.x += (map.pos.x - map.ease.x) * 1;
            map.ease.y += (map.pos.y - map.ease.y) * 1;
            if(mapWrapElem.current)
                mapWrapElem.current.style.transform = `translate3d(${map.ease.x}px,${map.ease.y}px,0) scale(${zoom * 2 + 1})`;
        }

        const render = () => {
            requestAnimationFrame(render);
            // update();
        }
        
        const addEvent = () => {
            document.addEventListener("mousedown", onMouseDown, false);
            document.addEventListener("touchstart", onMouseDown, false);
            document.addEventListener("touchmove", (event)=>{if(!disable) event.preventDefault()}, {passive: false});
            // document.addEventListener("mousewheel", onMouseWheel, false);
        }

        const removeEvent = () => {
            document.removeEventListener("mousedown", onMouseDown, false);
            document.removeEventListener("touchstart", onMouseDown, false);
            // document.removeEventListener("mousewheel", onMouseWheel, false);
        }
        
        const updateMapSize = (_mapIdx) => {
            setMapSize(map.initWidth, imagesRatio[_mapIdx-1]);
        }
        updateMapSizeFunc.current = {updateMapSize}

        const loadImage = () => {
            for(let i=0; i<imagesSrc.length; i++){
                const img = new Image();
                img.onload = function(){
                    ratio = this.height/this.width;
                    imagesRatio[i] = ratio;
                }
                img.src = imagesSrc[i];
            }
        }

        const getDisable = (bool) => {
            disable = bool;
        }
        getDisableFunc.current = {getDisable}

        const init = () => {
            markerElems = document.querySelectorAll('.marker');
            setMapSize(map.initWidth, ratio);
            addEvent();
            render();

            map.pos.x = -(map.initWidth * .24 - window.innerWidth/2/2);
            map.pos.y = -(map.initHeight * .86 - window.innerHeight/2);
        }

        init();
        loadImage();

        return () => {
            removeEvent();
        }
    },[])
    
    useEffect(()=>{ 
        let smooth = new SmoothScroll('#scrollWrap',(s, y, h) => {});
        smooth.on();
        smooth.showScrollBar();

        return () => {
            smooth.hideScrollBar();
            smooth.off();
            smooth = null;
        }
    },[])
    
    useEffect(()=>{
        getDisableFunc.current.getDisable(disableEvent);           
    },[disableEvent]);

    // useEffect(()=>{
    //     if(categoryItems !== null){
    //         let idx = 0;
    //         let array = [];
    //         console.log(photoList["photos"]);
    //         for(let i=0; i<categoryItems.length; i++){                
    //             const imageLth = categoryItems[i][1].images.length;
    //             if(imageLth){
    //                 for(let j=0; j<imageLth; j++){
    //                     if(categoryItems[i][1].images[j].selected)
    //                     array[idx++] = [categoryItems[i][0], categoryItems[i][1].images[j].src];
    //                 }
    //             }
    //             else{
    //                 if(categoryItems[i][1].images.selected)
    //                     array[idx++] = [categoryItems[i][0], categoryItems[i][1].images.src];
    //             }
    //         }
    //         console.log(array)
    //         setSelectedImages(array);
    //     }
    // },[categoryItems])

    useEffect(()=>{
        if(photoList !== null){
            let idx = 0;
            let array = [];
            array = photoList["photos"]
            setSelectedImages(array);  
        }
    },[photoList])

    
    useEffect(()=>{
        if(flickityElem.current){
            flickityElem.current.on('change', (index) => {
                setImageIdx(index);
            })
            flickityElem.current.on('staticClick', ( event, pointer, cellElement, cellIndex ) => {
                if ( !cellElement ) {
                    return;
                }
                onClickImage(cellIndex)
            })
        }
    },[selectedSource])
    
    useEffect(()=>{
        if(imageIdx !== null && flickityElem.current)
            flickityElem.current.select(imageIdx);
    },[imageIdx])

    // useEffect(()=>{
    //     setDisableEvent(!showMap);
    // },[showMap])

    const onClickLanging = () => {
        setStart(true);
        // stopIconAnimFunc.current.stopIconAnim();
    }

    const onClickCategory = (keyname) => {
        if(selectedCategory !== keyname){
            setSelectedCategory(keyname);
            setCategoryItems(Object.entries(data.items[keyname]));
            setPhotoList(data.images[keyname]);
            setMinimize(true);
            setSelectedItemKeys(Object.keys(data.items[keyname]));
            setLogData(keyname);
        }
    }

    const onShowDetails = (bool, itemName) => {
        if(itemName){
            setSelectedSource(data.items[selectedCategory][itemName].sourceID);
        }
        setShowDetails(bool);
        setDisableEvent(bool);
        if(!bool){
            setMargin(false);
            setMarkerKey(null);
        }
    }

    const onChangeImage = (i) => {
        setImageIdx(i);
        flickityElem.current.select(i);
    }

    const onClickImage = (i) => {
        setImageIdx(i);
        setOpenLightBox(true);
    }

    const onClickBlock = (idx, i, max, isImg = false) => {
        let itemKey;
        if(isImg)
            itemKey = selectedImages[idx+max*i] ? selectedImages[idx+max*i][1] : false;
        else
            itemKey = selectedItemKeys[idx+max*i];
        if(itemKey){
            setLogData(`${selectedCategory},${itemKey}`);
            setShowMap(true);
            onShowDetails(true, itemKey);
            onClickMarker(selectedCategory, itemKey, data.items[selectedCategory][itemKey].position.x, data.items[selectedCategory][itemKey].position.y)
        }
    }

    const onClickRelatedItem = (itemName) => {
        onClickMarker(selectedCategory, itemName, data.items[selectedCategory][itemName].position.x, data.items[selectedCategory][itemName].position.y)
        setImageIdx(0);
    }

    const openDetailsPage = (bool,x,y) => {
        onShowDetails(bool);
        centerMapFunc.current.centerMap(x,y);
    }

    const onClickBack = () => {
        setOpenLightBox(false);
        setShowDetails(false);
        setShowMap(false);
        setSelectedSource(null);
        setDisableEvent(true);
        setMargin(false);
    }

    const onClickMarker = (cat, key,x,y) => {
        onClickCategory(cat);
        setSelectedItem(key);
        setMarkerKey(key);
        setMapIdx(data.items[cat][key].mapIdx);
        updateMapSizeFunc.current.updateMapSize(data.items[cat][key].mapIdx);
        openDetailsPage(true,x,y);
        setImageIdx(0);
        setSelectedSource(data.items[cat][key].sourceID);

        if(x > 50)
            setMargin(true);
        else
            setMargin(false);
    }

    const getText = (idx, i, n) => {
        return selectedItemKeys[idx+n*i] && data.items[selectedCategory][selectedItemKeys[idx+n*i]] && <><span className="en">{data.items[selectedCategory][selectedItemKeys[idx+n*i]].name[0]}</span><span className="tc heavy">{data.items[selectedCategory][selectedItemKeys[idx+n*i]].name[1]}</span></>;
    }

    const getImage = (idx, i, n) => {
        //console.log(selectedImages)
        return selectedImages[idx+n*i] && `url(${(!isInDevMode() ? '.' : '') + selectedImages[idx+n*i][0] })`;
    }

    const getImageII = () => {
        let temp;
        temp = selectedImages[0][0];
        selectedImages.shift();
        return temp && `url(${(!isInDevMode() ? '.' : '') + temp })`;
    }

    const onChangeMapIdx = (dir, idx) => {
        let x,y;
        setMapIdx(idx);
        updateMapSizeFunc.current.updateMapSize(idx);

        if(dir === 'left') x = window.innerWidth*2-window.innerWidth;
        if(dir === 'right') x = 0;
        else if(dir === 'top') y = 0;
        else if(dir === 'bot') y = 1;
        resetPosFunc.current.resetPos(x,y);
    }

    let iconIdx = 1;

    return (
        <div id="lm01">
            <div id="home" className={start ? 'hide' : ''} onClick={onClickLanging}>
                <div className="row">
                    <div className="iconBlock size2 icon4"><span></span></div>
                    <div className="size2"><div className="iconBlock halfHeight icon3"><span></span></div></div>
                    <div className="size5"><div className="iconBlock halfHeight icon4"><span></span></div></div>
                    <div className="iconBlock size4 icon3"><span></span></div>
                    <div className="iconBlock size2 icon1"><span></span></div>
                </div>
                <div className="row">
                    <div className="iconBlock size1 icon3"><span></span></div>
                    <div className="size3"></div>
                    <div className="size2 icon4"></div>
                    <div className="size4 icon1"></div>
                    <div className="size2"></div>
                    <div className="iconBlock size2 halfHeight icon4"><span></span></div>
                </div>
                <div className="row">
                    <div className="iconBlock size2 icon1"><span></span></div>
                    <div className="iconBlock size2 icon3"><span></span></div>
                    <div className="iconBlock size4 icon2"><span></span></div>
                    <div className="iconBlock size2 icon3"><span></span></div>
                    <div className="size2">
                        <div className="iconBlock size2 halfHeight icon1"><span></span></div>
                        <div className="iconBlock size2 halfHeight icon2"><span></span></div>
                    </div>
                    <div className="iconBlock size2 icon3"><span></span></div>
                </div>
                <div id="title"></div>
            </div>
            <div id="categorySelector" className={`${start?'':'hide'}${minimize?' minimize':''}`}>
                {
                    Object.keys(data.categories).map((v,i)=>{
                        const keyname = v;
                        return <div key={i} id={keyname} className={`catItem${selectedCategory === keyname?' active' : selectedCategory !== null ? ' hide' : ''}`} onClick={()=>!minimize && onClickCategory(keyname)}>
                            <div id="outerWrap">
                                <div id="wrap">
                                    <div className="icon"></div>
                                    <div className="en">{data.categories[keyname].name[0]}</div>
                                    <div className="tc heavy">{data.categories[keyname].name[1]}</div>
                                </div>
                            </div>
                        </div>
                    })
                }
                <div id="smallButtons" className={selectedCategory?'active':''}>
                    {
                        Object.keys(data.categories).map((v,i)=>{
                            const keyname = v;
                            if(selectedCategory !== keyname)
                                return <div key={i} id={keyname} className={`btn ${`_${iconIdx++}`}`}onClick={()=>onClickCategory(keyname)}></div>
                            else
                                return false;
                        })
                    }
                </div>
            </div>
            <div id="itemsListWrap" className={`${selectedCategory} ${selectedCategory?'':'hide'}`}>
                <div id="scrollWrap">
                    {
                        selectedCategory && (
                            selectedCategory === 'characters' ? 
                                [...Array(2)].map((v,i)=>{
                                    if(i===0){
                                        return <ul key={i}>
                                        <li>
                                            <div className="block size2 lightGray"></div>
                                            <div>
                                                <div className="block size2 red halfHeight"></div>
                                                <div className="block size2_2 white halfHeight" onClick={()=>onClickBlock(0,i,35)}>{getText(0,i,35)}</div>
                                            </div>
                                            <div>
                                                <div className="block size5 darkgray halfHeight" onClick={()=>onClickBlock(1,i,35)}>{getText(1,i,35)}</div>
                                                <div className="block size2 red halfHeight floatR"></div>
                                            </div>
                                            <div className="block size4 white"></div>
                                            <div className="block size2 red overHeight" onClick={()=>onClickBlock(0,i,16,true)} style={{backgroundImage: getImage(0,i,16)}}></div>
                                        </li>
                                        <li>
                                            <div className="block size5 white overHeight" onClick={()=>onClickBlock(1,i,16,true)} style={{backgroundImage: getImage(1,i,16)}}></div>
                                            <div className="block size2 darkgray"></div>
                                            <div className="block size4 lightGray" onClick={()=>onClickBlock(2,i,35)}>{getText(2,i,35)}</div>
                                            <div className="block size2 darkgray"></div>
                                            <div className="block size2 white"></div>
                                        </li>
                                        <li>
                                            <div className="block size1 red"></div>
                                            <div className="block size3 darkgray fix" onClick={()=>onClickBlock(3,i,35)}>{getText(3,i,35)}</div>
                                            <div className="block size4 white" onClick={()=>onClickBlock(4,i,35)}>{getText(4,i,35)}</div>
                                            <div className="block size2 red"></div>
                                            <div>
                                                <div className="block size2 white halfHeight" onClick={()=>onClickBlock(5,i,35)}>{getText(5,i,35)}</div>
                                                <div className="block size2 lightGray halfHeight"></div>
                                            </div>
                                            <div className="block size2 red overHeight bottom"></div>
                                        </li>
                                        <li>
                                            <div className="block size2 lightGray"></div>
                                            <div className="block size4 red" onClick={()=>onClickBlock(2,i,16,true)} style={{backgroundImage: getImage(2,i,16)}}></div>
                                            <div className="block size2 darkgray overHeight"></div>
                                            <div className="block size2 white" onClick={()=>onClickBlock(6,i,35)}>{getText(6,i,35)}</div>
                                            <div className="block size5 darkgray" onClick={()=>onClickBlock(7,i,35)}>{getText(7,i,35)}</div>
                                        </li>
                                        <li>
                                            <div className="block size4 darkgray" onClick={()=>onClickBlock(8,i,35)}>{getText(8,i,35)}</div>
                                            <div className="block size2 white"> </div>
                                            <div className="block size2 red"></div>
                                            <div className="block size6 lightGray" onClick={()=>onClickBlock(3,i,16,true)} style={{backgroundImage: getImage(3,i,16)}}></div>
                                        </li>
                                
                                
                                
                                
                                
                                
                                
                                        <li style={{zIndex:1,position:"relative"}}>
                                            <div>
                                                <div className="block size2 red halfHeight"></div>  
                                                <div className="block size2 lightGray overHeight"></div>  
                                            </div>   
                                            <div>
                                                <div className="block size4 lightGray halfHeight"onClick={()=>onClickBlock(9,i,35)}>{getText(9,i,35)}</div>
                                                <div className="block size4 red halfHeight"></div>
                                            </div>
                                            <div className="block size5_ white" onClick={()=>onClickBlock(4,i,16,true)} style={{backgroundImage: getImage(4,i,16)}}></div>
                                            <div>
                                                <div className="block size2 red halfHeight"></div>
                                                <div className="block size5 darkgray halfHeight"></div>    
                                            </div>  
                                        </li>
                                        <li>
                                            <div>
                                                <div className="block size2 red lower under"></div>
                                            </div>
                                            <div>
                                                <div className="block size2_ white"></div>
                                            </div>
                                            <div>
                                                <div className="block size4 darkgray reg" onClick={()=>onClickBlock(5,i,16,true)} style={{backgroundImage: getImage(5,i,16)}}></div>
                                            </div>
                                            <div>
                                                <div className="block size5 red halfHeight"></div>
                                                <div className="block size5 white halfHeight" onClick={()=>onClickBlock(10,i,35)}>{getText(10,i,35)}</div>
                                            </div>
                                            <div>
                                                <div className="block size2 lightGray reg" onClick={()=>onClickBlock(11,i,35)}>{getText(11,i,35)}</div>
                                            </div> 
                                        </li>
                                        <li>                                          
                                            <div className="block size2 red"></div>
                                            <div className="block size2_ lightGray reg" onClick={()=>onClickBlock(12,i,35)}>{getText(12,i,35)}</div>          
                                            <div className="block size2 red overHeight"></div>
                                            <div>
                                                <div className="block size5 lightGray halfHeight"></div>
                                                <div className="block size3 darkgray halfHeight" onClick={()=>onClickBlock(13,i,35)}>{getText(13,i,35)}</div>
                                            </div>
                                            <div>
                                                <div className="block size4 red halfHeight"></div>
                                                <div className="block size2 darkgray halfHeight floatR"></div>
                                            </div>
                                        </li>
                                        <li>
                                            
                                            <div className="block size5_ white" onClick={()=>onClickBlock(6,i,16,true)} style={{backgroundImage: getImage(6,i,16)}}></div>
                                            <div className="block size2 darkgray sp_height" onClick={()=>onClickBlock(14,i,35)}>{getText(14,i,35)}</div>
                                            <div className="block size5__ lightGray reg" onClick={()=>onClickBlock(7,i,16,true)} style={{backgroundImage: getImage(7,i,16)}}></div>
                                            <div>
                                                <div className="block size2 red halfHeight"></div>
                                                <div className="block size2 white halfHeight" onClick={()=>onClickBlock(15,i,35)}>{getText(15,i,35)}</div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="block size2 red halfHeight upper"></div>
                                            <div className="block size2 lightGray reg"  onClick={()=>onClickBlock(16,i,35)}>{getText(16,i,35)}</div>
                                            <div className="block size5 red reg"></div>
                                            <div>
                                                <div className="block size4 white halfHeight"></div>
                                                <div className="block size4 darkgray halfHeight"  onClick={()=>onClickBlock(17,i,35)}>{getText(17,i,35)}</div>
                                            </div>
                                            <div className="block size2 red reg"></div>
                                        </li>
                                
                                
                                
                                
                                
                                
                                
                                        <li>
                                            <div className="block size2 lightGray"></div>
                                            <div>
                                                <div className="block size2 red halfHeight"></div>
                                                <div className="block size2_2 white halfHeight" onClick={()=>onClickBlock(18,i,35)}>{getText(18,i,35)}</div>
                                            </div>
                                            <div>
                                                <div className="block size5 darkgray halfHeight" onClick={()=>onClickBlock(19,i,35)}>{getText(19,i,35)}</div>
                                                <div className="block size2 red halfHeight floatR"></div>
                                            </div>
                                            <div className="block size4 white"></div>
                                            <div className="block size2 red overHeight" onClick={()=>onClickBlock(8,i,16,true)} style={{backgroundImage: getImage(8,i,16)}}></div>
                                        </li>
                                        <li>
                                            <div className="block size5 white overHeight" onClick={()=>onClickBlock(9,i,16,true)} style={{backgroundImage: getImage(9,i,16)}}></div>
                                            <div className="block size2 darkgray"></div>
                                            <div className="block size4 lightGray" onClick={()=>onClickBlock(20,i,35)}>{getText(20,i,35)}</div>
                                            <div className="block size2 darkgray"></div>
                                            <div className="block size2 white"></div>
                                        </li>
                                        <li>
                                            <div className="block size1 red"></div>
                                            <div className="block size3 darkgray fix" onClick={()=>onClickBlock(21,i,35)}>{getText(21,i,35)}</div>
                                            <div className="block size4 white" onClick={()=>onClickBlock(22,i,35)}>{getText(22,i,35)}</div>
                                            <div className="block size2 red"></div>
                                            <div>
                                                <div className="block size2 white halfHeight"></div>
                                                <div className="block size2 lightGray halfHeight"></div>
                                            </div>
                                            <div className="block size2 red overHeight bottom"></div>
                                        </li>
                                        <li>
                                            <div className="block size2 lightGray"></div>
                                            <div className="block size4 red" onClick={()=>onClickBlock(10,i,16,true)} style={{backgroundImage: getImage(10,i,16)}}></div>
                                            <div className="block size2 darkgray overHeight"></div>
                                            <div className="block size2 white" onClick={()=>onClickBlock(23,i,35)}>{getText(23,i,35)}</div>
                                            <div className="block size5 darkgray" onClick={()=>onClickBlock(24,i,35)}>{getText(24,i,35)}</div>
                                        </li>
                                        <li>
                                            <div className="block size4 darkgray" onClick={()=>onClickBlock(25,i,35)}>{getText(25,i,35)}</div>
                                            <div className="block size2 white"> </div>
                                            <div className="block size2 red"></div>
                                            <div className="block size6 lightGray" onClick={()=>onClickBlock(11,i,16,true)} style={{backgroundImage: getImage(11,i,16)}}></div>
                                        </li>
                                
                                
                                
                                
                                
                                        <li style={{zIndex:1,position:"relative"}}>
                                            <div>
                                                <div className="block size2 red halfHeight"></div>  
                                                <div className="block size2 lightGray overHeight"></div>  
                                            </div>   
                                            <div>
                                                <div className="block size4 lightGray halfHeight"onClick={()=>onClickBlock(26,i,35)}>{getText(26,i,35)}</div>
                                                <div className="block size4 red halfHeight"></div>
                                            </div>
                                            <div className="block size5_ white" onClick={()=>onClickBlock(12,i,16,true)} style={{backgroundImage: getImage(12,i,16)}}></div>
                                            <div>
                                                <div className="block size2 red halfHeight"></div>
                                                <div className="block size5 darkgray halfHeight"></div>    
                                            </div>  
                                        </li>
                                        <li>
                                            <div>
                                                <div className="block size2 red lower under"></div>
                                            </div>
                                            <div>
                                                <div className="block size2_ white"></div>
                                            </div>
                                            <div>
                                                <div className="block size4 darkgray reg" onClick={()=>onClickBlock(13,i,16,true)} style={{backgroundImage: getImage(13,i,16)}}></div>
                                            </div>
                                            <div>
                                                <div className="block size5 red halfHeight"></div>
                                                <div className="block size5 white halfHeight" onClick={()=>onClickBlock(27,i,35)}>{getText(27,i,35)}</div>
                                            </div>
                                            <div>
                                                <div className="block size2 lightGray reg" onClick={()=>onClickBlock(28,i,35)}>{getText(28,i,35)}</div>
                                            </div> 
                                        </li>
                                        <li>                                          
                                            <div className="block size2 red"></div>
                                            <div className="block size2_ lightGray reg" onClick={()=>onClickBlock(29,i,35)}>{getText(29,i,35)}</div>          
                                            <div className="block size2 red overHeight"></div>
                                            <div>
                                                <div className="block size5 lightGray halfHeight"></div>
                                                <div className="block size3 darkgray halfHeight" onClick={()=>onClickBlock(30,i,35)}>{getText(30,i,35)}</div>
                                            </div>
                                            <div>
                                                <div className="block size4 red halfHeight"></div>
                                                <div className="block size2 darkgray halfHeight floatR"></div>
                                            </div>
                                        </li>
                                        <li>
                                            
                                            <div className="block size5_ white" onClick={()=>onClickBlock(14,i,16,true)} style={{backgroundImage: getImage(14,i,16)}}></div>
                                            <div className="block size2 darkgray sp_height" onClick={()=>onClickBlock(31,i,35)}>{getText(31,i,35)}</div>
                                            <div className="block size5__ lightGray reg" onClick={()=>onClickBlock(15,i,16,true)} style={{backgroundImage: getImage(15,i,16)}}></div>
                                            <div>
                                                <div className="block size2 red halfHeight"></div>
                                                <div className="block size2 white halfHeight" onClick={()=>onClickBlock(32,i,35)}>{getText(32,i,35)}</div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="block size2 red halfHeight upper"></div>
                                            <div className="block size2 lightGray reg"  onClick={()=>onClickBlock(33,i,35)}>{getText(33,i,35)}</div>
                                            <div className="block size5 red reg"></div>
                                            <div>
                                                <div className="block size4 white halfHeight"></div>
                                                <div className="block size4 darkgray halfHeight"  onClick={()=>onClickBlock(34,i,35)}>{getText(34,i,35)}</div>
                                            </div>
                                            <div className="block size2 red reg"></div>
                                        </li>
                                        </ul>
                                    }
                                    else{
                                        return <ul key={i}>
                                        <li>
                                            <div className="block size2 lightGray"></div>
                                            <div>
                                                <div className="block size2 red halfHeight"></div>
                                                <div className="block size2_2 white halfHeight" onClick={()=>onClickBlock(0,i,35)}>{getText(0,i,35)}</div>
                                            </div>
                                            <div>
                                                <div className="block size5 darkgray halfHeight" onClick={()=>onClickBlock(1,i,35)}>{getText(1,i,35)}</div>
                                                <div className="block size2 red halfHeight floatR"></div>
                                            </div>
                                            <div className="block size4 white"></div>
                                            <div className="block size2 red overHeight" onClick={()=>onClickBlock(0,i,16,true)} style={{backgroundImage: getImage(0,i,16)}}></div>
                                        </li>
                                        <li>
                                            <div className="block size5 white overHeight" onClick={()=>onClickBlock(1,i,16,true)} style={{backgroundImage: getImage(1,i,16)}}></div>
                                            <div className="block size2 darkgray"></div>
                                            <div className="block size4 lightGray" onClick={()=>onClickBlock(2,i,35)}>{getText(2,i,35)}</div>
                                            <div className="block size2 darkgray"></div>
                                            <div className="block size2 white"></div>
                                        </li>
                                        <li>
                                            <div className="block size1 red"></div>
                                            <div className="block size3 darkgray fix" onClick={()=>onClickBlock(3,i,35)}>{getText(3,i,35)}</div>
                                            <div className="block size4 white" onClick={()=>onClickBlock(4,i,35)}>{getText(4,i,35)}</div>
                                            <div className="block size2 red"></div>
                                            <div>
                                                <div className="block size2 white halfHeight" onClick={()=>onClickBlock(5,i,35)}>{getText(5,i,35)}</div>
                                                <div className="block size2 lightGray halfHeight"></div>
                                            </div>
                                            <div className="block size2 red overHeight bottom"></div>
                                        </li>
                                        <li>
                                            <div className="block size2 lightGray"></div>
                                            <div className="block size4 red" onClick={()=>onClickBlock(2,i,16,true)} style={{backgroundImage: getImage(2,i,16)}}></div>
                                            <div className="block size2 darkgray overHeight"></div>
                                            <div className="block size2 white" onClick={()=>onClickBlock(6,i,35)}>{getText(6,i,35)}</div>
                                            <div className="block size5 darkgray" onClick={()=>onClickBlock(7,i,35)}>{getText(7,i,35)}</div>
                                        </li>
                                        <li>
                                            <div className="block size4 darkgray" onClick={()=>onClickBlock(8,i,35)}>{getText(8,i,35)}</div>
                                            <div className="block size2 white"> </div>
                                            <div className="block size2 red"></div>
                                            <div className="block size6 lightGray" onClick={()=>onClickBlock(3,i,16,true)} style={{backgroundImage: getImage(3,i,16)}}></div>
                                        </li>
                                
                                
                                
                                
                                
                                
                                
                                        <li style={{zIndex:1,position:"relative"}}>
                                            <div>
                                                <div className="block size2 red halfHeight"></div>  
                                                <div className="block size2 lightGray overHeight"></div>  
                                            </div>   
                                            <div>
                                                <div className="block size4 lightGray halfHeight"onClick={()=>onClickBlock(9,i,35)}>{getText(9,i,35)}</div>
                                                <div className="block size4 red halfHeight"></div>
                                            </div>
                                            <div className="block size5_ white" onClick={()=>onClickBlock(4,i,16,true)} style={{backgroundImage: getImage(4,i,16)}}></div>
                                            <div>
                                                <div className="block size2 red halfHeight"></div>
                                                <div className="block size5 darkgray halfHeight"></div>    
                                            </div>  
                                        </li>
                                        <li>
                                            <div>
                                                <div className="block size2 red lower under"></div>
                                            </div>
                                            <div>
                                                <div className="block size2_ white"></div>
                                            </div>
                                            <div>
                                                <div className="block size4 darkgray reg" onClick={()=>onClickBlock(5,i,16,true)} style={{backgroundImage: getImage(5,i,16)}}></div>
                                            </div>
                                            <div>
                                                <div className="block size5 red halfHeight"></div>
                                                <div className="block size5 white halfHeight" onClick={()=>onClickBlock(10,i,35)}>{getText(10,i,35)}</div>
                                            </div>
                                            <div>
                                                <div className="block size2 lightGray reg" onClick={()=>onClickBlock(11,i,35)}>{getText(11,i,35)}</div>
                                            </div> 
                                        </li>
                                        <li>                                          
                                            <div className="block size2 red"></div>
                                            <div className="block size2_ lightGray reg" onClick={()=>onClickBlock(12,i,35)}>{getText(12,i,35)}</div>          
                                            <div className="block size2 red overHeight"></div>
                                            <div>
                                                <div className="block size5 lightGray halfHeight"></div>
                                                <div className="block size3 darkgray halfHeight" onClick={()=>onClickBlock(13,i,35)}>{getText(13,i,35)}</div>
                                            </div>
                                            <div>
                                                <div className="block size4 red halfHeight"></div>
                                                <div className="block size2 darkgray halfHeight floatR"></div>
                                            </div>
                                        </li>
                                        <li>
                                            
                                            <div className="block size5_ white" onClick={()=>onClickBlock(6,i,16,true)} style={{backgroundImage: getImage(6,i,16)}}></div>
                                            <div className="block size2 darkgray sp_height" onClick={()=>onClickBlock(14,i,35)}>{getText(14,i,35)}</div>
                                            <div className="block size5__ lightGray reg" onClick={()=>onClickBlock(7,i,16,true)} style={{backgroundImage: getImage(7,i,16)}}></div>
                                            <div>
                                                <div className="block size2 red halfHeight"></div>
                                                <div className="block size2 white halfHeight" onClick={()=>onClickBlock(15,i,35)}>{getText(15,i,35)}</div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="block size2 red halfHeight upper"></div>
                                            <div className="block size2 lightGray reg"  onClick={()=>onClickBlock(16,i,35)}>{getText(16,i,35)}</div>
                                            <div className="block size5 red reg"></div>
                                            <div>
                                                <div className="block size4 white halfHeight"></div>
                                                <div className="block size4 darkgray halfHeight"  onClick={()=>onClickBlock(17,i,35)}>{getText(17,i,35)}</div>
                                            </div>
                                            <div className="block size2 red reg"></div>
                                        </li>
                                
                                
                                
                                
                                
                                
                                
                                        <li>
                                            <div className="block size2 lightGray"></div>
                                            <div>
                                                <div className="block size2 red halfHeight"></div>
                                                <div className="block size2_2 white halfHeight" onClick={()=>onClickBlock(18,i,35)}>{getText(18,i,35)}</div>
                                            </div>
                                            <div>
                                                <div className="block size5 darkgray halfHeight" onClick={()=>onClickBlock(19,i,35)}>{getText(19,i,35)}</div>
                                                <div className="block size2 red halfHeight floatR"></div>
                                            </div>
                                            <div className="block size4 white"></div>
                                            <div className="block size2 red overHeight" onClick={()=>onClickBlock(8,i,16,true)} style={{backgroundImage: getImage(8,i,16)}}></div>
                                        </li>
                                        <li>
                                            <div className="block size5 white overHeight" onClick={()=>onClickBlock(9,i,16,true)} style={{backgroundImage: getImage(9,i,16)}}></div>
                                            <div className="block size2 darkgray"></div>
                                            <div className="block size4 lightGray" onClick={()=>onClickBlock(20,i,35)}>{getText(20,i,35)}</div>
                                            <div className="block size2 darkgray"></div>
                                            <div className="block size2 white"></div>
                                        </li>
                                        <li>
                                            <div className="block size1 red"></div>
                                            <div className="block size3 darkgray fix" onClick={()=>onClickBlock(21,i,35)}>{getText(21,i,35)}</div>
                                            <div className="block size4 white" onClick={()=>onClickBlock(22,i,35)}>{getText(22,i,35)}</div>
                                            <div className="block size2 red"></div>
                                            <div>
                                                <div className="block size2 white halfHeight"></div>
                                                <div className="block size2 lightGray halfHeight"></div>
                                            </div>
                                            <div className="block size2 red overHeight bottom"></div>
                                        </li>
                                        <li>
                                            <div className="block size2 lightGray"></div>
                                            <div className="block size4 red" onClick={()=>onClickBlock(10,i,16,true)} style={{backgroundImage: getImage(10,i,16)}}></div>
                                            <div className="block size2 darkgray overHeight"></div>
                                            <div className="block size2 white" onClick={()=>onClickBlock(23,i,35)}>{getText(23,i,35)}</div>
                                            <div className="block size5 darkgray" onClick={()=>onClickBlock(24,i,35)}>{getText(24,i,35)}</div>
                                        </li>
                                        <li>
                                            <div className="block size4 darkgray" onClick={()=>onClickBlock(25,i,35)}>{getText(25,i,35)}</div>
                                            <div className="block size2 white"> </div>
                                            <div className="block size2 red"></div>
                                            <div className="block size6 lightGray" onClick={()=>onClickBlock(11,i,16,true)} style={{backgroundImage: getImage(11,i,16)}}></div>
                                        </li>
                                        </ul>
                                    }                                    
                                })
                            :selectedCategory === 'warships' ? 
                                [...Array(2)].map((v,i)=>{
                                    if ((i+1)%2===0){
                                        return <ul key={i}>
                                            <li style={{zIndex:1,position:"relative"}}>
                                                <div>
                                                    <div className="block size2 red halfHeight"></div>  
                                                    <div className="block size2 lightGray overHeight"></div>  
                                                </div>   
                                                <div>
                                                    <div className="block size4 lightGray halfHeight" onClick={()=>onClickBlock(0,i,4)}>{getText(0,i,4)}</div>
                                                    <div className="block size4 red halfHeight"></div>
                                                </div>
                                                <div className="block size5_ white" onClick={()=>onClickBlock(0,i,5,true)} style={{backgroundImage: getImage(0,i,5)}}></div>
                                                <div>
                                                    <div className="block size2 red halfHeight"></div>
                                                    <div className="block size5 darkgray halfHeight"></div>    
                                                </div>  
                                            </li>
                                            <li>
                                                <div>
                                                    <div className="block size2 red lower under"></div>
                                                </div>
                                                <div>
                                                    <div className="block size2_ white"></div>
                                                </div>
                                                <div>
                                                    <div className="block size4 darkgray reg"onClick={()=>onClickBlock(1,i,5,true)} style={{backgroundImage: getImage(1,i,5)}}></div>
                                                </div>
                                                <div>
                                                    <div className="block size5 red halfHeight"></div>
                                                    <div className="block size5 white halfHeight" onClick={()=>onClickBlock(1,i,4)}>{getText(1,i,4)}</div>
                                                </div>
                                                <div>
                                                    <div className="block size2 lightGray reg"></div>
                                                </div> 
                                            </li>
                                            <li>                                          
                                                <div className="block size2 red"></div>
                                                <div className="block size2_ lightGray reg" onClick={()=>onClickBlock(2,i,4)}>{getText(2,i,4)}</div>          
                                                <div className="block size2 red overHeight"></div>
                                                <div>
                                                    <div className="block size5 lightGray halfHeight"></div>
                                                    <div className="block size3 darkgray halfHeight" onClick={()=>onClickBlock(3,i,4)}>{getText(3,i,4)}</div>
                                                </div>
                                                <div>
                                                    <div className="block size4 red halfHeight"></div>
                                                    <div className="block size2 darkgray halfHeight floatR"></div>
                                                </div>
                                            </li>
                                            <li>
                                                
                                                <div className="block size5_ white" onClick={()=>onClickBlock(2,i,5,true)} style={{backgroundImage: getImage(2,i,5)}}></div>
                                                <div className="block size2 darkgray reg"></div>
                                                <div className="block size5__ lightGray reg" onClick={()=>onClickBlock(3,i,5,true)} style={{backgroundImage: getImage(3,i,5)}}></div>
                                                <div>
                                                    <div className="block size2 red halfHeight"></div>
                                                    <div className="block size2 white halfHeight"></div>
                                                </div>
                                            </li>
                                            <li>
                                                <div className="block size2 red halfHeight upper"></div>
                                                <div className="block size2 lightGray reg" onClick={()=>onClickBlock(4,i,4)}>{getText(4,i,4)}</div>
                                                <div className="block size5 red reg"></div>
                                                <div>
                                                    <div className="block size4 white halfHeight"></div>
                                                    <div className="block size4 darkgray halfHeight" onClick={()=>onClickBlock(5,i,4)}>{getText(5,i,4)}</div>
                                                </div>
                                                <div className="block size2 red reg"></div>
                                            </li>
                                        </ul>    
                                    }
                                    else{
                                        return <ul key={i}>
                                            <li>
                                                <div className="block size2 lightGray"></div>
                                                <div>
                                                    <div className="block size2 red halfHeight"></div>
                                                    <div className="block size2 white halfHeight"></div>
                                                </div>
                                                <div>
                                                    <div className="block size5 darkgray halfHeight" onClick={()=>onClickBlock(0,i,3)}>{getText(0,i,3)}</div>
                                                    <div className="block size2 red halfHeight floatR"></div>
                                                </div>
                                                <div className="block size4 white" ></div>
                                                <div className="block size2 red overHeight" onClick={()=>onClickBlock(0,i,5,true)} style={{backgroundImage: getImage(0,i,5)}}></div>
                                            </li>
                                            <li>
                                                <div className="block size5 white overHeight" onClick={()=>onClickBlock(1,i,5,true)} style={{backgroundImage: getImage(1,i,5)}}></div>
                                                <div className="block size2 darkgray"></div>
                                                <div className="block size4 lightGray" onClick={()=>onClickBlock(2,i,5,true)} style={{backgroundImage: getImage(2,i,5)}}></div>
                                                <div className="block size2 darkgray"></div>
                                                <div className="block size2 white"></div>
                                            </li>
                                            <li>
                                                <div className="block size1 red"></div>
                                                <div className="block size3 darkgray fix"></div>
                                                <div className="block size4 white"></div>
                                                <div className="block size2 red"></div>
                                                <div>
                                                    <div className="block size2 white halfHeight"onClick={()=>onClickBlock(1,i,3)}>{getText(1,i,3)}</div>
                                                    <div className="block size2 lightGray halfHeight"></div>
                                                </div>
                                                <div className="block size2 red overHeight bottom"></div>
                                            </li>
                                            <li>
                                                <div className="block size2 lightGray"></div>
                                                <div className="block size4 red" onClick={()=>onClickBlock(3,i,5,true)} style={{backgroundImage: getImage(3,i,5)}}></div>
                                                <div className="block size2 darkgray overHeight"></div>
                                                <div className="block size2 white"onClick={()=>onClickBlock(2,i,3)}>{getText(2,i,3)}</div>
                                                <div className="block size5 darkgray"></div>
                                            </li>
                                            <li>
                                                <div className="block size4 darkgray" onClick={()=>onClickBlock(3,i,3)}>{getText(3,i,3)}</div>
                                                <div className="block size2 white" ></div>
                                                <div className="block size2 red"></div>
                                                <div className="block size6 lightGray"  onClick={()=>onClickBlock(4,i,5,true)} style={{backgroundImage: getImage(4,i,5)}}></div>
                                            </li>
                                        </ul>                                        
                                    }
                                    
                                })
                            :selectedCategory === 'events' ? 
                                [...Array(1)].map((v,i)=>{
                                return <ul key={i}>
                                    <li>
                                        <div className="block size2 lightGray"></div>
                                        <div>
                                            <div className="block size2 red halfHeight"></div>
                                            <div className="block size2 white halfHeight"></div>
                                        </div>
                                        <div>
                                            <div className="block size5 darkgray halfHeight" onClick={()=>onClickBlock(0,i)}>{getText(0,i,2)}</div>
                                            <div className="block size2 red halfHeight floatR"></div>
                                        </div>
                                        <div className="block size4 white"></div>
                                        <div className="block size2 red overHeight" onClick={()=>onClickBlock(0,i,5,true)} style={{backgroundImage: getImage(0,i,5)}}></div>
                                    </li>
                                    <li>
                                        <div className="block size5 white overHeight" onClick={()=>onClickBlock(1,i,5,true)} style={{backgroundImage: getImage(1,i,5)}}></div>
                                        <div className="block size2 darkgray"></div>
                                        <div className="block size4 lightGray" onClick={()=>onClickBlock(2,i,5,true)} style={{backgroundImage: getImage(2,i,5)}}></div>
                                        <div className="block size2 darkgray"></div>
                                        <div className="block size2 white"></div>
                                    </li>
                                    <li>
                                        <div className="block size1 red"></div>
                                        <div className="block size3 darkgray fix" ></div>
                                        <div className="block size4 white" onClick={()=>onClickBlock(1,i)}>{getText(1,i,2)}</div>
                                        <div className="block size2 red"></div>
                                        <div>
                                            <div className="block size2 white halfHeight"></div>
                                            <div className="block size2 lightGray halfHeight" ></div>
                                        </div>
                                        <div className="block size2 red overHeight bottom"></div>
                                    </li>
                                    <li>
                                        <div className="block size2 lightGray" ></div>
                                        <div className="block size4 white" onClick={()=>onClickBlock(3,i,5,true)} style={{backgroundImage: getImage(3,i,5)}}></div>
                                        <div className="block size2 darkgray overHeight" ></div>
                                        <div className="block size2 white"></div>
                                        <div className="block size5 darkgray" onClick={()=>onClickBlock(4,i,5,true)} style={{backgroundImage: getImage(4,i,5)}}></div>
                                    </li>
                                    <li>
                                        <div className="block size4 darkgray"onClick={()=>onClickBlock(2,i)}>{getText(2,i,2)}</div>
                                        <div className="block size2 white" ></div>
                                        <div className="block size2 red"></div>
                                        <div className="block size6 lightGray" onClick={()=>onClickBlock(5,i,5,true)} style={{backgroundImage: getImage(5,i,5)}}></div>
                                    </li>
                                </ul>
                                })
                            ://fortification
                                [...Array(2)].map((v,i)=>{
                                    if ((i+1)%2===0){
                                        return <ul key={i}>
                                            <li style={{zIndex:1,position:"relative"}}>
                                                <div>
                                                    <div className="block size2 red halfHeight"></div>  
                                                    <div className="block size2 lightGray overHeight"></div>  
                                                </div>   
                                                <div>
                                                    <div className="block size4 lightGray halfHeight"></div>
                                                    <div className="block size4 red halfHeight"></div>
                                                </div>
                                                <div className="block size5_ white" onClick={()=>onClickBlock(0,i,6,true)} style={{backgroundImage: getImage(0,i,6)}}></div>
                                                <div>
                                                    <div className="block size2 red halfHeight"></div>
                                                    <div className="block size5 darkgray halfHeight"></div>    
                                                </div>  
                                            </li>
                                            <li>
                                                <div>
                                                    <div className="block size2 red lower under"></div>
                                                </div>
                                                <div>
                                                    <div className="block size2_ white reg" onClick={()=>onClickBlock(0,i,2)}>{getText(0,i,2)}</div>
                                                </div>
                                                <div>
                                                    <div className="block size4 darkgray reg"onClick={()=>onClickBlock(1,i,6,true)} style={{backgroundImage: getImage(1,i,6)}}></div>
                                                </div>
                                                <div>
                                                    <div className="block size5 red halfHeight"></div>
                                                    <div className="block size5 white halfHeight" onClick={()=>onClickBlock(1,i,2)}>{getText(1,i,2)}</div>
                                                </div>
                                                <div>
                                                    <div className="block size2 lightGray reg"></div>
                                                </div> 
                                            </li>
                                            <li>                                          
                                                <div className="block size2 red"></div>
                                                <div className="block size2_ lightGray reg"></div>          
                                                <div className="block size2 red overHeight"></div>
                                                <div>
                                                    <div className="block size5 lightGray halfHeight"></div>
                                                    <div className="block size3 darkgray halfHeight"></div>
                                                </div>
                                                <div>
                                                    <div className="block size4 red halfHeight"></div>
                                                    <div className="block size2 darkgray halfHeight floatR"></div>
                                                </div>
                                            </li>
                                            <li>
                                                
                                                <div className="block size5_ white" onClick={()=>onClickBlock(2,i,6,true)} style={{backgroundImage: getImage(2,i,6)}}></div>
                                                <div className="block size2 darkgray reg"></div>
                                                <div className="block size5__ lightGray reg" onClick={()=>onClickBlock(3,i,6,true)} style={{backgroundImage: getImage(3,i,6)}}></div>
                                                <div>
                                                    <div className="block size2 red halfHeight"></div>
                                                    <div className="block size2 white halfHeight"></div>
                                                </div>
                                            </li>
                                            <li>
                                                <div className="block size2 red halfHeight upper"></div>
                                                <div className="block size2 lightGray reg" onClick={()=>onClickBlock(2,i,2)}>{getText(2,i,2)}</div>
                                                <div className="block size5 red reg"></div>
                                                <div>
                                                    <div className="block size4 white halfHeight"></div>
                                                    <div className="block size4 darkgray halfHeight" onClick={()=>onClickBlock(3,i,2)}>{getText(3,i,2)}</div>
                                                </div>
                                                <div className="block size2 red reg"></div>
                                            </li>
                                        </ul>    
                                    }
                                    else{
                                        return <ul key={i}>
                                            <li>
                                                <div className="block size2 lightGray"></div>
                                                <div>
                                                    <div className="block size2 red halfHeight"></div>
                                                    <div className="block size2 white halfHeight"></div>
                                                </div>
                                                <div>
                                                    <div className="block size5 darkgray halfHeight" onClick={()=>onClickBlock(0,i,1)}>{getText(0,i,1)}</div>
                                                    <div className="block size2 red halfHeight floatR"></div>
                                                </div>
                                                <div className="block size4 white" ></div>
                                                <div className="block size2 red overHeight" onClick={()=>onClickBlock(0,i,5,true)} style={{backgroundImage: getImage(0,i,5)}}></div>
                                            </li>
                                            <li>
                                                <div className="block size5 white overHeight" onClick={()=>onClickBlock(1,i,5,true)} style={{backgroundImage: getImage(1,i,5)}}></div>
                                                <div className="block size2 darkgray"></div>
                                                <div className="block size4 lightGray" onClick={()=>onClickBlock(2,i,5,true)} style={{backgroundImage: getImage(2,i,5)}}></div>
                                                <div className="block size2 darkgray"></div>
                                                <div className="block size2 white"></div>
                                            </li>
                                            <li>
                                                <div className="block size1 red"></div>
                                                <div className="block size3 darkgray fix"></div>
                                                <div className="block size4 white" onClick={()=>onClickBlock(1,i,1)}>{getText(1,i,1)}</div>
                                                <div className="block size2 red"></div>
                                                <div>
                                                    <div className="block size2 white halfHeight"></div>
                                                    <div className="block size2 lightGray halfHeight"></div>
                                                </div>
                                                <div className="block size2 red overHeight bottom"></div>
                                            </li>
                                            <li>
                                                <div className="block size2 lightGray"></div>
                                                <div className="block size4 red" onClick={()=>onClickBlock(3,i,5,true)} style={{backgroundImage: getImage(3,i,5)}}></div>
                                                <div className="block size2 darkgray overHeight"></div>
                                                <div className="block size2 white"></div>
                                                <div className="block size5 darkgray"></div>
                                            </li>
                                            <li>
                                                <div className="block size4 darkgray" onClick={()=>onClickBlock(4,i,5,true)} style={{backgroundImage: getImage(4,i,5)}}></div>
                                                <div className="block size2 white" ></div>
                                                <div className="block size2 red"></div>
                                                <div className="block size6 lightGray" onClick={()=>onClickBlock(5,i,5,true)} style={{backgroundImage: getImage(5,i,5)}}></div>
                                            </li>
                                        </ul>                                        
                                    }
                                    
                                })
                        )
                    }
                </div>
            </div>
            <div id="detailsWrap" className={`${showMap?'':'hide'}`}>
                <div ref={mapOuterWrapElem} id="mapOuterWrap">
                    {
                        mapIdx && 
                        <>
                            {goLeftMap && data.map[mapIdx-1].left && <div id="goLeft" className="btn" onClick={()=>onChangeMapIdx('left',data.map[mapIdx-1].left)}> {`<`} </div>}
                            {goRightMap && data.map[mapIdx-1].right && <div id="goRight" className="btn" onClick={()=>onChangeMapIdx('right',data.map[mapIdx-1].right)}>{`>`}</div>}
                            {goTopMap && data.map[mapIdx-1].top && <div id="goTop" className="btn" onClick={()=>onChangeMapIdx('top',data.map[mapIdx-1].top)}>^</div>}
                            {goBottomMap && data.map[mapIdx-1].bottom && <div id="goBottom" className="btn" onClick={()=>onChangeMapIdx('bot',data.map[mapIdx-1].bottom)}>v</div>}
                        </>
                    }
                    {showMap && <div id="backBtn" onClick={onClickBack}></div>}
                    
                    <div id="minimapWrap" className={`map_${mapIdx}`}><div id="minimap" className={`${showDetails ? 'active' : ''}`}><div id="area"></div></div></div>
                    <div id="mapInnerWrap" className={margin ? 'margin' : ''}>
                        <div ref={mapWrapElem} id="mapWrap" className={showDetails ? 'dim' : ''} onMouseDown={()=>!showDetails ? setDisableEvent(false) : false} onTouchStart={()=>!showDetails ? setDisableEvent(false) : false}>
                            <div id="overlay" style={{backgroundImage:selectedSource && selectedItem && markerKey === selectedItem && `url(${data.items[selectedCategory][selectedItem].overlayImage.src !== null ? (!isInDevMode() ? '.' : '') + data.items[selectedCategory][selectedItem].overlayImage.src : '' })`}}></div>
                            <div id="markerWrap" className={showDetails ? 'active' : ''}>
                                {
                                    selectedCategory && mapIdx &&
                                    Object.keys(data.categories).map((c,i)=>{
                                        return Object.entries(data.items[c]).map((v,i)=>{
                                            if(v[1].name[3] == null && v[1].mapIdx === mapIdx){
                                                return <div key={i} className={`marker ${markerKey === v[0] ? 'active' : ''}`} style={{left:v[1].position.x+'%', top:v[1].position.y+'%'}} onClick={()=>onClickMarker(c, v[0], v[1].position.x, v[1].position.y)}>
                                                    <div className="wrap">
                                                        <div className={`text ${c}`}>
                                                            <span className="en" >{v[1].name[0]}</span><span className="tc" >{v[1].name[1]}</span>
                                                        </div>
                                                    </div>
                                                    {c === 'characters' &&
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 327.25 229.84"><defs><style></style></defs><g><g id="Layer_1_1:1_">
                                                        <path fill="#a91026" d="M211.46,108.6a1.34,1.34,0,0,1-1.33,1.33H206a1.34,1.34,0,0,1-1.33-1.33v-4.15a1.34,1.34,0,0,1,1.33-1.33h4.15a1.34,1.34,0,0,1,1.33,1.33ZM183,140.44l36.11,0c3.34,0,4.24-1.08,3.5-4.32-1.92-8.49-.39-27.35-2.31-35.84-1-4.5-3.86-7.75-7.36-10.49-6.06-4.75-13.08-7.56-20.31-9.9-3-1-6-1.57-9-2.57a26.69,26.69,0,0,1-6.16-2.83c-2-1.36-2-4.16,0-5.16,6.11-3,9.38-9,10.51-15.5.58-3.31.64-2.14.47-5.48s.48-6,3.69-7.52c2.81-1.33,3.11-4.72,1.76-7.69a23.85,23.85,0,0,1-1.07-2.56c-.63-2-.34-3.23,1.93-4.29,6.79-3.17,7.48-8.09,1.75-13C187.6,5.56,176.89,2.42,165.26,2l-1.63,0c-.55,0-1.09,0-1.64,0-11.63.39-22.34,3.53-31.28,11.25-5.72,4.94-5,9.86,1.75,13,2.28,1.06,2.56,2.32,1.93,4.29a22,22,0,0,1-1.07,2.56c-1.35,3-1,6.36,1.77,7.69a6.15,6.15,0,0,1,3.73,5.43c.37,5.69-.25,6.86,1.56,12.38a17.86,17.86,0,0,0,9.37,10.69c2.06,1,2.07,3.8,0,5.16a26.77,26.77,0,0,1-6.17,2.83c-2.94,1-6,1.62-9,2.57-7.23,2.34-14.25,5.15-20.31,9.9-3.49,2.74-6.35,6-7.36,10.49-1.92,8.49-.38,27.35-2.31,35.84-.73,3.24.17,4.32,3.51,4.32l55.45,0H183M171.17,29.71h15.9a.77.77,0,0,1,.76.77V34.7a.77.77,0,0,1-.76.77H170.62a8.55,8.55,0,0,0,.81-3.64A8.73,8.73,0,0,0,171.17,29.71Zm-8.27-3.88a6,6,0,1,1-6,6A6,6,0,0,1,162.9,25.83Zm-24.16,9.64a.77.77,0,0,1-.76-.77V30.48a.77.77,0,0,1,.76-.77h15.9a8.73,8.73,0,0,0-.26,2.12,8.55,8.55,0,0,0,.81,3.64Zm5.8,17.66c-.52-4.16-.09-3.91-.09-7.89H182.8c0,4,.43,3.73-.09,7.89-1,7.87-4.67,11.68-12.55,12.75a57.9,57.9,0,0,1-13.07,0C149.21,64.81,145.53,61,144.54,53.13Zm-1,54a1,1,0,0,1-1,1H124.1a1,1,0,0,1-1-1v-3.06a1,1,0,0,1,1-1h18.5a1,1,0,0,1,1,1ZM131.41,95.06c-2.66.84-5.34,1.62-8,2.56-1.67.6-2.88.41-3.41-1.4-.47-1.58-1.73-3.37.77-4.46L143.24,82c1.38,3.33,2.31,5.59,3.4,8.21Zm16.15-13.52,1.28-.78a13.67,13.67,0,0,1,2.74-1.35,6.13,6.13,0,0,1,.65-.16,4.46,4.46,0,0,1,1.26,0l.64.12a14,14,0,0,1,4.17,2.29c.48.33,1,.71,1.56,1.12l.3.22h0l-4.33,3.65-4.59,3.88c-1-2.41-1.91-4.64-2.8-6.8C148.14,83,147.85,82.25,147.56,81.54Zm13.93,16.19-4.29,20.86-6.14-22.91,7.17-5.93ZM155.74,76c.36-1.42.72-2.89,1.11-4.45h13.56c.38,1.56.75,3,1.1,4.45-3.57,2.49-5.83,3.83-7.88,4.07C161.57,79.85,159.31,78.51,155.74,76Zm14.31,42.55-4.29-20.84,3.26-8,7.17,5.93Zm6-28.09L167.09,83c6.38-4.71,7.22-4.81,12.61-1.41Zm7.91,27.28a1.34,1.34,0,0,1-1.33,1.33h-4.16a1.34,1.34,0,0,1-1.33-1.33v-4.15a1.34,1.34,0,0,1,1.33-1.33h4.16a1.34,1.34,0,0,1,1.33,1.33Zm0-9.16a1.34,1.34,0,0,1-1.33,1.33h-4.16a1.34,1.34,0,0,1-1.33-1.33v-4.15a1.34,1.34,0,0,1,1.33-1.33h4.16a1.34,1.34,0,0,1,1.33,1.33Zm9.18,9.16a1.34,1.34,0,0,1-1.33,1.33h-4.16a1.34,1.34,0,0,1-1.33-1.33v-4.15a1.34,1.34,0,0,1,1.33-1.33h4.16a1.34,1.34,0,0,1,1.33,1.33Zm0-9.16a1.34,1.34,0,0,1-1.33,1.33h-4.16a1.34,1.34,0,0,1-1.33-1.33v-4.15a1.34,1.34,0,0,1,1.33-1.33h4.16a1.34,1.34,0,0,1,1.33,1.33Zm9.18,9.16a1.34,1.34,0,0,1-1.33,1.33H196.8a1.34,1.34,0,0,1-1.33-1.33v-4.15a1.34,1.34,0,0,1,1.33-1.33H201a1.34,1.34,0,0,1,1.33,1.33Zm0-9.16a1.34,1.34,0,0,1-1.33,1.33H196.8a1.34,1.34,0,0,1-1.33-1.33v-4.15a1.34,1.34,0,0,1,1.33-1.33H201a1.34,1.34,0,0,1,1.33,1.33Zm9.18,9.16a1.34,1.34,0,0,1-1.33,1.33H206a1.34,1.34,0,0,1-1.33-1.33v-4.15a1.34,1.34,0,0,1,1.33-1.33h4.15a1.34,1.34,0,0,1,1.33,1.33Zm-4.25-21.54c-.53,1.81-1.74,2-3.41,1.4-2.62-.94-5.3-1.72-8-2.56l-15.23-4.84c1.08-2.62,2-4.88,3.39-8.21l22.43,9.75C208.94,92.85,207.68,94.64,207.21,96.22Z"/>
                                                        <path fill="#fff" d="M171.17,29.71h15.9a.77.77,0,0,1,.76.77V34.7a.77.77,0,0,1-.76.77H170.62a8.55,8.55,0,0,0,.81-3.64A8.73,8.73,0,0,0,171.17,29.71Z"/>
                                                        <circle fill="#fff" cx="162.9" cy="31.83" r="6"/>
                                                        <path fill="#fff" d="M138.74,35.47a.77.77,0,0,1-.76-.77V30.48a.77.77,0,0,1,.76-.77h15.9a8.73,8.73,0,0,0-.26,2.12,8.55,8.55,0,0,0,.81,3.64Z"/>
                                                        <path fill="#fff" d="M144.54,53.13c-.52-4.16-.09-3.91-.09-7.89H182.8c0,4,.43,3.73-.09,7.89-1,7.87-4.67,11.68-12.55,12.75a57.9,57.9,0,0,1-13.07,0C149.21,64.81,145.53,61,144.54,53.13Z"/>
                                                        <rect fill="#fff" x="123.12" y="103.1" width="20.45" height="5" rx="0.97"/>
                                                        <path fill="#fff" d="M131.41,95.06c-2.66.84-5.34,1.62-8,2.56-1.67.6-2.88.41-3.41-1.4-.47-1.58-1.73-3.37.77-4.46L143.24,82c1.38,3.33,2.31,5.59,3.4,8.21Z"/>
                                                        <path fill="#fff" d="M147.56,81.54l1.28-.78a13.67,13.67,0,0,1,2.74-1.35,6.13,6.13,0,0,1,.65-.16,4.46,4.46,0,0,1,1.26,0l.64.12a14,14,0,0,1,4.17,2.29c.48.33,1,.71,1.56,1.12l.3.22h0l-4.33,3.65-4.59,3.88c-1-2.41-1.91-4.64-2.8-6.8C148.14,83,147.85,82.25,147.56,81.54Z"/>
                                                        <polygon fill="#fff" points="161.49 97.73 157.2 118.59 151.06 95.68 158.24 89.75 161.49 97.73"/>
                                                        <path fill="#fff" d="M155.74,76c.36-1.42.72-2.89,1.11-4.45h13.56c.38,1.56.75,3,1.1,4.45-3.57,2.49-5.83,3.83-7.88,4.07C161.57,79.85,159.31,78.51,155.74,76Z"/>
                                                        <polygon fill="#fff" points="170.05 118.57 165.76 97.73 169.02 89.75 176.19 95.68 170.05 118.57"/>
                                                        <path fill="#fff" d="M176,90.48,167.09,83c6.38-4.71,7.22-4.81,12.61-1.41Z"/>
                                                        <rect fill="#fff" x="177.1" y="112.28" width="6.81" height="6.81" rx="1.33"/>
                                                        <rect fill="#fff" x="177.1" y="103.12" width="6.81" height="6.81" rx="1.33"/>
                                                        <rect fill="#fff" x="186.28" y="112.28" width="6.81" height="6.81" rx="1.33"/>
                                                        <rect fill="#fff" x="186.28" y="103.12" width="6.81" height="6.81" rx="1.33"/>
                                                        <rect fill="#fff" x="195.47" y="112.28" width="6.81" height="6.81" rx="1.33"/>
                                                        <rect fill="#fff" x="195.47" y="103.12" width="6.81" height="6.81" rx="1.33"/>
                                                        <rect fill="#fff" x="204.65" y="112.28" width="6.81" height="6.81" rx="1.33"/>
                                                        <rect fill="#fff" x="204.65" y="103.12" width="6.81" height="6.81" rx="1.33"/>
                                                        <path fill="#fff" d="M207.21,96.22c-.53,1.81-1.74,2-3.41,1.4-2.62-.94-5.3-1.72-8-2.56l-15.23-4.84c1.08-2.62,2-4.88,3.39-8.21l22.43,9.75C208.94,92.85,207.68,94.64,207.21,96.22Z"/>
                                                        <rect fill="#a91026" x="2" y="137.65" width="323.25" height="90.19" rx="5.02"/>
                                                        <path fill="#fff" d="M164.06,2l1.63,0C177.32,2.42,188,5.56,197,13.28c5.73,4.94,5,9.86-1.75,13-2.27,1.06-2.56,2.32-1.93,4.29a23.85,23.85,0,0,0,1.07,2.56c1.35,3,1,6.36-1.76,7.69-3.21,1.53-3.87,4.24-3.69,7.52s.11,2.17-.47,5.48c-1.13,6.48-4.4,12.54-10.51,15.5-2.06,1-2.06,3.8,0,5.16a26.69,26.69,0,0,0,6.16,2.83c2.94,1,6,1.62,9,2.57,7.23,2.34,14.25,5.15,20.31,9.9,3.5,2.74,6.35,6,7.37,10.49,1.91,8.49.38,27.35,2.3,35.84a8.69,8.69,0,0,1,.23,1.51h97a5,5,0,0,1,5,5v80.15a5,5,0,0,1-5,5H7a5,5,0,0,1-5-5V142.67a5,5,0,0,1,5-5h97.85a9.77,9.77,0,0,1,.23-1.51c1.93-8.49.4-27.35,2.31-35.84,1-4.5,3.87-7.75,7.37-10.49,6-4.75,13.07-7.56,20.3-9.9,3-1,6-1.57,9-2.57a26.77,26.77,0,0,0,6.17-2.83c2-1.36,2-4.16,0-5.16a17.86,17.86,0,0,1-9.37-10.69c-1.81-5.52-1.19-6.69-1.56-12.38a6.15,6.15,0,0,0-3.73-5.43c-2.82-1.33-3.12-4.72-1.76-7.69a23.78,23.78,0,0,0,1.06-2.56c.63-2,.35-3.23-1.93-4.29-6.79-3.17-7.47-8.09-1.75-13C140.08,5.56,150.79,2.42,162.42,2c.55,0,1.09,0,1.64,0m0-2q-.85,0-1.71,0c-13.25.45-23.88,4.29-32.51,11.74-4.24,3.65-4.78,6.9-4.49,9s1.68,5,6.7,7.37c1.28.6,1.22.77.87,1.88a20.89,20.89,0,0,1-.82,2l-.16.35c-2,4.3-.82,8.65,2.72,10.33a4.14,4.14,0,0,1,2.59,3.75c.1,1.52.13,2.71.15,3.77a25.66,25.66,0,0,0,1.51,9.1,19.77,19.77,0,0,0,10.4,11.87.7.7,0,0,1,.42.6,1.25,1.25,0,0,1-.63,1.09,25.29,25.29,0,0,1-5.7,2.6c-1.51.52-3,.92-4.65,1.35-1.4.37-2.85.76-4.28,1.22-6.62,2.14-14.29,5-20.93,10.23-4.53,3.55-7.1,7.24-8.08,11.62s-1.1,11.17-1.2,18.3c-.09,6.61-.19,13.44-1.1,17.49H7a7,7,0,0,0-7,7v80.15a7,7,0,0,0,7,7H320.23a7,7,0,0,0,7-7V142.67a7,7,0,0,0-7-7H225c-.91-4.05-1-10.88-1.1-17.49-.1-7.13-.19-13.86-1.19-18.3s-3.56-8.07-8.09-11.62C207.93,83,200.27,80.15,193.64,78c-1.42-.46-2.87-.85-4.28-1.22-1.61-.43-3.14-.83-4.64-1.35a25.15,25.15,0,0,1-5.71-2.6,1.28,1.28,0,0,1-.63-1.09.7.7,0,0,1,.42-.6c6.09-3,10.22-9,11.61-17,.15-.82.26-1.36.34-1.76a11.64,11.64,0,0,0,.15-4.15c-.16-3.14.53-4.66,2.55-5.62,3.55-1.68,4.69-6,2.73-10.33L196,32a16.69,16.69,0,0,1-.82-2c-.36-1.11-.41-1.28.87-1.88,5-2.34,6.41-5.3,6.7-7.37s-.26-5.33-4.49-9C189.65,4.32,179,.48,165.76,0l-1.7,0Z"/><path fill="#fff" d="M319.53,142.59H7.72a.41.41,0,0,0-.41.42v79.47a.41.41,0,0,0,.41.42H319.53a.42.42,0,0,0,.42-.42V143A.42.42,0,0,0,319.53,142.59Zm-3.09,41.84a4.57,4.57,0,0,1,0,.74l-15,35H25.87l-15.06-39.1a4.57,4.57,0,0,1,0-.74l15-35H301.39Z"/></g></g></svg>
                                                    }

                                                    {c === 'warships' &&
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 327.25 227.77"><defs><style></style></defs><g id="圖層_2"><g id="Layer_1_1:1_">
                                                        <polygon fill="#fff" points="176.1 96.85 142.1 70.85 111.1 97.85 113.1 110.85 181.1 121.85 228.1 90.85 176.1 96.85"/>
                                                        <path fill="#fff" d="M177.53,2V4.22a15.9,15.9,0,0,1,3-.31,11.75,11.75,0,0,1,7.06,2.26,9.36,9.36,0,0,0,1.65.72,7.9,7.9,0,0,0,3.51.91c1.45,0,2.65-.47,4.6-.47.23,0,.47,0,.72,0a11.26,11.26,0,0,1,3.61.85,26.13,26.13,0,0,1,6.68,4,3.36,3.36,0,0,0-.88-.11c-2.15,0-5.55,1.46-7.08,1.79-1.28.27-2.55.57-3.82.84a23.73,23.73,0,0,1-5,.65,11.93,11.93,0,0,1-2.89-.33c-1.54-.37-3.07-.82-4.59-1.3a8.9,8.9,0,0,0-2.75-.43,9.78,9.78,0,0,0-3.84.82v2.69h4.14c-.46,1.48-.84,2.88-1.34,4.22-.09.23-2.35.3-2.8.44V23.1h11c.08,2.6,3.23,16.24,6.63,20.92h0c-.66,0-11.62-1.58-15.29-1.82v3.63s19.76.6,26.71.6c2.5,0,1.43,1.64,1.21,2.06-3.75,7.26-4.29,13.8-5.64,21.84a91,91,0,0,0-.81,25.16c0,.42.1.83.15,1.25.34-.55.61-1,.66-1.06,3-4.82,16.12-24.18,21.24-32a.68.68,0,0,1,.57-.32.7.7,0,0,1,.71.75,76.88,76.88,0,0,0,3.71,26.83l-.05,0a21.87,21.87,0,0,0-3.22-.22A37,37,0,0,0,216.3,92v5.16a99.22,99.22,0,0,0,11.5-4.34c.18.33.34.58.45.84.94,2.17,1.87,4.33,2.8,6.5V101a10,10,0,0,1-1.3,1.22q-2.17,1.44-4.43,2.74a1.17,1.17,0,0,0-.7,1.11,5.45,5.45,0,0,1-3.26,5.29c-.23.11-.46.26-.69.4a2.8,2.8,0,0,0-1.36,2.41,13.11,13.11,0,0,1-.08,1.65c-1.13,9.59-10.66,16.73-19.74,19.75H320.23a5,5,0,0,1,5,5v80.15a5,5,0,0,1-5,5H7a5,5,0,0,1-5-5V140.6a5,5,0,0,1,5-5H145.69a36.41,36.41,0,0,1-22.54-19.83,35.1,35.1,0,0,1-2.65-11.52c0-.3-.11-.78-.31-.87-1.31-.58-2.66-1.08-4.1-1.65-1,3.74.4,6.65,2.53,9.17-2.58-.31-5.25-.75-7.94-.93-.94-.06-1.88-.1-2.82-.1a16.43,16.43,0,0,0-7.53,1.54h0c-2.38-3.33-1.54-9.28,1.53-12a2.24,2.24,0,0,1,1.54-.68l.28,0c.76.09,1.54.08,2.32.11h1.44a2.4,2.4,0,0,0-.73-.37c-2.8-1.06-10.91-2.74-10.49-5.09,0-.32.41-.46,1-.46,3.83,0,17.56,5.74,28,7.41v-6c-.78-.06-1.56-.12-2.32-.12h-.23c-3.83,0-7.63.18-11.07,2.64a35.35,35.35,0,0,1-1.77-3.39,29.6,29.6,0,0,1-1.4-16.24A17.77,17.77,0,0,1,111.85,69c.27-.35.58-.68.92-1.09S125.23,67,125.23,67v-3.1c-2.89.19-5.76.2-8.5,1.7-2.32-5.32-1.12-10.67,2.51-14.85-.07,0,.57,0,1.46,0l4.53,0V49.51l-2.44-.11V46.85l2.44-.11V45.53h3.66v1.21l2.39.11V49.4l-2.39.11V51h7.81a47,47,0,0,0-.75,6.48,16,16,0,0,0,1.28,7.06c-3.9-.8-4.32-.51-8.34-.62v3.12s12.54,1.16,12.1,1.82a17.48,17.48,0,0,0-1.18,2,19.91,19.91,0,0,0-1.75,8.87,70.92,70.92,0,0,0,1.81,13.84c.29,1.48.59,3,.91,4.56a33.07,33.07,0,0,0-11.89-3.31v6c3.93.44,7.82.91,11.71,1.26a5.53,5.53,0,0,1,3.87,2A24.4,24.4,0,0,0,156,112.05a49.7,49.7,0,0,0,15.56,2.31h0V102.48c-2.46.23-4.93.45-7.39.75a39.41,39.41,0,0,0-9,2A12.68,12.68,0,0,0,150.6,108c-.73-1.14-1.47-2.15-2.07-3.25-2.6-4.8-3.74-10-4.48-15.41a86.05,86.05,0,0,1-.44-18.64c.59-7.29,1.32-12.84,4.69-20A15,15,0,0,1,152.05,46a1.11,1.11,0,0,1,.57-.13l19,0V42.17l0,0c-3.44.31-7,.29-10,2.43A14.37,14.37,0,0,1,160,35.23h0c-.05-5.06,5.51-12.23,5.51-12.23l8.4.08V21.45c-.44-.14-2.72-.21-2.81-.44-.51-1.34-.88-2.74-1.34-4.22h4.15V2h3.66m0-2h-3.66a2,2,0,0,0-2,2V14.79h-2.15a2,2,0,0,0-1.91,2.58c.12.38.23.76.34,1.13.25.86.5,1.69.79,2.52l-3.45,0h0a2,2,0,0,0-1.58.77c-.6.79-5.89,7.77-5.93,13.34a16.51,16.51,0,0,0,1,8.73h-6.36a3.07,3.07,0,0,0-1.61.43c-1.62,1-3.75,4-4.51,5.58A49.6,49.6,0,0,0,141.94,67a12.18,12.18,0,0,0-3.48-.88,2.27,2.27,0,0,0,.31-.31,2,2,0,0,0,.31-2A13.86,13.86,0,0,1,138,57.55a47.7,47.7,0,0,1,.71-6.15,2,2,0,0,0-.42-1.65A2,2,0,0,0,136.7,49h-3.42V46.85a2,2,0,0,0-1.9-2l-.62,0a2,2,0,0,0-1.87-1.29h-3.66a2,2,0,0,0-1.87,1.29l-.66,0a2,2,0,0,0-1.91,2v1.91h-.09c-1.47,0-2.77,0-3.26,1.05a15.53,15.53,0,0,0-2.89,15.76c-2.66.26-2.91.54-3.29,1l-.32.36c-.24.27-.45.52-.66.79a19.74,19.74,0,0,0-3.81,9.1,31.9,31.9,0,0,0,1.28,16.72c-5.4-1.7-8.59-2.66-10.52-2.66-2.42,0-2.89,1.62-3,2.11-.48,2.66,2.34,4.21,5.73,5.4-3.39,3.63-4,10.29-1.28,14.17a2,2,0,0,0,1.15.78,2,2,0,0,0,.48.06,2,2,0,0,0,.9-.21,14.22,14.22,0,0,1,6.63-1.33c.78,0,1.63,0,2.69.1,1.8.12,3.63.37,5.41.6.81.11,1.62.22,2.42.31l.24,0a2,2,0,0,0,1.24-.44,32.19,32.19,0,0,0,1.45,4.11,37.88,37.88,0,0,0,15,17H7a7,7,0,0,0-7,7v80.15a7,7,0,0,0,7,7H320.23a7,7,0,0,0,7-7V140.6a7,7,0,0,0-7-7H208.45a34,34,0,0,0,5.24-3.94c4.35-4,6.95-8.69,7.53-13.58a14.23,14.23,0,0,0,.09-1.91.78.78,0,0,1,.4-.67l.18-.11a2.32,2.32,0,0,1,.31-.18,7.35,7.35,0,0,0,4.4-6.65c1.46-.85,2.88-1.74,4.25-2.63a7.16,7.16,0,0,0,1.26-1.12l.33-.34a2,2,0,0,0,.61-1.44v-.87a2,2,0,0,0-.16-.79L232.31,98c-.74-1.72-1.48-3.45-2.22-5.16-.1-.22-.2-.41-.3-.59a2.1,2.1,0,0,0,.42-2,74.61,74.61,0,0,1-3.61-26.15,2.69,2.69,0,0,0-.75-2,2.72,2.72,0,0,0-2-.83,2.69,2.69,0,0,0-2.24,1.22c-2.29,3.51-6.25,9.42-10.07,15.14-3.29,4.93-6.46,9.68-8.7,13.06a91.3,91.3,0,0,1,1.17-20.11q.31-1.91.6-3.72c1-6.28,1.84-11.7,4.85-17.53l0,0a3.09,3.09,0,0,0-3-4.93c-2.18,0-5.67-.06-9.41-.14a2,2,0,0,0-.37-1.46c-3.17-4.37-6.17-17.57-6.24-19.79a2,2,0,0,0-2-1.94h-6.07c.3-.85.55-1.71.82-2.6l.34-1.13a2,2,0,0,0-.31-1.77.18.18,0,0,0-.05-.07l.3.09c1.83.58,3.33,1,4.73,1.34a14,14,0,0,0,3.35.38,26,26,0,0,0,5.43-.69l1.65-.37,2.16-.47c.62-.14,1.38-.38,2.26-.67a18.07,18.07,0,0,1,4.41-1.08,1.34,1.34,0,0,1,.32,0,2.1,2.1,0,0,0,.56.08,2,2,0,0,0,1.29-3.53,28.55,28.55,0,0,0-7.2-4.29,13.14,13.14,0,0,0-4.27-1c-.29,0-.57,0-.83,0a17.85,17.85,0,0,0-3,.28,10.09,10.09,0,0,1-1.63.19,5.88,5.88,0,0,1-2.66-.72c-.29-.13-.56-.23-.81-.32a3.66,3.66,0,0,1-.52-.21,13.83,13.83,0,0,0-8.23-2.64l-1,0a2,2,0,0,0-2-1.94ZM141.08,100.14a2,2,0,0,0,.9-.39,2,2,0,0,0,.76-2l-.33-1.65c-.2-1-.39-2-.58-2.91l0-.15a67.69,67.69,0,0,1-1.74-13.3,18.26,18.26,0,0,1,1.45-7.8,88,88,0,0,0,.56,17.66A53.57,53.57,0,0,0,145,101.83a7.63,7.63,0,0,0-3.91-1.69Zm77.22-6.57a40.13,40.13,0,0,1,4.13-.68c-1.3.51-2.67,1-4.13,1.49v-.81ZM117.51,96.48a29.71,29.71,0,0,1,5.17-.33h.55v1.73c-1.85-.38-3.79-.86-5.72-1.4Zm13.38,2.57V97.12a29.79,29.79,0,0,1,9,2.82,1.22,1.22,0,0,0,.24.1c-2.64-.24-5.33-.55-7.93-.84l-1.29-.15Zm-12,8.8a7.29,7.29,0,0,1-1.1-3.33l.75.31c.09,1,.2,2,.35,3Zm34.1.75a11.24,11.24,0,0,1,2.87-1.5,36.47,36.47,0,0,1,8.58-1.89c1.7-.2,3.44-.37,5.15-.53v7.63a44.7,44.7,0,0,1-12.92-2.16A26.56,26.56,0,0,1,153,108.6Z"/>
                                                        <path fill="#a91026" d="M2,140.6v80.15a5,5,0,0,0,5,5H320.23a5,5,0,0,0,5-5V140.6a5,5,0,0,0-5-5H199.49c9.08-3,18.61-10.16,19.74-19.75a13.11,13.11,0,0,0,.08-1.65,2.8,2.8,0,0,1,1.36-2.41c.23-.14.46-.29.69-.4a5.45,5.45,0,0,0,3.26-5.29,1.17,1.17,0,0,1,.7-1.11q2.25-1.31,4.43-2.74a10,10,0,0,0,1.3-1.22v-.87c-.93-2.17-1.86-4.33-2.8-6.5-.11-.26-.27-.51-.45-.84a99.22,99.22,0,0,1-11.5,4.34V92A37,37,0,0,1,225,90.76a21.87,21.87,0,0,1,3.22.22l.05,0A76.88,76.88,0,0,1,224.6,64.1a.7.7,0,0,0-.71-.75.68.68,0,0,0-.57.32c-5.12,7.83-18.19,27.19-21.24,32-.05.07-.32.51-.66,1.06,0-.42-.11-.83-.15-1.25a91,91,0,0,1,.81-25.16c1.35-8,1.89-14.58,5.64-21.84.22-.42,1.29-2.06-1.21-2.06-6.95,0-26.71-.6-26.71-.6V42.2c3.67.24,14.63,1.82,15.29,1.82h0c-3.4-4.68-6.55-18.32-6.63-20.92h-11V21.45c.45-.14,2.71-.21,2.8-.44.5-1.34.88-2.74,1.34-4.22h-4.14V14.1a9.78,9.78,0,0,1,3.84-.82,8.9,8.9,0,0,1,2.75.43c1.52.48,3,.93,4.59,1.3a11.93,11.93,0,0,0,2.89.33,23.73,23.73,0,0,0,5-.65c1.27-.27,2.54-.57,3.82-.84,1.53-.33,4.93-1.79,7.08-1.79a3.36,3.36,0,0,1,.88.11,26.13,26.13,0,0,0-6.68-4,11.26,11.26,0,0,0-3.61-.85c-.25,0-.49,0-.72,0-1.95,0-3.15.47-4.6.47a7.9,7.9,0,0,1-3.51-.91,9.36,9.36,0,0,1-1.65-.72,11.75,11.75,0,0,0-7.06-2.26,15.9,15.9,0,0,0-3,.31V2h-3.66V16.79h-4.15c.46,1.48.83,2.88,1.34,4.22.09.23,2.37.3,2.81.44v1.62l-8.4-.08s-5.56,7.17-5.51,12.23h0a14.37,14.37,0,0,0,1.59,9.34c3-2.14,6.56-2.12,10-2.43l0,0v3.64l-19,0a1.11,1.11,0,0,0-.57.13,15,15,0,0,0-3.75,4.73c-3.37,7.17-4.1,12.72-4.69,20a86.05,86.05,0,0,0,.44,18.64c.74,5.36,1.88,10.61,4.48,15.41.6,1.1,1.34,2.11,2.07,3.25a12.68,12.68,0,0,1,4.57-2.78,39.41,39.41,0,0,1,9-2c2.46-.3,4.93-.52,7.39-.75v11.88h0A49.7,49.7,0,0,1,156,112.05a24.4,24.4,0,0,1-11.56-7.91,5.53,5.53,0,0,0-3.87-2c-3.89-.35-7.78-.82-11.71-1.26v-6a33.07,33.07,0,0,1,11.89,3.31c-.32-1.59-.62-3.08-.91-4.56a70.92,70.92,0,0,1-1.81-13.84,19.91,19.91,0,0,1,1.75-8.87,17.48,17.48,0,0,1,1.18-2c.44-.66-12.1-1.82-12.1-1.82V64c4,.11,4.44-.18,8.34.62A16,16,0,0,1,136,57.51,47,47,0,0,1,136.7,51h-7.81V49.51l2.39-.11V46.85l-2.39-.11V45.53h-3.66v1.21l-2.44.11V49.4l2.44.11v1.27l-4.53,0c-.89,0-1.53,0-1.46,0-3.63,4.18-4.83,9.53-2.51,14.85,2.74-1.5,5.61-1.51,8.5-1.7V67s-12.11.43-12.46.83-.65.74-.92,1.09a17.77,17.77,0,0,0-3.41,8.21,29.6,29.6,0,0,0,1.4,16.24,35.35,35.35,0,0,0,1.77,3.39c3.44-2.46,7.24-2.64,11.07-2.64h.23c.76,0,1.54.06,2.32.12v6c-10.44-1.67-24.17-7.41-28-7.41-.6,0-1,.14-1,.46-.42,2.35,7.69,4,10.49,5.09a2.4,2.4,0,0,1,.73.37H106c-.78,0-1.56,0-2.32-.11l-.28,0a2.24,2.24,0,0,0-1.54.68c-3.07,2.77-3.91,8.72-1.53,12h0a16.43,16.43,0,0,1,7.53-1.54c.94,0,1.88,0,2.82.1,2.69.18,5.36.62,7.94.93-2.13-2.52-3.5-5.43-2.53-9.17,1.44.57,2.79,1.07,4.1,1.65.2.09.29.57.31.87a35.1,35.1,0,0,0,2.65,11.52,36.41,36.41,0,0,0,22.54,19.83H7A5,5,0,0,0,2,140.6Z"/>
                                                        <path fill="#fff" d="M159.48,96.08a43.5,43.5,0,0,0-5,1.14,83.73,83.73,0,0,1-1.86-28c.77-7.48,1-12.39,3.91-19.21a16.86,16.86,0,0,1,5.11.63c-2.83,6.69-3.08,11.54-3.82,18.52A81.19,81.19,0,0,0,159.48,96.08Zm-38.87-6.22c-1.66,0-3.18.13-4.57.27-1.43-5.39-2-10.54-.64-16.27.23-.92.48-1.82.76-2.69,1.62,0,3.21.11,4.75.21-.32.94-.59,1.9-.84,2.87C118.69,79.74,119.28,84.66,120.61,89.86Zm.72-29.5a8.41,8.41,0,0,1,1.25-6.25l7.84.13c-.1.85-.18,1.84-.2,2.73a16.32,16.32,0,0,0,.16,2.79,29.32,29.32,0,0,0-3.28-.19A18.75,18.75,0,0,0,121.33,60.36Zm6,13.73c.24-1,.52-2,.83-2.92,1.2.1,2.62.14,4.64.3-.26.83-.59,2.15-.8,3-1.38,5.49-1,9.94-.21,15.24-1.65-.12-3.18-.18-4.57-.17C126.28,84.05,125.88,79.82,127.29,74.09Zm58.15-4.46c.67-6.07,1.47-13,3.95-19a24.21,24.21,0,0,1,5.27.36c-2.66,5.91-3.34,12.79-4,18.67a63.06,63.06,0,0,0,1.6,23c.43,1.62.89,3.09,1.39,4.48-1.71-.31-3.59-.6-5.67-.86-.32-1-.64-2.09-.94-3.26A66.19,66.19,0,0,1,185.44,69.63Zm-10,25.61c0,.05,0,.09,0,.13-1.59-.05-3.24-.09-5-.1h-.35a80.18,80.18,0,0,1-1.69-26.43c.71-6.85,1.49-12.33,4.05-18.53a11.3,11.3,0,0,1,5.31.21c-2.64,6.22-3.46,11.75-4.15,18.29A77,77,0,0,0,175.45,95.24Zm1.23-59a97.94,97.94,0,0,0-9.8.47s-.57-5.13,1.84-8.88a109.49,109.49,0,0,0,13.91,0c.93,3.29,1.09,6.29,3.12,9.71A90,90,0,0,0,176.68,36.28Zm18.63,74.78c-4.78,2.28-10.23,2.38-15.51,2.88V102.08a102.21,102.21,0,0,1,22.28,2.44A15.41,15.41,0,0,1,195.31,111.06Zm16.07-12.45c-2.51.68-5,1.35-7.56,2-.55.14-.77.33-.82.93a6.58,6.58,0,0,1-.13.89,19,19,0,0,1-1.23-4.29,62.81,62.81,0,0,1,9.74-4.7Z"/>
                                                        <path fill="#fff" d="M319.53,140.53H7.72a.41.41,0,0,0-.41.41v79.48a.41.41,0,0,0,.41.41H319.53a.42.42,0,0,0,.42-.41V140.94A.41.41,0,0,0,319.53,140.53Zm-3.09,41.84a4.57,4.57,0,0,1,0,.74l-15,35H25.87L10.81,179a4.57,4.57,0,0,1,0-.74l15-35H301.39Z"/></g></g>
                                                        </svg>
                                                    }

                                                    {
                                                        c === 'events' &&
                                                        <svg className="events" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 327.25 197.24"><defs><style></style></defs><g id="圖層_2"><g id="Layer_1_1:1_">
                                                        <path fill="#fff" d="M196.15,41.86l2.45-5.59-28.5-3-36,20s-22,1-23,4,13,20,13,20l5,29.93,77.35-3.13Z"/>
                                                        <path fill="#a91026" d="M119.22,46a1,1,0,0,1-.79-.37,7.27,7.27,0,0,1-1.42-6.1,8.75,8.75,0,0,1,4.62-5.93c3.44-1.77,4.78-2.53,6.08-3.27s2.73-1.54,6.63-3.51c.43-.21.86-.44,1.29-.66a40.53,40.53,0,0,1,4.31-2,8.75,8.75,0,0,1,3.05-.63c3.23-.07,6,1.78,7.7,5.06a1,1,0,0,1-.44,1.34c-6.7,3.42-11.11,5.77-15.37,8s-8.61,4.58-15.22,7.95A1,1,0,0,1,119.22,46Z"/>
                                                        <path fill="#fff" d="M143,24.51c2.79-.06,5.27,1.53,6.79,4.51-13.39,6.83-17.34,9.22-30.6,16-2.65-3.28-1.26-8.36,2.89-10.51,7.31-3.78,5.35-3.07,12.7-6.77a60.65,60.65,0,0,1,5.51-2.66,7.91,7.91,0,0,1,2.71-.56m0-2a10.2,10.2,0,0,0-3.39.69,43.67,43.67,0,0,0-4.41,2.08l-1.28.66c-3.92,2-5.26,2.73-6.67,3.53s-2.63,1.49-6,3.25A9.77,9.77,0,0,0,116,39.34a8.26,8.26,0,0,0,1.62,6.93,2,2,0,0,0,1.6.74,1.89,1.89,0,0,0,.86-.22c6.63-3.38,11-5.71,15.25-8s8.65-4.61,15.35-8a2,2,0,0,0,.87-2.68c-1.85-3.64-5-5.68-8.61-5.61Z"/>
                                                        <path fill="#a91026" d="M117.25,75.72c-3.09,0-5.53-1.54-7.69-4.85a11.16,11.16,0,0,1,.73-13.28,1,1,0,0,1,.79-.39l.19,0a1,1,0,0,1,.78.71c.16.59.34,1.16.51,1.7l0,.15c2,6.16,4.86,10.66,8.83,13.75a1,1,0,0,1-.49,1.78l-.79.12a18.28,18.28,0,0,1-2.91.29Z"/>
                                                        <path fill="#fff" d="M111.08,58.2c.17.6.35,1.19.53,1.74l0,.15c2,6.37,5,11,9.16,14.22h0a24.54,24.54,0,0,1-3.56.4c-2.22,0-4.51-.81-6.86-4.4a10.21,10.21,0,0,1,.69-12.12m0-2a2,2,0,0,0-1.58.78,12.25,12.25,0,0,0-.81,14.39l0,0c2.36,3.62,5.07,5.3,8.53,5.3a19.71,19.71,0,0,0,3.06-.3l.78-.12a2,2,0,0,0,1-.48,2.05,2.05,0,0,0,.68-1.56,2,2,0,0,0-.77-1.52c-3.8-3-6.58-7.3-8.49-13.26l0-.15c-.17-.53-.34-1.1-.5-1.67a2,2,0,0,0-1.54-1.42,1.72,1.72,0,0,0-.39,0Z"/>
                                                        <path fill="#a91026" d="M127.09,74.87a3.85,3.85,0,0,1-2.2-.79c-4.48-3.15-7.74-8.06-10-15l0-.16a19.42,19.42,0,0,1-1.23-5.82c0-.8,0-2.66,1.66-3.52,9.8-5,14-7.25,19-9.83,3.92-2.06,8.23-4.32,16.08-8.37,17.5-9,47.23-24.17,47.53-24.33a1,1,0,0,1,.45-.1,1,1,0,0,1,.87.51l12.23,22a1,1,0,0,1,.09.77,1,1,0,0,1-.5.6l-14.08,7.46a1,1,0,0,1-.47.12,1,1,0,0,1-.29,0,39.73,39.73,0,0,0-11.33-1.66A38.83,38.83,0,0,0,171,39.26a39.32,39.32,0,0,0-23.61,24.95,1,1,0,0,1-.49.58l-18.3,9.7a3.13,3.13,0,0,1-1.48.38Z"/>
                                                        <path fill="#fff" d="M198.33,7.93l12.23,22L196.47,37.4a40.55,40.55,0,0,0-11.62-1.71,41,41,0,0,0-5.17.33A40.64,40.64,0,0,0,146.4,63.91L128.1,73.6a2,2,0,0,1-1,.27,2.92,2.92,0,0,1-1.63-.6c-4.95-3.5-7.78-8.87-9.59-14.51a19.32,19.32,0,0,1-1.23-5.69c0-1,.12-2.11,1.11-2.62,17.67-9,17.43-9.1,35.06-18.2S198.33,7.93,198.33,7.93m0-2a2.09,2.09,0,0,0-.91.21c-.3.16-30,15.29-47.53,24.33-7.85,4.06-12.23,6.35-16.09,8.38-4.92,2.58-9.17,4.81-19,9.82-2.22,1.14-2.2,3.61-2.2,4.42a20.2,20.2,0,0,0,1.28,6.12l0,.16c2.3,7.17,5.68,12.25,10.34,15.53a4.83,4.83,0,0,0,2.78,1,4.14,4.14,0,0,0,2-.5l18.29-9.69a2,2,0,0,0,1-1.17,38.33,38.33,0,0,1,23-24.31A37.16,37.16,0,0,1,179.94,38a36.59,36.59,0,0,1,4.91-.32,38.54,38.54,0,0,1,11.05,1.62,1.84,1.84,0,0,0,.57.09,2,2,0,0,0,.94-.24l14.08-7.45a2,2,0,0,0,1-1.2A1.93,1.93,0,0,0,212.3,29L200.08,7a2,2,0,0,0-1.75-1Z"/>
                                                        <path fill="#a91026" d="M221,21.94a1,1,0,0,1-.89-.51C220,21.31,213.41,9,210.26,3a1,1,0,0,1,0-.86,1,1,0,0,1,.65-.57,4.61,4.61,0,0,1,1.2-.16,4.25,4.25,0,0,1,3.76,2.51s3.54,6.68,4.27,8,1.43,2.7,2.06,4.11a5.68,5.68,0,0,1,.63,2.47,3.84,3.84,0,0,1-.09.68,13.51,13.51,0,0,1-.78,2.14,1.06,1.06,0,0,1-.89.63Z"/>
                                                        <path fill="#fff" d="M212.08,2.36a3.23,3.23,0,0,1,2.87,2l4.28,8.05c.7,1.33,1.41,2.66,2,4a5,5,0,0,1,.54,2,3.93,3.93,0,0,1-.06.48,13.65,13.65,0,0,1-.75,2s-6.66-12.39-9.85-18.47a3.54,3.54,0,0,1,.94-.13m0-2a5.7,5.7,0,0,0-1.46.2,2,2,0,0,0-1.25,2.86c3.16,6,9.79,18.36,9.86,18.48A2,2,0,0,0,221,23h.08a2,2,0,0,0,1.76-1.21l0-.05a13,13,0,0,0,.83-2.31,4.24,4.24,0,0,0,.12-.88,6.89,6.89,0,0,0-.71-2.9c-.65-1.44-1.38-2.82-2.1-4.16l-2.18-4.11L216.72,3.4a5.2,5.2,0,0,0-4.64-3Z"/>
                                                        <path fill="#a91026" d="M215.42,29.09a5.13,5.13,0,0,1-4.19-2.23,26.14,26.14,0,0,1-1.79-3.1L209,23q-3.6-6.84-7.17-13.69c-1.67-3.2-1.26-5.36,1.44-7.7a1,1,0,0,1,.36-.2l1.11-.35a1.06,1.06,0,0,1,.31-.05h0c2.57.12,4.39,1.41,5.74,4.08,1.86,3.66,3.81,7.36,5.71,10.93l2.6,4.91a9.75,9.75,0,0,1,.62,1.44,5.11,5.11,0,0,1-2.2,6.18,4.55,4.55,0,0,1-2.18.55Z"/>
                                                        <path fill="#fff" d="M205.09,2c2.4.11,3.83,1.43,4.89,3.53,2.69,5.33,5.53,10.58,8.31,15.86a7.64,7.64,0,0,1,.56,1.28,4.09,4.09,0,0,1-1.73,5,3.49,3.49,0,0,1-1.7.43,4.13,4.13,0,0,1-3.37-1.8,33.12,33.12,0,0,1-2.12-3.77q-3.6-6.83-7.17-13.68C201.3,6,201.61,4.39,204,2.35L205.09,2m0-2a2.1,2.1,0,0,0-.61.09l-.66.21-.46.15a1.86,1.86,0,0,0-.7.39C199.6,3.49,199.1,6.16,201,9.76q3.57,6.86,7.17,13.69l.39.77a26.44,26.44,0,0,0,1.86,3.22,6.15,6.15,0,0,0,5,2.65,5.53,5.53,0,0,0,2.66-.67,6.12,6.12,0,0,0,2.67-7.37,9.46,9.46,0,0,0-.69-1.59q-1.29-2.46-2.6-4.92c-1.89-3.57-3.85-7.26-5.7-10.91-1.51-3-3.66-4.5-6.58-4.63Z"/>
                                                        <path fill="#a91026" d="M105.66,93.53a1,1,0,0,1-.63-.22,1,1,0,0,1-.37-.86c.26-3.29,3.42-6.24,7.53-7a11.85,11.85,0,0,1,2-.19,8.54,8.54,0,0,1,6.87,3,1,1,0,0,1,.14.95,1,1,0,0,1-.72.63c-1.15.27-11.35,2.64-14.59,3.62A1.35,1.35,0,0,1,105.66,93.53Z"/>
                                                        <path fill="#fff" d="M114.24,86.27a7.53,7.53,0,0,1,6.07,2.63c-1.64.38-11.44,2.66-14.65,3.63.21-2.81,3-5.4,6.71-6.09a10,10,0,0,1,1.87-.17m0-2a12,12,0,0,0-2.23.2c-4.62.85-8.05,4.1-8.35,7.9a2,2,0,0,0,2,2.16,1.88,1.88,0,0,0,.57-.09c3.2-1,13.38-3.33,14.53-3.6a2,2,0,0,0,1.43-1.26,2,2,0,0,0-.28-1.89,9.53,9.53,0,0,0-7.67-3.42Z"/>
                                                        <path fill="#a91026" d="M7,196.24a6,6,0,0,1-6-6V110.08a6,6,0,0,1,6-6h93.05s.7-7.21.7-7.21a.43.43,0,0,1,0-.11,2.12,2.12,0,0,1,1.65-1.65c1.6-.34,15.84-3.56,19-4.27.58-2.44,2.48-10.36,2.73-11.13,0-.16.11-.36.16-.58a4.64,4.64,0,0,1,1.37-2.64,2.22,2.22,0,0,1,1.32-.41,2.87,2.87,0,0,1,1.17.25,5.73,5.73,0,0,1,1.1.67l.37.25a5.39,5.39,0,0,0,2.94.79,7.87,7.87,0,0,0,2.62-.47,7.53,7.53,0,0,0,3.19-2.26l.14-.17a6.32,6.32,0,0,0,.66-1.25,5.68,5.68,0,0,1,1.52-2.28l.19-.16a3.5,3.5,0,0,1,2.3-1,3.23,3.23,0,0,1,.85.12,1,1,0,0,1,.73,1.11c0,.13,0,.14-.94,3.3-2,6.68-7,23.76-8,29.11h24.72a37.07,37.07,0,0,1,11.25-62.58,36.25,36.25,0,0,1,13.08-2.43,37.38,37.38,0,0,1,29.53,14.61,36.65,36.65,0,0,1,7.28,27.47,37.63,37.63,0,0,1-12.29,22.93H320.23a6,6,0,0,1,6,6v80.14a6,6,0,0,1-6,6Z"/>
                                                        <path fill="#fff" d="M184.9,40.05a36.13,36.13,0,0,1,21.71,65H320.23a5,5,0,0,1,5,5v80.14a5,5,0,0,1-5,5H7a5,5,0,0,1-5-5V110.08a5,5,0,0,1,5-5h94.42a1.22,1.22,0,0,1-.37-1l.69-7.15a1.13,1.13,0,0,1,.89-.88c1.82-.38,19.59-4.41,19.59-4.41s2.57-10.82,2.85-11.65.47-2.23,1.17-2.73a1.19,1.19,0,0,1,.73-.22,1.88,1.88,0,0,1,.77.17,8.4,8.4,0,0,1,1.32.84,6.41,6.41,0,0,0,3.49,1,8.92,8.92,0,0,0,3-.53,8.49,8.49,0,0,0,3.61-2.56,1.56,1.56,0,0,0,.16-.2c.78-1,1-2.56,2-3.36a3,3,0,0,1,1.87-1,2.17,2.17,0,0,1,.59.09c-.05.36-8.39,28.13-9.06,33.28a2.76,2.76,0,0,1-.08.27H163.4a36.08,36.08,0,0,1,8.78-62.65,35.45,35.45,0,0,1,12.72-2.36m0-2a37.37,37.37,0,0,0-13.44,2.49A38.07,38.07,0,0,0,158,103.06h-21c1.4-6.26,5.88-21.57,7.7-27.8.95-3.26.95-3.26,1-3.47a2,2,0,0,0-1.46-2.21,3.92,3.92,0,0,0-1.11-.16,4.47,4.47,0,0,0-2.93,1.24l-.18.14a6.51,6.51,0,0,0-1.81,2.67,5.76,5.76,0,0,1-.54,1l-.12.15a6.58,6.58,0,0,1-2.76,2,6.65,6.65,0,0,1-2.28.41,4.39,4.39,0,0,1-2.4-.63l-.33-.23a7.32,7.32,0,0,0-1.28-.77,4,4,0,0,0-1.57-.33,3.23,3.23,0,0,0-1.9.6,5.41,5.41,0,0,0-1.75,3.2c0,.19-.1.37-.15.52-.25.74-1.81,7.27-2.6,10.6-4,.92-16.84,3.81-18.35,4.13a3.13,3.13,0,0,0-2.43,2.42,1.57,1.57,0,0,0,0,.23l-.61,6.3H7a7,7,0,0,0-7,7v80.14a7,7,0,0,0,7,7H320.23a7,7,0,0,0,7-7V110.08a7,7,0,0,0-7-7H211.94a38.76,38.76,0,0,0,10.76-21.8,37.64,37.64,0,0,0-7.48-28.21,38.38,38.38,0,0,0-30.32-15Z"/>
                                                        <path fill="#fff" d="M319.53,110H7.72a.41.41,0,0,0-.41.41v79.48a.41.41,0,0,0,.41.41H319.53a.41.41,0,0,0,.42-.41V110.41A.41.41,0,0,0,319.53,110Zm-3.09,41.84a4.57,4.57,0,0,1,0,.74l-15,35H25.87l-15.06-39.1a4.57,4.57,0,0,1,0-.74l15-35H301.39Z"/>
                                                        <path fill="#fff" d="M208.7,72.84a23.95,23.95,0,1,0-20.63,27.07A24,24,0,0,0,208.7,72.84Z"/>
                                                        <path fill="#a91026" d="M198.58,67.86l-7.76,3.7L194.93,64a2.44,2.44,0,0,0-4.29-2.33l-4.11,7.55-1.12-8.52a2.44,2.44,0,0,0-4.84.64l1.13,8.52-5.92-6.24A2.44,2.44,0,1,0,172.24,67l5.91,6.24-8.45-1.57a2.44,2.44,0,0,0-.89,4.8L177.26,78l-7.75,3.7a2.44,2.44,0,0,0,1.37,4.62,2.51,2.51,0,0,0,.73-.21l7.76-3.7L175.26,90a2.45,2.45,0,0,0,1,3.31,2.45,2.45,0,0,0,3.31-1l4.11-7.55,1.12,8.52a2.44,2.44,0,1,0,4.84-.64l-1.12-8.52,5.91,6.23a2.43,2.43,0,0,0,2.09.74,2.38,2.38,0,0,0,1.36-.65A2.44,2.44,0,0,0,198,87L192,80.77l8.45,1.56a2.44,2.44,0,0,0,.89-4.8L192.93,76l7.76-3.7a2.44,2.44,0,1,0-2.11-4.41Z"/></g></g>
                                                        </svg>
                                                    }

                                                    {
                                                        c === 'fortification' &&
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 327.25 226.92"><defs><style></style></defs><g id="圖層_2"><g id="Layer_1_1:1_">
                                                        <path fill="#a91026" d="M112.54,33.86a2.82,2.82,0,0,1-2.31-1.22,2.79,2.79,0,0,1-.3-2.58l3.59-9.38a2.82,2.82,0,0,1,2.61-1.8H127.7V3.51a3.25,3.25,0,0,1,.09-1A2.22,2.22,0,0,1,129.89,1a1.53,1.53,0,0,1,1.45.88c.11.25.19.29.85.38a5.15,5.15,0,0,1,.95.19l2.42.82c1.62.55,3.24,1.1,4.88,1.63,1.12.36,2.72.71,4.26,1,3.94.88,5.08,1.17,5.33,2.14l0,.14a2.32,2.32,0,0,1-.62,1.81c-1.82,2.1-7.65,2.92-10.19,3l-1.11,0c-1.74,0-3.54.09-5.26.25l-.41,0a3,3,0,0,0,0,.53v5h11.45a2.81,2.81,0,0,1,2.65,1.91l3.16,9.37a2.81,2.81,0,0,1-2.65,3.7ZM144,28.23l-1.31-3.71h-3.3v3.71Zm-11,0V24.52h-5.3v3.71Zm-11.74,0V24.52h-3.06l-1.31,3.71Zm11.29-19c.89,0,2.1-.06,3.44-.08L139.48,9c1.06,0,1.87-.07,2.54-.14-1-.14-2.21-.3-3.34-.54-1.41-.3-2.8-.65-4-1-.8-.2-1.54-.39-2.14-.52Z"/>
                                                        <path fill="#fff" d="M129.89,2a.54.54,0,0,1,.54.3c.52,1.11,1.56.82,2.39,1.1,2.44.81,4.86,1.66,7.31,2.45,2.92.93,8.76,1.8,8.93,2.49.26,2.29-6.3,3.6-9.84,3.7-2.15.06-4.32.08-6.44.29-.7.07-1.34-.13-1.34,1.55v6h12.45a1.81,1.81,0,0,1,1.7,1.23l3.16,9.37a1.8,1.8,0,0,1-1.7,2.38H112.54a1.8,1.8,0,0,1-1.68-2.44l3.6-9.38a1.78,1.78,0,0,1,1.67-1.16H128.7V3.69a3.28,3.28,0,0,1,.05-.89,1.25,1.25,0,0,1,1.14-.8m1.63,8.26c1-.11,5-.13,8-.22s4.14-.25,5.56-.87c.42-.19.15-.73-.3-.84-1.47-.34-3.75-.5-5.88-1-3.07-.65-6.1-1.58-7.37-1.71v4.59m6.88,19h6.12a.62.62,0,0,0,.62-.8l-1.59-4.49a.65.65,0,0,0-.62-.42H138.4v5.71m-11.73,0H134V23.52h-7.3v5.71m-10.32,0h5.88V23.52h-4.29a.65.65,0,0,0-.62.42l-1.59,4.49a.62.62,0,0,0,.62.8M129.89,0a3.21,3.21,0,0,0-3.06,2.25,4,4,0,0,0-.13,1.28V17.88H116.13a3.81,3.81,0,0,0-3.54,2.44L109,29.7a3.81,3.81,0,0,0,3.55,5.16h34.51a3.8,3.8,0,0,0,3.6-5l-3.17-9.37a3.78,3.78,0,0,0-3.59-2.59H133.44v-3.6c1.55-.13,3.18-.18,4.75-.22l1.09,0c2.28-.07,8.7-.8,10.92-3.35a3.31,3.31,0,0,0,.85-2.58c0-.09,0-.18-.05-.28-.42-1.59-2-1.94-6.08-2.85-1.52-.34-3.1-.69-4.18-1-1.62-.52-3.26-1.08-4.86-1.62l-2.42-.82a6,6,0,0,0-1.14-.23l-.19,0A2.56,2.56,0,0,0,129.89,0Zm3.63,8.17v0l.11,0Z"/>
                                                        <path fill="#a91026" d="M118.73,56.85A3.91,3.91,0,0,1,114.82,53L113,35.53a1,1,0,0,1,.25-.77,1,1,0,0,1,.75-.33h31.16a1,1,0,0,1,.74.33,1,1,0,0,1,.25.77L144.37,53a3.91,3.91,0,0,1-3.9,3.84Z"/>
                                                        <path fill="#fff" d="M145.18,35.43,143.37,53a2.9,2.9,0,0,1-2.9,2.9H118.73a2.9,2.9,0,0,1-2.91-2.9L114,35.43h31.16m0-2H114a2,2,0,0,0-1.49.66,2,2,0,0,0-.5,1.54l1.8,17.44a4.9,4.9,0,0,0,4.9,4.78h21.74a4.91,4.91,0,0,0,4.9-4.78l1.8-17.44a2,2,0,0,0-.51-1.54,2,2,0,0,0-1.48-.66Z"/>
                                                        <path fill="#a91026" d="M7,225.92a6,6,0,0,1-6-6V139.75a6,6,0,0,1,6-6h97l13-75.13a1,1,0,0,1,1-.83h23.07a1,1,0,0,1,1,.76l4,16.23a1,1,0,0,1-.41,1.07c-15.56,10.54-24.13,25.5-24.13,42.1v15.8h2.07v-18c0-12.77,5.68-24.86,16-34,.49-.43,1-.85,1.5-1.25A41.13,41.13,0,0,1,167,71.51h1.4V42a5.53,5.53,0,0,1,.15-1.68A3.46,3.46,0,0,1,171.74,38a2.11,2.11,0,0,1,2,1.18c.47,1,1.17,1.16,2.48,1.33a8.13,8.13,0,0,1,1.7.34q2.44.81,4.87,1.65c3.18,1.08,6.47,2.2,9.73,3.24,2.29.73,5.5,1.45,8.61,2.14,7.6,1.69,9.57,2.26,9.9,3.53a.89.89,0,0,1,0,.14,3.66,3.66,0,0,1-1,2.86C207,57.92,196.5,59.84,190.41,60l-2.16.06c-3.51.09-7.15.18-10.64.52l-.55,0c-1,0-1.24.06-1.24,2.07,0,1.1,0,5.09,0,8.81h5.45A41.1,41.1,0,0,1,208.5,81.58l.15.13c10.33,9.17,16,21.26,16,34v18h95.56a6,6,0,0,1,6,6V219.9a6,6,0,0,1-6,6Zm193-92.19v-27H177v27h2.64v-24a1,1,0,0,1,1-1h15.68a1,1,0,0,1,1,1v24Zm-28.73,0v-27h-23v27H151v-24a1,1,0,0,1,1-1h15.68a1,1,0,0,1,1,1v24ZM193,91.85a2.29,2.29,0,0,0,0,4.57h10.22a2.29,2.29,0,0,0,0-4.57Zm-24.3,0a2.29,2.29,0,0,0,0,4.57h10.22a2.29,2.29,0,0,0,0-4.57Zm-24.3,0a2.29,2.29,0,0,0,0,4.57h10.22a2.29,2.29,0,0,0,0-4.57ZM176,54.38c1.74-.09,4.66-.14,7.93-.21,2.33,0,4.79-.09,7-.15,5.5-.16,7.87-.48,10.25-1.45-1.38-.32-3.16-.56-5-.82-2.07-.27-4.4-.59-6.63-1.06-2.8-.6-5.57-1.3-8-1.92-2.18-.56-4.13-1.06-5.51-1.32Z"/>
                                                        <path fill="#fff" d="M171.74,39a1.11,1.11,0,0,1,1.08.6c1,2.23,3.11,1.64,4.77,2.19,4.87,1.64,9.72,3.34,14.61,4.9,5.84,1.87,17.5,3.6,17.86,5,.51,4.58-12.6,7.19-19.68,7.39-4.3.12-8.63.17-12.86.58-1.41.14-2.7-.26-2.7,3.11,0,1.2,0,5.83,0,9.81h6.45a40.1,40.1,0,0,1,26.55,9.82l.16.13c9.7,8.62,15.68,20.35,15.68,33.28v19h96.56a5,5,0,0,1,5,5V219.9a5,5,0,0,1-5,5H7a5,5,0,0,1-5-5V139.75a5,5,0,0,1,5-5h97.86l13.18-76h23.07l3.93,16.08c-15,10.16-24.53,25.41-24.53,43.08v16.8h4.07v-19c0-12.93,6-24.66,15.67-33.28.48-.42,1-.83,1.46-1.23A40.1,40.1,0,0,1,167,72.51h2.4V42.33a6.57,6.57,0,0,1,.1-1.78,2.49,2.49,0,0,1,2.28-1.6M175,55.46c2.08-.22,9.93-.27,16-.44,5.73-.17,8.27-.49,11.1-1.74.85-.38.3-1.46-.59-1.67-2.95-.69-7.5-1-11.76-1.9-6.14-1.31-12.19-3.16-14.72-3.43v9.18m18,42h10.22a3.29,3.29,0,0,0,0-6.57H193a3.29,3.29,0,0,0,0,6.57m-24.3,0h10.22a3.29,3.29,0,0,0,0-6.57H168.69a3.29,3.29,0,0,0,0,6.57m-24.3,0h10.22a3.29,3.29,0,0,0,0-6.57H144.39a3.29,3.29,0,0,0,0,6.57M176,134.73h4.64v-25h15.68v25H201v-29H176v29m-28.74,0H152v-25h15.68v25h4.57v-29h-25v29M171.74,37h0a4.45,4.45,0,0,0-4.2,3,6.47,6.47,0,0,0-.19,2c0,.12,0,.24,0,.36V70.51H167a42.92,42.92,0,0,0-19.89,4.84,2,2,0,0,0,0-.83l-4-16.23a2,2,0,0,0-1.94-1.52H118.06a2,2,0,0,0-2,1.66l-12.89,74.3H7a7,7,0,0,0-7,7V219.9a7,7,0,0,0,7,7H320.23a7,7,0,0,0,7-7V139.75a7,7,0,0,0-7-7H225.67v-17c0-13.06-5.81-25.41-16.35-34.77l-.17-.15a42.1,42.1,0,0,0-27.87-10.31h-4.45c0-3.41,0-6.8,0-7.81a5.53,5.53,0,0,1,.08-1.06l.22,0,.59,0c3.46-.33,7.07-.42,10.57-.51l2.16-.06c5.07-.14,16.72-1.8,20.37-6A4.63,4.63,0,0,0,212,51.39a1.37,1.37,0,0,0,0-.28c-.5-1.92-2.79-2.51-10.66-4.26-3.08-.68-6.27-1.39-8.52-2.11-3.25-1-6.55-2.17-9.74-3.25l-4.84-1.64a9,9,0,0,0-1.9-.38c-1.32-.17-1.47-.27-1.7-.76A3.07,3.07,0,0,0,171.74,37Z"/>
                                                        <path fill="#fff" d="M319.53,139.67H7.72a.41.41,0,0,0-.41.42v79.47a.41.41,0,0,0,.41.42H319.53a.42.42,0,0,0,.42-.42V140.09A.42.42,0,0,0,319.53,139.67Zm-3.09,41.85a4.57,4.57,0,0,1,0,.74l-15,35H25.87L10.81,178.14a4.57,4.57,0,0,1,0-.74l15-35H301.39Z"/></g></g>
                                                        </svg>
                                                    }
                                                </div>
                                            }
                                            else if (v[1].name[3] !== null && v[1].mapIdx === mapIdx){
                                                return <div key={i} className={`marker ${markerKey === v[0] ? 'active' : ''}`} style={{left:v[1].position.x+'%', top:v[1].position.y+'%'}} onClick={()=>onClickMarker(c, v[0], v[1].position.x, v[1].position.y)}>
                                                <div className="wrap">
                                                    <div className="text">
                                                        <span className="en"dangerouslySetInnerHTML={{__html:v[1].name[3]}}></span><span className="tc">{v[1].name[1]}</span>
                                                    </div>
                                                </div>
                                                {c === 'characters' &&
                                                    <svg className={v[1].name[2]} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 327.25 229.84">
                                                        <rect className="color" fill="#a91026" x="2" y="137.65" width="323.25" height="90.19" rx="5.02"/>
                                                        <path className="color" fill="#a91026" d="M211.89 108.6a1.33 1.33 0 01-1.32 1.33h-4.16a1.34 1.34 0 01-1.33-1.33v-4.15a1.34 1.34 0 011.33-1.33h4.16a1.33 1.33 0 011.32 1.33zm-28.49 31.84h36.11c3.34 0 4.24-1.08 3.5-4.32-1.92-8.49-.39-27.35-2.3-35.84-1-4.5-3.87-7.75-7.37-10.49-6.06-4.75-13.08-7.56-20.31-9.9-2.95-1-6-1.57-9-2.57a26.69 26.69 0 01-6.16-2.83c-2-1.35-2-4.16 0-5.16 6.11-3 9.38-9 10.51-15.5.58-3.31.64-2.14.47-5.48s.48-6 3.69-7.52c2.81-1.33 3.11-4.72 1.76-7.69a23.85 23.85 0 01-1.07-2.56c-.63-2-.34-3.23 1.93-4.29 6.79-3.17 7.48-8.09 1.75-13C188 5.56 177.32 2.42 165.69 2H162.42c-11.63.39-22.34 3.53-31.28 11.25-5.72 4.94-5 9.86 1.75 13 2.28 1.06 2.56 2.32 1.93 4.29a22 22 0 01-1.07 2.56c-1.35 3-1.05 6.36 1.77 7.69a6.15 6.15 0 013.73 5.43c.37 5.69-.25 6.86 1.56 12.38a17.86 17.86 0 009.37 10.69c2.06 1 2.07 3.8 0 5.16a26.77 26.77 0 01-6.18 2.89c-2.94 1-6 1.62-9 2.57-7.23 2.34-14.25 5.15-20.31 9.9-3.49 2.74-6.35 6-7.36 10.49-1.92 8.49-.38 27.35-2.31 35.84-.73 3.24.17 4.32 3.51 4.32h74.87M171.6 29.71h15.9a.77.77 0 01.76.77v4.22a.77.77 0 01-.76.77h-16.45a8.55 8.55 0 00.81-3.64 8.73 8.73 0 00-.26-2.12zm-8.27-3.88a6 6 0 11-6 6 6 6 0 016-6zm-24.16 9.64a.77.77 0 01-.76-.77v-4.22a.77.77 0 01.76-.77h15.9a8.73 8.73 0 00-.26 2.12 8.55 8.55 0 00.81 3.64zM145 53.13c-.52-4.16-.09-3.91-.09-7.89h38.35c0 4 .43 3.73-.09 7.89-1 7.87-4.67 11.68-12.55 12.75a57.9 57.9 0 01-13.07 0C149.64 64.81 146 61 145 53.13zm-1 54a1 1 0 01-1 1h-18.5a1 1 0 01-1-1v-3.06a1 1 0 011-1H143a1 1 0 011 1zm-12.16-12.07c-2.66.84-5.34 1.62-8 2.56-1.67.6-2.88.41-3.41-1.4-.47-1.58-1.73-3.37.77-4.46L143.67 82c1.38 3.33 2.31 5.59 3.4 8.21zM148 81.54l1.28-.78a13.47 13.47 0 012.72-1.35c.22-.06.43-.12.64-.16a4.46 4.46 0 011.26 0l.64.12a14 14 0 014.17 2.29c.48.33 1 .71 1.56 1.12l.3.22-4.32 3.65-4.6 3.88c-1-2.41-1.91-4.64-2.8-6.8-.28-.73-.57-1.48-.85-2.19zm13.93 16.19l-4.29 20.86-6.14-22.91 7.18-5.93zM156.17 76c.36-1.42.72-2.89 1.11-4.45h13.56c.38 1.56.75 3 1.1 4.45-3.57 2.49-5.83 3.83-7.88 4.07-2.06-.22-4.31-1.56-7.89-4.07zm14.31 42.55l-4.29-20.84 3.26-8 7.17 5.93zm6-28.09L167.52 83c6.38-4.71 7.22-4.81 12.61-1.41zm7.91 27.28a1.34 1.34 0 01-1.33 1.33h-4.16a1.34 1.34 0 01-1.33-1.33v-4.15a1.34 1.34 0 011.33-1.33h4.1a1.34 1.34 0 011.33 1.33zm0-9.16a1.34 1.34 0 01-1.33 1.33h-4.16a1.34 1.34 0 01-1.33-1.33v-4.15a1.34 1.34 0 011.33-1.33h4.1a1.34 1.34 0 011.33 1.33zm9.18 9.16a1.34 1.34 0 01-1.33 1.33H188a1.33 1.33 0 01-1.32-1.33v-4.15a1.33 1.33 0 011.32-1.33h4.16a1.34 1.34 0 011.33 1.33zm0-9.16a1.34 1.34 0 01-1.33 1.33H188a1.33 1.33 0 01-1.32-1.33v-4.15a1.33 1.33 0 011.32-1.33h4.16a1.34 1.34 0 011.33 1.33zm9.18 9.16a1.34 1.34 0 01-1.33 1.33h-4.15a1.34 1.34 0 01-1.33-1.33v-4.15a1.34 1.34 0 011.33-1.33h4.15a1.34 1.34 0 011.33 1.33zm0-9.16a1.34 1.34 0 01-1.33 1.33h-4.15a1.34 1.34 0 01-1.33-1.33v-4.15a1.34 1.34 0 011.33-1.33h4.15a1.34 1.34 0 011.33 1.33zm9.18 9.16a1.33 1.33 0 01-1.32 1.33h-4.16a1.34 1.34 0 01-1.33-1.33v-4.15a1.34 1.34 0 011.33-1.33h4.16a1.33 1.33 0 011.32 1.33zm-4.25-21.54c-.53 1.81-1.74 2-3.41 1.4-2.61-.94-5.3-1.72-7.95-2.56l-15.23-4.84c1.08-2.62 2-4.88 3.39-8.21l22.43 9.75c2.46 1.11 1.2 2.9.73 4.48z"/>
                                                        <path fill="#fff" d="M171.6 29.71h15.9a.77.77 0 01.76.77v4.22a.77.77 0 01-.76.77h-16.45a8.55 8.55 0 00.81-3.64 8.73 8.73 0 00-.26-2.12z"/>
                                                        <circle fill="#fff" cx="163.33" cy="31.83" r="6"/>
                                                        <path fill="#fff" d="M139.17 35.47a.77.77 0 01-.76-.77v-4.22a.77.77 0 01.76-.77h15.9a8.73 8.73 0 00-.26 2.12 8.55 8.55 0 00.81 3.64z"/>
                                                        <path fill="#fff" d="M145 53.13c-.52-4.16-.09-3.91-.09-7.89h38.35c0 4 .43 3.73-.09 7.89-1 7.87-4.67 11.68-12.55 12.75a57.9 57.9 0 01-13.07 0C149.64 64.81 146 61 145 53.13z"/>
                                                        <rect fill="#fff" x="123.55" y="103.1" width="20.45" height="5" rx=".97"/>
                                                        <path fill="#fff" d="M131.84 95.06c-2.66.84-5.34 1.62-8 2.56-1.67.6-2.88.41-3.41-1.4-.47-1.58-1.73-3.37.77-4.46L143.67 82c1.38 3.33 2.31 5.59 3.4 8.21z"/>
                                                        <path fill="#fff" d="M148 81.54l1.28-.78a13.47 13.47 0 012.72-1.35c.22-.06.43-.12.64-.16a4.46 4.46 0 011.26 0l.64.12a14 14 0 014.17 2.29c.48.33 1 .71 1.56 1.12l.3.22-4.32 3.65-4.6 3.88c-1-2.41-1.91-4.64-2.8-6.8-.28-.73-.57-1.48-.85-2.19z"/>
                                                        <path fill="#fff" d="M161.92 97.73l-4.29 20.86-6.14-22.91 7.17-5.93 3.26 7.98z"/>
                                                        <path fill="#fff" d="M156.17 76c.36-1.42.72-2.89 1.11-4.45h13.56c.38 1.56.75 3 1.1 4.45-3.57 2.49-5.83 3.83-7.88 4.07-2.06-.22-4.31-1.56-7.89-4.07z"/>
                                                        <path fill="#fff" d="M170.48 118.57l-4.29-20.84 3.26-7.98 7.17 5.93-6.14 22.89z"/>
                                                        <path fill="#fff" d="M176.44 90.48L167.52 83c6.38-4.71 7.22-4.81 12.61-1.41z"/>
                                                        <rect fill="#fff" x="177.53" y="112.28" width="6.81" height="6.81" rx="1.33"/>
                                                        <rect fill="#fff" x="177.53" y="103.12" width="6.81" height="6.81" rx="1.33"/>
                                                        <rect fill="#fff" x="186.72" y="112.28" width="6.81" height="6.81" rx="1.33"/>
                                                        <rect fill="#fff" x="186.72" y="103.12" width="6.81" height="6.81" rx="1.33"/>
                                                        <rect fill="#fff" x="195.9" y="112.28" width="6.81" height="6.81" rx="1.33"/>
                                                        <rect fill="#fff" x="195.9" y="103.12" width="6.81" height="6.81" rx="1.33"/>
                                                        <rect fill="#fff" x="205.08" y="112.28" width="6.81" height="6.81" rx="1.33"/>
                                                        <rect fill="#fff" x="205.08" y="103.12" width="6.81" height="6.81" rx="1.33"/>
                                                        <path fill="#fff" d="M207.64 96.22c-.53 1.81-1.74 2-3.41 1.4-2.61-.94-5.3-1.72-7.95-2.56l-15.23-4.84c1.08-2.62 2-4.88 3.39-8.21l22.43 9.75c2.5 1.09 1.24 2.88.77 4.46z"/>
                                                        <path fill="#fff" d="M164.06 2h1.63C177.32 2.42 188 5.56 197 13.28c5.73 4.94 5 9.86-1.75 13-2.27 1.06-2.56 2.32-1.93 4.29a23.85 23.85 0 001.07 2.56c1.35 3 1 6.36-1.76 7.69-3.21 1.53-3.87 4.24-3.69 7.52s.11 2.17-.47 5.48c-1.13 6.48-4.4 12.54-10.51 15.5-2.06 1-2.06 3.8 0 5.16a26.69 26.69 0 006.16 2.83c2.94 1 6 1.62 9 2.57 7.23 2.34 14.25 5.15 20.31 9.9 3.5 2.74 6.35 6 7.37 10.49 1.91 8.49.38 27.35 2.3 35.84a8.69 8.69 0 01.23 1.51h97a5 5 0 015 5v80.15a5 5 0 01-5 5H7a5 5 0 01-5-5v-80.1a5 5 0 015-5h97.85a9.77 9.77 0 01.23-1.51c1.93-8.49.39-27.35 2.31-35.84 1-4.5 3.87-7.75 7.36-10.49 6.06-4.75 13.08-7.56 20.31-9.9 3-1 6-1.57 9-2.57a26.77 26.77 0 006.17-2.83c2-1.36 2-4.16 0-5.16a17.86 17.86 0 01-9.37-10.69c-1.81-5.52-1.19-6.69-1.56-12.38a6.15 6.15 0 00-3.73-5.43c-2.82-1.33-3.12-4.72-1.77-7.69a22 22 0 001.07-2.56c.63-2 .35-3.23-1.93-4.29-6.79-3.17-7.47-8.09-1.75-13 8.89-7.77 19.6-10.91 31.23-11.33h1.64m0-2h-1.71c-13.25.45-23.88 4.29-32.51 11.74-4.24 3.65-4.78 6.9-4.5 9s1.69 5 6.71 7.37c1.28.6 1.22.77.87 1.88a20.89 20.89 0 01-.82 2l-.16.35c-2 4.3-.82 8.65 2.72 10.33a4.14 4.14 0 012.59 3.75c.1 1.52.13 2.71.15 3.77a25.66 25.66 0 001.51 9.1 19.77 19.77 0 0010.4 11.87.7.7 0 01.42.6 1.25 1.25 0 01-.63 1.09 25.29 25.29 0 01-5.7 2.6c-1.51.52-3 .92-4.65 1.35-1.4.37-2.85.76-4.28 1.22-6.62 2.14-14.29 5-20.93 10.23-4.53 3.55-7.1 7.24-8.08 11.62s-1.1 11.17-1.2 18.3c-.09 6.61-.19 13.44-1.1 17.49H7a7 7 0 00-7 7v80.15a7 7 0 007 7h313.23a7 7 0 007-7v-80.14a7 7 0 00-7-7H225c-.91-4.05-1-10.88-1.1-17.49-.1-7.13-.19-13.86-1.19-18.3s-3.56-8.07-8.09-11.62C207.93 83 200.27 80.15 193.64 78c-1.42-.46-2.87-.85-4.28-1.22-1.61-.43-3.14-.83-4.64-1.35a25.15 25.15 0 01-5.71-2.6 1.28 1.28 0 01-.63-1.09.7.7 0 01.42-.6c6.09-3 10.22-9 11.61-17 .15-.82.26-1.36.34-1.76a11.64 11.64 0 00.15-4.15c-.16-3.14.53-4.66 2.56-5.62 3.54-1.68 4.68-6 2.72-10.33L196 32a16.69 16.69 0 01-.82-2c-.36-1.11-.41-1.28.86-1.88 5-2.34 6.42-5.3 6.71-7.37s-.26-5.33-4.49-9C189.65 4.32 179 .48 165.76 0h-1.7z"/>
                                                        <path fill="#fff" d="M319.53 142.59H7.72a.41.41 0 00-.41.42v79.47a.41.41 0 00.41.42h311.81a.42.42 0 00.42-.42V143a.42.42 0 00-.42-.41zm-3.09 41.84a4.57 4.57 0 010 .74l-15 35H25.86l-15-39.1a4.57 4.57 0 010-.74l15-35h275.53z"/>
                                                    </svg>
                                                }
                                            </div>
                                            }
                                            else
                                                return false;
                                        })
                                    })
                                }
                            </div>
                            <div ref={mapElem} id="map" className={`map${mapIdx}`}>
                                {
                                    imagesSrc.map((v,i)=>{
                                        return <img key={i} className={mapIdx === i+1 ? 'active' : ''} src={v}/>
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div id="contentWrap" className={showDetails ? 'active' : ''}>
                    <div id="closeBtn" onClick={()=>onShowDetails(false)}></div>
                    <div id="wrap">
                        {
                            selectedSource &&
                            selectedItem &&
                            <>
                                <div id={`${selectedCategory}`} className="icon"></div>
                                <div id="contentInnerWrap">
                                    <div id="content">
                                        <div id="name">
                                            <div className="tc">{data.source[selectedSource].name[1]}</div>
                                            <div className="en" dangerouslySetInnerHTML={{__html:data.source[selectedSource].name[0]}}></div>
                                        </div>
                                        <div id="description">
                                            <div className="tc">
                                                {
                                                    data.source[selectedSource].description[1].replace('（',' (').replace('）',') ').split('<br/><br/>').map((v,i)=>{
                                                        return <p key={i} dangerouslySetInnerHTML={{__html:v}}></p>
                                                    })
                                                }
                                            </div>
                                            <div className="en" dangerouslySetInnerHTML={{__html: data.source[selectedSource].description[0]}}></div>
                                        </div>
                                    </div>
                                    <div id="galleryWrap">
                                        <ul id="gallery">
                                            {
                                                selectedCategory &&
                                                <Flickity flickityRef={elem => flickityElem.current = elem}>
                                                {
                                                    data.items[selectedCategory][selectedItem].images.map((v,i)=>{
                                                        if (v.thum !== null){
                                                            return <li key={i} className={imageIdx === i ? 'active' : ''}><span><img src={(!isInDevMode() ? '.' : '') + v.thum} alt="" /></span></li>
                                                        } 
                                                        else{
                                                            return <li key={i} className={imageIdx === i ? 'active' : ''}><span><img src={(!isInDevMode() ? '.' : '') + v.src} alt="" /></span></li>
                                                        }
                                                    })
                                                }
                                                </Flickity>
                                            }
                                        </ul>
                                        {
                                            data.items[selectedCategory][selectedItem].images.length > 1 &&
                                            <ul id="points">
                                                {
                                                    data.items[selectedCategory][selectedItem].images.map((v,i)=>{
                                                        return <li key={i} className={imageIdx === i ? 'active' : ''} onClick={()=>onChangeImage(i)}></li>
                                                    })
                                                }
                                            </ul>
                                        }
                                    </div>
                                    <div id="related" className={data.source[selectedSource].relatedItems.length > 1 ? '' : 'none'}>
                                        {
                                            data.source[selectedSource].relatedItems &&
                                            data.source[selectedSource].relatedItems.map((v,i)=>{
                                                if(v.id !== selectedItem)
                                                    return <div className={data.items[selectedCategory][v.id].name[2]} key={i} onClick={()=>onClickRelatedItem(v.id)}><div className="en">{data.items[selectedCategory][v.id].name[0]}</div><div className="tc">{data.items[selectedCategory][v.id].name[1]}</div></div>
                                                else
                                                    return false;
                                            })
                                        }
                                        {
                                            
                                            (4 - (data.source[selectedSource].relatedItems.length-1)) == 3 &&
                                            [...Array(2 - (data.source[selectedSource].relatedItems.length-1))].map((v,i)=>{
                                                return <div key={i} className="none">{data.items[selectedCategory][selectedItem].name[2]}</div>
                                            })
                                        }

                                        {
                                            (4 - (data.source[selectedSource].relatedItems.length-1)) == 1 &&
                                            [...Array(4 - (data.source[selectedSource].relatedItems.length-1))].map((v,i)=>{
                                                return <div key={i} className="none"></div>
                                            })
                                        }
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                </div>
            </div>
            {
                openLightBox &&
                <LightBox 
                    data={data}
                    selectedCategory={selectedCategory}
                    selectedItem={selectedItem}
                    imageIdx={imageIdx}
                    setOpenLightBox={setOpenLightBox}
                    onChangeImage={onChangeImage}
                />
            }
        </div>
    )
}

export default LM01;