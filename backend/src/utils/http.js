export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export const publicUser = { id: true, name: true, email: true, role: true, active: true, locale: true, createdAt: true };
export function opportunityDTO(row, locale = 'en') {
  const translation = row.translations?.find(item => item.locale === locale);
  const content = translation ? Object.fromEntries(['title','organization','location','description','requirements','tags'].map(key => [key,translation[key]])) : {};
  const category = locale === 'fa-AF' ? row.category.nameFa : locale === 'ps-AF' ? row.category.namePs : row.category.name;
  return { ...row, ...content, category: category || row.category.name, categoryKey: row.category.name, contentLocale: translation ? locale : 'en', deadline: row.deadline.toISOString().slice(0, 10) };
}
export function pageResult(data, total, page, limit) {
  return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
}
