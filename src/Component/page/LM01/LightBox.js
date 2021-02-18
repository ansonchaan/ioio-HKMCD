import React, { useEffect, useRef, useState } from 'react';
import { isInDevMode } from '../../../globalFunc';
import Flickity from 'react-flickity-component';

const LightBox = props => {
    const flickityElem = useRef(null);
    const [imageIdx, setImageIdx] = useState(props.imageIdx);

    const images = props.selectedCategory && props.selectedItem ? props.data.items[props.selectedCategory][props.selectedItem].images : null;

    useEffect(()=>{
        flickityElem.current.on('ready', () => {
            flickityElem.current.select(imageIdx);
        })
        flickityElem.current.on('change', (index) => {
            setImageIdx(index);
            props.onChangeImage(index);
        })
        flickityElem.current.on('staticClick', ( e, pointer, cellElement, cellIndex ) => {
            if ( !cellElement ) {
                return;
            }
            if(e.target.tagName !== 'IMG'){
                props.setOpenLightBox(false)
            }
        })
    },[flickityElem])

    return(
        <div id="lightBoxWrap">
            <div id="wrap">
                <div id="image">
                    {
                        images &&
                        <Flickity flickityRef={elem => flickityElem.current = elem}>
                            {
                                images.map((v,i)=>{
                                    return <div key={i} className="imgWrap">
                                        <span>
                                            <img src={(!isInDevMode() ? '.' : '') + v.src} alt="" />
                                            {v.credit && <div id="credit">{v.credit[1] && <span className="tc">{v.credit[1]}</span>}{v.credit[0] && <span className="en">{v.credit[0]}</span>}</div>}
                                        </span>
                                    </div>
                                })
                            }
                        </Flickity>
                    }
                </div>
                {
                    images &&
                    images.length > 1 &&
                    <ul id="points">
                        {
                            images.map((v,i)=>{
                                return <li key={i} className={imageIdx === i ? 'active' : ''} onClick={()=>flickityElem.current.select(i)}></li>
                            })
                        }
                    </ul>
                }
            </div>
            <div id="bg" onClick={()=>props.setOpenLightBox(false)}></div>
        </div>
    )
}

export default LightBox;