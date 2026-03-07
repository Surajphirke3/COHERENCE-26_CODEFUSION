export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
] as const

export type LangCode = typeof LANGUAGES[number]['code']

type TranslationKeys = {
  // Navigation
  'nav.dashboard': string
  'nav.projects': string
  'nav.tasks': string
  'nav.docs': string
  'nav.messages': string
  'nav.ai': string
  'nav.team': string
  'nav.settings': string
  'nav.outreach': string
  'nav.leads': string
  'nav.workflows': string
  'nav.monitor': string
  // Settings
  'settings.title': string
  'settings.profile': string
  'settings.account': string
  'settings.email': string
  'settings.emailDesc': string
  'settings.appearance': string
  'settings.theme': string
  'settings.light': string
  'settings.dark': string
  'settings.language': string
  'settings.languageDesc': string
  'settings.aiProviders': string
  'settings.aiProvidersDesc': string
  'settings.activeProvider': string
  'settings.apiKey': string
  'settings.model': string
  'settings.save': string
  'settings.saved': string
  'settings.saving': string
  // Workflows
  'workflow.title': string
  'workflow.create': string
  'workflow.templates': string
  'workflow.save': string
  'workflow.execute': string
  'workflow.selectLeads': string
  'workflow.noLeads': string
  'workflow.running': string
  'workflow.done': string
  'workflow.failed': string
  // Leads
  'leads.title': string
  'leads.import': string
  'leads.search': string
  'leads.noLeads': string
  'leads.totalLeads': string
  // Monitor
  'monitor.title': string
  'monitor.realtime': string
  'monitor.refresh': string
  'monitor.noExecutions': string
  // Dashboard
  'dashboard.welcome': string
  'dashboard.overview': string
  'dashboard.recentActivity': string
  'dashboard.quickActions': string
  'dashboard.activeProjects': string
  'dashboard.tasksDueToday': string
  'dashboard.teamMembers': string
  'dashboard.newProject': string
  'dashboard.newDoc': string
  'dashboard.aiAssistant': string
  // Projects
  'projects.title': string
  'projects.create': string
  'projects.search': string
  'projects.noProjects': string
  'projects.active': string
  'projects.completed': string
  'projects.all': string
  // Docs
  'docs.title': string
  'docs.create': string
  'docs.search': string
  'docs.noDocs': string
  'docs.pinned': string
  // Team
  'team.title': string
  'team.members': string
  'team.role': string
  'team.admin': string
  'team.member': string
  // AI
  'ai.title': string
  'ai.taskGenerator': string
  'ai.summarizer': string
  'ai.prdWriter': string
  'ai.generate': string
  'ai.poweredBy': string
  // Topbar
  'topbar.search': string
  'topbar.signOut': string
  'topbar.collapse': string
  // Common
  'common.cancel': string
  'common.delete': string
  'common.edit': string
  'common.search': string
  'common.loading': string
  'common.selectAll': string
  'common.selectNone': string
  'common.new': string
  'common.name': string
  'common.email': string
  'common.status': string
  'common.actions': string
  'common.noData': string
  'common.confirm': string
  'common.back': string
  'common.next': string
  'common.submit': string
}

