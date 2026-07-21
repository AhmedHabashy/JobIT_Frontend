/**
 * UI string catalogue. English is the source of truth: its keys define the
 * allowed `StringKey` type, and the Arabic map is typed `Record<StringKey, …>`
 * so a missing or misspelled key is a compile error. Only the app's own chrome
 * lives here — backend messages (API errors, the assistant's replies) are not
 * translated client-side. The product name "Jobit" is intentionally left in
 * Latin script in both languages.
 *
 * `workspace.toggleLang` uses the "show the language you'd switch to" trick: in
 * English it reads "العربية", in Arabic it reads "English".
 */
export const en = {
  // Landing
  "landing.signIn": "Sign In",
  "landing.eyebrow": "An ECES innovation · Egyptian labour market",
  "landing.heroTitle": "Find the skills Egypt is hiring for — and the fastest path to them.",
  "landing.heroLede":
    "AI-powered career intelligence built on three years of research into real Egyptian job postings.",
  "landing.ctaExplore": "Explore the Career Coach",
  "landing.ctaHow": "See how it works",
  "landing.goToApp": "Go to your workspace",
  "landing.trustEces": "Egyptian Center for Economic Studies",
  "landing.chartLabel": "Skill demand index",
  "landing.chartSub": "Egypt · 2022 → 2025",
  "landing.chartDelta": "demand growth",
  "landing.tickerLabel": "In demand now",
  "landing.figLabel": "Fig. 1",
  "landing.figCaption":
    "Skill demand index for Egypt, 2022–2025 (100 = peak observed demand). Source: ECES analysis of online job postings.",
  "landing.skillData": "Data analysis",
  "landing.skillMarketing": "Digital marketing",
  "landing.skillCloud": "Cloud & DevOps",
  "landing.skillFinance": "Financial analysis",
  "landing.whatKicker": "What is Jobit",
  "landing.whatBody":
    "Jobit is an ECES innovation, developed through three years of intensive, data-driven research on the Egyptian labour market using online job platforms. Powered by AI, Jobit turns that research into actionable insight — the most in-demand skills for each occupation and specialization, and the easiest, most promising pathways into the careers people want, grounded in rigorous scientific methodology.",
  "landing.stat1": "Years of data-driven labour-market research",
  "landing.stat2": "Online job postings analysed",
  "landing.stat3": "Occupations & specializations mapped",
  "landing.insightsTitle": "Egyptian market insight, made actionable",
  "landing.insightsSub": "Four ways Jobit turns three years of research into your next move.",
  "landing.featDemandTitle": "Demand trends across occupations",
  "landing.featDemandBody":
    "See which skills are rising for each occupation and specialization, with skill-gap analysis drawn from real, continuously-updated job-posting data.",
  "landing.featPathTitle": "Easiest pathways in",
  "landing.featPathBody":
    "Identify the shortest, most promising route into your desired career, ranked by how attainable each path is for you.",
  "landing.featCvTitle": "CV-tailored guidance",
  "landing.featCvBody":
    "Attach your CV and get advice aligned to Egyptian enterprise standards and the skills your target roles actually ask for.",
  "landing.featMethodTitle": "Scientific methodology",
  "landing.featMethodBody":
    "Every recommendation traces back to rigorous, transparent research — not guesswork or generic advice.",
  "landing.ctaTitle": "Ready to find your next step?",
  "landing.ctaBody":
    "Jobit's AI Career Coach helps Egyptian professionals reach their next role. Access is provided by your organization's administrator.",
  "landing.ctaSignIn": "Sign in to get started",
  "landing.footerRights": "© 2026 Jobit · An ECES innovation. All rights reserved.",
  "landing.footerAccess": "Access is restricted to authorized personnel.",

  // Login
  "login.errInvalid":
    "Invalid email or access key. Please check your credentials and try again.",
  "login.errDeactivated": "This account has been deactivated. Please contact your administrator.",
  "login.title": "Authorized Access Only",
  "login.subtitle": "Sign in to access Jobit Career Intelligence.",
  "login.emailLabel": "Corporate Email",
  "login.emailPlaceholder": "name@company.com",
  "login.passwordLabel": "Access Key",
  "login.passwordPlaceholder": "Enter security key",
  "login.showKey": "Show access key",
  "login.hideKey": "Hide access key",
  "login.verifying": "Verifying…",
  "login.signIn": "Sign In",
  "login.or": "OR",
  "login.signUp": "Sign Up",
  "login.registrationNote":
    "Registration is restricted to authorized personnel. Please contact your administrator for credentials.",

  // Workspace header
  "workspace.openMenu": "Open menu",
  "workspace.home": "Home",
  "workspace.session": "Session",
  "workspace.newChat": "New chat",
  "workspace.toggleLang": "العربية",

  // Composer
  "composer.uploadFailed": "Upload failed. Please try again.",
  "composer.unsupportedType": "Unsupported file type. Allowed: PDF, DOCX, DOC.",
  "composer.tooLarge": "File is too large. Maximum size is 10 MiB.",
  "composer.placeholder": "Ask about career paths, labour laws, or salaries in Egypt…",
  "composer.attachTitle": "Attach CV (PDF/DOCX/DOC)",
  "composer.attachAria": "Attach CV",
  "composer.removeAttachment": "Remove attachment",
  "composer.uploading": "Uploading…",
  "composer.pdfDocx": "PDF/DOCX",
  "composer.messageAria": "Message",
  "composer.cvFileAria": "CV file",
  "composer.sendAria": "Send message",
  "composer.disclaimer": "Jobit AI can provide guidance but does not replace legal advice.",

  // Sidebar
  "sidebar.deleteFailed": "Couldn't delete the conversation.",
  "sidebar.title": "Career Coach",
  "sidebar.subtitle": "AI Assistant",
  "sidebar.newChat": "New Chat",
  "sidebar.history": "HISTORY",
  "sidebar.loading": "Loading…",
  "sidebar.loadFailed": "Couldn't load conversations.",
  "sidebar.empty": "No conversations yet.",
  "sidebar.creditSingular": "credit left",
  "sidebar.creditPlural": "credits left",
  "sidebar.signOut": "Sign out",

  // Session row
  "session.untitled": "New conversation",
  "session.delete": "Delete conversation",

  // Chat area
  "chat.emptyTitle": "How can I help with your career today?",
  "chat.emptySubtitle":
    "Ask about salaries, in-demand skills, or Egyptian labour law — or attach your CV for tailored guidance.",
  "chat.notFoundTitle": "Conversation not found",
  "chat.notFoundBody": "This conversation no longer exists. It may have been deleted.",
  "chat.startNew": "Start a new chat",
  "chat.cvProfile": "CV PROFILE",
  "chat.more": "more",
  "chat.outOfCreditsShort": "You are out of credits. Sending is disabled.",
  "chat.using": "using",

  // Out-of-credits banner
  "banner.outOfCredits":
    "Your account is out of credits and has been deactivated. Contact your administrator to top up. Sending is disabled until credits are restored.",

  // Toasts
  "toast.dismiss": "Dismiss",
  "toast.retry": "Retry",
} as const;

