import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LanguageContext = createContext(null);

// All 22 official Indian scheduled languages + English as recognized in Eighth Schedule of the Constitution of India
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', script: '' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', script: 'हिन्दी' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', script: 'తెలుగు' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', script: 'தமிழ்' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', script: 'বাংলা' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', script: 'मराठी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', script: 'ગુજરાતી' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', script: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', script: 'മലയാളം' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', script: 'ਪੰਜਾਬੀ' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ', script: 'ଓଡ଼ିଆ' },
  { code: 'ur', label: 'Urdu', native: 'اردو', script: 'اردو' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া', script: 'অসমীয়া' },
  { code: 'sa', label: 'Sanskrit', native: 'संस्कृतम्', script: 'संस्कृत' },
  { code: 'ne', label: 'Nepali', native: 'नेपाली', script: 'नेपाली' },
  { code: 'mai', label: 'Maithili', native: 'मैथिली', script: 'मैथिली' },
  { code: 'sat', label: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ', script: 'संताली' },
  { code: 'ks', label: 'Kashmiri', native: 'کٲشُر', script: 'कश्मीरी' },
  { code: 'doi', label: 'Dogri', native: 'डोगरी', script: 'डोगरी' },
  { code: 'kok', label: 'Konkani', native: 'कोंकणी', script: 'कोंकणी' },
  { code: 'sd', label: 'Sindhi', native: 'سنڌي', script: 'सिन्धी' },
  { code: 'brx', label: 'Bodo', native: 'बड़ो', script: 'बड़ो' },
  { code: 'mni', label: 'Manipuri', native: 'মৈতৈলোন্', script: 'मईतई' },
];

const TRANSLATIONS = {
  en: {
    home: 'Home',
    fileComplaint: 'File a Complaint',
    trackStatus: 'Track Status',
    myComplaints: 'My Complaints',
    citizenCharter: 'Citizen Guide',
    help: 'Help & FAQs',
    officialLogin: 'Official Login',
    citizenLogin: 'Login / Sign Up',
    adminPortal: 'Admin Portal',
    officialPortal: 'Official Portal',
    citizenDashboard: 'Citizen Dashboard',
    signOut: 'Sign Out',
    textResize: 'Text Size',
    selectLanguage: 'Language',
    tollFree: 'Toll Free',
    
    adminNavOverview: 'Directorate Overview',
    adminNavComplaints: 'All Grievances',
    adminNavEmployees: 'Officer Directory',
    adminNavEmailRequests: 'Email Requests',
    adminNavAudit: 'Audit Trail',
    staffNavWorkspace: 'Officer Workspace',
    staffNavDeptComplaints: 'Department Grievances',
    staffNavEscalated: 'Escalated Cases',
    changePassword: 'Change Password (OTP)',
    requestEmailChange: 'Request Email Change',
    grievanceQueue: 'Grievance Queue',

    topGovLine: 'Government of India',
    topMinistryLine: 'Department of Administrative Reforms & Public Grievances',
    tickerNotice: 'Notice: Every complaint gets a unique reference ID. Department officers must upload photo proof of work before any issue is closed. Track progress anytime 24x7.',
    
    portalTitle: 'Public Grievance Redressal Portal',
    heroTag: 'Government of India Citizen Portal',
    heroDescription: 'Report problems in your area directly to government departments. Track your complaint step-by-step and verify the fix before it gets closed.',
    fileComplaintBtn: 'File a Complaint',
    trackStatusBtn: 'Track Status',
    howItWorksBtn: 'How It Works',
    quickTrackLabel: 'Check Complaint Status',
    quickTrackPlaceholder: 'Enter Complaint ID (e.g., JNS-2026-000001)',
    checkStatusBtn: 'Check Status',
    formatHint: 'Format: JNS-2026-XXXXXX',
    
    commit1Title: 'Direct Routing',
    commit1Desc: 'Complaints go straight to the local officer in charge without middlemen.',
    commit2Title: 'Fixed Time Limits',
    commit2Desc: 'Clear deadlines (24 to 72 hours) for inspection and repair.',
    commit3Title: 'Photo Proof Required',
    commit3Desc: 'Field teams must upload before-and-after photos of completed work.',
    commit4Title: 'You Confirm the Fix',
    commit4Desc: 'No complaint can be closed until you review and approve the result.',
    
    helplinesTitle: '24x7 Emergency & Grievance Helplines',
    railHelpline: 'Railway Helpline',
    cyberHelpline: 'Cyber Fraud Helpline',
    consumerHelpline: 'Consumer Helpline',
    emergencyHelpline: 'National Emergency',
    
    howItWorksTitle: 'How It Works',
    howItWorksDesc: 'A simple 4-step process from reporting a problem to getting it fixed.',
    step1Title: '1. Report the Problem',
    step1Desc: 'Describe what happened. Add photos, an audio note, or your location.',
    step2Title: '2. Sent to the Right Office',
    step2Desc: 'We route your complaint straight to the responsible local office.',
    step3Title: '3. Field Team Fixes It',
    step3Desc: 'The field crew carries out the repair and uploads photos as proof.',
    step4Title: '4. You Check & Sign Off',
    step4Desc: 'You inspect the proof photos. If satisfied, close it. If not, reopen it.',
    
    departmentsTitle: 'Departments You Can Complain To',
    departmentsDesc: 'Select a department below to file a specific complaint.',
    deptRailway: 'Indian Railways',
    deptRailwayDesc: 'Cleanliness, coach issues, stations, tracks, and ticketing.',
    deptMuni: 'Municipal Corporation',
    deptMuniDesc: 'Garbage collection, street cleaning, open drains, and parks.',
    deptWater: 'Water Supply & Drainage',
    deptWaterDesc: 'Broken water pipes, contaminated water, and sewer blockage.',
    deptRoads: 'Roads & Bridges (PWD)',
    deptRoadsDesc: 'Potholes, broken footpaths, road cave-ins, and street damage.',
    deptPower: 'Electricity & Power',
    deptPowerDesc: 'Power cuts, dangerous fallen wires, transformer faults, streetlights.',
    deptHealth: 'Public Health & Sanitation',
    deptHealthDesc: 'Mosquito breeding, hospital hygiene, bio-waste, food safety.',
    slaLabel: 'Resolution Time',
    fileHere: 'File Complaint',
    guaranteeTag: 'Citizen Guarantee',
    guaranteeTitle: 'No Complaint is Closed Without Your Sign-Off',
    guaranteeDesc: 'Government officers cannot close a ticket on their own. You inspect the before/after photos and confirm the issue is fixed.',
    guaranteeBtn: 'File a Complaint',
    guaranteeLearnMore: 'How JanSahayata Protects You',
  },
  
  hi: {
    home: 'होम',
    fileComplaint: 'शिकायत दर्ज करें',
    trackStatus: 'स्थिति जांचें',
    myComplaints: 'मेरी शिकायतें',
    citizenCharter: 'नागरिक मार्गदर्शिका',
    help: 'सहायता एवं सामान्य प्रश्न',
    officialLogin: 'अधिकारी लॉगिन',
    citizenLogin: 'लॉगिन / साइन अप',
    adminPortal: 'प्रशासन पोर्टल',
    officialPortal: 'अधिकारी पोर्टल',
    citizenDashboard: 'नागरिक डैशबोर्ड',
    signOut: 'लॉग आउट',
    textResize: 'अक्षर आकार',
    selectLanguage: 'भाषा',
    tollFree: 'टोल फ्री',
    
    adminNavOverview: 'निदेशालय अवलोकन',
    adminNavComplaints: 'सभी शिकायतें',
    adminNavEmployees: 'अधिकारी निर्देशिका',
    adminNavEmailRequests: 'ईमेल अनुरोध',
    adminNavAudit: 'ऑडिट ट्रेल',
    staffNavWorkspace: 'कार्यक्षेत्र',
    staffNavDeptComplaints: 'विभागीय शिकायतें',
    staffNavEscalated: 'अग्रेषित मामले',
    changePassword: 'पासवर्ड बदलें (OTP)',
    requestEmailChange: 'ईमेल परिवर्तन अनुरोध',
    grievanceQueue: 'शिकायत कतार',

    topGovLine: 'भारत सरकार',
    topMinistryLine: 'प्रशासनिक सुधार और लोक शिकायत विभाग',
    tickerNotice: 'सूचना: प्रत्येक शिकायत को विशिष्ट पहचान संख्या (ID) मिलती है। काम पूरा होने पर फोटो प्रमाण अपलोड करना अनिवार्य है। 24x7 कभी भी प्रगति जांचें।',
    
    portalTitle: 'केंद्रीय लोक शिकायत निवारण पोर्टल',
    heroTag: 'भारत सरकार नागरिक सेवा पोर्टल',
    heroDescription: 'अपने क्षेत्र की जनसमस्याएं सीधे सरकारी विभागों तक पहुंचाएं। चरण-दर-चरण निगरानी करें और समाधान की पुष्टि करें।',
    fileComplaintBtn: 'शिकायत दर्ज करें',
    trackStatusBtn: 'स्थिति ट्रैक करें',
    howItWorksBtn: 'कार्यप्रणाली',
    quickTrackLabel: 'शिकायत स्थिति जांचें',
    quickTrackPlaceholder: 'शिकायत संख्या दर्ज करें (उदा. JNS-2026-000001)',
    checkStatusBtn: 'स्थिति देखें',
    formatHint: 'प्रारूप: JNS-2026-XXXXXX',
    
    commit1Title: 'सीधा आवंटन',
    commit1Desc: 'शिकायत बिना किसी बिचौलिए के सीधे संबंधित स्थानीय अधिकारी तक पहुंचती है।',
    commit2Title: 'निश्चित समय सीमा',
    commit2Desc: 'जांच और मरम्मत के लिए 24 से 72 घंटे की स्पष्ट समय सीमा।',
    commit3Title: 'फोटो प्रमाण अनिवार्य',
    commit3Desc: 'फील्ड कर्मचारियों को काम पूरा होने के पहले और बाद की तस्वीरें अपलोड करनी होंगी।',
    commit4Title: 'नागरिक अनुमोदन',
    commit4Desc: 'आपकी संतुष्टि और समीक्षा के बिना कोई भी शिकायत बंद नहीं की जा सकती।',
    
    helplinesTitle: '24x7 आपातकालीन एवं शिकायत हेल्पलाइन',
    railHelpline: 'रेलवे हेल्पलाइन',
    cyberHelpline: 'साइबर अपराध हेल्पलाइन',
    consumerHelpline: 'उपभोक्ता हेल्पलाइन',
    emergencyHelpline: 'राष्ट्रीय आपातकालीन सेवा',
    
    howItWorksTitle: 'यह कैसे काम करता है',
    howItWorksDesc: 'शिकायत दर्ज करने से लेकर निवारण तक की सरल 4-चरणीय प्रक्रिया।',
    step1Title: '1. समस्या बताएं',
    step1Desc: 'समस्या का विवरण दें। फोटो, ऑडियो नोट या स्थान की जानकारी जोड़ें।',
    step2Title: '2. सही विभाग को प्रेषित',
    step2Desc: 'आपकी शिकायत तुरंत जिम्मेदार स्थानीय कार्यालय को भेजी जाती है।',
    step3Title: '3. फील्ड टीम द्वारा समाधान',
    step3Desc: 'कर्मचारी मौके पर मरम्मत करते हैं और फोटो प्रमाण अपलोड करते हैं।',
    step4Title: '4. आपकी संतुष्टि व क्लोजर',
    step4Desc: 'प्रमाण देखकर संतुष्ट होने पर ही शिकायत बंद करें, अन्यथा पुनः खोलें।',
    
    departmentsTitle: 'संबद्ध सरकारी विभाग',
    departmentsDesc: 'शिकायत दर्ज करने के लिए नीचे दिए गए विभाग का चयन करें।',
    deptRailway: 'भारतीय रेल',
    deptRailwayDesc: 'स्वच्छता, बोगी की समस्याएं, रेलवे स्टेशन, ट्रैक और टिकट।',
    deptMuni: 'नगर निगम',
    deptMuniDesc: 'कचरा उठाव, सड़क सफाई, खुली नालियां, स्ट्रीट लाइट और पार्क।',
    deptWater: 'जल आपूर्ति एवं सीवरेज',
    deptWaterDesc: 'पानी की पाइपलाइन टूटना, गंदा पानी और सीवर रुकावट।',
    deptRoads: 'सड़क एवं पुल (लोक निर्माण)',
    deptRoadsDesc: 'गड्ढे, टूटे फुटपाथ, धंसी हुई सड़क और बुनियादी ढांचा।',
    deptPower: 'विद्युत वितरण',
    deptPowerDesc: 'बिजली कटौती, गिरे हुए तार, ट्रांसफार्मर खराबी, वोल्टेज समस्या।',
    deptHealth: 'सार्वजनिक स्वास्थ्य एवं स्वच्छता',
    deptHealthDesc: 'मच्छर प्रकोप, अस्पताल स्वच्छता, बायो-वेस्ट, खाद्य सुरक्षा।',
    slaLabel: 'समाधान समय',
    fileHere: 'शिकायत करें',
    guaranteeTag: 'नागरिक अधिकार गारंटी',
    guaranteeTitle: 'आपकी अनुमति के बिना कोई शिकायत बंद नहीं होगी',
    guaranteeDesc: 'अधिकारी स्वयं शिकायत बंद नहीं कर सकते। कार्य पूरा होने के फोटो देखकर आपकी सहमति आवश्यक है।',
    guaranteeBtn: 'शिकायत दर्ज करें',
    guaranteeLearnMore: 'नागरिक अधिकार चार्टर पढ़ें',
  },

  te: {
    home: 'హోమ్',
    fileComplaint: 'ఫిర్యాదు నమోదు చేయండి',
    trackStatus: 'స్థితిని తనిఖీ చేయండి',
    myComplaints: 'నా ఫిర్యాదులు',
    citizenCharter: 'పౌర మార్గదర్శి',
    help: 'సహాయం & తరచుగా అడిగే ప్రశ్నలు',
    officialLogin: 'అధికారుల లాగిన్',
    citizenLogin: 'లాగిన్ / సైన్ అప్',
    adminPortal: 'అడ్మిన్ పోర్టల్',
    officialPortal: 'అధికారిక పోర్టల్',
    citizenDashboard: 'సిటిజన్ డాష్‌బోర్డ్',
    signOut: 'లాగ్ అవుట్',
    textResize: 'అక్షర పరిమాణం',
    selectLanguage: 'భాష',
    tollFree: 'టోల్ ఫ్రీ',
    
    adminNavOverview: 'డైరెక్టరేట్ అవలోకనం',
    adminNavComplaints: 'అన్ని ఫిర్యాదులు',
    adminNavEmployees: 'అధికారుల డైరెక్టరీ',
    adminNavEmailRequests: 'ఇమెయిల్ అభ్యర్థనలు',
    adminNavAudit: 'ఆడిట్ లాగ్',
    staffNavWorkspace: 'కార్యాలయం',
    staffNavDeptComplaints: 'విభాగం ఫిర్యాదులు',
    staffNavEscalated: 'తీవ్రమైన కేసులు',
    changePassword: 'పాస్‌వర్డ్ మార్చండి (OTP)',
    requestEmailChange: 'ఇమెయిల్ మార్పు అభ్యర్థన',
    grievanceQueue: 'ఫిర్యాదుల వరుస',

    topGovLine: 'భారత ప్రభుత్వం',
    topMinistryLine: 'పరిపాలనా సంస్కరణలు మరియు ప్రజా ఫిర్యాదుల శాఖ',
    tickerNotice: 'గమనిక: ప్రతి ఫిర్యాదుకు ప్రత్యేక ID ఇవ్వబడుతుంది. పని పూర్తయిన తర్వాత అధికారులు ఫోటో రుజువు అప్‌లోడ్ చేయాల్సి ఉంటుంది. 24x7 స్థితిని తనిఖీ చేయండి.',
    
    portalTitle: 'కేంద్ర ప్రజా ఫిర్యాదుల పరిష్కార పోర్టల్',
    heroTag: 'భారత ప్రభుత్వం పౌర పోర్టల్',
    heroDescription: 'మీ ప్రాంతంలోని ప్రజా సమస్యలను నేరుగా సంబంధిత ప్రభుత్వ శాఖలకు నివేదించండి. సమస్య పరిష్కారాన్ని స్వయంగా ధృవీకరించుకోండి.',
    fileComplaintBtn: 'ఫిర్యాదు నమోదు చేయండి',
    trackStatusBtn: 'స్టేటస్ తెలుసుకోండి',
    howItWorksBtn: 'ఎలా పనిచేస్తుంది',
    quickTrackLabel: 'ఫిర్యాదు స్థితిని తనిఖీ చేయండి',
    quickTrackPlaceholder: 'ఫిర్యాదు సంఖ్య నమోదు చేయండి (ఉదా: JNS-2026-000001)',
    checkStatusBtn: 'స్థితి చూడండి',
    formatHint: 'ఫార్మాట్: JNS-2026-XXXXXX',
    
    commit1Title: 'ప్రత్యక్ష మార్గం',
    commit1Desc: 'మధ్యవర్తులు లేకుండా ఫిర్యాదు నేరుగా సంబంధిత అధికారికి చేరుతుంది.',
    commit2Title: 'నిర్దిష్ట కాలపరిమితి',
    commit2Desc: 'పరిష్కారం కోసం 24 నుండి 72 గంటల స్పష్టమైన గడువు.',
    commit3Title: 'ఫోటో రుజువు తప్పనిసరి',
    commit3Desc: 'పని పూర్తయిన తర్వాత అధికారులు ముందు, వెనుక ఫోటోలను అప్‌లోడ్ చేయాలి.',
    commit4Title: 'మీరే నిర్ధారించండి',
    commit4Desc: 'మీరు పనిని పరిశీలించి ఆమోదించే వరకు ఫిర్యాదు ముగియదు.',
    
    helplinesTitle: '24x7 అత్యవసర & సహాయ హెల్ప్‌లైన్‌లు',
    railHelpline: 'రైల్వే హెల్ప్‌లైన్',
    cyberHelpline: 'సైబర్ మోసాల హెల్ప్‌లైన్',
    consumerHelpline: 'వినియోగదారుల హెల్ప్‌లైన్',
    emergencyHelpline: 'జాతీయ అత్యవసర సేవ',
    
    howItWorksTitle: 'ఇది ఎలా పనిచేస్తుంది',
    howItWorksDesc: 'సమస్యను నివేదించడం నుండి పరిష్కారం వరకు సులభమైన 4 దశలు.',
    step1Title: '1. సమస్యను తెలపండి',
    step1Desc: 'వివరాలు రాయండి. ఫోటోలు, ఆడియో సందేశం లేదా లొకేషన్ జోడించండి.',
    step2Title: '2. సరైన అధికారికి బదిలీ',
    step2Desc: 'ఫిర్యాదు నేరుగా బాధ్యతాయుతమైన ప్రాంతీయ అధికారికి చేరుతుంది.',
    step3Title: '3. సిబ్బంది పరిష్కారం',
    step3Desc: 'క్షేత్రస్థాయి సిబ్బంది మరమ్మతులు చేసి ఫోటో ఆధారాలు అప్‌లోడ్ చేస్తారు.',
    step4Title: '4. మీ ఆమోదం',
    step4Desc: 'ఫోటోలు చూసి మీరు సంతృప్తి చెందిన తర్వాతే ఫిర్యాదు ముగుస్తుంది.',
    
    departmentsTitle: 'ఫిర్యాదు చేయగల విభాగాలు',
    departmentsDesc: 'కింది విభాగాలలో మీ సమస్యకు తగిన దానిని ఎంచుకోండి.',
    deptRailway: 'భారతీయ రైల్వే',
    deptRailwayDesc: 'పరిశుభ్రత, బోగీ సమస్యలు, స్టేషన్లు, ట్రాక్‌లు, టికెటింగ్.',
    deptMuni: 'మున్సిపల్ కార్పొరేషన్',
    deptMuniDesc: 'చెత్త సేకరణ, రోడ్ల శుభ్రత, డ్రైనేజీ సమస్యలు, పార్కులు.',
    deptWater: 'నీటి సరఫరా మరియు డ్రైనేజీ',
    deptWaterDesc: 'పైపుల లీకేజీ, కలుషిత నీరు, డ్రైనేజీ బ్లాక్‌లు.',
    deptRoads: 'రోడ్లు మరియు వంతెనలు (PWD)',
    deptRoadsDesc: 'గుంతలు, దెబ్బతిన్న ఫుట్‌పాత్‌లు, రహదారి సమస్యలు.',
    deptPower: 'విద్యుత్ సరఫరా',
    deptPowerDesc: 'విద్యుత్ కోతలు, ప్రమాదకర తీగలు, ట్రాన్స్‌ఫార్మర్ లోపాలు, వీధి దీపాలు.',
    deptHealth: 'ప్రజారోగ్యం మరియు పారిశుధ్యం',
    deptHealthDesc: 'దోమల నివారణ, ఆసుపత్రి పరిశుభ్రత, ఆహార నాణ్యత.',
    slaLabel: 'పరిష్కార గడువు',
    fileHere: 'ఫిర్యాదు చేయండి',
    guaranteeTag: 'పౌర హక్కు హామీ',
    guaranteeTitle: 'మీ అనుమతి లేకుండా ఏ ఫిర్యాదు ముగియదు',
    guaranteeDesc: 'అధికారులు స్వతహాగా ఫిర్యాదును ముగించలేరు. ఫోటో సాక్ష్యాలు చూసి మీరే ఆమోదించాలి.',
    guaranteeBtn: 'ఫిర్యాదు నమోదు చేయండి',
    guaranteeLearnMore: 'పూర్తి వివరాలు చదవండి',
  },

  ta: {
    home: 'முகப்பு',
    fileComplaint: 'புகார் பதிவு செய்க',
    trackStatus: 'நிலையை அறிய',
    myComplaints: 'எனது புகார்கள்',
    citizenCharter: 'குடிமக்கள் கையேடு',
    help: 'உதவி & அடிக்கடி கேட்கப்படும் கேள்விகள்',
    officialLogin: 'அதிகாரிகள் உள்நுழைவு',
    citizenLogin: 'உள்நுழைவு / பதிவு',
    adminPortal: 'நிர்வாக போர்டல்',
    officialPortal: 'அதிகாரிகள் போர்டல்',
    citizenDashboard: 'குடிமக்கள் முகப்பு',
    signOut: 'வெளியேறு',
    textResize: 'எழுத்து அளவு',
    selectLanguage: 'மொழி',
    tollFree: 'இலவச அழைப்பு',
    
    adminNavOverview: 'இயக்குநரக மேலோட்டம்',
    adminNavComplaints: 'அனைத்து புகார்கள்',
    adminNavEmployees: 'அதிகாரிகள் அடைவு',
    adminNavEmailRequests: 'மின்னஞ்சல் கோரிக்கைகள்',
    adminNavAudit: 'தணிக்கை பதிவு',
    staffNavWorkspace: 'பணியிடம்',
    staffNavDeptComplaints: 'துறை புகார்கள்',
    staffNavEscalated: 'தீவிர வழக்குகள்',
    changePassword: 'கடவுச்சொல் மாற்று (OTP)',
    requestEmailChange: 'மின்னஞ்சல் மாற்ற கோரிக்கை',
    grievanceQueue: 'புகார் வரிசை',

    topGovLine: 'இந்திய அரசு',
    topMinistryLine: 'நிர்வாக சீர்திருத்தங்கள் மற்றும் பொதுக் குறைகள் துறை',
    tickerNotice: 'அறிவிப்பு: ஒவ்வொரு புகாருக்கும் பிரத்யேக அடையாள எண் வழங்கப்படும். பணி முடிந்தவுடன் அதிகாரிகள் புகைப்பட ஆதாரத்தை பதிவேற்ற வேண்டும்.',
    
    portalTitle: 'மத்திய பொதுக் குறை தீர்க்கும் போர்டல்',
    heroTag: 'இந்திய அரசு குடிமக்கள் சேவை போர்டல்',
    heroDescription: 'உங்கள் பகுதி பொதுப் பிரச்சினைகளை அரசுத் துறைகளுக்கு நேரடியாகத் தெரியப்படுத்துங்கள். தீர்வினை நீங்களே உறுதி செய்யுங்கள்.',
    fileComplaintBtn: 'புகார் பதிவு செய்க',
    trackStatusBtn: 'நிலையை அறிய',
    howItWorksBtn: 'செயல்முறை',
    quickTrackLabel: 'புகார் நிலையை சரிபார்க்க',
    quickTrackPlaceholder: 'புகார் எண்ணை உள்ளிடவும் (எ.கா. JNS-2026-000001)',
    checkStatusBtn: 'நிலையை காண்க',
    formatHint: 'வடிவம்: JNS-2026-XXXXXX',
    
    commit1Title: 'நேரடி ஒதுக்கீடு',
    commit1Desc: 'இடைத்தரகர்கள் இன்றி புகார் நேரடியாக சம்பந்தப்பட்ட அதிகாரியை அடைகிறது.',
    commit2Title: 'குறிப்பிட்ட காலக்கெடு',
    commit2Desc: '24 முதல் 72 மணி நேரத்திற்குள் ஆய்வு மற்றும் பழுதுபார்க்கும் காலக்கெடு.',
    commit3Title: 'புகைப்பட ஆதாரம் கட்டாயம்',
    commit3Desc: 'பணி முடிந்த புகைப்படங்களை களக் குழுவினர் கட்டாயம் பதிவேற்ற வேண்டும்.',
    commit4Title: 'குடிமக்கள் ஒப்புதல்',
    commit4Desc: 'நீங்கள் சரிபார்த்து ஒப்புதல் அளிக்கும் வரை புகார் மூடப்படாது.',
    
    helplinesTitle: '24x7 அவசர மற்றும் குறை தீர்க்கும் உதவி எண்கள்',
    railHelpline: 'ரயில்வே உதவி எண்',
    cyberHelpline: 'சைபர் கிரைம் உதவி எண்',
    consumerHelpline: 'நுகர்வோர் உதவி எண்',
    emergencyHelpline: 'தேசிய அவசர சேவை',
    
    howItWorksTitle: 'இது எவ்வாறு செயல்படுகிறது',
    howItWorksDesc: 'புகார் அளிப்பது முதல் தீர்வு காண்பது வரையிலான எளிய 4 படிகள்.',
    step1Title: '1. பிரச்சனை குறித்து விவரிக்கவும்',
    step1Desc: 'விவரங்களை உள்ளிடவும். புகைப்படங்கள் அல்லது இருப்பிடத்தைச் சேர்க்கவும்.',
    step2Title: '2. துறைக்கு அனுப்புதல்',
    step2Desc: 'புகார் உடனடியாக சம்பந்தப்பட்ட உள்ளூர் அலுவலகத்திற்கு அனுப்பப்படுகிறது.',
    step3Title: '3. களப்பணி & தீர்வு',
    step3Desc: 'பணியாளர்கள் பழுதுபார்த்து புகைப்பட ஆதாரங்களைப் பதிவேற்றுகின்றனர்.',
    step4Title: '4. நீங்கள் சரிபார்த்து முடித்தல்',
    step4Desc: 'புகைப்படங்களை பார்த்து திருப்தி அடைந்தால் மட்டுமே புகாரை மூடலாம்.',
    
    departmentsTitle: 'அரசு துறைகள்',
    departmentsDesc: 'புகார் பதிவு செய்ய வேண்டிய துறையை தேர்வு செய்யவும்.',
    deptRailway: 'இந்திய ரயில்வே',
    deptRailwayDesc: 'தூய்மை, பெட்டி பராமரிப்பு, நிலையங்கள், தண்டவாளங்கள்.',
    deptMuni: 'மாநகராட்சி',
    deptMuniDesc: 'குப்பை அகற்றுதல், சாலை தூய்மை, சாக்கடை மற்றும் பூங்காக்கள்.',
    deptWater: 'குடிநீர் மற்றும் கழிவுநீர் வடிகால்',
    deptWaterDesc: 'குழாய் உடைப்பு, அசுத்தமான குடிநீர், கழிவுநீர் அடைப்பு.',
    deptRoads: 'சாலைகள் மற்றும் பாலங்கள் (PWD)',
    deptRoadsDesc: 'சாலை குழிகள், சேதமடைந்த நடைபாதைகள், சாலை பராமரிப்பு.',
    deptPower: 'மின்சார வாரியம்',
    deptPowerDesc: 'மின்தடை, அறுந்து விழுந்த கம்பிகள், டிரான்ஸ்பார்மர் கோளாறு.',
    deptHealth: 'பொது சுகாதாரம்',
    deptHealthDesc: 'கொசு ஒழிப்பு, மருத்துவமனை தூய்மை, உணவு பாதுகாப்பு.',
    slaLabel: 'தீர்வு காலம்',
    fileHere: 'புகார் செய்க',
    guaranteeTag: 'குடிமக்கள் உரிமை உத்தரவாதம்',
    guaranteeTitle: 'உங்கள் அனுமதியின்றி புகார் மூடப்படாது',
    guaranteeDesc: 'அதிகாரிகள் தானாக புகாரை மூட முடியாது. புகைப்பட ஆதாரங்களைப் பார்த்து நீங்கள் ஒப்புதல் அளிக்க வேண்டும்.',
    guaranteeBtn: 'புகார் பதிவு செய்க',
    guaranteeLearnMore: 'விவரங்களை படிக்கவும்',
  },

  bn: {
    home: 'হোম',
    fileComplaint: 'অভিযোগ দায়ের করুন',
    trackStatus: 'স্থিতি ট্র্যাক করুন',
    myComplaints: 'আমার অভিযোগ',
    citizenCharter: 'নাগরিক নির্দেশিকা',
    help: 'সহায়তা ও সাধারণ প্রশ্নাবলী',
    officialLogin: 'অফিসিয়াল লগইন',
    citizenLogin: 'লগইন / সাইন আপ',
    adminPortal: 'অ্যাডমিন পোর্টাল',
    officialPortal: 'অফিসিয়াল পোর্টাল',
    citizenDashboard: 'নাগরিক ড্যাশবোর্ড',
    signOut: 'লগ আউট',
    textResize: 'হরফের আকার',
    selectLanguage: 'ভাষা',
    tollFree: 'টোল ফ্রি',
    
    adminNavOverview: 'ডিরেক্টরেট ওভারভিউ',
    adminNavComplaints: 'সমস্ত অভিযোগ',
    adminNavEmployees: 'অফিসার ডিরেক্টরি',
    adminNavEmailRequests: 'ইমেল পরিবর্তন অনুরোধ',
    adminNavAudit: 'অডিট লগ',
    staffNavWorkspace: 'কর্মক্ষেত্র',
    staffNavDeptComplaints: 'বিভাগীয় অভিযোগ',
    staffNavEscalated: 'জরুরি কেস',
    changePassword: 'পাসওয়ার্ড পরিবর্তন (OTP)',
    requestEmailChange: 'ইমেল পরিবর্তনের অনুরোধ',
    grievanceQueue: 'অভিযোগের সারি',

    topGovLine: 'ভারত সরকার',
    topMinistryLine: 'প্রশাসনিক সংস্কার ও জনঅভিযোগ বিভাগ',
    tickerNotice: 'বিজ্ঞপ্তি: প্রতিটি অভিযোগ একটি নির্দিষ্ট আইডি পায়। কাজ সমাপ্তির ফটো প্রমাণ আপলোড বাধ্যতামূলক। ২৪x৭ অগ্রগতি পরীক্ষা করুন।',
    
    portalTitle: 'কেন্দ্রীয় জনঅভিযোগ নিষ্পত্তি পোর্টাল',
    heroTag: 'ভারত সরকার নাগরিক সেবা পোর্টাল',
    heroDescription: 'আপনার এলাকার সমস্যা সরাসরি সরকারি দফতরে জানান। ধাপে ধাপে অগ্রগতি দেখুন এবং সমাধানের সত্যতা যাচাই করুন।',
    fileComplaintBtn: 'অভিযোগ দায়ের করুন',
    trackStatusBtn: 'স্থিতি পরীক্ষা করুন',
    howItWorksBtn: 'পদ্ধতি জানুন',
    quickTrackLabel: 'অভিযোগের স্থিতি পরীক্ষা করুন',
    quickTrackPlaceholder: 'অভিযোগ আইডি লিখুন (যেমন: JNS-2026-000001)',
    checkStatusBtn: 'স্থিতি দেখুন',
    formatHint: 'ফরম্যাট: JNS-2026-XXXXXX',
    
    commit1Title: 'সরাসরি রউটিং',
    commit1Desc: 'মধ্যস্থতাকারী ছাড়া অভিযোগ সরাসরি সংশ্লিষ্ট স্থানীয় আধিকারিকের কাছে পৌঁছায়।',
    commit2Title: 'নির্দিষ্ট সময়সীমা',
    commit2Desc: 'পরিদর্শন ও মেরামতের জন্য ২৪ থেকে ৭২ ঘণ্টার পরিষ্কার সময়সীমা।',
    commit3Title: 'ছবির প্রমাণ বাধ্যতামূলক',
    commit3Desc: 'কাজ শেষের আগের ও পরের ছবি আপলোড করতে হবে।',
    commit4Title: 'নাগরিকের অনুমোদন',
    commit4Desc: 'আপনার যাচাই এবং অনুমোদন ছাড়া কোনো অভিযোগ বন্ধ করা যাবে না।',
    
    helplinesTitle: '২৪x৭ জরুরি ও অভিযোগ হেল্পলাইন',
    railHelpline: 'রেলওয়ে হেল্পলাইন',
    cyberHelpline: 'সাইবার ক্রাইম হেল্পলাইন',
    consumerHelpline: 'ভোক্তা সুরক্ষা হেল্পলাইন',
    emergencyHelpline: 'জাতীয় জরুরি পরিষেবা',
    
    howItWorksTitle: 'এটি কীভাবে কাজ করে',
    howItWorksDesc: 'অভিযোগ জানানো থেকে সমাধান পর্যন্ত সহজ ৪টি ধাপ।',
    step1Title: '১. সমস্যাটি জানান',
    step1Desc: 'বিবরণ লিখুন। ছবি, অডিও বার্তা বা লোকেশন যুক্ত করুন।',
    step2Title: '২. সঠিক দফতরে পাঠানো',
    step2Desc: 'অভিযোগ সরাসরি দায়িত্বশীল দফতরে পৌঁছে যায়।',
    step3Title: '৩. দল দ্বারা সমাধান',
    step3Desc: 'কর্মীরা মেরামত করে ছবির প্রমাণ আপলোড করেন।',
    step4Title: '৪. আপনার অনুমোদন ও সমাপ্তি',
    step4Desc: 'ছবি দেখে সন্তুষ্ট হলে তবেই অভিযোগ বন্ধ করুন।',
    
    departmentsTitle: 'সরকারি বিভাগসমূহ',
    departmentsDesc: 'অভিযোগ জানাতে নিচের বিভাগ নির্বাচন করুন।',
    deptRailway: 'ভারতীয় রেল',
    deptRailwayDesc: 'পরিচ্ছন্নতা, বগির সমস্যা, স্টেশন, ট্র্যাক ও টিকিট।',
    deptMuni: 'পৌর নিগম',
    deptMuniDesc: 'আবর্জনা পরিষ্কার, নিকাশি নালা, আলো ও পার্ক।',
    deptWater: 'জল সরবরাহ ও ড্রেনেজ',
    deptWaterDesc: 'ভাঙা পাইপলাইন, দূষিত জল ও নর্দমা অবরোধ।',
    deptRoads: 'পূর্ত দফতর (রাস্তা ও সেতু)',
    deptRoadsDesc: 'রাস্তার গর্ত, ভাঙা ফুটপাথ ও রাস্তার ক্ষয়ক্ষতি।',
    deptPower: 'বিদ্যুৎ সরবরাহ',
    deptPowerDesc: 'লোডশেডিং, বিপজ্জনক তার, ট্রান্সফরমার ত্রুটি ও পথবাতি।',
    deptHealth: 'জনস্বাস্থ্য ও পরিচ্ছন্নতা',
    deptHealthDesc: 'মশার উপদ্রব, হাসপাতাল স্বাস্থ্যবিধি ও খাদ্য নিরাপত্তা।',
    slaLabel: 'সমাধানের সময়',
    fileHere: 'অভিযোগ করুন',
    guaranteeTag: 'নাগরিক অধিকার গ্যারান্টি',
    guaranteeTitle: 'আপনার অনুমতি ছাড়া কোনো অভিযোগ বন্ধ হবে না',
    guaranteeDesc: 'কর্মকর্তারা নিজে থেকে বন্ধ করতে পারবেন না। ছবির প্রমাণ দেখে আপনার সন্তুষ্টি জরুরি।',
    guaranteeBtn: 'অভিযোগ দায়ের করুন',
    guaranteeLearnMore: 'নাগরিক সনদ পড়ুন',
  },

  mr: {
    home: 'मुख्यपृष्ठ',
    fileComplaint: 'तक्रार नोंदवा',
    trackStatus: 'स्थिती तपासा',
    myComplaints: 'माझ्या तक्रारी',
    citizenCharter: 'नागरिक मार्गदर्शिका',
    help: 'मदत व वारंवार विचारले जाणारे प्रश्न',
    officialLogin: 'अधिकारी लॉगिन',
    citizenLogin: 'लॉगिन / साइन अप',
    adminPortal: 'प्रशासन पोर्टल',
    officialPortal: 'अधिकारी पोर्टल',
    citizenDashboard: 'नागरिक डॅशबोर्ड',
    signOut: 'लॉग आउट',
    textResize: 'फॉन्ट आकार',
    selectLanguage: 'भाषा',
    tollFree: 'टोल फ्री',
    
    adminNavOverview: 'संचालनालय आढावा',
    adminNavComplaints: 'सर्व तक्रारी',
    adminNavEmployees: 'अधिकारी निर्देशिका',
    adminNavEmailRequests: 'ईमेल विनंत्या',
    adminNavAudit: 'ऑडिट ट्रेल',
    staffNavWorkspace: 'कार्यक्षेत्र',
    staffNavDeptComplaints: 'विभागीय तक्रारी',
    staffNavEscalated: 'गंभीर प्रकरणे',
    changePassword: 'पासवर्ड बदला (OTP)',
    requestEmailChange: 'ईमेल बदल विनंती',
    grievanceQueue: 'तक्रार रांग',

    topGovLine: 'भारत सरकार',
    topMinistryLine: 'प्रशासकीय सुधारणा आणि सार्वजनिक तक्रार निवारण विभाग',
    tickerNotice: 'सूचना: प्रत्येक तक्रारीला युनिक आयडी मिळतो. काम पूर्ण झाल्यावर फोटो पुरावा अपलोड करणे बंधनकारक आहे. २४x७ प्रगती तपासा.',
    
    portalTitle: 'सार्वजनिक तक्रार निवारण पोर्टल',
    heroTag: 'भारत सरकार नागरिक सेवा पोर्टल',
    heroDescription: 'तुमच्या परिसरातील समस्या थेट सरकारी विभागांकडे मांडा. कामाची प्रगती तपासा आणि खात्री झाल्यावरच तक्रार बंद करा.',
    fileComplaintBtn: 'तक्रार नोंदवा',
    trackStatusBtn: 'स्थिती तपासा',
    howItWorksBtn: 'कार्यपद्धती',
    quickTrackLabel: 'तक्रार स्थिती तपासा',
    quickTrackPlaceholder: 'तक्रार क्रमांक टाका (उदा. JNS-2026-000001)',
    checkStatusBtn: 'तपासा',
    formatHint: 'स्वरूप: JNS-2026-XXXXXX',
    
    commit1Title: 'थेट वाटप',
    commit1Desc: 'मध्यस्थांशिवाय तक्रार थेट संबंधित स्थानिक अधिकाऱ्याकडे जाते.',
    commit2Title: 'निश्चित कालमर्यादा',
    commit2Desc: 'तपासणी आणि दुरुस्तीसाठी २४ ते ७२ तासांची निश्चित मुदत.',
    commit3Title: 'फोटो पुरावा अनिवार्य',
    commit3Desc: 'काम पूर्ण झाल्यानंतर आधीचे व नंतरचे फोटो अपलोड करणे आवश्यक.',
    commit4Title: 'नागरिकांची मंजुरी',
    commit4Desc: 'आपल्या समाधानाशिवाय आणि मंजुरीशिवाय तक्रार बंद केली जात नाही.',
    
    helplinesTitle: '२४x७ आपत्कालीन व तक्रार हेल्पलाइन',
    railHelpline: 'रेल्वे हेल्पलाइन',
    cyberHelpline: 'सायबर फसवणूक हेल्पलाइन',
    consumerHelpline: 'ग्राहक हेल्पलाइन',
    emergencyHelpline: 'राष्ट्रीय आपत्कालीन सेवा',
    
    howItWorksTitle: 'हे कसे कार्य करते',
    howItWorksDesc: 'तक्रार नोंदवण्यापासून निवारणापर्यंतची सोपी ४ पायऱ्यांची प्रक्रिया.',
    step1Title: '१. समस्या मांडा',
    step1Desc: 'तपशील लिहा. फोटो किंवा ऑडिओ संदेश जोडा.',
    step2Title: '२. योग्य कार्यालयाकडे पाठवणे',
    step2Desc: 'तक्रार थेट संबंधित स्थानिक कार्यालयात पाठवली जाते.',
    step3Title: '३. कर्मचाऱ्यांमार्फत दुरुस्ती',
    step3Desc: 'कर्मचारी काम पूर्ण करून फोटो पुरावे अपलोड करतात.',
    step4Title: '४. आपली खात्री व मान्यता',
    step4Desc: 'फोटो पाहून समाधान झाल्यावरच तक्रार बंद करा.',
    
    departmentsTitle: 'सरकारी विभाग',
    departmentsDesc: 'तक्रार नोंदवण्यासाठी खालील विभाग निवडा.',
    deptRailway: 'भारतीय रेल्वे',
    deptRailwayDesc: 'स्वच्छता, डब्यांच्या समस्या, स्थानके व तिकीट.',
    deptMuni: 'महानगरपालिका',
    deptMuniDesc: 'कचरा उचल, रस्ते स्वच्छता, उघडी गटारे व उद्याने.',
    deptWater: 'पाणीपुरवठा आणि सांडपाणी',
    deptWaterDesc: 'जलवाहिनी गळती, दूषित पाणी व तुंबलेली गटारे.',
    deptRoads: 'रस्ते व पूल (सार्वजनिक बांधकाम)',
    deptRoadsDesc: 'खड्डे, तुटलेले पदपथ व खराब रस्ते.',
    deptPower: 'महावितरण (वीज)',
    deptPowerDesc: 'खंडित वीज, तुटलेल्या तारा, ट्रान्सफॉर्मर बिघाड व दिवे.',
    deptHealth: 'सार्वजनिक आरोग्य व स्वच्छता',
    deptHealthDesc: 'डास प्रतिबंध, रुग्णालय स्वच्छता व अन्न सुरक्षा.',
    slaLabel: 'निवारण मुदत',
    fileHere: 'तक्रार करा',
    guaranteeTag: 'नागरिक हक्क हमी',
    guaranteeTitle: 'आपल्या संमतीशिवाय कोणतीही तक्रार बंद होणार नाही',
    guaranteeDesc: 'अधिकारी परस्पर तक्रार बंद करू शकत नाहीत. कामाचा फोटो पाहून आपली मान्यता आवश्यक आहे.',
    guaranteeBtn: 'तक्रार नोंदवा',
    guaranteeLearnMore: 'नागरिक सनद वाचा',
  },

  gu: {
    home: 'હોમ',
    fileComplaint: 'ફરિયાદ નોંધાવો',
    trackStatus: 'સ્થિતિ તપાસો',
    myComplaints: 'મારી ફરિયાદો',
    citizenCharter: 'નાગરિક માર્ગદર્શિકા',
    help: 'સહાય અને પ્રશ્નોત્તરી',
    officialLogin: 'અધિકારી લૉગિન',
    citizenLogin: 'લૉગિન / સાઇન અપ',
    adminPortal: 'એડમિન પોર્ટલ',
    officialPortal: 'સત્તાવાર પોર્ટલ',
    citizenDashboard: 'નાગરિક ડેશબોર્ડ',
    signOut: 'લૉગ આઉટ',
    textResize: 'અક્ષરનું કદ',
    selectLanguage: 'ભાષા',
    tollFree: 'ટોલ ફ્રી',
    
    adminNavOverview: 'ડિરેક્ટોરેટ ઝાંખી',
    adminNavComplaints: 'તમામ ફરિયાદો',
    adminNavEmployees: 'અધિકારી ડિરેક્ટરી',
    adminNavEmailRequests: 'ઇમેઇલ વિનંતીઓ',
    adminNavAudit: 'ઑડિટ ટ્રેઇલ',
    staffNavWorkspace: 'કાર્યક્ષેત્ર',
    staffNavDeptComplaints: 'વિભાગીય ફરિયાદો',
    staffNavEscalated: 'તાકીદના કેસ',
    changePassword: 'પાસવર્ડ બદલો (OTP)',
    requestEmailChange: 'ઇમેઇલ ફેરફાર વિનંતી',
    grievanceQueue: 'ફરિયાદ કતાર',

    topGovLine: 'ભારત સરકાર',
    topMinistryLine: 'વહીવટી સુધારણા અને જાહેર ફરિયાદ નિવારણ વિભાગ',
    tickerNotice: 'સૂચના: દરેક ફરિયાદને વિશિષ્ટ ID મળે છે. કામ પૂર્ણ થવા પર ફોટો પુરાવો અપલોડ કરવો ફરજિયાત છે. ૨૪x૭ પ્રગતિ તપાસો.',
    
    portalTitle: 'કેન્દ્રીય જાહેર ફરિયાદ નિવારણ પોર્ટલ',
    heroTag: 'ભારત સરકાર નાગરિક સેવા પોર્ટલ',
    heroDescription: 'તમારા વિસ્તારની સમસ્યાઓ સીધી સરકારી વિભાગો સુધી પહોંચાડો. તબક્કાવાર સ્થિતિ ચકાસો અને સંતોષ થાય પછી જ બંધ કરો.',
    fileComplaintBtn: 'ફરિયાદ નોંધાવો',
    trackStatusBtn: 'સ્થિતિ તપાસો',
    howItWorksBtn: 'કાર્યપદ્ધતિ',
    quickTrackLabel: 'ફરિયાદ સ્થિતિ તપાસો',
    quickTrackPlaceholder: 'ફરિયાદ નંબર દાખલ કરો (દા.ત. JNS-2026-000001)',
    checkStatusBtn: 'તપાસો',
    formatHint: 'ફોર્મેટ: JNS-2026-XXXXXX',
    
    commit1Title: 'સીધું વિતરણ',
    commit1Desc: 'વચેટીયા વગર ફરિયાદ સીધી સંબંધિત સ્થાનિક અધિકારી સુધી પહોંચે છે.',
    commit2Title: 'નિશ્ચિત સમયમર્યાદા',
    commit2Desc: 'તપાસ અને સમારકામ માટે ૨૪ થી ૭૨ કલાકની સ્પષ્ટ સમયમર્યાદા.',
    commit3Title: 'ફોટો પુરાવો ફરજિયાત',
    commit3Desc: 'ટીમ દ્વારા સમારકામ પહેલાં અને પછીના ફોટા અપલોડ કરવા જરૂરી.',
    commit4Title: 'નાગરિક મંજૂરી',
    commit4Desc: 'તમારા સંતોષ અને મંજૂરી વિના કોઈ ફરિયાદ બંધ થઈ શકતી નથી.',
    
    helplinesTitle: '૨૪x૭ કટોકટી અને ફરિયાદ હેલ્પલાઇન',
    railHelpline: 'રેલવે હેલ્પલાઇન',
    cyberHelpline: 'સાયબર ક્રાઇમ હેલ્પલાઇન',
    consumerHelpline: 'ગ્રાહક સુરક્ષા હેલ્પલાઇન',
    emergencyHelpline: 'રાષ્ટ્રીય કટોકટી સેવા',
    
    howItWorksTitle: 'આ કેવી રીતે કાર્ય કરે છે',
    howItWorksDesc: 'સમસ્યા નોંધાવવાથી લઈને ઉકેલ સુધીની સરળ ૪ તબક્કાની પ્રક્રિયા.',
    step1Title: '૧. સમસ્યા જણાવો',
    step1Desc: 'વિગતો લખો. ફોટો, ઑડિયો અથવા લોકેશન ઉમેરો.',
    step2Title: '૨. યોગ્ય વિભાગને મોકલવું',
    step2Desc: 'ફરિયાદ સીધી સંબંધિત સ્થાનિક કચેરીને મોકલવામાં આવે છે.',
    step3Title: '૩. ટીમ દ્વારા સમારકામ',
    step3Desc: 'ટીમ સમારકામ પૂર્ણ કરીને ફોટો પુરાવા અપલોડ કરે છે.',
    step4Title: '૪. તમારી મંજૂરી અને પૂર્ણાહુતિ',
    step4Desc: 'ફોટા જોઈને સંતોષ થાય તો જ ફરિયાદ બંધ કરો.',
    
    departmentsTitle: 'સરકારી વિભાગો',
    departmentsDesc: 'ફરિયાદ નોંધાવવા માટે નીચે આપેલ વિભાગ પસંદ કરો.',
    deptRailway: 'ભારતીય રેલવે',
    deptRailwayDesc: 'સ્વચ્છતા, કોચ સમસ્યાઓ, સ્ટેશનો, પાટા અને ટિકિટિંગ.',
    deptMuni: 'મ્યુનિસિપલ કોર્પોરેશન',
    deptMuniDesc: 'કચરો ઉપાડવો, રસ્તા સફાઈ, ગટર અને બગીચાઓ.',
    deptWater: 'પાણી પુરવઠો અને ગટર વ્યવસ્થા',
    deptWaterDesc: 'પાઈપલાઈન લિકેજ, દૂષિત પાણી અને ગટર બ્લોકેજ.',
    deptRoads: 'માર્ગ અને મકાન વિભાગ (PWD)',
    deptRoadsDesc: 'ખાડા, તૂટેલા ફૂટપાથ અને ક્ષતિગ્રસ્ત રસ્તાઓ.',
    deptPower: 'વીજળી બોર્ડ (GEB)',
    deptPowerDesc: 'પાવર કટ, તૂટેલા વાયર, ટ્રાન્સફોર્મર ખામી અને સ્ટ્રીટ લાઈટ્સ.',
    deptHealth: 'જાહેર આરોગ્ય અને સ્વચ્છતા',
    deptHealthDesc: 'મચ્છર ઉપદ્રવ, હોસ્પિટલ સ્વચ્છતા અને ખાદ્ય સુરક્ષા.',
    slaLabel: 'ઉકેલ સમય',
    fileHere: 'ફરિયાદ કરો',
    guaranteeTag: 'નાગરિક અધિકાર બાંયધરી',
    guaranteeTitle: 'તમારી સંમતિ વગર કોઈ ફરિયાદ બંધ થશે નહીં',
    guaranteeDesc: 'અધિકારીઓ જાતે ફરિયાદ બંધ કરી શકતા નથી. પુરાવા જોઈને તમારી મંજૂરી અનિવાર્ય છે.',
    guaranteeBtn: 'ફરિયાદ નોંધાવો',
    guaranteeLearnMore: 'નાગરિક સનદ વાંચો',
  },

  kn: {
    home: 'ಮುಖಪುಟ',
    fileComplaint: 'ದೂರು ದಾಖಲಿಸಿ',
    trackStatus: 'ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ',
    myComplaints: 'ನನ್ನ ದೂರುಗಳು',
    citizenCharter: 'ನಾಗರಿಕ ಕೈಪಿಡಿ',
    help: 'ಸಹಾಯ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ',
    officialLogin: 'ಅಧಿಕಾರಿ ಲಾಗಿನ್',
    citizenLogin: 'ಲಾಗಿನ್ / ಸೈನ್ ಅಪ್',
    adminPortal: 'ಆಡಳಿತ ಪೋರ್ಟಲ್',
    officialPortal: 'ಅಧಿಕೃತ ಪೋರ್ಟಲ್',
    citizenDashboard: 'ನಾಗರಿಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    signOut: 'ಸೈನ್ ಔಟ್',
    textResize: 'ಅಕ್ಷರ ಗಾತ್ರ',
    selectLanguage: 'ಭಾಷೆ',
    tollFree: 'ಟೋಲ್ ಫ್ರೀ',
    
    adminNavOverview: 'ನಿರ್ದೇಶನಾಲಯ ಅವಲೋಕನ',
    adminNavComplaints: 'ಎಲ್ಲಾ ದೂರುಗಳು',
    adminNavEmployees: 'ಅಧಿಕಾರಿ ಡೈರೆಕ್ಟರಿ',
    adminNavEmailRequests: 'ಇಮೇಲ್ ಬದಲಾವಣೆ ಕೋರಿಕೆಗಳು',
    adminNavAudit: 'ಆಡಿಟ್ ವಿವರ',
    staffNavWorkspace: 'ಕಾರ್ಯಸ್ಥಳ',
    staffNavDeptComplaints: 'ಇಲಾಖಾ ದೂರುಗಳು',
    staffNavEscalated: 'ತುರ್ತು ಪ್ರಕರಣಗಳು',
    changePassword: 'ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸಿ (OTP)',
    requestEmailChange: 'ಇಮೇಲ್ ಬದಲಾವಣೆ ವಿನಂತಿ',
    grievanceQueue: 'ದೂರುಗಳ ಸಾಲು',

    topGovLine: 'ಭಾರತ ಸರ್ಕಾರ',
    topMinistryLine: 'ಆಡಳಿತ ಸುಧಾರಣೆಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆಗಳ ಇಲಾಖೆ',
    tickerNotice: 'ಸೂಚನೆ: ಪ್ರತಿಯೊಂದು ದೂರಿಗೆ ಪ್ರತ್ಯೇಕ ಐಡಿ ನೀಡಲಾಗುತ್ತದೆ. ಕೆಲಸ ಪೂರ್ಣಗೊಂಡ ನಂತರ ಅಧಿಕಾರಿಗಳು ಫೋಟೋ ಸಾಕ್ಷ್ಯ ಅಪ್‌ಲೋಡ್ ಮಾಡುವುದು ಕಡ್ಡಾಯ. ೨೪x೭ ಪರಿಶೀಲಿಸಿ.',
    
    portalTitle: 'ಕೇಂದ್ರ ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆ ಪರಿಹಾರ ಪೋರ್ಟಲ್',
    heroTag: 'ಭಾರತ ಸರ್ಕಾರ ನಾಗರಿಕ ಸೇವಾ ಪೋರ್ಟಲ್',
    heroDescription: 'ನಿಮ್ಮ ವ್ಯಾಪ್ತಿಯ ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳನ್ನು ನೇರವಾಗಿ ಸರ್ಕಾರಿ ಇಲಾಖೆಗಳಿಗೆ ವರದಿ ಮಾಡಿ. ಹಂತ-ಹಂತವಾಗಿ ಪರಿಶೀಲಿಸಿ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.',
    fileComplaintBtn: 'ದೂರು ದಾಖಲಿಸಿ',
    trackStatusBtn: 'ಸ್ಥಿತಿ ತಿಳಿಯಿರಿ',
    howItWorksBtn: 'ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
    quickTrackLabel: 'ದೂರಿನ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ',
    quickTrackPlaceholder: 'ದೂರು ಸಂಖ್ಯೆ ನಮೂದಿಸಿ (ಉದಾ: JNS-2026-000001)',
    checkStatusBtn: 'ಸ್ಥಿತಿ ನೋಡಿ',
    formatHint: 'ಮಾದರಿ: JNS-2026-XXXXXX',
    
    commit1Title: 'ನೇರ ವರ್ಗಾವಣೆ',
    commit1Desc: 'ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲದೆ ದೂರು ನೇರವಾಗಿ ಸ್ಥಳೀಯ ಅಧಿಕಾರಿಗೆ ತಲುಪುತ್ತದೆ.',
    commit2Title: 'ನಿಗದಿತ ಕಾಲಮಿತಿ',
    commit2Desc: 'ತಪಾಸಣೆ ಮತ್ತು ದುರಸ್ತಿಗೆ ೨೪ ರಿಂದ ೭೨ ಗಂಟೆಗಳ ಸ್ಪಷ್ಟ ಗಡುವು.',
    commit3Title: 'ಫೋಟೋ ಸಾಕ್ಷ್ಯ ಕಡ್ಡಾಯ',
    commit3Desc: 'ಕೆಲಸ ಮುಗಿದ ನಂತರ ಅಧಿಕಾರಿಗಳು ಮೊದಲು ಮತ್ತು ನಂತರದ ಫೋಟೋಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಬೇಕು.',
    commit4Title: 'ನಿಮ್ಮ ಅನುಮೋದನೆ',
    commit4Desc: 'ನೀವು ಪರಿಶೀಲಿಸಿ ಒಪ್ಪಿಗೆ ನೀಡುವವರೆಗೆ ದೂರನ್ನು ಮುಕ್ತಾಯಗೊಳಿಸಲಾಗುವುದಿಲ್ಲ.',
    
    helplinesTitle: '೨೪x೭ ತುರ್ತು ಮತ್ತು ಕುಂದುಕೊರತೆ ಸಹಾಯವಾಣಿಗಳು',
    railHelpline: 'ರೈಲ್ವೆ ಸಹಾಯವಾಣಿ',
    cyberHelpline: 'ಸೈಬರ್ ಅಪರಾಧ ಸಹಾಯವಾಣಿ',
    consumerHelpline: 'ಗ್ರಾಹಕರ ಸಹಾಯವಾಣಿ',
    emergencyHelpline: 'ರಾಷ್ಟ್ರೀಯ ತುರ್ತು ಸೇವೆ',
    
    howItWorksTitle: 'ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
    howItWorksDesc: 'ದೂರು ದಾಖಲಿಸುವುದರಿಂದ ಹಿಡಿದು ಪರಿಹಾರದವರೆಗೆ ಸರಳ ೪ ಹಂತಗಳು.',
    step1Title: '೧. ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ',
    step1Desc: 'ವಿವರಗಳನ್ನು ಬರೆಯಿರಿ. ಫೋಟೋಗಳು ಅಥವಾ ಸ್ಥಳವನ್ನು ಸೇರಿಸಿ.',
    step2Title: '೨. ಸೂಕ್ತ ಇಲಾಖೆಗೆ ರವಾನೆ',
    step2Desc: 'ದೂರು ನೇರವಾಗಿ ಜವಾಬ್ದಾರಿಯುತ ಸ್ಥಳೀಯ ಕಚೇರಿಗೆ ತಲುಪುತ್ತದೆ.',
    step3Title: '೩. ಸಿಬ್ಬಂದಿಯಿಂದ ಪರಿಹಾರ',
    step3Desc: 'ಸಿಬ್ಬಂದಿ ದುರಸ್ತಿ ಕಾರ್ಯ ನಡೆಸಿ ಫೋಟೋ ಪುರಾವೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡುತ್ತಾರೆ.',
    step4Title: '೪. ನಿಮ್ಮ ಪರಿಶೀಲನೆ ಮತ್ತು ಮುಕ್ತಾಯ',
    step4Desc: 'ಫೋಟೋ ನೋಡಿ ತೃಪ್ತಿಯಾದಲ್ಲಿ ಮಾತ್ರ ದೂರನ್ನು ಮುಕ್ತಾಯಗೊಳಿಸಿ.',
    
    departmentsTitle: 'ಸರ್ಕಾರಿ ಇಲಾಖೆಗಳು',
    departmentsDesc: 'ದೂರು ದಾಖಲಿಸಲು ಸೂಕ್ತ ಇಲಾಖೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    deptRailway: 'ಭಾರತೀಯ ರೈಲ್ವೆ',
    deptRailwayDesc: 'ಸ್ವಚ್ಛತೆ, ಕೋಚ್ ಸಮಸ್ಯೆಗಳು, ನಿಲ್ದಾಣಗಳು, ಹಳಿಗಳು ಮತ್ತು ಟಿಕೆಟಿಂಗ್.',
    deptMuni: 'ಮಹಾನಗರ ಪಾಲಿಕೆ',
    deptMuniDesc: 'ಕಸ ವಿಲೇವಾರಿ, ರಸ್ತೆ ಸ್ವಚ್ಛತೆ, ಚರಂಡಿ ಮತ್ತು ಉದ್ಯಾನವನಗಳು.',
    deptWater: 'ನೀರು ಸರಬರಾಜು ಮತ್ತು ಒಳಚರಂಡಿ',
    deptWaterDesc: 'ಪೈಪ್ ಒಡೆದಿರುವುದು, ಕಲುಷಿತ ನೀರು ಮತ್ತು ಒಳಚರಂಡಿ ಬ್ಲಾಕ್.',
    deptRoads: 'ರಸ್ತೆಗಳು ಮತ್ತು ಸೇತುವೆಗಳು (ಲೋಕೋಪಯೋಗಿ)',
    deptRoadsDesc: 'ಗುಂಡಿಗಳು, ಹಾಳಾದ ಪಾದಚಾರಿ ಮಾರ್ಗಗಳು ಮತ್ತು ರಸ್ತೆ ಹಾನಿ.',
    deptPower: 'ವಿದ್ಯುತ್ ಸರಬರಾಜು ಮಂಡಳಿ (ಬೆಸ್ಕಾಂ)',
    deptPowerDesc: 'ವಿದ್ಯುತ್ ಕಡಿತ, ಬಿದ್ದ ತಂತಿಗಳು, ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್ ದೋಷ, ಬೀದಿದೀಪಗಳು.',
    deptHealth: 'ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ಮತ್ತು ನೈರ್ಮಲ್ಯ',
    deptHealthDesc: 'ಸೊಳ್ಳೆ ನಿಯಂತ್ರಣ, ಆಸ್ಪತ್ರೆ ಸ್ವಚ್ಛತೆ ಮತ್ತು ಆಹಾರ ಸುರಕ್ಷತೆ.',
    slaLabel: 'ಪರಿಹಾರ ಗಡುವು',
    fileHere: 'ದೂರು ನೀಡಿ',
    guaranteeTag: 'ನಾಗರಿಕ ಹಕ್ಕು ಭರವಸೆ',
    guaranteeTitle: 'ನಿಮ್ಮ ಒಪ್ಪಿಗೆಯಿಲ್ಲದೆ ಯಾವುದೇ ದೂರು ಮುಕ್ತಾಯವಾಗುವುದಿಲ್ಲ',
    guaranteeDesc: 'ಅಧಿಕಾರಿಗಳು ಸ್ವತಂತ್ರವಾಗಿ ಮುಕ್ತಾಯಗೊಳಿಸಲಾಗುವುದಿಲ್ಲ. ಫೋಟೋ ನೋಡಿ ನಿಮ್ಮ ಒಪ್ಪಿಗೆ ಮುಖ್ಯ.',
    guaranteeBtn: 'ದೂರು ದಾಖಲಿಸಿ',
    guaranteeLearnMore: 'ನಾಗರಿಕ ಸನ್ನದು ಓದಿ',
  },

  ml: {
    home: 'ഹോം',
    fileComplaint: 'പരാതി നൽകുക',
    trackStatus: 'നില പരിശോധിക്കുക',
    myComplaints: 'എന്റെ പരാതികൾ',
    citizenCharter: 'പൗരരേഖ',
    help: 'സഹായവും ചോദ്യോത്തരങ്ങളും',
    officialLogin: 'ഉദ്യോഗസ്ഥ ലോഗിൻ',
    citizenLogin: 'ലോഗിൻ / സൈൻ അപ്പ്',
    adminPortal: 'അഡ്മിൻ പോർട്ടൽ',
    officialPortal: 'ഔദ്യോഗിക പോർട്ടൽ',
    citizenDashboard: 'സിറ്റിസൺ ഡാഷ്‌ബോർഡ്',
    signOut: 'ലോഗ് ഔട്ട്',
    textResize: 'ഫോണ്ട് വലുപ്പം',
    selectLanguage: 'ഭാഷ',
    tollFree: 'ടോൾ ഫ്രീ',
    
    adminNavOverview: 'ഡയറക്ടറേറ്റ് അവലോകനം',
    adminNavComplaints: 'എല്ലാ പരാതികളും',
    adminNavEmployees: 'ഉദ്യോഗസ്ഥ ഡയറക്ടറി',
    adminNavEmailRequests: 'ഇമെയിൽ മാറ്റ അഭ്യർത്ഥനകൾ',
    adminNavAudit: 'ഓഡിറ്റ് ലോഗ്',
    staffNavWorkspace: 'വർക്ക്‌സ്‌പേസ്',
    staffNavDeptComplaints: 'വകുപ്പ് പരാതികൾ',
    staffNavEscalated: 'അടിയന്തര കേസുകൾ',
    changePassword: 'പാസ്‌വേഡ് മാറ്റുക (OTP)',
    requestEmailChange: 'ഇമെയിൽ മാറ്റ അഭ്യർത്ഥന',
    grievanceQueue: 'പരാതി നിര',

    topGovLine: 'ഭാരത സർക്കാർ',
    topMinistryLine: 'ഭരണപരിഷ്കാരങ്ങളും പൊതുജന പരാതി പരിഹാര വകുപ്പും',
    tickerNotice: 'അറിയിപ്പ്: ഓരോ പരാതിക്കും പ്രത്യേക ഐഡി ലഭിക്കും. പണി പൂർത്തിയായ ശേഷം ഫോട്ടോ തെളിവ് അപ്‌ലോഡ് ചെയ്യേണ്ടതുണ്ട്. 24x7 നില പരിശോധിക്കുക.',
    
    portalTitle: 'കേന്ദ്ര പൊതുജന പരാതി പരിഹാര പോർട്ടൽ',
    heroTag: 'ഭാരത സർക്കാർ പൗര സേവന പോർട്ടൽ',
    heroDescription: 'നിങ്ങളുടെ പ്രദേശത്തെ പ്രശ്നങ്ങൾ നേരിട്ട് സർക്കാർ വകുപ്പുകളെ അറിയിക്കുക. പരിഹാരം ഉറപ്പുവരുത്തിയ ശേഷം മാത്രം ക്ലോസ് ചെയ്യുക.',
    fileComplaintBtn: 'പരാതി നൽകുക',
    trackStatusBtn: 'നില പരിശോധിക്കുക',
    howItWorksBtn: 'പ്രവർത്തനരീതി',
    quickTrackLabel: 'പരാതി നില പരിശോധിക്കുക',
    quickTrackPlaceholder: 'പരാതി നമ്പർ നൽകുക (ഉദാ: JNS-2026-000001)',
    checkStatusBtn: 'പരിശോധിക്കുക',
    formatHint: 'ഫോർമാറ്റ്: JNS-2026-XXXXXX',
    
    commit1Title: 'നേരിട്ടുള്ള റൂട്ടിംഗ്',
    commit1Desc: 'ഇടനിലക്കാരില്ലാതെ പരാതി നേരിട്ട് ബന്ധപ്പെട്ട പ്രാദേശിക ഉദ്യോഗസ്ഥനിലേക്ക് എത്തുന്നു.',
    commit2Title: 'കൃത്യമായ സമയപരിധി',
    commit2Desc: 'പരിശോധനയ്ക്കും അറ്റകുറ്റപ്പണിക്കുമായി 24 മുതൽ 72 മണിക്കൂർ വരെ വ്യക്തമായ സമയപരിധി.',
    commit3Title: 'ഫോട്ടോ തെളിവ് നിർബന്ധം',
    commit3Desc: 'ജോലിക്ക് മുൻപും ശേഷവുമുള്ള ഫോട്ടോകൾ ഉദ്യോഗസ്ഥർ അപ്‌ലോഡ് ചെയ്യണം.',
    commit4Title: 'നിങ്ങളുടെ അംഗീകാരം',
    commit4Desc: 'നിങ്ങൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുന്നതുവരെ പരാതി തീർപ്പാക്കില്ല.',
    
    helplinesTitle: '24x7 അടിയന്തര & പരാതി ഹെൽപ്പ്‌ലൈനുകൾ',
    railHelpline: 'റെയിൽവേ ഹെൽപ്പ്‌ലൈൻ',
    cyberHelpline: 'സൈബർ ക്രൈം ഹെൽപ്പ്‌ലൈൻ',
    consumerHelpline: 'ഉപഭോക്തൃ ഹെൽപ്പ്‌ലൈൻ',
    emergencyHelpline: 'ദേശീയ അടിയന്തര സേവനം',
    
    howItWorksTitle: 'ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു',
    howItWorksDesc: 'പരാതി നൽകുന്നത് മുതൽ പരിഹാരം വരെ ലളിതമായ 4 ഘട്ടങ്ങൾ.',
    step1Title: '1. പരാതി വിശദീകരിക്കുക',
    step1Desc: 'വിവരങ്ങൾ എഴുതുക, ഫോട്ടോകൾ അല്ലെങ്കിൽ ലൊക്കേഷൻ ചേർക്കുക.',
    step2Title: '2. ഓഫീസിലേക്ക് അയക്കുന്നു',
    step2Desc: 'പരാതി ഉടൻ തന്നെ ബന്ധപ്പെട്ട ഓഫീസിലേക്ക് അയക്കുന്നു.',
    step3Title: '3. ടീം പരിഹരിക്കുന്നു',
    step3Desc: 'ഫീൽഡ് സംഘം അറ്റകുറ്റപ്പണി നടത്തി ഫോട്ടോ തെളിവുകൾ അപ്‌ലോഡ് ചെയ്യുന്നു.',
    step4Title: '4. അംഗീകരിക്കുക',
    step4Desc: 'ഫോട്ടോകൾ പരിശോധിച്ച് ബോധ്യപ്പെട്ടാൽ പരാതി ക്ലോസ് ചെയ്യാം.',
    
    departmentsTitle: 'സർക്കാർ വകുപ്പുകൾ',
    departmentsDesc: 'പരാതി നൽകാൻ ആവശ്യമായ വകുപ്പ് തിരഞ്ഞെടുക്കുക.',
    deptRailway: 'ഇന്ത്യൻ റെയിൽവേ',
    deptRailwayDesc: 'ശുചിത്വം, കോച്ച് പ്രശ്നങ്ങൾ, സ്റ്റേഷനുകൾ, ടിക്കറ്റിംഗ്.',
    deptMuni: 'മുനിസിപ്പൽ കോർപ്പറേഷൻ',
    deptMuniDesc: 'മാലിന്യ സംസ്കരണം, ഓട ശുചീകരണം, പാർക്കുകൾ.',
    deptWater: 'കുടിവെള്ളവും ഡ്രെയിനേജും',
    deptWaterDesc: 'പൈപ്പ് പൊട്ടൽ, മലിനജലം, മലിനജല തടസ്സം.',
    deptRoads: 'റോഡുകളും പാലങ്ങളും (PWD)',
    deptRoadsDesc: 'റോഡിലെ കുഴികൾ, തകർന്ന നടപ്പാതകൾ, റോഡ് കേടുപാടുകൾ.',
    deptPower: 'വൈദ്യുതി ബോർഡ് (KSEB)',
    deptPowerDesc: 'വൈദ്യുതി മുടക്കം, പൊട്ടിയ കമ്പികൾ, തെരുവ് വിളക്കുകൾ.',
    deptHealth: 'പൊതുജനാരോഗ്യവും ശുചിത്വവും',
    deptHealthDesc: 'കൊതുക് നശീകരണം, ആശുപത്രി ശുചിത്വം, ഭക്ഷ്യസുരക്ഷ.',
    slaLabel: 'സമയപരിധി',
    fileHere: 'പരാതി നൽകുക',
    guaranteeTag: 'പൗരാവകാശം',
    guaranteeTitle: 'നിങ്ങളുടെ അനുമതിയില്ലാതെ പരാതി ക്ലോസ് ചെയ്യില്ല',
    guaranteeDesc: 'ജോലി കഴിഞ്ഞ ഫോട്ടോകൾ പരിശോധിച്ച് നിങ്ങൾ തൃപ്തനായാൽ മാത്രമേ പരാതി ക്ലോസ് ചെയ്യപ്പെടൂ.',
    guaranteeBtn: 'പരാതി നൽകുക',
    guaranteeLearnMore: 'വിവരങ്ങൾ വായിക്കുക',
  },

  pa: {
    home: 'ਮੁੱਖ ਪੰਨਾ',
    fileComplaint: 'ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰੋ',
    trackStatus: 'ਸਥਿਤੀ ਜਾਂਚੋ',
    myComplaints: 'ਮੇਰੀਆਂ ਸ਼ਿਕਾਇਤਾਂ',
    citizenCharter: 'ਨਾਗਰਿਕ ਮਾਰਗਦਰਸ਼ਕ',
    help: 'ਸਹਾਇਤਾ ਅਤੇ ਅਕਸਰ ਪੁੱਛੇ ਜਾਂਦੇ ਸਵਾਲ',
    officialLogin: 'ਅਧਿਕਾਰੀ ਲੌਗਇਨ',
    citizenLogin: 'ਲੌਗਇਨ / ਸਾਈਨ ਅੱਪ',
    adminPortal: 'ਐਡਮਿਨ ਪੋਰਟਲ',
    officialPortal: 'ਅਧਿਕਾਰਤ ਪੋਰਟਲ',
    citizenDashboard: 'ਨਾਗਰਿਕ ਡੈਸ਼ਬੋਰਡ',
    signOut: 'ਲੌਗ ਆਉਟ',
    textResize: 'ਅੱਖਰਾਂ ਦਾ ਆਕਾਰ',
    selectLanguage: 'ਭਾਸ਼ਾ',
    tollFree: 'ਟੋਲ ਫ੍ਰੀ',
    
    adminNavOverview: 'ਡਾਇਰੈਕਟੋਰੇਟ ਸੰਖੇਪ',
    adminNavComplaints: 'ਸਾਰੀਆਂ ਸ਼ਿਕਾਇਤਾਂ',
    adminNavEmployees: 'ਅਧਿਕਾਰੀ ਡਾਇਰੈਕਟਰੀ',
    adminNavEmailRequests: 'ਈਮੇਲ ਬੇਨਤੀਆਂ',
    adminNavAudit: 'ਆਡਿਟ ਟ੍ਰੇਲ',
    staffNavWorkspace: 'ਕਾਰਜ ਖੇਤਰ',
    staffNavDeptComplaints: 'ਵਿਭਾਗੀ ਸ਼ਿਕਾਇਤਾਂ',
    staffNavEscalated: 'ਜ਼ਰੂਰੀ ਮਾਮਲੇ',
    changePassword: 'ਪਾਸਵਰਡ ਬਦਲੋ (OTP)',
    requestEmailChange: 'ਈਮੇਲ ਬਦਲਣ ਦੀ ਬੇਨਤੀ',
    grievanceQueue: 'ਸ਼ਿਕਾਇਤ ਕਤਾਰ',

    topGovLine: 'ਭਾਰਤ ਸਰਕਾਰ',
    topMinistryLine: 'ਪ੍ਰਸ਼ਾਸਕੀ ਸੁਧਾਰ ਅਤੇ ਲੋਕ ਸ਼ਿਕਾਇਤਾਂ ਵਿਭਾਗ',
    tickerNotice: 'ਸੂਚਨਾ: ਹਰੇਕ ਸ਼ਿਕਾਇਤ ਨੂੰ ਵਿਲੱਖਣ ID ਮਿਲਦੀ ਹੈ। ਕੰਮ ਪੂਰਾ ਹੋਣ ਤੇ ਫੋਟੋ ਸਬੂਤ ਅਪਲੋਡ ਕਰਨਾ ਲਾਜ਼ਮੀ ਹੈ। ੨੪x੭ ਪ੍ਰਗਤੀ ਜਾਂਚੋ।',
    
    portalTitle: 'ਕੇਂਦਰੀ ਲੋਕ ਸ਼ਿਕਾਇਤ ਨਿਵਾਰਣ ਪੋਰਟਲ',
    heroTag: 'ਭਾਰਤ ਸਰਕਾਰ ਨਾਗਰਿਕ ਸੇਵਾ ਪੋਰਟਲ',
    heroDescription: 'ਆਪਣੇ ਖੇਤਰ ਦੀਆਂ ਸਮੱਸਿਆਵਾਂ ਸਿੱਧੇ ਸਰਕਾਰੀ ਵਿਭਾਗਾਂ ਤੱਕ ਪਹੁੰਚਾਓ। ਕਦਮ-ਦਰ-ਕਦਮ ਨਿਗਰਾਨੀ ਕਰੋ ਅਤੇ ਤਸੱਲੀ ਹੋਣ ਤੇ ਹੀ ਬੰਦ ਕਰੋ।',
    fileComplaintBtn: 'ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰੋ',
    trackStatusBtn: 'ਸਥਿਤੀ ਦੇਖੋ',
    howItWorksBtn: 'ਕਾਰਜ ਪ੍ਰਣਾਲੀ',
    quickTrackLabel: 'ਸ਼ਿਕਾਇਤ ਸਥਿਤੀ ਜਾਂਚੋ',
    quickTrackPlaceholder: 'ਸ਼ਿਕਾਇਤ ਨੰਬਰ ਦਰਜ ਕਰੋ (ਉਦਾ: JNS-2026-000001)',
    checkStatusBtn: 'ਜਾਂਚ ਕਰੋ',
    formatHint: 'ਫਾਰਮੈਟ: JNS-2026-XXXXXX',
    
    commit1Title: 'ਸਿੱਧਾ ਨਿਰਦੇਸ਼ਨ',
    commit1Desc: 'ਬਿਨਾਂ ਕਿਸੇ ਵਿਚੋਲੇ ਦੇ ਸ਼ਿਕਾਇਤ ਸਿੱਧੇ ਸਥਾਨਕ ਅਧਿਕਾਰੀ ਤੱਕ ਪਹੁੰਚਦੀ ਹੈ।',
    commit2Title: 'ਨਿਸ਼ਚਿਤ ਸਮਾਂ ਸੀਮਾ',
    commit2Desc: 'ਜਾਂਚ ਅਤੇ ਮੁਰੰਮਤ ਲਈ ੨੪ ਤੋਂ ੭੨ ਘੰਟਿਆਂ ਦੀ ਸਪੱਸ਼ਟ ਸਮਾਂ ਸੀਮਾ।',
    commit3Title: 'ਫੋਟੋ ਸਬੂਤ ਲਾਜ਼ਮੀ',
    commit3Desc: 'ਟੀਮ ਨੂੰ ਕੰਮ ਪੂਰਾ ਹੋਣ ਦੇ ਪਹਿਲਾਂ ਅਤੇ ਬਾਅਦ ਦੇ ਫੋਟੋ ਅਪਲੋਡ ਕਰਨੇ ਪੈਣਗੇ।',
    commit4Title: 'ਨਾਗਰਿਕ ਪ੍ਰਵਾਨਗੀ',
    commit4Desc: 'ਤੁਹਾਡੀ ਸੰਤੁਸ਼ਟੀ ਅਤੇ ਸਮੀਖਿਆ ਤੋਂ ਬਿਨਾਂ ਕੋਈ ਵੀ ਸ਼ਿਕਾਇਤ ਬੰਦ ਨਹੀਂ ਕੀਤੀ ਜਾ ਸਕਦੀ।',
    
    helplinesTitle: '੨੪x੭ ਐਮਰਜੈਂਸੀ ਅਤੇ ਸ਼ਿਕਾਇਤ ਹੈਲਪਲਾਈਨਾਂ',
    railHelpline: 'ਰੇਲਵੇ ਹੈਲਪਲਾਈਨ',
    cyberHelpline: 'ਸਾਈਬਰ ਕ੍ਰਾਈਮ ਹੈਲਪਲਾਈਨ',
    consumerHelpline: 'ਖਪਤਕਾਰ ਹੈਲਪਲਾਈਨ',
    emergencyHelpline: 'ਰਾਸ਼ਟਰੀ ਐਮਰਜੈਂਸੀ ਸੇਵਾ',
    
    howItWorksTitle: 'ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ',
    howItWorksDesc: 'ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰਨ ਤੋਂ ਲੈ ਕੇ ਹੱਲ ਤੱਕ ਦੇ ਸਰਲ ੪ ਕਦਮ।',
    step1Title: '੧. ਸਮੱਸਿਆ ਬਾਰੇ ਦੱਸੋ',
    step1Desc: 'ਵੇਰਵਾ ਲਿਖੋ। ਫੋਟੋ ਜਾਂ ਸਥਾਨ ਸ਼ਾਮਲ ਕਰੋ।',
    step2Title: '੨. ਸਬੰਧਤ ਦਫ਼ਤਰ ਨੂੰ ਭੇਜਣਾ',
    step2Desc: 'ਸ਼ਿਕਾਇਤ ਤੁਰੰਤ ਜ਼ਿੰਮੇਵਾਰ ਸਥਾਨਕ ਦਫ਼ਤਰ ਨੂੰ ਭੇਜੀ ਜਾਂਦੀ ਹੈ।',
    step3Title: '੩. ਟੀਮ ਵੱਲੋਂ ਹੱਲ',
    step3Desc: 'ਕਰਮਚਾਰੀ ਮੁਰੰਮਤ ਕਰਕੇ ਫੋਟੋ ਸਬੂਤ ਅਪਲੋਡ ਕਰਦੇ ਹਨ।',
    step4Title: '੪. ਤੁਹਾਡੀ ਪ੍ਰਵਾਨਗੀ',
    step4Desc: 'ਸਬੂਤ ਦੇਖ ਕੇ ਸੰਤੁਸ਼ਟ ਹੋਣ ਤੇ ਹੀ ਸ਼ਿਕਾਇਤ ਬੰਦ ਕਰੋ।',
    
    departmentsTitle: 'ਸਰਕਾਰੀ ਵਿਭਾਗ',
    departmentsDesc: 'ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰਨ ਲਈ ਹੇਠਾਂ ਦਿੱਤੇ ਵਿਭਾਗਾਂ ਵਿੱਚੋਂ ਚੁਣੋ।',
    deptRailway: 'ਭਾਰਤੀ ਰੇਲਵੇ',
    deptRailwayDesc: 'ਸਫ਼ਾਈ, ਕੋਚ ਸਮੱਸਿਆਵਾਂ, ਸਟੇਸ਼ਨ, ਪਟੜੀਆਂ ਅਤੇ ਟਿਕਟਿੰਗ।',
    deptMuni: 'ਨਗਰ ਨਿਗਮ',
    deptMuniDesc: 'ਕੂੜਾ ਚੁੱਕਣਾ, ਸੜਕ ਸਫ਼ਾਈ, ਨਾਲੀਆਂ ਅਤੇ ਪਾਰਕ।',
    deptWater: 'ਜਲ ਸਪਲਾਈ ਅਤੇ ਸੀਵਰੇਜ',
    deptWaterDesc: 'ਪਾਈਪ ਟੁੱਟਣਾ, ਗੰਦਾ ਪਾਣੀ ਅਤੇ ਸੀਵਰ ਬਲਾਕੇਜ।',
    deptRoads: 'ਸੜਕਾਂ ਅਤੇ ਪੁਲ (ਲੋਕ ਨਿਰਮਾਣ)',
    deptRoadsDesc: 'ਟੋਏ, ਟੁੱਟੇ ਫੁੱਟਪਾਥ ਅਤੇ ਸੜਕਾਂ ਦੇ ਨੁਕਸਾਨ।',
    deptPower: 'ਬਿਜਲੀ ਬੋਰਡ (PSPCL)',
    deptPowerDesc: 'ਬਿਜਲੀ ਕੱਟ, ਟੁੱਟੀਆਂ ਤਾਰਾਂ, ਟਰਾਂਸਫਾਰਮਰ ਖਰਾਬੀ, ਲਾਈਟਾਂ।',
    deptHealth: 'ਜਨ ਸਿਹਤ ਅਤੇ ਸਫ਼ਾਈ',
    deptHealthDesc: 'ਮੱਛਰਾਂ ਦੀ ਰੋਕਥਾਮ, ਹਸਪਤਾਲ ਸਫ਼ਾਈ ਅਤੇ ਖੁਰਾਕ ਸੁਰੱਖਿਆ।',
    slaLabel: 'ਹੱਲ ਦਾ ਸਮਾਂ',
    fileHere: 'ਸ਼ਿਕਾਇਤ ਕਰੋ',
    guaranteeTag: 'ਨਾਗਰਿਕ ਅਧਿਕਾਰ ਗਾਰੰਟੀ',
    guaranteeTitle: 'ਤੁਹਾਡੀ ਮਨਜ਼ੂਰੀ ਤੋਂ ਬਿਨਾਂ ਕੋਈ ਸ਼ਿਕਾਇਤ ਬੰਦ ਨਹੀਂ ਹੋਵੇਗੀ',
    guaranteeDesc: 'ਅਧਿਕਾਰੀ ਖੁਦ ਸ਼ਿਕਾਇਤ ਬੰਦ ਨਹੀਂ ਕਰ ਸਕਦੇ। ਫੋਟੋ ਦੇਖ ਕੇ ਤੁਹਾਡੀ ਮਨਜ਼ੂਰੀ ਜ਼ਰੂਰੀ ਹੈ।',
    guaranteeBtn: 'ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰੋ',
    guaranteeLearnMore: 'ਨਾਗਰਿਕ ਚਾਰਟਰ ਪੜ੍ਹੋ',
  },

  or: {
    home: 'ମୂଳ ପୃଷ୍ଠା',
    fileComplaint: 'ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ',
    trackStatus: 'ସ୍ଥିତି ଯାଞ୍ଚ କରନ୍ତୁ',
    myComplaints: 'ମୋର ଅଭିଯୋଗ',
    citizenCharter: 'ନାଗରିକ ମାର୍ଗଦର୍ଶିକା',
    help: 'ସହାୟତା ଓ ପ୍ରଶ୍ନୋତ୍ତର',
    officialLogin: 'ଅଧିକାରୀ ଲଗଇନ୍',
    citizenLogin: 'ଲଗଇନ୍ / ସାଇନ୍ ଅପ୍',
    adminPortal: 'ପ୍ରଶାସନ ପୋର୍ଟାଲ୍',
    officialPortal: 'ସରକାରୀ ପୋର୍ଟାଲ୍',
    citizenDashboard: 'ନାଗରିକ ଡ୍ୟାସବୋର୍ଡ',
    signOut: 'ଲଗ୍ ଆଉଟ୍',
    textResize: 'ଅକ୍ଷର ଆକାର',
    selectLanguage: 'ଭାଷା',
    tollFree: 'ଟୋଲ୍ ଫ୍ରି',
    
    adminNavOverview: 'ନିର୍ଦ୍ଦେଶାଳୟ ସମୀକ୍ଷା',
    adminNavComplaints: 'ସମସ୍ତ ଅଭିଯୋଗ',
    adminNavEmployees: 'ଅଧିକାରୀ ଡିରେକ୍ଟୋରୀ',
    adminNavEmailRequests: 'ଇମେଲ୍ ଅନୁରୋଧ',
    adminNavAudit: 'ଅଡିଟ୍ ଲଗ୍',
    staffNavWorkspace: 'କାର୍ଯ୍ୟକ୍ଷେତ୍ର',
    staffNavDeptComplaints: 'ବିଭାଗୀୟ ଅଭିଯୋଗ',
    staffNavEscalated: 'ଜରୁରୀ ମାମଲା',
    changePassword: 'ପାସୱାର୍ଡ଼ ବଦଳାନ୍ତୁ (OTP)',
    requestEmailChange: 'ଇମେଲ୍ ପରିବର୍ତ୍ତନ ଅନୁରୋଧ',
    grievanceQueue: 'ଅଭିଯୋଗ ଧାଡ଼ି',

    topGovLine: 'ଭାରତ ସରକାର',
    topMinistryLine: 'ପ୍ରଶାସନିକ ସଂସ୍କାର ଏବଂ ଜନ ଅଭିଯୋଗ ବିଭାଗ',
    tickerNotice: 'ସୂଚନା: ପ୍ରତ୍ୟେକ ଅଭିଯୋଗକୁ ଏକ ସ୍ୱତନ୍ତ୍ର ID ପ୍ରଦାନ କରାଯାଏ। କାମ ଶେଷ ହେବା ପରେ ଫଟୋ ପ୍ରମାଣ ଅପଲୋଡ୍ କରିବା ବାଧ୍ୟତାମୂଳକ। ୨୪x୭ ସ୍ଥିତି ଯାଞ୍ଚ କରନ୍ତୁ।',
    
    portalTitle: 'କେନ୍ଦ୍ରୀୟ ଜନ ଅଭିଯୋଗ ସମାଧାନ ପୋର୍ଟାଲ୍',
    heroTag: 'ଭାରତ ସରକାର ନାଗରିକ ସେବା ପୋର୍ଟାଲ୍',
    heroDescription: 'ଆପଣଙ୍କ ଅଞ୍ଚଳର ସମସ୍ୟା ସିଧାସଳଖ ସରକାରୀ ବିଭାଗକୁ ଜଣାନ୍ତୁ। ପର୍ଯ୍ୟାୟକ୍ରମେ ଯାଞ୍ଚ କରନ୍ତୁ ଏବଂ ସନ୍ତୁଷ୍ଟ ହେବା ପରେ ହିଁ ବନ୍ଦ କରନ୍ତୁ।',
    fileComplaintBtn: 'ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ',
    trackStatusBtn: 'ସ୍ଥିତି ଯାଞ୍ଚ କରନ୍ତୁ',
    howItWorksBtn: 'କାର୍ଯ୍ୟପ୍ରଣାଳୀ',
    quickTrackLabel: 'ଅଭିଯୋଗ ସ୍ଥିତି ଯାଞ୍ଚ କରନ୍ତୁ',
    quickTrackPlaceholder: 'ଅଭିଯୋଗ ନମ୍ବର ଲେଖନ୍ତୁ (ଯଥା: JNS-2026-000001)',
    checkStatusBtn: 'ଯାଞ୍ଚ କରନ୍ତୁ',
    formatHint: 'ଫର୍ମାଟ୍: JNS-2026-XXXXXX',
    
    commit1Title: 'ସିଧାସଳଖ ପ୍ରେରଣ',
    commit1Desc: 'ମଧ୍ୟସ୍ଥି ବିନା ଅଭିଯୋଗ ସିଧାସଳଖ ସମ୍ପୃକ୍ତ ସ୍ଥାନୀୟ ଅଧିକାରୀଙ୍କ ନିକଟରେ ପହଞ୍ଚେ।',
    commit2Title: 'ନିର୍ଦ୍ଦିଷ୍ଟ ସମୟସୀମା',
    commit2Desc: 'ତଦନ୍ତ ଏବଂ ମରାମତି ପାଇଁ ୨୪ ରୁ ୭୨ ଘଣ୍ଟାର ନିର୍ଦ୍ଦିଷ୍ଟ ସମୟସୀମା।',
    commit3Title: 'ଫଟୋ ପ୍ରମାଣ ବାଧ୍ୟତାମୂଳକ',
    commit3Desc: 'କାମ ଶେଷ ହେବା ପୂର୍ବରୁ ଏବଂ ପରେ ଫଟୋ ଅପଲୋଡ୍ କରିବା ଆବଶ୍ୟକ।',
    commit4Title: 'ନାଗରିକ ସ୍ୱୀକୃତି',
    commit4Desc: 'ଆପଣଙ୍କ ସନ୍ତୁଷ୍ଟି ଓ ଅନୁମୋଦନ ବିନା କୌଣସି ଅଭିଯୋଗ ବନ୍ଦ ହୋଇପାରିବ ନାହିଁ।',
    
    helplinesTitle: '୨୪x୭ ଜରୁରୀକାଳୀନ ଏବଂ ଅଭିଯୋଗ ହେଲ୍ପଲାଇନ୍',
    railHelpline: 'ରେଳବାଇ ହେଲ୍ପଲାଇନ୍',
    cyberHelpline: 'ସାଇବର କ୍ରାଇମ୍ ହେଲ୍ପଲାଇନ୍',
    consumerHelpline: 'ଗ୍ରାହକ ସୁରକ୍ଷା ହେଲ୍ପଲାଇନ୍',
    emergencyHelpline: 'ଜାତୀୟ ଜରୁରୀକାଳୀନ ସେବା',
    
    howItWorksTitle: 'ଏହା କିପରି କାର୍ଯ୍ୟ କରେ',
    howItWorksDesc: 'ଅଭିଯୋଗ ଦାଖଲ ଠାରୁ ସମାଧାନ ପର୍ଯ୍ୟନ୍ତ ୪ଟି ସରଳ ପଦକ୍ଷେପ।',
    step1Title: '୧. ସମସ୍ୟା ଜଣାନ୍ତୁ',
    step1Desc: 'ବିବରଣୀ ଲେଖନ୍ତୁ। ଫଟୋ କିମ୍ବା ସ୍ଥାନ ଯୋଡନ୍ତୁ।',
    step2Title: '୨. ସମ୍ପୃକ୍ତ ଦପ୍ତରକୁ ପ୍ରେରଣ',
    step2Desc: 'ଅଭିଯୋଗ ସିଧାସଳଖ ଦାୟିତ୍ୱବାନ କାର୍ଯ୍ୟାଳୟକୁ ପଠାଯାଏ।',
    step3Title: '୩. କର୍ମଚାରୀଙ୍କ ଦ୍ୱାରା ସମାଧାନ',
    step3Desc: 'କର୍ମଚାରୀ ମରାମତି କରି ଫଟୋ ପ୍ରମାଣ ଅପଲୋଡ୍ କରନ୍ତି।',
    step4Title: '୪. ଆପଣଙ୍କ ଯାଞ୍ଚ ଓ ସମାପ୍ତି',
    step4Desc: 'ଫଟୋ ଦେଖି ସନ୍ତୁଷ୍ଟ ହେଲେ ହିଁ ଅଭିଯୋଗ ବନ୍ଦ କରନ୍ତୁ।',
    
    departmentsTitle: 'ସରକାରୀ ବିଭାଗ',
    departmentsDesc: 'ଅଭିଯୋଗ ପାଇଁ ଉପଯୁକ୍ତ ବିଭାଗ ଚୟନ କରନ୍ତୁ।',
    deptRailway: 'ଭାରତୀୟ ରେଳ',
    deptRailwayDesc: 'ପରିଷ୍କାର ପରିଚ୍ଛନ୍ନତା, ବଗି ସମସ୍ୟା, ଷ୍ଟେସନ, ଟ୍ରାକ୍ ଓ ଟିକେଟ୍।',
    deptMuni: 'ପୌର ନିଗମ',
    deptMuniDesc: 'ଅଳିଆ ସଫେଇ, ଡ୍ରେନେଜ୍, ଆଲୋକ ଓ ପାର୍କ।',
    deptWater: 'ଜଳ ଯୋଗାଣ ଓ ନିଷ୍କାସନ',
    deptWaterDesc: 'ପାଇପ୍ ଫାଟିବା, ଦୂଷିତ ପାଣି ଓ ଡ୍ରେନ୍ ବନ୍ଦ।',
    deptRoads: 'ରାସ୍ତା ଓ ପୋଲ (ପୂର୍ତ୍ତ ବିଭାଗ)',
    deptRoadsDesc: 'ଖାଲଖମା, ଭଙ୍ଗା ଫୁଟପାଥ୍ ଓ ରାସ୍ତା କ୍ଷତି।',
    deptPower: 'ବିଦ୍ୟୁତ ବିତରଣ (TPCODL)',
    deptPowerDesc: 'ବିଦ୍ୟୁତ୍ କାଟ, ତାର ଛିଣ୍ଡିବା, ଟ୍ରାନ୍ସଫର୍ମର ତ୍ରୁଟି ଓ ଲାଇଟ୍।',
    deptHealth: 'ଜନସ୍ୱାସ୍ଥ୍ୟ ଏବଂ ପରିମଳ',
    deptHealthDesc: 'ମଶା ନିୟନ୍ତ୍ରଣ, ଡାକ୍ତରଖାନା ସ୍ୱଚ୍ଛତା ଓ ଖାଦ୍ୟ ନିରାପତ୍ତା।',
    slaLabel: 'ସମାଧାନ ସମୟ',
    fileHere: 'ଅଭିଯୋଗ କରନ୍ତୁ',
    guaranteeTag: 'ନାଗରିକ ଅଧିକାର ଗ୍ୟାରେଣ୍ଟି',
    guaranteeTitle: 'ଆପଣଙ୍କ ଅନୁମତି ବିନା କୌଣସି ଅଭିଯୋଗ ବନ୍ଦ ହେବ ନାହିଁ',
    guaranteeDesc: 'ଅଧିକାରୀମାନେ ନିଜେ ବନ୍ଦ କରିପାରିବେ ନାହିଁ। ଫଟୋ ପ୍ରମାଣ ଦେଖି ଆପଣଙ୍କ ମଞ୍ଜୁରୀ ଜରୁରୀ।',
    guaranteeBtn: 'ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ',
    guaranteeLearnMore: 'ନାଗରିକ ଚାର୍ଟର୍ ପଢ଼ନ୍ତୁ',
  },

  ur: {
    home: 'ہوم',
    fileComplaint: 'شکایت درج کریں',
    trackStatus: 'حیثیت معلوم کریں',
    myComplaints: 'میری شکایات',
    citizenCharter: 'شہری گائیڈ',
    help: 'مدد اور عمومی سوالات',
    officialLogin: 'سرکاری لاگ ان',
    citizenLogin: 'لاگ ان / سائن اپ',
    adminPortal: 'ایڈمن پورٹل',
    officialPortal: 'سرکاری پورٹل',
    citizenDashboard: 'شہری ڈیش بورڈ',
    signOut: 'لاگ آؤٹ',
    textResize: 'حروف کا سائز',
    selectLanguage: 'زبان',
    tollFree: 'ٹول فری',
    
    adminNavOverview: 'ڈائریکٹوریٹ کا جائزہ',
    adminNavComplaints: 'تمام شکایات',
    adminNavEmployees: 'افسران کی ڈائرکٹری',
    adminNavEmailRequests: 'ای میل کی درخواستیں',
    adminNavAudit: 'آڈٹ ٹریل',
    staffNavWorkspace: 'ورک اسپیس',
    staffNavDeptComplaints: 'محکمہ کی شکایات',
    staffNavEscalated: 'اہم مقدمات',
    changePassword: 'پاس ورڈ تبدیل کریں (OTP)',
    requestEmailChange: 'ای میل تبدیلی کی درخواست',
    grievanceQueue: 'شکایات کی قطار',

    topGovLine: 'حکومت ہند',
    topMinistryLine: 'محکمہ انتظامی اصلاحات اور عوامی شکایات',
    tickerNotice: 'اطلاع: ہر شکایت کو ایک منفرد ID دی جاتی ہے۔ کام مکمل ہونے پر تصویری ثبوت اپ لوڈ کرنا لازمی ہے۔ 24x7 پیش رفت دیکھیں۔',
    
    portalTitle: 'مرکزی عوامی شکایت پورٹل',
    heroTag: 'حکومت ہند شہری سروس پورٹل',
    heroDescription: 'اپنے علاقے کے مسائل براہ راست سرکاری محکموں تک پہنچائیں۔ ہر مرحلے کی نگرانی کریں اور تصدیق کے بعد بند کریں۔',
    fileComplaintBtn: 'شکایت درج کریں',
    trackStatusBtn: 'حیثیت جانیں',
    howItWorksBtn: 'کام کا طریقہ',
    quickTrackLabel: 'شکایت کی حیثیت جانیں',
    quickTrackPlaceholder: 'شکایت نمبر درج کریں (مثلاً: JNS-2026-000001)',
    checkStatusBtn: 'چیک کریں',
    formatHint: 'فارمیٹ: JNS-2026-XXXXXX',
    
    commit1Title: 'براہ راست ترسیل',
    commit1Desc: 'شکایت بغیر کسی دلال کے سیدھی متعلقہ مقامی افسر تک پہنچتی ہے۔',
    commit2Title: 'مقررہ وقت',
    commit2Desc: 'معائنے اور مرمت کے لیے 24 سے 72 گھنٹے کی واضح مدت۔',
    commit3Title: 'تصویری ثبوت لازمی',
    commit3Desc: 'کام مکمل ہونے سے پہلے اور بعد کی تصاویر اپ لوڈ کرنا ضروری ہے۔',
    commit4Title: 'شہری کی منظوری',
    commit4Desc: 'آپ کے اطمینان اور توثیق کے بغیر کوئی شکایت بند نہیں ہو سکتی۔',
    
    helplinesTitle: '24x7 ہنگامی اور شکایات ہیلپ لائنز',
    railHelpline: 'ریلوے ہیلپ لائن',
    cyberHelpline: 'سائبر کرائم ہیلپ لائن',
    consumerHelpline: 'کنزیومر ہیلپ لائن',
    emergencyHelpline: 'قومی ہنگامی سروس',
    
    howItWorksTitle: 'یہ کیسے کام کرتا ہے',
    howItWorksDesc: 'شکایت درج کرنے سے لے کر حل تک کے 4 آسان مراحل۔',
    step1Title: '۱. مسئلہ بیان کریں',
    step1Desc: 'تفصیلات لکھیں۔ تصاویر یا لوکیشن شامل کریں۔',
    step2Title: '۲. متعلقہ دفتر کو ترسیل',
    step2Desc: 'شکایت براہ راست ذمہ دار دفتر کو بھیجی جاتی ہے۔',
    step3Title: '۳. فیلڈ ٹیم کے ذریعے حل',
    step3Desc: 'عملہ مرمت کر کے تصویری ثبوت اپ لوڈ کرتا ہے۔',
    step4Title: '۴. آپ کی منظوری اور اختتام',
    step4Desc: 'تصاویر دیکھ کر مطمئن ہونے پر ہی شکایت بند کریں۔',
    
    departmentsTitle: 'سرکاری محکمے',
    departmentsDesc: 'شکایت کے لیے درج ذیل محکموں کا انتخاب کریں۔',
    deptRailway: 'ہندوستانی ریلوے',
    deptRailwayDesc: 'صفائی، بوگی کے مسائل، اسٹیشن، ٹریک اور ٹکٹنگ۔',
    deptMuni: 'میونسپل کارپوریشن',
    deptMuniDesc: 'کوڑا کرکٹ، گلیوں کی صفائی، نالیاں اور پارکس۔',
    deptWater: 'واٹر سپلائی اور نکاسی آب',
    deptWaterDesc: 'پائپ لائن ٹوٹنا، گندا پانی اور سیوریج بند ہونا۔',
    deptRoads: 'سڑکیں اور پل (PWD)',
    deptRoadsDesc: 'گڑھے، ٹوٹے ہوئے فٹ پاتھ اور سڑکوں کا نقصان۔',
    deptPower: 'بجلی بورڈ',
    deptPowerDesc: 'بجلی کی بندش، ٹوٹی تاریں، ٹرانسفارمر خرابی اور اسٹریٹ لائٹس۔',
    deptHealth: 'صحت عامہ اور صفائی',
    deptHealthDesc: 'مچھروں کی روک تھام، ہسپتال صفائی اور خوراک کی حفاظت۔',
    slaLabel: 'حل کا وقت',
    fileHere: 'شکایت درج کریں',
    guaranteeTag: 'شہری حقوق کی ضمانت',
    guaranteeTitle: 'آپ کی اجازت کے بغیر کوئی شکایت بند نہیں ہوگی',
    guaranteeDesc: 'افسران خود سے بند نہیں کر سکتے۔ ثبوت دیکھ کر آپ کی منظوری ضروری ہے۔',
    guaranteeBtn: 'شکایت درج کریں',
    guaranteeLearnMore: 'شہری چارٹر پڑھیں',
  },

  as: {
    home: 'মুখ্যপৃষ্ঠা',
    fileComplaint: 'অভিযোগ দাখিল কৰক',
    trackStatus: 'স্থিতি পৰীক্ষা কৰক',
    myComplaints: 'মোৰ অভিযোগসমূহ',
    citizenCharter: 'নাগৰিক নিৰ্দেশিকা',
    help: 'সহায় আৰু প্ৰশ্নোত্তৰ',
    officialLogin: 'বিষয়াসকলৰ লগইন',
    citizenLogin: 'লগইন / ছাইন আপ',
    adminPortal: 'প্ৰশাসন প’ৰ্টেল',
    officialPortal: 'চৰকাৰী প’ৰ্টেল',
    citizenDashboard: 'নাগৰিক ডেচব’ৰ্ড',
    signOut: 'লগ আউট',
    textResize: 'আখৰৰ আকাৰ',
    selectLanguage: 'ভাষা',
    tollFree: 'টোল ফ্ৰী',
    
    adminNavOverview: 'সঞ্চালকালয় পৰ্যালোচনা',
    adminNavComplaints: 'সকলো অভিযোগ',
    adminNavEmployees: 'বিষয়া ডাইৰেক্টৰি',
    adminNavEmailRequests: 'ইমেইল অনুৰোধ',
    adminNavAudit: 'অডিট তথ্য',
    staffNavWorkspace: 'কাৰ্যক্ষেত্ৰ',
    staffNavDeptComplaints: 'বিভাগীয় অভিযোগ',
    staffNavEscalated: 'জৰুৰী বিষয়',
    changePassword: 'পাছৱৰ্ড সলনি কৰক (OTP)',
    requestEmailChange: 'ইমেইল সলনিৰ অনুৰোধ',
    grievanceQueue: 'অভিযোগৰ শাৰী',

    topGovLine: 'ভাৰত চৰকাৰ',
    topMinistryLine: 'প্ৰশাসনিক সংস্কাৰ আৰু ৰাজহুৱা ওজৰ-আপত্তি বিভাগ',
    tickerNotice: 'জাননী: প্ৰতিটো অভিযোগক এটা সুকীয়া ID দিয়া হয়। কাম সম্পূৰ্ণ হোৱাৰ ফটো প্ৰমাণ আপলোড কৰাটো বাধ্যতামূলক। ২৪x৭ স্থিতি পৰীক্ষা কৰক।',
    
    portalTitle: 'কেন্দ্ৰীয় ৰাজহুৱা ওজৰ-আপত্তি নিষ্পত্তি প’ৰ্টেল',
    heroTag: 'ভাৰত চৰকাৰ নাগৰিক সেৱা প’ৰ্টেল',
    heroDescription: 'আপোনাৰ অঞ্চলৰ সমস্যা পোনপটীয়াকৈ চৰকাৰী বিভাগক জনাওক। কামৰ অগ্ৰগতি নিৰীক্ষণ কৰক আৰু নিশ্চিত হৈ অভিযোগ নিষ্পত্তি কৰক।',
    fileComplaintBtn: 'অভিযোগ দাখিল কৰক',
    trackStatusBtn: 'স্থিতি পৰীক্ষা কৰক',
    howItWorksBtn: 'কাৰ্যপদ্ধতি',
    quickTrackLabel: 'অভিযোগ স্থিতি পৰীক্ষা কৰক',
    quickTrackPlaceholder: 'অভিযোগ নম্বৰ দিয়ক (যেনে: JNS-2026-000001)',
    checkStatusBtn: 'পৰীক্ষা কৰক',
    formatHint: 'ফৰ্মেট: JNS-2026-XXXXXX',
    
    commit1Title: 'পোনপটীয়া প্ৰেৰণ',
    commit1Desc: 'কোনো মধ্যভোগী অবিহনে অভিযোগ পোনে পোনে সংশ্লিষ্ট স্থানীয় বিষয়াৰ হাতত পৰে।',
    commit2Title: 'নিৰ্দিষ্ট সময়সীমা',
    commit2Desc: 'পৰিদৰ্শন আৰু মেৰামতিৰ বাবে ২৪ৰ পৰা ৭২ ঘণ্টাৰ স্পষ্ট সময়সীমা।',
    commit3Title: 'ফটো প্ৰমাণ বাধ্যতামূলক',
    commit3Desc: 'কাম সম্পূৰ্ণ হোৱাৰ আগৰ আৰু পিছৰ ফটো আপলোড কৰিব লাগিব।',
    commit4Title: 'নাগৰিকৰ স্বীকৃতি',
    commit4Desc: 'আপোনাৰ সন্তুষ্টি আৰু অনুমোদন অবিহনে কোনো অভিযোগ বন্ধ কৰা নহয়।',
    
    helplinesTitle: '২৪x৭ জৰুৰীকালীন আৰু অভিযোগ হেল্পলাইন',
    railHelpline: 'ৰে’লৱে হেল্পলাইন',
    cyberHelpline: 'চাইবাৰ অপৰাধ হেল্পলাইন',
    consumerHelpline: 'গ্ৰাহক সুৰক্ষা হেল্পলাইন',
    emergencyHelpline: 'ৰাষ্ট্ৰীয় জৰুৰীকালীন সেৱা',
    
    howItWorksTitle: 'ই কেনেদৰে কাম কৰে',
    howItWorksDesc: 'অভিযোগ দাখিলৰ পৰা সমাধানলৈকে ৪টা সহজ পদক্ষেপ।',
    step1Title: '১. সমস্যাৰ বিৱৰণ দিয়ক',
    step1Desc: 'বিৱৰণ লিখক। ফটো বা স্থান যোগ কৰক।',
    step2Title: '২. সংশ্লিষ্ট কাৰ্যালয়লৈ প্ৰেৰণ',
    step2Desc: 'অভিযোগ পোনপটীয়াকৈ দায়িত্বশীল কাৰ্যালয়লৈ প্ৰেৰণ কৰা হয়।',
    step3Title: '৩. দলৰ দ্বাৰা মেৰামতি',
    step3Desc: 'কৰ্মচাৰীসকলে মেৰামতি কৰি ফটো প্ৰমাণ আপলোড কৰে।',
    step4Title: '৪. আপোনাৰ পৰীক্ষা আৰু নিষ্পত্তি',
    step4Desc: 'ফটো প্ৰমাণ চাই সন্তুষ্ট হ’লেহে অভিযোগ বন্ধ কৰক।',
    
    departmentsTitle: 'চৰকাৰী বিভাগসমূহ',
    departmentsDesc: 'অভিযোগ দাখিলৰ বাবে উপযুক্ত বিভাগ বাছক।',
    deptRailway: 'ভাৰতীয় ৰে’লৱে',
    deptRailwayDesc: 'পৰিষ্কাৰ-পৰিচ্ছন্নতা, দবাৰ সমস্যা, ষ্টেচন আৰু টিকট।',
    deptMuni: 'পৌৰ নিগম',
    deptMuniDesc: 'আৱৰ্জনা নিষ্কাশন, পথৰ পৰিষ্কাৰ-পৰিচ্ছন্নতা আৰু নলা।',
    deptWater: 'পানী যোগান আৰু নলা-নৰ্দমা',
    deptWaterDesc: 'পাইপ ফাটি যোৱা, দূষিত পানী আৰু নলা বন্ধ হোৱা।',
    deptRoads: 'পথ আৰু দলং (লোকনিৰ্মাণ বিভাগ)',
    deptRoadsDesc: 'পথৰ গাঁত, ভঙা ফুটপাথ আৰু পথৰ ক্ষতিসাধন।',
    deptPower: 'বিদ্যুৎ পৰিষদ (APDCL)',
    deptPowerDesc: 'বিদ্যুৎ কৰ্তন, ছিঙা তাঁৰ, ট্ৰান্সফৰ্মাৰৰ বিজুতি আৰু লাইট।',
    deptHealth: 'জনস্বাস্থ্য আৰু অনাময়',
    deptHealthDesc: 'মঁহ নিয়ন্ত্ৰণ, চিকিৎসালয়ৰ পৰিষ্কাৰ-পৰিচ্ছন্নতা আৰু খাদ্য সুৰক্ষা।',
    slaLabel: 'সমাধানৰ সময়সীমা',
    fileHere: 'অভিযোগ কৰক',
    guaranteeTag: 'নাগৰিক অধিকাৰ প্ৰতিশ্ৰুতি',
    guaranteeTitle: 'আপোনাৰ সন্মতি অবিহনে কোনো অভিযোগ বন্ধ নহয়',
    guaranteeDesc: 'বিষয়াসকলে নিজে নিজে বন্ধ কৰিব নোৱাৰে। ফটো প্ৰমাণ চাই আপোনাৰ সন্মতি প্ৰয়োজন।',
    guaranteeBtn: 'অভিযোগ দাখিল কৰক',
    guaranteeLearnMore: 'নাগৰিক চনদ পঢ়ক',
  }
};

// Google Translate code overrides for Indian scheduled languages
const GOOGLE_LANG_CODE_MAP = {
  kok: 'gom',        // Goan Konkani in Google Translate is 'gom'
  mni: 'mni-Mtei',   // Manipuri (Meitei)
  sat: 'sat',        // Santali
  doi: 'doi',        // Dogri
  brx: 'brx',        // Bodo
  mai: 'mai',        // Maithili
  sa: 'sa',          // Sanskrit
  ur: 'ur',          // Urdu
  or: 'or',          // Odia
};

/**
 * Clear all Google Translate cookies across root and domain variants
 */
function clearGoogleTranslateCookies() {
  if (typeof window === 'undefined') return;

  const host = window.location.hostname;
  const domainParts = host.split('.');
  const domains = ['', host, '.' + host];
  if (domainParts.length > 1) {
    domains.push('.' + domainParts.slice(-2).join('.'));
  }

  domains.forEach(d => {
    const domainStr = d ? `; domain=${d}` : '';
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${domainStr}`;
    document.cookie = `googtrans=/en/en; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${domainStr}`;
    document.cookie = `googtrans=/auto/en; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${domainStr}`;
  });

  document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'googtrans=/en/en; path=/;';
}

/**
 * Restores original English text cleanly when switching back from another language
 * without refreshing the page
 */
function restoreOriginalEnglish() {
  if (typeof window === 'undefined') return;

  // 1. Clear all translation cookies so browser knows English is active
  clearGoogleTranslateCookies();

  // 2. Trigger Google Translate's built-in "restore" or "close" button in iframe if available
  try {
    const iframes = document.querySelectorAll(
      'iframe.goog-te-banner-frame, iframe.VIpgJd-ZVi9od-ORHb-Oxf5Fd, iframe[id*=":1.container"], iframe[id*=":2.container"]'
    );
    iframes.forEach(iframe => {
      try {
        const doc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
        if (doc) {
          const btn = doc.getElementById(':1.restore') || 
                      doc.getElementById(':1.close') || 
                      doc.querySelector('button[id*="restore"], button[id*="close"], a[id*="close"], .goog-close-link');
          if (btn) {
            btn.click();
          }
        }
      } catch (err) {
        // Cross-origin restriction fallback
      }
    });
  } catch (e) {
    // Ignore error
  }

  // 3. Reset the Google Translate combo
  try {
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = '';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } catch (e) {
    // Ignore error
  }

  // 4. Clean up any remaining <font> wrapper tags inserted by Google Translate
  try {
    document.querySelectorAll('font').forEach(font => {
      const parent = font.parentNode;
      if (parent) {
        while (font.firstChild) {
          parent.insertBefore(font.firstChild, font);
        }
        parent.removeChild(font);
      }
    });
  } catch (e) {
    // Ignore error
  }

  // 5. Ensure body top remains locked at 0px
  if (document.body) {
    document.body.style.top = '0px';
  }
}

/**
 * Apply dynamic in-page Google Translate to cover all 22+ languages seamlessly
 */
function syncGoogleTranslateEngine(langCode) {
  if (typeof window === 'undefined') return;

  if (langCode === 'en') {
    restoreOriginalEnglish();
    return;
  }

  const targetCode = GOOGLE_LANG_CODE_MAP[langCode] || langCode;

  // 1. Update googtrans cookies (for both current host and parent domain)
  const cookieVal = `/en/${targetCode}`;
  document.cookie = `googtrans=${cookieVal}; path=/;`;
  const hostParts = window.location.hostname.split('.');
  if (hostParts.length > 1) {
    document.cookie = `googtrans=${cookieVal}; path=/; domain=.${hostParts.slice(-2).join('.')};`;
  }

  // 2. Trigger the Google Translate select dropdown if loaded
  const attemptTrigger = () => {
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      if (select.value !== targetCode) {
        select.value = targetCode;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      // Ensure banner remains suppressed and body top is locked at 0px
      if (document.body) {
        document.body.style.top = '0px';
      }
      return true;
    }
    return false;
  };

  if (!attemptTrigger()) {
    // Retry periodically while script finishes loading
    let retries = 0;
    const interval = setInterval(() => {
      retries++;
      if (attemptTrigger() || retries > 12) {
        clearInterval(interval);
      }
    }, 250);
  }
}

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('jansahayata_lang') || 'en';
  });

  // Synchronize Google Translate on mount
  useEffect(() => {
    if (currentLang && currentLang !== 'en') {
      syncGoogleTranslateEngine(currentLang);
    } else {
      clearGoogleTranslateCookies();
    }
  }, []);

  const setLanguage = useCallback((langCode) => {
    const prevLang = currentLang;
    setCurrentLang(langCode);
    localStorage.setItem('jansahayata_lang', langCode);

    if (langCode === 'en') {
      if (prevLang && prevLang !== 'en') {
        restoreOriginalEnglish();
      }
    } else {
      syncGoogleTranslateEngine(langCode);
    }
  }, [currentLang]);

  const t = useCallback((key) => {
    // Check if selected language has explicit native translation
    const localized = TRANSLATIONS[currentLang]?.[key];
    if (localized) return localized;
    
    // Otherwise fallback to English dictionary or key name
    return TRANSLATIONS.en[key] || key;
  }, [currentLang]);

  return (
    <LanguageContext.Provider value={{ currentLang, setLanguage, t, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
