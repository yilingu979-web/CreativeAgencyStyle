import assert from 'node:assert/strict';
import test from 'node:test';

import { validateContactForm } from '../src/lib/contactForm.js';

const validForm = {
    name: '林一',
    company: '扣寂科技',
    contact: 'kouji-studio',
    projectDescription: '品牌影像合作',
};

test('validateContactForm accepts email or WeChat contact details', () => {
    assert.deepEqual(validateContactForm(validForm), {});
    assert.deepEqual(validateContactForm({ ...validForm, contact: 'hello@example.com' }), {});
});

test('validateContactForm reports required fields without forcing email syntax', () => {
    const errors = validateContactForm({
        name: '',
        company: '',
        contact: 'x',
        projectDescription: '',
    });

    assert.deepEqual(errors, {
        name: '请填写姓名。',
        company: '请填写公司。',
        contact: '请填写有效的邮箱或微信。',
        projectDescription: '请填写项目描述。',
    });
});

test('validateContactForm enforces the same length limits as the API', () => {
    const errors = validateContactForm({
        ...validForm,
        name: '名'.repeat(81),
        company: '公'.repeat(121),
        contact: '微'.repeat(161),
        projectDescription: '项'.repeat(2001),
    });

    assert.equal(errors.name, '姓名请控制在 80 字以内。');
    assert.equal(errors.company, '公司名称请控制在 120 字以内。');
    assert.equal(errors.contact, '联系方式请控制在 160 字以内。');
    assert.equal(errors.projectDescription, '项目描述请控制在 2000 字以内。');
});
