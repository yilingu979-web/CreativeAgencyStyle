import { useState } from 'react';

export default function FullVideo({ src, videoRef }) {
    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);
    if (failed) return (
        <div className="work-lightbox__status" role="status">
            <p>视频暂时无法播放，请重试。</p>
            <button type="button" onClick={() => { setFailed(false); setAttempt(value => value + 1); }}>重新播放</button>
        </div>
    );
    return <video key={attempt} ref={videoRef} className="work-lightbox__video" src={src} controls controlsList="nodownload noremoteplayback" disablePictureInPicture autoPlay playsInline preload="metadata" onContextMenu={event => event.preventDefault()} onError={() => setFailed(true)} />;
}