export type StringKey = keyof typeof en;

export const ar: Record<StringKey, string> = {
  // Landing
  "landing.signIn": "تسجيل الدخول",
  "landing.eyebrow": "ابتكار من ECES · سوق العمل المصري",
  "landing.heroTitle": "اكتشف المهارات التي يطلبها سوق العمل المصري — وأسرع طريق للوصول إليها.",
  "landing.heroLede":
    "ذكاء مهني مدعوم بالذكاء الاصطناعي، مبني على ثلاث سنوات من البحث في إعلانات الوظائف المصرية الحقيقية.",
  "landing.ctaExplore": "استكشف المدرب المهني",
  "landing.ctaHow": "كيف يعمل",
  "landing.goToApp": "اذهب إلى مساحة العمل",
  "landing.trustEces": "المركز المصري للدراسات الاقتصادية",
  "landing.chartLabel": "مؤشر الطلب على المهارات",
  "landing.chartSub": "مصر · 2022 ← 2025",
  "landing.chartDelta": "نمو الطلب",
  "landing.tickerLabel": "الأكثر طلبًا الآن",
  "landing.figLabel": "شكل ١",
  "landing.figCaption":
    "مؤشر الطلب على المهارات في مصر، 2022–2025 (100 = ذروة الطلب المرصود). المصدر: تحليل ECES لإعلانات الوظائف الإلكترونية.",
  "landing.skillData": "تحليل البيانات",
  "landing.skillMarketing": "التسويق الرقمي",
  "landing.skillCloud": "الحوسبة السحابية",
  "landing.skillFinance": "التحليل المالي",
  "landing.whatKicker": "ما هو Jobit",
  "landing.whatBody":
    "Jobit ابتكار من المركز المصري للدراسات الاقتصادية، طوّرناه عبر ثلاث سنوات من البحث المكثّف القائم على البيانات في سوق العمل المصري باستخدام منصات التوظيف الإلكترونية. مدعومًا بالذكاء الاصطناعي، يحوّل Jobit هذا البحث إلى رؤى عملية — أكثر المهارات طلبًا لكل مهنة وتخصص، وأسهل المسارات وأكثرها وعدًا للدخول إلى المهن التي يطمح إليها الناس، استنادًا إلى منهجية علمية دقيقة.",
  "landing.stat1": "سنوات من البحث القائم على البيانات في سوق العمل",
  "landing.stat2": "إعلان وظيفة تم تحليلها",
  "landing.stat3": "مهنة وتخصص تم رسم خريطتها",
  "landing.insightsTitle": "رؤى سوق العمل المصري، جاهزة للتطبيق",
  "landing.insightsSub": "أربع طرق يحوّل بها Jobit ثلاث سنوات من البحث إلى خطوتك التالية.",
  "landing.featDemandTitle": "اتجاهات الطلب عبر المهن",
  "landing.featDemandBody":
    "اطّلع على المهارات الصاعدة لكل مهنة وتخصص، مع تحليل فجوات المهارات المستمد من بيانات إعلانات وظائف حقيقية ومحدّثة باستمرار.",
  "landing.featPathTitle": "أسهل المسارات للدخول",
  "landing.featPathBody":
    "حدّد أقصر المسارات وأكثرها وعدًا للدخول إلى مهنتك المرغوبة، مرتّبة حسب سهولة تحقيقها بالنسبة لك.",
  "landing.featCvTitle": "إرشاد مخصّص لسيرتك",
  "landing.featCvBody":
    "أرفق سيرتك الذاتية واحصل على نصائح متوافقة مع معايير الشركات المصرية والمهارات التي تطلبها وظائفك المستهدفة فعليًا.",
  "landing.featMethodTitle": "منهجية علمية",
  "landing.featMethodBody":
    "كل توصية تستند إلى بحث دقيق وشفّاف — لا تخمين ولا نصائح عامة.",
  "landing.ctaTitle": "هل أنت مستعد لخطوتك التالية؟",
  "landing.ctaBody":
    "يساعد المدرب المهني الذكي من Jobit المحترفين المصريين على الوصول إلى وظيفتهم التالية. يُتاح الوصول عبر مسؤول مؤسستك.",
  "landing.ctaSignIn": "سجّل الدخول للبدء",
  "landing.footerRights": "© 2026 Jobit · ابتكار من ECES. جميع الحقوق محفوظة.",
  "landing.footerAccess": "الوصول مقتصر على الأشخاص المصرّح لهم.",

  // Login
  "login.errInvalid":
    "البريد الإلكتروني أو مفتاح الدخول غير صحيح. يرجى التحقق من بياناتك والمحاولة مرة أخرى.",
  "login.errDeactivated": "تم إيقاف هذا الحساب. يرجى التواصل مع المسؤول.",
  "login.title": "الدخول للمصرّح لهم فقط",
  "login.subtitle": "سجّل الدخول للوصول إلى Jobit للذكاء المهني.",
  "login.emailLabel": "البريد الإلكتروني للعمل",
  "login.emailPlaceholder": "name@company.com",
  "login.passwordLabel": "مفتاح الدخول",
  "login.passwordPlaceholder": "أدخل مفتاح الأمان",
  "login.showKey": "إظهار مفتاح الدخول",
  "login.hideKey": "إخفاء مفتاح الدخول",
  "login.verifying": "جارٍ التحقق…",
  "login.signIn": "تسجيل الدخول",
  "login.or": "أو",
  "login.signUp": "إنشاء حساب",
  "login.registrationNote":
    "التسجيل مقتصر على الأشخاص المصرّح لهم. يرجى التواصل مع المسؤول للحصول على بيانات الدخول.",

  // Workspace header
  "workspace.openMenu": "فتح القائمة",
  "workspace.home": "الرئيسية",
  "workspace.session": "محادثة",
  "workspace.newChat": "محادثة جديدة",
  "workspace.toggleLang": "English",

  // Composer
  "composer.uploadFailed": "فشل الرفع. يرجى المحاولة مرة أخرى.",
  "composer.unsupportedType": "نوع الملف غير مدعوم. المسموح: PDF، DOCX، DOC.",
  "composer.tooLarge": "حجم الملف كبير جدًا. الحد الأقصى ١٠ ميجابايت.",
  "composer.placeholder": "اسأل عن المسارات المهنية أو قوانين العمل أو الرواتب في مصر…",
  "composer.attachTitle": "إرفاق السيرة الذاتية (PDF/DOCX/DOC)",
  "composer.attachAria": "إرفاق السيرة الذاتية",
  "composer.removeAttachment": "إزالة المرفق",
  "composer.uploading": "جارٍ الرفع…",
  "composer.pdfDocx": "PDF/DOCX",
  "composer.messageAria": "الرسالة",
  "composer.cvFileAria": "ملف السيرة الذاتية",
  "composer.sendAria": "إرسال الرسالة",
  "composer.disclaimer": "يقدّم Jobit إرشادات ولكنه لا يغني عن الاستشارة القانونية.",

  // Sidebar
  "sidebar.deleteFailed": "تعذّر حذف المحادثة.",
  "sidebar.title": "المدرب المهني",
  "sidebar.subtitle": "مساعد ذكي",
  "sidebar.newChat": "محادثة جديدة",
  "sidebar.history": "السجل",
  "sidebar.loading": "جارٍ التحميل…",
  "sidebar.loadFailed": "تعذّر تحميل المحادثات.",
  "sidebar.empty": "لا توجد محادثات بعد.",
  "sidebar.creditSingular": "رصيد متبقٍ",
  "sidebar.creditPlural": "رصيد متبقٍ",
  "sidebar.signOut": "تسجيل الخروج",

  // Session row
  "session.untitled": "محادثة جديدة",
  "session.delete": "حذف المحادثة",

  // Chat area
  "chat.emptyTitle": "كيف يمكنني مساعدتك في مسارك المهني اليوم؟",
  "chat.emptySubtitle":
    "اسأل عن الرواتب أو المهارات المطلوبة أو قانون العمل المصري — أو أرفق سيرتك الذاتية للحصول على إرشاد مخصّص.",
  "chat.notFoundTitle": "المحادثة غير موجودة",
  "chat.notFoundBody": "هذه المحادثة لم تعد موجودة. ربما تم حذفها.",
  "chat.startNew": "ابدأ محادثة جديدة",
  "chat.cvProfile": "ملف السيرة الذاتية",
  "chat.more": "أخرى",
  "chat.outOfCreditsShort": "لقد نفد رصيدك. تم تعطيل الإرسال.",
  "chat.using": "يستخدم",

  // Out-of-credits banner
  "banner.outOfCredits":
    "نفد رصيد حسابك وتم إيقافه. تواصل مع المسؤول لإعادة الشحن. تم تعطيل الإرسال حتى استعادة الرصيد.",

  // Toasts
  "toast.dismiss": "إغلاق",
  "toast.retry": "إعادة المحاولة",
};

export const dictionaries = { en, ar } as const;

export type Language = keyof typeof dictionaries;