const en: TranslationKeys = {
  'nav.dashboard': 'Dashboard',
  'nav.projects': 'Projects',
  'nav.tasks': 'Tasks',
  'nav.docs': 'Docs',
  'nav.messages': 'Messages',
  'nav.ai': 'AI Assistant',
  'nav.team': 'Team',
  'nav.settings': 'Settings',
  'nav.outreach': 'Outreach',
  'nav.leads': 'Leads',
  'nav.workflows': 'Workflows',
  'nav.monitor': 'Live Monitor',
  'settings.title': 'Settings',
  'settings.profile': 'Profile',
  'settings.account': 'Account',
  'settings.email': 'Email Configuration',
  'settings.emailDesc': 'Connect your Gmail to send outreach emails. All workflows will use this email automatically.',
  'settings.appearance': 'Appearance',
  'settings.theme': 'Theme',
  'settings.light': 'Light',
  'settings.dark': 'Dark',
  'settings.language': 'Language',
  'settings.languageDesc': 'Choose your preferred language for the interface.',
  'settings.aiProviders': 'AI Providers',
  'settings.aiProvidersDesc': 'Configure API keys and select your preferred AI provider.',
  'settings.activeProvider': 'Active Provider',
  'settings.apiKey': 'API Key',
  'settings.model': 'Model',
  'settings.save': 'Save',
  'settings.saved': 'Saved!',
  'settings.saving': 'Saving...',
  'workflow.title': 'Workflows',
  'workflow.create': 'New Workflow',
  'workflow.templates': 'Use Template',
  'workflow.save': 'Save Workflow',
  'workflow.execute': 'Select Leads & Run',
  'workflow.selectLeads': 'Select Leads to Run',
  'workflow.noLeads': 'No leads found. Import leads from CSV/Excel first.',
  'workflow.running': 'Running...',
  'workflow.done': 'Done',
  'workflow.failed': 'Failed',
  'leads.title': 'Leads',
  'leads.import': 'Import',
  'leads.search': 'Search leads...',
  'leads.noLeads': 'No leads yet',
  'leads.totalLeads': 'Total Leads',
  'monitor.title': 'Live Monitor',
  'monitor.realtime': 'Real-time pipeline view',
  'monitor.refresh': 'Refresh',
  'monitor.noExecutions': 'No executions yet',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.search': 'Search',
  'common.loading': 'Loading...',
  'common.selectAll': 'Select All',
  'common.selectNone': 'Select None',
  'common.new': 'New',
  'common.name': 'Name',
  'common.email': 'Email',
  'common.status': 'Status',
  'common.actions': 'Actions',
  'common.noData': 'No data available',
  'common.confirm': 'Confirm',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.submit': 'Submit',
  'dashboard.welcome': 'Welcome back',
  'dashboard.overview': 'Overview',
  'dashboard.recentActivity': 'Recent Activity',
  'dashboard.quickActions': 'Quick Actions',
  'dashboard.activeProjects': 'Active Projects',
  'dashboard.tasksDueToday': 'Tasks Due Today',
  'dashboard.teamMembers': 'Team Members',
  'dashboard.newProject': 'New Project',
  'dashboard.newDoc': 'New Document',
  'dashboard.aiAssistant': 'AI Assistant',
  'projects.title': 'Projects',
  'projects.create': 'New Project',
  'projects.search': 'Search projects...',
  'projects.noProjects': 'No projects yet',
  'projects.active': 'Active',
  'projects.completed': 'Completed',
  'projects.all': 'All',
  'docs.title': 'Documents',
  'docs.create': 'New Document',
  'docs.search': 'Search documents...',
  'docs.noDocs': 'No documents yet',
  'docs.pinned': 'Pinned',
  'team.title': 'Team',
  'team.members': 'Members',
  'team.role': 'Role',
  'team.admin': 'Admin',
  'team.member': 'Member',
  'ai.title': 'AI Assistant',
  'ai.taskGenerator': 'Task Generator',
  'ai.summarizer': 'Summarizer',
  'ai.prdWriter': 'PRD Writer',
  'ai.generate': 'Generate',
  'ai.poweredBy': 'Powered by',
  'topbar.search': 'Search...',
  'topbar.signOut': 'Sign out',
  'topbar.collapse': 'Collapse',
}

