const fs=require('node:fs');
function edit(file,fn){fs.writeFileSync(file,fn(fs.readFileSync(file,'utf8')));}
for(const file of ['backend/src/routes/admin.js','backend/src/routes/account.js'])edit(file,s=>s.replaceAll('include: { category: true }','include: { category: true, translations: true }'));
edit('backend/src/routes/admin.js',s=>s.replace("adminRoutes.put('/opportunities/:id', async (req, res) => {\n  const data = await opportunityData(opportunity.parse(req.body));","adminRoutes.put('/opportunities/:id', async (req, res) => {\n  const data = await opportunityData(opportunity.parse(req.body), true);").replace('const categoryInput = z.object({ name: z.string().trim().min(2).max(80) })',"const categoryInput = z.object({ name: z.string().trim().min(2).max(80), nameFa: z.string().trim().min(2).max(80).optional(), namePs: z.string().trim().min(2).max(80).optional() })"));
edit('backend/src/routes/account.js',s=>s.replaceAll('opportunityDTO(row.opportunity)','opportunityDTO(row.opportunity, req.locale)'));
edit('backend/src/app.js',s=>"import { messageFor, supportedLocales } from '../../locales/catalog.mjs';\n".replace('../../locales','../../locales')+s);
// app.js is backend/src: shared catalogs live two levels above.
edit('backend/src/app.js',s=>s.replace("  app.use(helmet());",`  app.use((req, res, next) => {
    const language = req.get('X-KaarYab-Language');
    req.locale = supportedLocales.includes(language) ? language : 'en';
    res.set('Content-Language', req.locale);
    const json = res.json.bind(res);
    res.json = body => {
      if (body && typeof body === 'object') {
        if (body.error) body.error = messageFor(req.locale, body.error);
        if (body.message) body.message = messageFor(req.locale, body.message);
        if (body.details && req.locale !== 'en') body.details = body.details.map(item => ({...item,message:messageFor(req.locale,'This field is invalid.')}));
      }
      return json(body);
    };
    next();
  });
  app.use(helmet());`));
edit('backend/src/services/mail.js',s=>"import { messageFor } from '../../../locales/catalog.mjs';\n"+s.replace('sendReset(email, token)','sendReset(email, token, locale = \'en\')').replace("link.searchParams.set('reset', token);","link.searchParams.set('reset', token);\n  link.searchParams.set('lang',locale);").replace("subject: 'Reset your KaarYab password', text: `Use this link within 30 minutes to reset your password: ${link}\\nIf you did not request this, ignore this email.`","subject: messageFor(locale,'Reset your KaarYab password'), text: `${messageFor(locale,'Use this link within 30 minutes to reset your password:')} ${link}\\n${messageFor(locale,'If you did not request this, ignore this email.')}`"));
edit('backend/src/routes/auth.js',s=>s.replace('sendReset(email, token)','sendReset(email, token, user.locale)'));
edit('scripts/translate-ui.cjs',s=>s.replace("if(code.includes('useTranslation'))continue;",'').replace("for(const start of funcs)edits.push([start,start,'\\n  const { t } = useTranslation();']);","for(const start of funcs)if(!code.slice(start,start+100).includes('useTranslation()'))edits.push([start,start,'\\n  const { t } = useTranslation();']);").replace("const first=code.indexOf('\\n');code=", "const first=code.indexOf('\\n');if(!code.includes(\"import { useTranslation }\"))code="));
edit('context/SavedContext.jsx',s=>s.replace("import Link", "import { useTranslation } from 'react-i18next';\nimport { useLanguage } from './LanguageContext';\nimport Link").replace('  const { user,', '  const {t} = useTranslation();\n  const {locale} = useLanguage();\n  const { user,').replace('[user, authLoading, revision, opportunityPage]','[user, authLoading, revision, opportunityPage, locale]').replace("window.confirm('Delete this opportunity? This cannot be undone.')","window.confirm(t('Delete this opportunity? This cannot be undone.'))").replace('{error} <Link', '{t(error)} <Link').replace('>Account</Link>',">{t('Account')}</Link>").replace('>Retry</button>',">{t('Retry')}</button>").replace('>Loading opportunities...</p>',">{t('Loading opportunities...')}</p>"));
edit('context/LanguageContext.jsx',s=>s.replace("preferred = localStorage.getItem('kaaryab_language');", "preferred = new URLSearchParams(window.location.search).get('lang') || localStorage.getItem('kaaryab_language');"));
