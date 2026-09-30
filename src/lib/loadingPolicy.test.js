import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPreviewOnce, shouldShowIntro, INTRO_DEADLINE_MS } from './loadingPolicy.js';
test('offscreen previews have no media request until observed, and load only once', () => {
 const video={dataset:{src:'/preview.mp4'},getAttribute(){return this.src;},load(){this.loads=(this.loads||0)+1;}};
 assert.equal(video.src,undefined);
 loadPreviewOnce(video); loadPreviewOnce(video);
 assert.equal(video.src,'/preview.mp4'); assert.equal(video.loads,1);
});
test('normal visits retain the full intro; reduced motion can skip it',()=>{
 assert.equal(shouldShowIntro(false,false),true);
 assert.equal(shouldShowIntro(true,false),true);
 assert.equal(shouldShowIntro(false,true),false);
 assert.ok(INTRO_DEADLINE_MS >= 5000);
});