// All languages spread from `en` so new keys automatically fall back to English
const hi: TranslationKeys = {
  ...en,
  'nav.dashboard': 'डैशबोर्ड', 'nav.projects': 'प्रोजेक्ट्स', 'nav.tasks': 'कार्य', 'nav.docs': 'डॉक्स', 'nav.messages': 'संदेश', 'nav.ai': 'AI सहायक', 'nav.team': 'टीम', 'nav.settings': 'सेटिंग्स', 'nav.outreach': 'आउटरीच', 'nav.leads': 'लीड्स', 'nav.workflows': 'वर्कफ़्लो', 'nav.monitor': 'लाइव मॉनिटर',
  'settings.title': 'सेटिंग्स', 'settings.profile': 'प्रोफाइल', 'settings.account': 'खाता', 'settings.email': 'ईमेल कॉन्फ़िगरेशन', 'settings.emailDesc': 'आउटरीच ईमेल भेजने के लिए अपना Gmail कनेक्ट करें।', 'settings.appearance': 'दिखावट', 'settings.theme': 'थीम', 'settings.light': 'लाइट', 'settings.dark': 'डार्क', 'settings.language': 'भाषा', 'settings.languageDesc': 'इंटरफ़ेस के लिए अपनी पसंदीदा भाषा चुनें।', 'settings.aiProviders': 'AI प्रदाता', 'settings.aiProvidersDesc': 'API कुंजी कॉन्फ़िगर करें और अपना पसंदीदा AI प्रदाता चुनें।', 'settings.activeProvider': 'सक्रिय प्रदाता', 'settings.apiKey': 'API कुंजी', 'settings.model': 'मॉडल', 'settings.save': 'सहेजें', 'settings.saved': 'सहेजा गया!', 'settings.saving': 'सहेज रहा है...',
  'workflow.title': 'वर्कफ़्लो', 'workflow.create': 'नया वर्कफ़्लो', 'workflow.templates': 'टेम्पलेट का उपयोग करें', 'workflow.save': 'वर्कफ़्लो सहेजें', 'workflow.execute': 'लीड्स चुनें और चलाएं', 'workflow.selectLeads': 'चलाने के लिए लीड्स चुनें', 'workflow.noLeads': 'कोई लीड नहीं मिला। पहले CSV/Excel से लीड्स इंपोर्ट करें।', 'workflow.running': 'चल रहा है...', 'workflow.done': 'पूर्ण', 'workflow.failed': 'विफल',
  'leads.title': 'लीड्स', 'leads.import': 'इंपोर्ट', 'leads.search': 'लीड्स खोजें...', 'leads.noLeads': 'अभी तक कोई लीड नहीं', 'leads.totalLeads': 'कुल लीड्स',
  'monitor.title': 'लाइव मॉनिटर', 'monitor.realtime': 'रीयल-टाइम पाइपलाइन दृश्य', 'monitor.refresh': 'रीफ्रेश', 'monitor.noExecutions': 'अभी तक कोई निष्पादन नहीं',
  'common.cancel': 'रद्द करें', 'common.delete': 'हटाएं', 'common.edit': 'संपादित करें', 'common.search': 'खोजें', 'common.loading': 'लोड हो रहा है...', 'common.selectAll': 'सभी चुनें', 'common.selectNone': 'कोई नहीं चुनें', 'common.new': 'नया', 'common.name': 'नाम', 'common.email': 'ईमेल', 'common.status': 'स्थिति', 'common.actions': 'कार्रवाई', 'common.noData': 'कोई डेटा उपलब्ध नहीं', 'common.confirm': 'पुष्टि करें', 'common.back': 'वापस', 'common.next': 'अगला', 'common.submit': 'जमा करें',
  'dashboard.welcome': 'वापस स्वागत है', 'dashboard.overview': 'अवलोकन', 'dashboard.recentActivity': 'हाल की गतिविधि', 'dashboard.quickActions': 'त्वरित कार्य', 'dashboard.activeProjects': 'सक्रिय प्रोजेक्ट', 'dashboard.tasksDueToday': 'आज के कार्य', 'dashboard.teamMembers': 'टीम सदस्य', 'dashboard.newProject': 'नया प्रोजेक्ट', 'dashboard.newDoc': 'नया दस्तावेज़', 'dashboard.aiAssistant': 'AI सहायक',
  'projects.title': 'प्रोजेक्ट्स', 'projects.create': 'नया प्रोजेक्ट', 'projects.search': 'प्रोजेक्ट खोजें...', 'projects.noProjects': 'अभी तक कोई प्रोजेक्ट नहीं', 'projects.active': 'सक्रिय', 'projects.completed': 'पूर्ण', 'projects.all': 'सभी',
  'docs.title': 'दस्तावेज़', 'docs.create': 'नया दस्तावेज़', 'docs.search': 'दस्तावेज़ खोजें...', 'docs.noDocs': 'अभी तक कोई दस्तावेज़ नहीं', 'docs.pinned': 'पिन किया गया',
  'team.title': 'टीम', 'team.members': 'सदस्य', 'team.role': 'भूमिका', 'team.admin': 'व्यवस्थापक', 'team.member': 'सदस्य',
  'ai.title': 'AI सहायक', 'ai.taskGenerator': 'कार्य जनरेटर', 'ai.summarizer': 'सारांशकर्ता', 'ai.prdWriter': 'PRD लेखक', 'ai.generate': 'जनरेट करें', 'ai.poweredBy': 'द्वारा संचालित',
  'topbar.search': 'खोजें...', 'topbar.signOut': 'साइन आउट', 'topbar.collapse': 'छोटा करें',
}

