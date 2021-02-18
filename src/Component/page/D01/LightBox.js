import React from 'react';
import VideoPlayer from 'react-video-js-player';
import { isInDevMode } from '../../../globalFunc';

const LightBox = props => {
    const imageSrc = props.filteredData[props.batteryIdx].details.gallery.images[props.galleryIdx].src;
    const videoSrc = props.filteredData[props.batteryIdx].details.gallery.video;
    return(
        <div id="lightBoxWrap">
            <div id="wrap">
                <div id="closeBtn" onClick={()=>props.setOpenLightBox(false)}></div>
                {   
                    videoSrc && props.galleryIdx === 0 ?
                    <VideoPlayer
                        controls={true}
                        autoplay={true}
                        hideControls={['volume','playbackrates','fullscreen']}
                        src={(!isInDevMode() ? '.' : '') + videoSrc}
                    />
                    :
                    <div id="image" style={{backgroundImage:`url(${(!isInDevMode() ? '.' : '') + imageSrc})`}}></div>
                }
            </div>
            <div id="bg" onClick={()=>props.setOpenLightBox(false)}></div>
        </div>
    )
}

export default LightBox;