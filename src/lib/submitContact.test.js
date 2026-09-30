import test from 'node:test';
import assert from 'node:assert/strict';
import { submitContact } from './submitContact.js';
const form = { name:'客户', company:'公司', contact:'client@example.com', projectDescription:'制作影片', website:'' };
test('sends readable inquiry and reply email to configured form', async () => {
  await submitContact('https://formspree.io/f/example', form, async (url, options) => {
    assert.equal(url, 'https://formspree.io/f/example');
    assert.equal(options.headers.Accept, 'application/json');
    const data=JSON.parse(options.body);
    assert.equal(data.email, form.contact);
    assert.match(data.message, /制作影片/);
    assert.equal(data._gotcha, '');
    return {ok:true,json:async()=>({ok:true})};
  });
});
test('rejects server errors rather than claiming success', async () => {
  await assert.rejects(submitContact('https://formspree.io/f/example', form, async()=>({ok:false,status:429,json:async()=>({})})), /未能确认/);
});
test('rejects malformed successful responses', async () => {
  await assert.rejects(submitContact('https://formspree.io/f/example', form, async()=>({ok:true,json:async()=>{throw Error('html')}})), /未能确认/);
});
test('does not submit when endpoint is missing', async () => {
  await assert.rejects(submitContact('', form, async()=>{assert.fail('must not send')}), /暂未/);
});
