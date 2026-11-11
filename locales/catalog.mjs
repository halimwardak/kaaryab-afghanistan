import { extra } from './extra.mjs';
// Reviewed UI translations. English source phrases are stable message keys.
const rows = `
Home|خانه|کورپاڼه
Opportunities|فرصت‌ها|فرصتونه
Dashboard|داشبورد|ډاشبورډ
Post Opportunity|نشر فرصت|فرصت خپرول
CV Builder|ساخت خلص سوانح|د ژوندلیک جوړول
Saved|ذخیره‌شده|خوندي شوي
About|دربارهٔ ما|زموږ په اړه
Contact|تماس|اړیکه
Account|حساب|حساب
Sign in|ورود|ننوتل
Sign out|خروج|وتل
Create account|ایجاد حساب|حساب جوړول
Sign in / Create account|ورود / ایجاد حساب|ننوتل / حساب جوړول
Language|زبان|ژبه
English|انگلیسی|انګلیسي
Dari|فارسی دری|دري
Pashto|پشتو|پښتو
Saving language...|در حال ذخیرهٔ زبان...|ژبه خوندي کېږي...
Toggle Theme|تغییر حالت نمایش|د بڼې بدلول
Open navigation|باز کردن فهرست|غورنۍ پرانیستل
Close navigation|بستن فهرست|غورنۍ تړل
Find Your Next|فرصت بعدی خود را|خپل راتلونکی
Opportunity|فرصت|فرصت
In Afghanistan|در افغانستان بیابید|په افغانستان کې ومومئ
Explore Opportunities|جستجوی فرصت‌ها|فرصتونه ولټوئ
Explore opportunities|جستجوی فرصت‌ها|فرصتونه ولټوئ
Post an Opportunity|یک فرصت نشر کنید|یو فرصت خپور کړئ
Browse by Category|مرور بر اساس دسته‌بندی|د کټګورۍ له مخې پلټنه
Quickly find what matches your current career goals|فرصت مناسب با اهداف شغلی خود را به‌آسانی بیابید|له خپلو مسلکي موخو سره سم فرصت ژر ومومئ
Jobs|وظایف|دندې
Job|وظیفه|دنده
Scholarships|بورسیه‌ها|بورسونه
Scholarship|بورسیه|بورس
Internships|کارآموزی‌ها|کارزده‌کړې
Internship|کارآموزی|کارزده‌کړه
Online course|دورهٔ آنلاین|انلاین کورس
Online Course|دورهٔ آنلاین|انلاین کورس
Remote work|کار از راه دور|له لرې کار
Remote Work|کار از راه دور|له لرې کار
Training program|برنامهٔ آموزشی|روزنیز پروګرام
Volunteer work|کار داوطلبانه|رضاکارانه کار
Available|موجود|شته
Empowering Women|توانمندسازی زنان|د ښځو پیاوړتیا
Looking for Online or Remote Roles?|در جستجوی فرصت‌های آنلاین یا کار از راه دور هستید؟|انلاین یا له لرې کاري فرصتونه لټوئ؟
View Remote Options|دیدن فرصت‌های از راه دور|له لرې فرصتونه وګورئ
KaarYab is a unified platform built for Afghan youth, students, and job seekers to discover jobs, scholarships, remote positions, and training programs in one secure place.|کاریاب بستری یکپارچه برای جوانان، محصلان و کارجویان افغان است تا وظایف، بورسیه‌ها، کار از راه دور و برنامه‌های آموزشی را در یک جای امن بیابند.|کاریاب د افغان ځوانانو، محصلانو او کار غوښتونکو ګډ پلیټفارم دی، چې دندې، بورسونه، له لرې کار او روزنیز پروګرامونه په یوه خوندي ځای کې ومومي.
KaarYab prioritizes safe, online, and remote education and work alternatives to help girls and women across Afghanistan continue their growth path.|کاریاب فرصت‌های امن آموزش و کار آنلاین و از راه دور را در اولویت قرار می‌دهد تا دختران و زنان سراسر افغانستان بتوانند به پیشرفت خود ادامه دهند.|کاریاب خوندي انلاین او له لرې زده‌کړو او کار ته لومړیتوب ورکوي، څو د افغانستان نجونې او ښځې خپل پرمختګ ته دوام ورکړي.
📢 Discover career and learning opportunities for Afghan youth.|📢 فرصت‌های کاری و آموزشی برای جوانان افغان را بیابید.|📢 د افغان ځوانانو لپاره کاري او زده‌کړیز فرصتونه ومومئ.
About KaarYab|دربارهٔ کاریاب|د کاریاب په اړه
Bridging the Gap Between|پیوند میان|د دې دواړو ترمنځ اړیکه
Talent & Opportunity|استعداد و فرصت|وړتیا او فرصت
Our Mission|رسالت ما|زموږ موخه
Inclusivity|فراگیری|ټول‌شمولیت
Transparency|شفافیت|روڼتیا
Built by the Community, for the Community|ساخته‌شده توسط جامعه، برای جامعه|د ټولنې له خوا، د ټولنې لپاره
Empowering Afghan youth by providing centralized, free, and verifiable access to jobs and educational resources.|توانمندسازی جوانان افغان با دسترسی متمرکز، رایگان و قابل بررسی به وظایف و منابع آموزشی.|کاري او ښوونیزو سرچینو ته د متمرکز، وړیا او د تایید وړ لاسرسي له لارې د افغان ځوانانو پیاوړي کول.
We prioritize safe, remote, and hybrid alternatives to ensure everyone, especially women, can continue their career path.|ما فرصت‌های امن، از راه دور و ترکیبی را در اولویت قرار می‌دهیم تا همه، به‌ویژه زنان، بتوانند مسیر شغلی خود را ادامه دهند.|موږ خوندي، له لرې او ګډو فرصتونو ته لومړیتوب ورکوو، څو هر څوک، په ځانګړې توګه ښځې، خپل مسلکي مسیر ته دوام ورکړي.
Every single opportunity listed here undergoes strict review to eliminate scam offers and outdated entries.|فرصت‌های درج‌شده برای جلوگیری از پیشنهادهای فریبنده و اطلاعات کهنه به‌دقت بررسی می‌شوند.|دلته ثبت شوي فرصتونه په دقت ارزول کېږي، څو درغلي او زاړه معلومات لرې شي.
KaarYab Afghanistan was born out of a critical need: to create a secure, modern, and unified space where students and job seekers can seamlessly discover their next step in life.|کاریاب افغانستان از یک نیاز اساسی پدید آمد: ایجاد فضایی امن، نوین و یکپارچه تا محصلان و کارجویان بتوانند گام بعدی زندگی خود را به‌آسانی پیدا کنند.|کاریاب افغانستان د یوې اساسي اړتیا له مخې رامنځته شو: یو خوندي، عصري او ګډ چاپېریال، چې محصلان او کار غوښتونکي پکې د خپل ژوند راتلونکی ګام په اسانۍ ومومي.
KaarYab is driven by volunteer developers and educators dedicated to making education and employment accessible across all provinces of Afghanistan.|کاریاب با تلاش برنامه‌نویسان و آموزگاران داوطلب پیش می‌رود که برای دسترسی به آموزش و کار در همهٔ ولایت‌های افغانستان متعهد اند.|کاریاب د رضاکارو پراختیاکوونکو او ښوونکو په هڅو پر مخ ځي، چې د افغانستان په ټولو ولایتونو کې زده‌کړو او کار ته د لاسرسي لپاره ژمن دي.
KaarYab Afghanistan. All rights reserved.|کاریاب افغانستان. تمام حقوق محفوظ است.|کاریاب افغانستان. ټول حقونه خوندي دي.
Empowering Afghan youth to find jobs, scholarships, and skills.|توانمندسازی جوانان افغان برای یافتن وظیفه، بورسیه و مهارت.|د دندو، بورسونو او مهارتونو د موندلو لپاره د افغان ځوانانو پیاوړي کول.
Created with ❤️ for Afghan Youth. By|با ❤️ برای جوانان افغان ساخته شده است. توسط|د افغان ځوانانو لپاره په ❤️ جوړ شوی. جوړوونکی
Search and filter through jobs, scholarships, and training options.|وظایف، بورسیه‌ها و برنامه‌های آموزشی را جستجو و فیلتر کنید.|دندې، بورسونه او روزنیز فرصتونه ولټوئ او چاڼ یې کړئ.
Search by title, keyword, or organization...|جستجو بر اساس عنوان، واژه یا اداره...|د سرلیک، کلیمې یا ادارې له مخې ولټوئ...
All|همه|ټول
All Categories|همهٔ دسته‌ها|ټولې کټګورۍ
All Types|همهٔ انواع|ټول ډولونه
Remote|از راه دور|له لرې
On-site|حضوری|حضوري
Hybrid|ترکیبی|ګډ
Filter by location|فیلتر بر اساس محل|د ځای له مخې چاڼ
Location|محل|ځای
Sort opportunities|مرتب‌سازی فرصت‌ها|د فرصتونو ترتیب
Newest first|جدیدترین‌ها نخست|لومړی نوي
Oldest first|قدیمی‌ترین‌ها نخست|لومړی زاړه
Deadline|مهلت|وروستۍ نېټه
Title|عنوان|سرلیک
Deadline filter|فیلتر مهلت|د وروستۍ نېټې چاڼ
All deadlines|همهٔ مهلت‌ها|ټولې وروستۍ نېټې
Open deadlines|مهلت‌های باز|پاتې مهلتونه
Expired|منقضی‌شده|پای ته رسېدلي
No Opportunities Found|فرصتی یافت نشد|هیڅ فرصت ونه موندل شو
Try adjusting your search keywords or filters to find what you are looking for.|برای یافتن نتیجهٔ دلخواه، واژه‌های جستجو یا فیلترها را تغییر دهید.|د خپلې خوښې پایلو لپاره د لټون کلیمې یا چاڼونه بدل کړئ.
Previous|قبلی|مخکینی
Next|بعدی|راتلونکی
Page|صفحه|پاڼه
of|از|له
View Details|دیدن جزئیات|جزییات وګورئ
Save Role|ذخیرهٔ فرصت|فرصت خوندي کول
Save {{title}}|ذخیرهٔ {{title}}|{{title}} خوندي کول
Unsave {{title}}|حذف {{title}} از ذخیره‌شده‌ها|{{title}} له خوندي شوو لرې کول
Back|بازگشت|شاته
Apply Now|اکنون درخواست دهید|اوس غوښتنلیک ورکړئ
Deadline:|مهلت:|وروستۍ نېټه:
Description|شرح|تشریح
Requirements|شرایط|شرطونه
Skills & Tags|مهارت‌ها و برچسب‌ها|مهارتونه او نښانونه
Opportunity Not Found|فرصت یافت نشد|فرصت ونه موندل شو
The opportunity you are looking for does not exist or has expired.|فرصت مورد نظر موجود نیست یا مهلت آن به پایان رسیده است.|هغه فرصت چې تاسې یې لټوئ نشته یا یې مهلت پای ته رسېدلی دی.
Back to Opportunities|بازگشت به فرصت‌ها|فرصتونو ته ستنېدل
Saved Opportunities|فرصت‌های ذخیره‌شده|خوندي شوي فرصتونه
Keep track of positions and scholarships you want to apply for|وظایف و بورسیه‌های مورد علاقهٔ خود را دنبال کنید|هغه دندې او بورسونه تعقیب کړئ چې غوښتنلیک ورته ورکوئ
Back to Explore|بازگشت به جستجو|پلټنې ته ستنېدل
No saved opportunities yet|هنوز فرصتی ذخیره نشده است|تر اوسه فرصت نه دی خوندي شوی
When exploring jobs and scholarships, click the bookmark icon to save them here.|هنگام مرور وظایف و بورسیه‌ها، روی نشان ذخیره کلیک کنید تا اینجا نگهداری شوند.|د دندو او بورسونو د کتلو پر مهال د خوندي کولو نښه کېکاږئ، څو دلته وساتل شي.
Explore Now|اکنون جستجو کنید|اوس پلټنه وکړئ
Loading opportunities...|در حال بارگذاری فرصت‌ها...|فرصتونه رااخیستل کېږي...
Loading opportunity...|در حال بارگذاری فرصت...|فرصت رااخیستل کېږي...
Loading account...|در حال بارگذاری حساب...|حساب رااخیستل کېږي...
Loading applications...|در حال بارگذاری درخواست‌ها...|غوښتنلیکونه رااخیستل کېږي...
Loading form...|در حال بارگذاری فورم...|فورمه رااخیستل کېږي...
Loading...|در حال بارگذاری...|رااخیستل کېږي...
Retry|تلاش دوباره|بیا هڅه
Please wait...|لطفاً صبر کنید...|مهرباني وکړئ انتظار وکړئ...
Please sign in to continue.|برای ادامه وارد حساب شوید.|د دوام لپاره خپل حساب ته ننوځئ.
Please sign in to save opportunities.|برای ذخیرهٔ فرصت‌ها وارد حساب شوید.|د فرصتونو د خوندي کولو لپاره حساب ته ننوځئ.
This page is for administrators.|این صفحه ویژهٔ مدیران است.|دا پاڼه د مدیرانو لپاره ده.
Your Account|حساب شما|ستاسې حساب
Welcome to KaarYab|به کاریاب خوش آمدید|کاریاب ته ښه راغلاست
Name|نام|نوم
Email|ایمیل|برېښنالیک
Password|رمز عبور|پټنوم
Full name|نام کامل|بشپړ نوم
Full Name|نام کامل|بشپړ نوم
Administrator|مدیر|مدیر
Member|عضو|غړی
Update profile|به‌روزرسانی مشخصات|د پېژندڅېرې تازه کول
Profile updated.|مشخصات به‌روز شد.|پېژندڅېره تازه شوه.
Signed in successfully.|با موفقیت وارد شدید.|په بریالیتوب ننوتئ.
Signed out.|از حساب خارج شدید.|له حسابه ووتئ.
Change password|تغییر رمز عبور|پټنوم بدلول
Current password|رمز عبور فعلی|اوسنی پټنوم
New password|رمز عبور جدید|نوی پټنوم
New password (12–72 characters)|رمز عبور جدید (۱۲ تا ۷۲ حرف)|نوی پټنوم (۱۲–۷۲ توري)
Use 12–72 characters (at most 72 UTF-8 bytes).|از ۱۲ تا ۷۲ حرف استفاده کنید (حداکثر ۷۲ بایت UTF-8).|له ۱۲ تر ۷۲ تورو وکاروئ (تر ډېره ۷۲ UTF-8 بایټه).
Forgot password?|رمز عبور را فراموش کرده‌اید؟|پټنوم مو هېر شوی؟
Request reset link|درخواست پیوند بازیابی|د بیاټاکلو لینک غوښتنه
Reset password|بازیابی رمز عبور|د پټنوم بیاټاکل
My applications|درخواست‌های من|زما غوښتنلیکونه
My Applications|درخواست‌های من|زما غوښتنلیکونه
No applications yet.|هنوز درخواستی ثبت نشده است.|تر اوسه غوښتنلیک نشته.
· Applied|· تاریخ درخواست|· د غوښتنلیک نېټه
Apply through KaarYab|درخواست از طریق کاریاب|د کاریاب له لارې غوښتنلیک
Your application is received by KaarYab administrators. You can also use the organization's external Apply Now link.|درخواست شما به مدیران کاریاب می‌رسد. می‌توانید از پیوند بیرونی «اکنون درخواست دهید» نیز استفاده کنید.|ستاسې غوښتنلیک د کاریاب مدیرانو ته رسېږي. د ادارې له بهرنۍ «اوس غوښتنلیک ورکړئ» تړوني هم کار اخیستلای شئ.
to submit and track an application through KaarYab.|تا درخواست خود را از طریق کاریاب ثبت و پیگیری کنید.|څو د کاریاب له لارې غوښتنلیک وسپارئ او تعقیب یې کړئ.
Cover letter|نامهٔ معرفی|د ځان پېژندنې لیک
Resume URL (optional)|پیوند خلص سوانح (اختیاری)|د ژوندلیک تړونی (اختیاري)
Submit application|ارسال درخواست|غوښتنلیک سپارل
Submitting...|در حال ارسال...|سپارل کېږي...
Application submitted. Track its status in My applications.|درخواست ثبت شد. وضعیت آن را در «درخواست‌های من» پیگیری کنید.|غوښتنلیک ثبت شو. حالت یې په «زما غوښتنلیکونه» کې تعقیب کړئ.
Applications are closed for this opportunity.|پذیرش درخواست برای این فرصت بسته شده است.|د دې فرصت لپاره د غوښتنلیک منل بند شوي دي.
SUBMITTED|ثبت‌شده|سپارل شوی
REVIEWING|در حال بررسی|تر ارزونې لاندې
INTERVIEW|مصاحبه|مرکه
ACCEPTED|پذیرفته‌شده|منل شوی
REJECTED|ردشده|رد شوی
USER|کاربر|کارن
ADMIN|مدیر|مدیر
PUBLISHED|نشرشده|خپور شوی
DRAFT|پیش‌نویس|مسوده
CLOSED|بسته‌شده|تړل شوی
Administration|مدیریت|اداره
Manage opportunities|مدیریت فرصت‌ها|د فرصتونو اداره
Manage users, applications, categories and messages|مدیریت کاربران، درخواست‌ها، دسته‌ها و پیام‌ها|د کارنانو، غوښتنلیکونو، کټګوریو او پیغامونو اداره
Management Dashboard|داشبورد مدیریت|د ادارې ډاشبورډ
Monitor live stats, analytical charts, and perform CRUD actions.|آمار زنده و نمودارها را ببینید و اطلاعات را ایجاد، ویرایش یا حذف کنید.|ژوندۍ شمېرې او چارټونه وګورئ؛ معلومات جوړ، سم او حذف کړئ.
Add Opportunity|افزودن فرصت|فرصت زیاتول
Previous listings|فهرست قبلی|مخکینی لېست
Next listings|فهرست بعدی|راتلونکی لېست
Total Active|مجموع فرصت‌ها|ټول فرصتونه
Remote Roles|فرصت‌های از راه دور|له لرې فرصتونه
Saved By You|ذخیره‌شده توسط شما|ستاسې خوندي کړي
Visual Metrics Breakdown|نمایش تصویری آمار|د شمېرو انځوریز وېش
Live Analytics|آمار زنده|ژوندۍ شمېرې
Expiring Soon (Critical)|نزدیک به پایان مهلت|ژر پای ته رسېدونکي
Recent Submissions|فرصت‌های تازه ثبت‌شده|تازه ثبت شوي فرصتونه
No opportunities available.|فرصتی موجود نیست.|هیڅ فرصت نشته.
Manage Submissions (CRUD Active)|مدیریت موارد ثبت‌شده|د ثبت شوو مواردو اداره
Total:|مجموع:|ټول:
Items|مورد|توکي
Opportunity Title|عنوان فرصت|د فرصت سرلیک
Category|دسته‌بندی|کټګوري
Type & Location|نوع و محل|ډول او ځای
Actions|عملیات|کړنې
Unpublish|لغو نشر|خپرول بندول
Publish|نشر|خپرول
Close|بستن|تړل
Edit This Opportunity|ویرایش این فرصت|دا فرصت سمول
Delete This Opportunity|حذف این فرصت|دا فرصت ړنګول
Delete this opportunity? This cannot be undone.|این فرصت حذف شود؟ این کار قابل برگشت نیست.|دا فرصت ړنګ شي؟ دا کار بېرته نه شي راګرځېدای.
No opportunities found in the database. Try creating one!|فرصتی در پایگاه داده نیست. یک فرصت ایجاد کنید!|په ډیټابیس کې فرصت نشته. یو فرصت جوړ کړئ!
Users|کاربران|کارنان
Applications|درخواست‌ها|غوښتنلیکونه
Published|نشرشده|خپاره شوي
Unread messages|پیام‌های خوانده‌نشده|نالوستل شوي پیغامونه
applications|درخواست‌ها|غوښتنلیکونه
users|کاربران|کارنان
categories|دسته‌بندی‌ها|کټګورۍ
messages|پیام‌ها|پیغامونه
New category|دستهٔ جدید|نوې کټګوري
New category name|نام دستهٔ جدید|د نوې کټګورۍ نوم
Category name|نام دسته|د کټګورۍ نوم
Add category|افزودن دسته|کټګوري زیاتول
No records found.|موردی یافت نشد.|هیڅ ریکارډ ونه موندل شو.
View resume|دیدن خلص سوانح|ژوندلیک کتل
Status|وضعیت|حالت
Active|فعال|فعال
Disabled|غیرفعال|غیرفعال
Disable account|غیرفعال کردن حساب|حساب غیرفعالول
Enable account|فعال کردن حساب|حساب فعالول
Rename|تغییر نام|نوم بدلول
Delete|حذف|ړنګول
Mark|علامت‌گذاری|نښه کول
read|خوانده‌شده|لوستل شوی
unread|خوانده‌نشده|نالوستل شوی
Mark read|علامت‌گذاری به‌عنوان خوانده‌شده|د لوستل شوي په توګه نښه کول
Mark unread|علامت‌گذاری به‌عنوان خوانده‌نشده|د نالوستل شوي په توګه نښه کول
Delete category {{name}}?|دستهٔ {{name}} حذف شود؟|د {{name}} کټګوري ړنګه شي؟
Application status for {{name}}|وضعیت درخواست {{name}}|د {{name}} د غوښتنلیک حالت
Role for {{name}}|نقش {{name}}|د {{name}} صلاحیت
Back to Dashboard|بازگشت به داشبورد|ډاشبورډ ته ستنېدل
Edit Opportunity|ویرایش فرصت|فرصت سمول
Post a New Opportunity|نشر یک فرصت جدید|نوی فرصت خپرول
Provide details about the career, study, or training opportunity for Afghan youth.|جزئیات فرصت کاری، تحصیلی یا آموزشی را برای جوانان افغان وارد کنید.|د افغان ځوانانو لپاره د کاري، تحصیلي یا روزنیز فرصت جزییات ولیکئ.
Opportunity Title *|عنوان فرصت *|د فرصت سرلیک *
Organization Name *|نام اداره *|د ادارې نوم *
Category *|دسته‌بندی *|کټګوري *
Workplace Type *|نوع محل کار *|د کارځای ډول *
Location *|محل *|ځای *
Application Deadline *|آخرین مهلت درخواست *|د غوښتنلیک وروستۍ نېټه *
Application Link / URL *|پیوند درخواست *|د غوښتنلیک تړونی *
Requirements * (Separate with commas)|شرایط * (با کامه جدا کنید)|شرطونه * (په کامه یې جلا کړئ)
Tags (Optional - Separate with commas)|برچسب‌ها (اختیاری، با کامه جدا کنید)|نښانونه (اختیاري، په کامه یې جلا کړئ)
Full Description *|شرح کامل *|بشپړه تشریح *
Publish Opportunity|نشر فرصت|فرصت خپرول
Update Opportunity|به‌روزرسانی فرصت|فرصت تازه کول
Opportunity created successfully! Redirecting...|فرصت با موفقیت ایجاد شد! در حال انتقال...|فرصت په بریالیتوب جوړ شو! لېږدول کېږئ...
Opportunity updated successfully! Redirecting...|فرصت با موفقیت به‌روز شد! در حال انتقال...|فرصت په بریالیتوب تازه شو! لېږدول کېږئ...
The opportunity to edit could not be loaded.|فرصت برای ویرایش بارگذاری نشد.|د سمولو لپاره فرصت راوانخیستل شو.
e.g. Frontend Developer Intern|مثلاً کارآموز توسعهٔ رابط کاربری|لکه د فرنټ‌اینډ پراختیا کارزده‌کوونکی
e.g. Kabul Tech Community|مثلاً انجمن فناوری کابل|لکه د کابل ټکنالوژۍ ټولنه
e.g. Kabul, Online|مثلاً کابل، آنلاین|لکه کابل، انلاین
React, GitHub, Internet access|ری‌اکت، گیت‌هاب، دسترسی به انترنت|ری‌اکټ، ګېټ‌هاب، انټرنېټ ته لاسرسی
Nextjs, Scholarship|نکست‌جی‌اس، بورسیه|نکسټ‌جي‌اېس، بورس
Provide a detailed description of the role...|شرح مفصل این فرصت را بنویسید...|د دې فرصت بشپړه تشریح ولیکئ...
Title must be at least 3 characters long|عنوان باید دست‌کم ۳ حرف داشته باشد|سرلیک باید لږ تر لږه ۳ توري ولري
Organization name is required|نام اداره ضروری است|د ادارې نوم اړین دی
Please select a category|یک دسته را انتخاب کنید|یوه کټګوري وټاکئ
Please select work type|نوع کار را انتخاب کنید|د کار ډول وټاکئ
Location is required (e.g. Kabul, Online)|محل ضروری است (مثلاً کابل، آنلاین)|ځای اړین دی (لکه کابل، انلاین)
Deadline date is required|تاریخ پایان مهلت ضروری است|وروستۍ نېټه اړینه ده
Description must be at least 10 characters long|شرح باید دست‌کم ۱۰ حرف داشته باشد|تشریح باید لږ تر لږه ۱۰ توري ولري
Please enter requirements (comma-separated)|شرایط را با کامه جدا کرده بنویسید|شرطونه ولیکئ او په کامه یې جلا کړئ
Please enter a valid URL (e.g., https://...)|یک پیوند معتبر وارد کنید (مثلاً https://...)|سم تړونی ولیکئ (لکه https://...)
Get in Touch|با ما در تماس شوید|له موږ سره اړیکه ونیسئ
Have questions, feedback, or partnerships? We’d love to hear from you.|پرسش، پیشنهاد یا طرح همکاری دارید؟ مشتاق شنیدن دیدگاه شما هستیم.|پوښتنې، نظرونه یا د همکارۍ وړاندیز لرئ؟ ستاسې خبرې اورېدل غواړو.
Email Us|به ما ایمیل بفرستید|موږ ته برېښنالیک راولېږئ
Telegram Channel|کانال تلگرام|د ټیلیګرام چینل
Message Sent!|پیام ارسال شد!|پیغام ولېږل شو!
Thank you for reaching out. Our support unit will review your query and reply soon.|از تماس شما سپاسگزاریم. تیم پشتیبانی پیام شما را بررسی کرده و به‌زودی پاسخ می‌دهد.|له اړیکې مو مننه. زموږ د ملاتړ ډله به ستاسې پیغام وګوري او ژر ځواب درکړي.
Email Address|نشانی ایمیل|د برېښنالیک پته
Your Message|پیام شما|ستاسې پیغام
Your name|نام شما|ستاسې نوم
How can we help you today?|امروز چگونه می‌توانیم کمک کنیم؟|نن څه مرسته درسره کولای شو؟
Send Message|ارسال پیام|پیغام لېږل
Sending...|در حال ارسال...|لېږل کېږي...
Move your old browser data|انتقال اطلاعات قبلی مرورگر|د براوزر د زړو معلوماتو لېږد
Export a backup, then import this browser's saved opportunities. Administrators can also import old listings. Existing server records are never overwritten.|نخست نسخهٔ پشتیبان بگیرید، سپس فرصت‌های ذخیره‌شدهٔ این مرورگر را وارد کنید. مدیران می‌توانند فهرست‌های قبلی را نیز وارد کنند. اطلاعات سرور بازنویسی نمی‌شود.|لومړی بیک‌اپ واخلئ، بیا د دې براوزر خوندي شوي فرصتونه وارد کړئ. مدیران زاړه اعلانونه هم واردولای شي. د سرور شته ریکارډونه نه بدلېږي.
Export backup|گرفتن نسخهٔ پشتیبان|بیک‌اپ اخیستل
Import old data|وارد کردن اطلاعات قبلی|زاړه معلومات واردول
Importing...|در حال وارد کردن...|واردېږي...
Backup exported. Original browser data was kept.|نسخهٔ پشتیبان گرفته شد. اطلاعات اصلی مرورگر حفظ شد.|بیک‌اپ واخیستل شو. د براوزر اصلي معلومات وساتل شول.
Invalid legacy format. Export a backup.|قالب اطلاعات قبلی نادرست است. نسخهٔ پشتیبان بگیرید.|د زړو معلوماتو بڼه ناسمه ده. بیک‌اپ واخلئ.
Original browser data was kept.|اطلاعات اصلی مرورگر حفظ شد.|د براوزر اصلي معلومات وساتل شول.
Listing imports require an administrator.|وارد کردن فهرست‌ها به دسترسی مدیر نیاز دارد.|د اعلانونو واردول د مدیر صلاحیت ته اړتیا لري.
Import report: {{imported}} bookmarks, {{unmatched}} unmatched bookmarks, {{failed}} invalid listings.|گزارش: {{imported}} ذخیره، {{unmatched}} ذخیرهٔ نامطابق و {{failed}} فهرست نامعتبر.|راپور: {{imported}} خوندي شوي، {{unmatched}} ناتړلي خوندي شوي او {{failed}} ناسم اعلانونه.
Export the backup to recover unresolved records.|برای بازیابی موارد حل‌نشده نسخهٔ پشتیبان بگیرید.|د ناحل شوو ریکارډونو د راګرځولو لپاره بیک‌اپ واخلئ.
Content translations|ترجمه‌های محتوا|د منځپانګې ژباړې
English content|محتوای انگلیسی|انګلیسي منځپانګه
Dari content|محتوای دری|دري منځپانګه
Pashto content|محتوای پشتو|پښتو منځپانګه
Complete every field in a language to save its translation.|برای ذخیرهٔ ترجمه، همهٔ بخش‌های آن زبان را تکمیل کنید.|د ژباړې د خوندي کولو لپاره د هغې ژبې ټولې برخې بشپړې کړئ.
Translation is not available yet. Original content is shown.|ترجمه هنوز موجود نیست. متن اصلی نمایش داده می‌شود.|ژباړه لا نشته. اصلي منځپانګه ښودل کېږي.
Dari category name|نام دسته به دری|د کټګورۍ دري نوم
Pashto category name|نام دسته به پشتو|د کټګورۍ پښتو نوم
This field is invalid.|این بخش نادرست است.|دا برخه ناسمه ده.
This field is required.|این بخش ضروری است.|دا برخه اړینه ده.
Enter at least {{minimum}} characters.|دست‌کم {{minimum}} حرف وارد کنید.|لږ تر لږه {{minimum}} توري ولیکئ.
Enter no more than {{maximum}} characters.|بیش از {{maximum}} حرف وارد نکنید.|تر {{maximum}} زیات توري مه لیکئ.
Choose a valid option.|یک گزینهٔ معتبر انتخاب کنید.|سم انتخاب وټاکئ.
Enter a valid email address.|یک نشانی ایمیل معتبر وارد کنید.|سمه برېښنالیک پته ولیکئ.
Enter a valid date or web address.|تاریخ یا نشانی وب معتبر وارد کنید.|سمه نېټه یا وېب‌پته ولیکئ.
KaarYab|کاریاب|کاریاب
KaarYab Afghanistan|کاریاب افغانستان|کاریاب افغانستان
Opportunity Finder Platform for Afghan Youth|بستر جستجوی فرصت برای جوانان افغان|د افغان ځوانانو د فرصت موندنې پلیټفارم
`;
export const entries = (rows.trim() + '\n' + extra.trim()).split('\n').map(line => line.split('|'));
export const supportedLocales = ['en', 'fa-AF', 'ps-AF'];
export const resources = Object.fromEntries(supportedLocales.map((locale,index) => [locale,{translation:Object.fromEntries(entries.map(row=>[row[0],row[index]]))}]));
export function messageFor(locale, key, values = {}) {
  const text = resources[locale]?.translation[key] || key;
  return text.replace(/\{\{(\w+)\}\}/g, (_,name) => String(values[name] ?? ''));
}