const es: TranslationKeys = {
  ...en,
  'nav.dashboard': 'Panel', 'nav.projects': 'Proyectos', 'nav.tasks': 'Tareas', 'nav.docs': 'Documentos', 'nav.messages': 'Mensajes', 'nav.ai': 'Asistente IA', 'nav.team': 'Equipo', 'nav.settings': 'Configuración', 'nav.outreach': 'Alcance', 'nav.leads': 'Contactos', 'nav.workflows': 'Flujos de trabajo', 'nav.monitor': 'Monitor en vivo',
  'settings.title': 'Configuración', 'settings.profile': 'Perfil', 'settings.account': 'Cuenta', 'settings.email': 'Configuración de correo', 'settings.emailDesc': 'Conecta tu Gmail para enviar correos de alcance.', 'settings.appearance': 'Apariencia', 'settings.theme': 'Tema', 'settings.light': 'Claro', 'settings.dark': 'Oscuro', 'settings.language': 'Idioma', 'settings.languageDesc': 'Elige tu idioma preferido para la interfaz.', 'settings.aiProviders': 'Proveedores de IA', 'settings.aiProvidersDesc': 'Configura claves API y selecciona tu proveedor de IA.', 'settings.activeProvider': 'Proveedor activo', 'settings.apiKey': 'Clave API', 'settings.model': 'Modelo', 'settings.save': 'Guardar', 'settings.saved': '¡Guardado!', 'settings.saving': 'Guardando...',
  'workflow.title': 'Flujos de trabajo', 'workflow.create': 'Nuevo flujo', 'workflow.templates': 'Usar plantilla', 'workflow.save': 'Guardar flujo', 'workflow.execute': 'Seleccionar contactos y ejecutar', 'workflow.selectLeads': 'Seleccionar contactos para ejecutar', 'workflow.noLeads': 'No se encontraron contactos. Importa desde CSV/Excel primero.', 'workflow.running': 'Ejecutando...', 'workflow.done': 'Listo', 'workflow.failed': 'Fallido',
  'leads.title': 'Contactos', 'leads.import': 'Importar', 'leads.search': 'Buscar contactos...', 'leads.noLeads': 'Aún no hay contactos', 'leads.totalLeads': 'Total de contactos',
  'monitor.title': 'Monitor en vivo', 'monitor.realtime': 'Vista de pipeline en tiempo real', 'monitor.refresh': 'Actualizar', 'monitor.noExecutions': 'Aún no hay ejecuciones',
  'common.cancel': 'Cancelar', 'common.delete': 'Eliminar', 'common.edit': 'Editar', 'common.search': 'Buscar', 'common.loading': 'Cargando...', 'common.selectAll': 'Seleccionar todo', 'common.selectNone': 'Ninguno', 'common.new': 'Nuevo', 'common.name': 'Nombre', 'common.email': 'Correo', 'common.status': 'Estado', 'common.back': 'Atrás', 'common.submit': 'Enviar',
  'dashboard.welcome': 'Bienvenido de nuevo', 'dashboard.overview': 'Resumen', 'dashboard.recentActivity': 'Actividad reciente', 'dashboard.quickActions': 'Acciones rápidas', 'dashboard.activeProjects': 'Proyectos activos', 'dashboard.tasksDueToday': 'Tareas para hoy', 'dashboard.teamMembers': 'Miembros del equipo', 'dashboard.newProject': 'Nuevo proyecto', 'dashboard.newDoc': 'Nuevo documento', 'dashboard.aiAssistant': 'Asistente IA',
  'projects.title': 'Proyectos', 'projects.create': 'Nuevo proyecto', 'projects.search': 'Buscar proyectos...', 'projects.noProjects': 'Aún no hay proyectos', 'projects.active': 'Activo', 'projects.completed': 'Completado', 'projects.all': 'Todos',
  'docs.title': 'Documentos', 'docs.create': 'Nuevo documento', 'docs.search': 'Buscar documentos...', 'docs.noDocs': 'Aún no hay documentos', 'docs.pinned': 'Fijado',
  'team.title': 'Equipo', 'team.members': 'Miembros', 'team.role': 'Rol', 'team.admin': 'Admin', 'team.member': 'Miembro',
  'ai.title': 'Asistente IA', 'ai.taskGenerator': 'Generador de tareas', 'ai.summarizer': 'Resumidor', 'ai.prdWriter': 'Escritor PRD', 'ai.generate': 'Generar', 'ai.poweredBy': 'Impulsado por',
  'topbar.search': 'Buscar...', 'topbar.signOut': 'Cerrar sesión', 'topbar.collapse': 'Contraer',
}

