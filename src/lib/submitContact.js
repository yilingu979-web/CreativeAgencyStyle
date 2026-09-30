const failureMessage = '未能确认提交成功，填写内容已保留。请重试，或直接邮件联系 postmaster@koujikeji.com。';

export async function submitContact(endpoint, form, fetcher = fetch) {
  if (!endpoint) throw new Error('在线提交暂未开通，请直接邮件联系 postmaster@koujikeji.com。');
  const payload = {
    name: form.name.trim(),
    email: form.contact.trim(),
    company: form.company.trim(),
    message: `姓名：${form.name.trim()}\n公司：${form.company.trim()}\n邮箱：${form.contact.trim()}\n\n项目需求：\n${form.projectDescription.trim()}`,
    _subject: '叩寂网站｜新项目咨询',
    _gotcha: form.website,
  };
  try {
    const response = await fetcher(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000),
    });
    const result = await response.json();
    if (!response.ok || result.ok !== true) throw new Error(failureMessage);
  } catch {
    throw new Error(failureMessage);
  }
}
