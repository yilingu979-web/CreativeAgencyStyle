const rules = {
    name: { required: '请填写姓名。', max: 80, tooLong: '姓名请控制在 80 字以内。' },
    company: { required: '请填写公司。', max: 120, tooLong: '公司名称请控制在 120 字以内。' },
    contact: { required: '请填写联系方式。', max: 160, tooLong: '联系方式请控制在 160 字以内。' },
    projectDescription: { required: '请填写项目描述。', max: 2000, tooLong: '项目描述请控制在 2000 字以内。' },
};

export function validateContactForm(values) {
    const errors = {};
    for (const [field, rule] of Object.entries(rules)) {
        const value = values[field]?.trim() || '';
        if (!value) errors[field] = rule.required;
        else if (value.length > rule.max) errors[field] = rule.tooLong;
    }

    if (!errors.contact && values.contact.trim().length < 3) {
        errors.contact = '请填写有效的邮箱或微信。';
    }
    return errors;
}