const fr: TranslationKeys = { ...en,
  'nav.dashboard': 'Tableau de bord', 'nav.projects': 'Projets', 'nav.tasks': 'Tâches', 'nav.docs': 'Documents', 'nav.messages': 'Messages', 'nav.ai': 'Assistant IA', 'nav.team': 'Équipe', 'nav.settings': 'Paramètres', 'nav.outreach': 'Prospection', 'nav.leads': 'Prospects', 'nav.workflows': 'Flux de travail', 'nav.monitor': 'Moniteur en direct',
  'settings.title': 'Paramètres', 'settings.profile': 'Profil', 'settings.account': 'Compte', 'settings.email': 'Configuration email', 'settings.emailDesc': 'Connectez votre Gmail pour envoyer des emails.', 'settings.appearance': 'Apparence', 'settings.theme': 'Thème', 'settings.light': 'Clair', 'settings.dark': 'Sombre', 'settings.language': 'Langue', 'settings.languageDesc': 'Choisissez votre langue préférée.',
  'dashboard.welcome': 'Bon retour', 'dashboard.recentActivity': 'Activité récente', 'dashboard.quickActions': 'Actions rapides', 'dashboard.activeProjects': 'Projets actifs',
  'projects.title': 'Projets', 'projects.create': 'Nouveau projet', 'projects.search': 'Rechercher des projets...', 'docs.title': 'Documents', 'docs.create': 'Nouveau document',
  'team.title': 'Équipe', 'ai.title': 'Assistant IA', 'common.loading': 'Chargement...', 'common.cancel': 'Annuler', 'common.delete': 'Supprimer', 'common.search': 'Rechercher',
  'topbar.search': 'Rechercher...', 'topbar.signOut': 'Déconnexion', 'topbar.collapse': 'Réduire',
}

const de: TranslationKeys = { ...en,
  'nav.dashboard': 'Dashboard', 'nav.projects': 'Projekte', 'nav.tasks': 'Aufgaben', 'nav.docs': 'Dokumente', 'nav.messages': 'Nachrichten', 'nav.ai': 'KI-Assistent', 'nav.team': 'Team', 'nav.settings': 'Einstellungen', 'nav.outreach': 'Outreach', 'nav.leads': 'Kontakte', 'nav.workflows': 'Workflows', 'nav.monitor': 'Live-Monitor',
  'settings.title': 'Einstellungen', 'settings.profile': 'Profil', 'settings.language': 'Sprache', 'settings.appearance': 'Erscheinungsbild', 'settings.light': 'Hell', 'settings.dark': 'Dunkel',
  'dashboard.welcome': 'Willkommen zurück', 'dashboard.recentActivity': 'Letzte Aktivität', 'dashboard.quickActions': 'Schnellaktionen', 'dashboard.activeProjects': 'Aktive Projekte',
  'projects.title': 'Projekte', 'projects.create': 'Neues Projekt', 'docs.title': 'Dokumente', 'docs.create': 'Neues Dokument',
  'team.title': 'Team', 'ai.title': 'KI-Assistent', 'common.loading': 'Laden...', 'common.cancel': 'Abbrechen', 'common.delete': 'Löschen', 'common.search': 'Suchen',
  'topbar.search': 'Suchen...', 'topbar.signOut': 'Abmelden', 'topbar.collapse': 'Einklappen',
}

const ja: TranslationKeys = { ...en,
  'nav.dashboard': 'ダッシュボード', 'nav.projects': 'プロジェクト', 'nav.tasks': 'タスク', 'nav.docs': 'ドキュメント', 'nav.messages': 'メッセージ', 'nav.ai': 'AIアシスタント', 'nav.team': 'チーム', 'nav.settings': '設定', 'nav.outreach': 'アウトリーチ', 'nav.leads': 'リード', 'nav.workflows': 'ワークフロー', 'nav.monitor': 'ライブモニター',
  'settings.title': '設定', 'settings.profile': 'プロフィール', 'settings.language': '言語', 'settings.appearance': '外観', 'settings.light': 'ライト', 'settings.dark': 'ダーク',
  'dashboard.welcome': 'おかえりなさい', 'dashboard.recentActivity': '最近のアクティビティ', 'dashboard.quickActions': 'クイックアクション', 'dashboard.activeProjects': 'アクティブプロジェクト',
  'projects.title': 'プロジェクト', 'projects.create': '新規プロジェクト', 'docs.title': 'ドキュメント', 'docs.create': '新規ドキュメント',
  'team.title': 'チーム', 'ai.title': 'AIアシスタント', 'common.loading': '読み込み中...', 'common.cancel': 'キャンセル', 'common.delete': '削除', 'common.search': '検索',
  'topbar.search': '検索...', 'topbar.signOut': 'サインアウト', 'topbar.collapse': '折りたたむ',
}

export const translations: Record<string, TranslationKeys> = {
  en, hi, es, fr, de, ja,
  pt: { ...es, 'nav.dashboard': 'Painel', 'settings.title': 'Configurações', 'settings.language': 'Idioma', 'dashboard.welcome': 'Bem-vindo de volta' },
  zh: { ...en, 'nav.dashboard': '仪表板', 'nav.projects': '项目', 'nav.tasks': '任务', 'nav.docs': '文档', 'nav.messages': '消息', 'nav.ai': 'AI助手', 'nav.team': '团队', 'nav.settings': '设置', 'settings.title': '设置', 'settings.language': '语言', 'dashboard.welcome': '欢迎回来', 'common.loading': '加载中...', 'projects.title': '项目', 'docs.title': '文档', 'team.title': '团队', 'ai.title': 'AI助手', 'topbar.search': '搜索...' },
  ar: { ...en, 'nav.dashboard': 'لوحة القيادة', 'nav.projects': 'المشاريع', 'nav.tasks': 'المهام', 'nav.docs': 'المستندات', 'nav.messages': 'الرسائل', 'nav.settings': 'الإعدادات', 'settings.title': 'الإعدادات', 'settings.language': 'اللغة', 'dashboard.welcome': 'مرحباً بعودتك', 'common.loading': 'جار التحميل...' },
  ko: { ...en, 'nav.dashboard': '대시보드', 'nav.projects': '프로젝트', 'nav.tasks': '작업', 'nav.docs': '문서', 'nav.messages': '메시지', 'nav.ai': 'AI 어시스턴트', 'nav.settings': '설정', 'settings.title': '설정', 'settings.language': '언어', 'dashboard.welcome': '다시 오셨습니다', 'common.loading': '로딩 중...', 'projects.title': '프로젝트', 'docs.title': '문서', 'team.title': '팀', 'topbar.search': '검색...' },
}

export function t(key: keyof TranslationKeys, lang: string = 'en'): string {
  return translations[lang]?.[key] || translations.en[key] || key
}
