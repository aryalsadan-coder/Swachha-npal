import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from 'recharts';
import { 
  auth, 
  db, 
  signInWithGoogle, 
  logout, 
  onAuthStateChanged, 
  collection, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  increment,
  User as FirebaseUser
} from './lib/firebase';
import { 
  APIProvider, 
  ControlPosition, 
  MapControl,
  useMapsLibrary,
  useMap
} from '@vis.gl/react-google-maps';
import { 
  Wind, Droplets, AlertTriangle, CheckCircle2, Leaf,
  Info, MapPin, Search,
  ArrowLeft, ArrowRight, ShieldCheck, Activity, Clock,
  Camera, X, RefreshCw, Eye, Globe, Menu, Upload,
  Waves, Factory, Trash2, BookOpen, ChevronRight,
  Thermometer, Beaker, ShieldAlert, User, Mail,
  FileText, AlertCircle, Plus, Users, LayoutDashboard,
  Pill, Calendar, CreditCard, Stethoscope, Briefcase,
  Layers, Package, AlertOctagon, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { getNepalPollutionData, analyzePollutionImage } from './services/gemini';
import { cn } from './utils';

// Translations
const translations = {
  en: {
    title: "Swachha Nepal",
    tagline: "Guardian of Himalayan Ecology",
    lang: "नेपाली",
    search: "Search pollution hotspots, rivers orAQI...",
    dashboard: "Dashboard",
    rivers: "River Quality",
    reports: "Citizen Reports",
    aqi: "AQI",
    wqi: "WQI",
    status: "Environmental Status",
    sources: "Pollution Sources",
    waterSafety: "Water Safety",
    industrial: "Industrial Load",
    safe: "Boiling Required",
    tracking: "Monitored",
    cached: "Locally Cached",
    savedReports: "My Pollution Reports",
    noReports: "No reports found in local memory.",
    syncing: "Syncing with Database...",
    pendingSync: "Pending Sync (Offline)",
    synced: "Synced & Verified",
    takeAction: "Take Action",
    offlineTips: "Action Guide",
    menu: {
      home: "Dashboard",
      air: "Air Quality",
      water: "River Health",
    },
    profile: {
      title: "Guardian Profile",
      name: "Sadan Aryal",
      email: "citizen@swachha.np",
      rank: "Environmental Guardian",
      points: "Impact Points",
      reportsCount: "Reports Submitted",
      badges: ["Air Monitor", "River Savior", "Early Adopter"],
      rankNames: {
        0: "Eco Novice",
        50: "Nature Protector",
        150: "Himalayan Sentinel",
        500: "Gaia Guardian"
      },
      joined: "Member Since"
    },
    report: "Report Pollution",
    reportTagline: "Help us identify pollution hotspots. Your data helps local governments prioritize river cleanups.",
    reportForm: {
      title: "File Pollution Report",
      type: "Category",
      types: ["River Waste", "Air Smog", "Illegal Dumping", "Sewage Leak", "Industrial Smoke"],
      location: "Location",
      placeholderLoc: "e.g. Bagmati River Corridor, Kathmandu",
      desc: "Detailed Observation",
      placeholderDesc: "Describe the odor, color of water, or visible medical waste...",
      submit: "Submit to Database",
      success: "Thank you! Your report has been submitted for verification."
    },
    tipDetails: {
      plastic: {
        title: "Stop Plastic Pollution",
        desc: "Plastic bottles and bags are clogging our river systems. One bottle takes 450 years to decompose.",
        processTitle: "Best Practices",
        steps: ["Carry a reusable water bottle.", "Refuse plastic straws at cafes.", "Support local recycling initiatives.", "Participate in river-side cleanups."]
      },
      transport: {
        title: "Clean Commute",
        desc: "Vehicle emissions are the #1 cause of PM2.5 in Kathmandu Valley. Switching to clean energy saves lives.",
        processTitle: "Action Plan",
        images: [
          "https://upload.wikimedia.org/wikipedia/commons/e/e0/Sajha_Yatayat_Bus.jpg",
          "https://upload.wikimedia.org/wikipedia/commons/2/2a/Electric_Tempo_Kathmandu.jpg",
          "https://upload.wikimedia.org/wikipedia/commons/1/1b/Kathmandu_Traffic.jpg"
        ],
        steps: ["Use Sajha Yatayat for long commutes.", "Charge your EV at designated stations.", "Carpool with colleagues.", "Keep your vehicle emission-test updated."]
      },
      water: {
        title: "Monitor River Health",
        desc: "Our sacred rivers are ecosystem lifelines. Regular monitoring helps prevent water-borne disease outbreaks.",
        processTitle: "Guardian Steps",
        guideImg: "https://upload.wikimedia.org/wikipedia/commons/8/82/Bagmati_River_Kathmandu.jpg",
        steps: ["Report sewage leakage immediately.", "Avoid washing clothes near river banks.", "Check local WQI before fishing.", "Support upstream forest conservation."]
      },
      waste: {
        title: "Zero Waste Home",
        desc: "80% of urban waste in Nepal can be composted. Reduce the burden on landfills like Sisdole.",
        processTitle: "Implementation",
        pollutionImg: "https://upload.wikimedia.org/wikipedia/commons/4/41/Waste_management_Kathmandu.jpg",
        steps: ["Start a kitchen compost bin.", "Sell 'Kabaad' items to recyclers.", "Avoid open burning of leaves/waste.", "Use eco-friendly packaging."]
      }
    },
    knowledge: {
      title: "Environmental Knowledge Base",
      air: {
        title: "Air Health",
        desc: "Kathmandu's air quality often exceeds WHO limits. Learn how to stay safe during smog episodes."
      },
      water: {
        title: "Water Health",
        desc: "Our rivers are cultural and ecological treasures. Keep them free from sewage and plastics.",
        lakesTitle: "Major Lakes",
        riversTitle: "Major Rivers",
        wqiScale: "WQI Scale: 0-40 Critical | 40-70 Moderate | 70-100 Healthy"
      },
      prevention: {
        title: "Prevention",
        desc: "Small changes lead to national impact. Switch to clean energy and reduce household waste."
      },
      role: {
        title: "Swachha Nepal's Role",
        desc: "We bridge data with action, empowering citizens to monitor and report for a cleaner future."
      }
    }
  },
  ne: {
    title: "स्वच्छ नेपाल",
    tagline: "हिमाली पारिस्थितिकीको संरक्षक",
    lang: "English",
    search: "प्रदूषणका क्षेत्रहरू, नदी वा AQI खोज्नुहोस्...",
    dashboard: "ड्यासबोर्ड",
    rivers: "नदीको गुणस्तर",
    reports: "नागरिक रिपोर्टहरू",
    aqi: "AQI",
    wqi: "WQI",
    status: "वातावरणीय स्थिति",
    sources: "प्रदूषणका स्रोतहरू",
    waterSafety: "पानीको सुरक्षा",
    industrial: "औद्योगिक भार",
    safe: "उमालेर मात्र",
    tracking: "अनुगमन गरिएको",
    cached: "स्थानीय भण्डारण",
    savedReports: "मेरा प्रदूषण रिपोर्टहरू",
    noReports: "स्थानीय मेमोरीमा कुनै रिपोर्टहरू फेला परेनन्।",
    syncing: "डाटाबेसमा सिङ्क हुँदै...",
    pendingSync: "सिङ्क बाँकी (अफलाइन)",
    synced: "सिङ्क र प्रमाणीकरण गरिएको",
    takeAction: "कदम चाल्नुहोस्",
    offlineTips: "कार्य मार्गनिर्देशन",
    menu: {
      home: "ड्यासबोर्ड",
      air: "वायु गुणस्तर",
      water: "नदी स्वास्थ्य",
    },
    profile: {
      title: "संरक्षक प्रोफाइल",
      name: "सदन अर्याल",
      email: "citizen@swachha.np",
      rank: "वातावरणीय संरक्षक",
      points: "प्रभाव बिन्दुहरू",
      reportsCount: "पेस गरिएका रिपोर्टहरू",
      badges: ["वायु अनुगमनकर्ता", "नदी सम्बर्धक", "प्रारम्भिक प्रयोगकर्ता"],
      rankNames: {
        0: "पर्यवेक्षक",
        50: "प्रकृति सम्बर्धक",
        150: "हिमाली रक्षक",
        500: "धर्ती संरक्षक"
      },
      joined: "सदस्यता मिति"
    },
    report: "प्रदूषण रिपोर्ट",
    reportTagline: "हामीलाई प्रदूषणका हटस्पटहरू पहिचान गर्न मद्दत गर्नुहोस्। तपाईंको तथ्याङ्कले नदी सफाइमा मद्दत पुर्याउँछ।",
    reportForm: {
      title: "प्रदूषण रिपोर्ट पेस गर्नुहोस्",
      type: "प्रकार",
      types: ["नदीको फोहोर", "वायु प्रदूषण", "अवैध फोहोर", "ढल चुहावट", "औद्योगिक धुवाँ"],
      location: "स्थान",
      placeholderLoc: "उदाहरण: बागमती कोरिडोर, काठमाडौं",
      desc: "विस्तृत विवरण",
      placeholderDesc: "नदीको गन्ध, रङ वा मेडिकल फोहोरको विवरण दिनुहोस्...",
      submit: "डाटाबेसमा पेस गर्नुहोस्",
      success: "धन्यवाद! तपाईंको रिपोर्ट प्रमाणीकरणका लागि पेस गरिएको छ।"
    },
    tipDetails: {
      plastic: {
        title: "प्लास्टिक प्रदूषण रोक्नुहोस्",
        desc: "प्लास्टिकका बोतल र झोलाहरूले हाम्रो नदी प्रणालीलाई बन्द गर्दैछन्। एउटा बोतल कुहिन ४५० वर्ष लाग्छ।",
        processTitle: "उत्तम अभ्यासहरू",
        steps: ["पुन: प्रयोगयोग्य पानीको बोतल बोक्नुहोस्।", "क्याफेहरूमा प्लास्टिकका स्ट्राहरू प्रयोग नगर्नुहोस्।", "स्थानीय पुन: चक्रण पहलहरूलाई समर्थन गर्नुहोस्।", "नदी किनारको सरसफाइमा भाग लिनुहोस्।"]
      },
      transport: {
        title: "स्वच्छ यातायात",
        desc: "काठमाडौं उपत्यकामा PM2.5 को मुख्य कारण सवारी साधनको उत्सर्जन हो। स्वच्छ ऊर्जामा जाँदा जीवन बच्छ।",
        processTitle: "कार्य योजना",
        images: [
          "https://upload.wikimedia.org/wikipedia/commons/e/e0/Sajha_Yatayat_Bus.jpg",
          "https://upload.wikimedia.org/wikipedia/commons/2/2a/Electric_Tempo_Kathmandu.jpg",
          "https://upload.wikimedia.org/wikipedia/commons/1/1b/Kathmandu_Traffic.jpg"
        ],
        steps: ["लामो दूरीका लागि साझा यातायात प्रयोग गर्नुहोस्।", "निर्धारित स्टेशनहरूमा आफ्नो विद्युतीय सवारी चार्ज गर्नुहोस्।", "सहकर्मीहरूसँग कारपुल गर्नुहोस्।", "आफ्नो सवारीको प्रदूषण परीक्षण अद्यावधिक राख्नुहोस्।"]
      },
      water: {
        title: "नदी स्वास्थ्यको अनुगमन",
        desc: "हाम्रा पवित्र नदीहरू पारिस्थितिक प्रणालीका जीवनरेखा हुन्। नियमित अनुगमनले जलजन्य रोगको प्रकोप रोक्न मद्दत गर्छ।",
        processTitle: "संरक्षक कदमहरू",
        guideImg: "https://upload.wikimedia.org/wikipedia/commons/8/82/Bagmati_River_Kathmandu.jpg",
        steps: ["ढल चुहावटको तुरुन्तै रिपोर्ट गर्नुहोस्।", "नदी किनारमा लुगा धुने काम नगर्नुहोस्।", "माछा मार्नु अघि स्थानीय WQI जाँच गर्नुहोस्।", "माथिल्लो तटीय वन संरक्षणमा सहयोग गर्नुहोस्।"]
      },
      waste: {
        title: "शून्य फोहोर घर",
        desc: "नेपालको सहरी क्षेत्रको ८०% फोहोर कम्पोस्ट बनाउन सकिन्छ। सिसडोल जस्ता ल्यान्डफिलहरूको भार कम गर्नुहोस्।",
        processTitle: "कार्यान्वयन",
        pollutionImg: "https://upload.wikimedia.org/wikipedia/commons/4/41/Waste_management_Kathmandu.jpg",
        steps: ["भान्छाको फोहोरबाट कम्पोस्ट बनाउन सुरु गर्नुहोस्।", "पत्रु सामान संकलकलाई बेच्नुहोस्।", "पात वा फोहोर खुला रूपमा जलाउनु हुँदैन।", "वातावरणमैत्री प्याकेजिङ प्रयोग गर्नुहोस्।"]
      }
    },
    knowledge: {
      title: "वातावरणीय ज्ञान केन्द्र",
      air: {
        title: "वायु स्वास्थ्य",
        desc: "१. काठमाडौंको वायु गुणस्तर प्रायः विश्व स्वास्थ्य संगठनको मापदण्डभन्दा बाहिर हुन्छ।\n२. वायु प्रदूषणले हृदय रोग र फोक्सोको क्यान्सरको जोखिम बढाउँछ।\n३. बालबालिका र वृद्धवृद्धाहरू खराब हावाबाट बढी प्रभावित हुन्छन्।\n४. सडकको धुलो र पुराना सवारी साधनहरू प्रदूषणका मुख्य कारण हुन्।\n५. स्वच्छ हावाले हाम्रो प्रतिरक्षा प्रणालीको सन्तुलन कायम राख्छ।\n६. हिमालयको उचाइमा अक्सिजनको चाप कम हुन्छ, जसले स्वास्थ्यमा असर गर्छ।\n७. स्वच्छ हावाले दम र क्रोनिक ब्रोन्काइटिस जस्ता श्वासप्रश्वासका रोगहरू रोक्छ।\n८. राष्ट्रिय निकुञ्जहरूको संरक्षणले अक्सिजन दिने जैविक विविधता जोगाउन मद्दत गर्छ।\n९. तीव्र सहरीकरणले हरियाली क्षेत्र घटाउँदैछ, जसले वायुको गुणस्तर कम गर्छ।\n१०. हामीले फेर्ने प्रत्येक श्वास हाम्रो प्राकृतिक वातावरणको स्वास्थ्यमा निर्भर गर्दछ।"
      },
      water: {
        title: "पानीको स्वास्थ्य",
        desc: "१. नेपाल जलस्रोतमा विश्वकै धनी देशहरूमध्ये एक हो।\n२. बागमती र विष्णुमती जस्ता नदीहरू सांस्कृतिक र पारिस्थितिक रूपमा महत्त्वपूर्ण छन्।\n३. पिउने पानी, सरसफाइ र जलविद्युत ऊर्जाका लागि स्वच्छ पानी आवश्यक छ।\n४. हिमालयको हिउँ पग्लिएर तल्लो तटीय क्षेत्रका लाखौं मानिसलाई पानी उपलब्ध हुन्छ।\n५. ढल र औद्योगिक फोहोरको प्रदूषणले हाम्रो नदी पारिस्थितिक प्रणालीलाई खतरामा पार्छ।\n६. धेरै क्षेत्रहरूमा जलजन्य रोगहरू अझै पनि ठूलो स्वास्थ्य जोखिमको रूपमा रहेका छन्।\n७. जलाधार क्षेत्रको संरक्षणले पहिरो रोक्छ र पानीको निरन्तर बहाव सुनिश्चित गर्छ।\n८. परम्परागत 'ढुङ्गे धारा' हरू महत्त्वपूर्ण सांस्कृतिक जलस्रोत हुन्।\n९. नेपालको कृषि र आर्थिक समृद्धिका लागि दिगो सिँचाइ मुख्य कुरा हो।\n१०. पानीको गुणस्तर जोगाउनु नेपालका सबै नागरिकको पवित्र कर्तव्य हो।",
        lakesTitle: "प्रमुख तालहरू",
        riversTitle: "ठूला नदीहरू",
        wqiScale: "WQI मापदण्ड: ०-४० गम्भीर | ४०-७० मध्यम | ७०-१०० स्वस्थ"
      },
      prevention: {
        title: "रोकथाम",
        desc: "१. सहरी धुवाँ र उत्सर्जन कम गर्न विद्युतीय सवारी साधन (EVs) मा जानुहोस्।\n२. घरपरिवार र कृषिजन्य फोहोर खुला रूपमा जलाउन तुरुन्तै बन्द गर्नुहोस्।\n३. सामुदायिक वन र सहरी सडक किनारमा स्थानीय रूखहरू रोप्नुहोस्।\n४. भूमिगत पानी जोगाउन घरहरूमा आकाशे पानी संकलन प्रणाली जडान गर्नुहोस्।\n५. घरमा सुरक्षित पिउने पानीका लागि बायो-स्यान्ड फिल्टर वा उमाल्ने विधि प्रयोग गर्नुहोस्।\n६. स्थानीय खोला र नदीहरूमा प्लास्टिक, रसायन वा तेल फाल्नबाट बच्नुहोस्।\n७. 'स्वच्छ बागमती' र नदी पुनरुत्थान अभियानहरूमा सहयोग र सहभागिता जनाउनुहोस्।\n८. भित्री प्रदूषण कम गर्न सौर्य ऊर्जा र स्वच्छ खाना पकाउने इन्धनलाई बढावा दिनुहोस्।\n९. स्रोतमा नै फोहोरको वर्गीकरण (जैविक र अजैविक) कडाइका साथ लागू गर्नुहोस्।\n१०. बलियो वातावरणीय नियमहरू र सामुदायिक कार्यान्वयनको वकालत गर्नुहोस्।"
      },
      role: {
        title: "स्वच्छ नेपालको भूमिका",
        desc: "१. हामी सबै प्रदेशहरूमा वायु गुणस्तर (AQI) को वास्तविक समयको अनुगमन प्रदान गर्दछौं।\n२. हाम्रो प्लेटफर्मले नदीको स्वास्थ्यको नक्सांकन गरी प्रदूषणका हटस्पटहरू पहिचान गर्दछ।\n३. हामी नागरिकहरूलाई वातावरणीय उल्लंघनका घटनाहरू सिधै अधिकारीहरूलाई रिपोर्ट गर्न सशक्त बनाउँछौं।\n४. हामी वैज्ञानिक तथ्याङ्क र सामुदायिक कार्यबीचको खाडललाई कम गर्छौं।\n५. स्वच्छ नेपालले स्थानीय सरसफाइ अभियान र चेतनामूलक कार्यक्रमहरू आयोजना गर्दछ।\n६. हामी राम्रो फोहोर व्यवस्थापन प्रणालीका लागि स्थानीय सरकारहरूसँग सहकार्य गर्छौं।\n७. हाम्रो एपले दिगो र वातावरणमैत्री जीवनका लागि अफलाइन सुझावहरू प्रदान गर्दछ।\n८. हामी राष्ट्रिय मापदण्डहरूको पालना सुनिश्चित गर्न औद्योगिक उत्सर्जनको ट्र्याक गर्छौं।\n९. हामी नेपालको अद्वितीय हिमालयन पारिस्थितिक प्रणालीको संरक्षणको वकालत गर्छौं।\n१०. सँगै मिलेर, हामी सबैका लागि स्वच्छ, हरियो र स्वस्थ नेपाल निर्माण गर्दैछौं।"
      }
    }
  }
};

const MAJOR_WATER_BODIES = {
  rivers: [
    { name: "Bagmati", location: "Kathmandu Valley", wqi: 25, status: "Critical", desc: "Heavy industrial & sewage discharge in urban areas." },
    { name: "Koshi", location: "Eastern Nepal", wqi: 75, status: "Good", desc: "Flood siltation & moderate agricultural runoff." },
    { name: "Gandaki", location: "Central/Western", wqi: 82, status: "Excellent", desc: "Pristine mountain source, monitor downstream." },
    { name: "Karnali", location: "Far-Western", wqi: 90, status: "Pristine", desc: "Wild river, minimal human interference." },
    { name: "Bishnumati", location: "Kathmandu", wqi: 18, status: "Toxic", desc: "Heavily polluted from urban waste & encroachment." },
    { name: "Narayani", location: "Chitwan/Terai", wqi: 62, status: "Moderate", desc: "Industrial hotspots near Narayangarh." }
  ],
  lakes: [
    { name: "Rara Lake", location: "Mugu", wqi: 98, status: "Pristine", desc: "Untouched alpine water, protected ecosystem." },
    { name: "Phewa Lake", location: "Pokhara", wqi: 45, status: "Polluted", desc: "Encroachment & lake-side tourism pollution." },
    { name: "Shey Phoksundo", location: "Dolpa", wqi: 99, status: "Pristine", desc: "Highest transparency, deep blue water." },
    { name: "Tilicho Lake", location: "Manang", wqi: 95, status: "Clean", desc: "Glacial melt, extreme high altitude stability." },
    { name: "Begnas Lake", location: "Pokhara", wqi: 72, status: "Good", desc: "Relatively clean compared to nearby Phewa." },
    { name: "Gosaikunda", location: "Rasuwa", wqi: 88, status: "Holy/Clean", desc: "Seasonal pilgrim impact, naturally filtered." }
  ]
};

const NEPAL_PROVINCES = [
  { id: 'p1', name: 'Koshi', aqi: 85, wqi: 70, status: 'Moderate', color: '#3b82f6', path: "M661,224 L685,228 L710,225 L735,215 L760,208 L774,204 L782,230 L787,270 L787,330 L765,355 L736,380 L695,365 L649,343 L631,234 Z" },
  { id: 'p2', name: 'Madhesh', aqi: 180, wqi: 45, status: 'Polluted', color: '#facc15', path: "M544,383 L600,380 L660,378 L710,385 L750,381 L774,420 L700,435 L620,445 L538,443 L544,383 Z" },
  { id: 'p3', name: 'Bagmati', aqi: 165, wqi: 60, status: 'Polluted', color: '#ec4899', path: "M465,231 L500,215 L540,203 L580,210 L620,218 L662,223 L648,343 L600,360 L544,382 L500,365 L468,349 L465,231 Z" },
  { id: 'p4', name: 'Gandaki', aqi: 45, wqi: 90, status: 'Clean', color: '#06b6d4', path: "M367,143 L420,165 L480,185 L538,203 L500,240 L468,349 L410,335 L359,321 L367,143 Z" },
  { id: 'p5', name: 'Lumbini', aqi: 95, wqi: 75, status: 'Moderate', color: '#84cc16', path: "M216,420 L300,425 L380,422 L457,419 L468,350 L410,335 L360,323 L300,330 L256,325 L211,282 L218,340 L216,420 Z" },
  { id: 'p6', name: 'Karnali', aqi: 35, wqi: 95, status: 'Clean', color: '#0ea5e9', path: "M136,101 L200,115 L280,125 L366,143 L359,321 L300,330 L257,324 L200,245 L161,202 L136,101 Z" },
  { id: 'p7', name: 'Sudurpashchim', aqi: 55, wqi: 80, status: 'Clean', color: '#ef4444', path: "M25,145 L50,135 L68,85 L110,85 L136,101 L161,202 L211,282 L150,305 L112,323 L37,288 L25,145 Z" }
];

const NEPAL_OUTLINE = "M25,145 L50,135 L68,85 L110,85 L136,101 L200,115 L280,125 L366,143 L420,165 L480,185 L538,203 L580,210 L620,218 L662,223 L735,215 L774,204 L787,270 L787,330 L774,420 L700,435 L620,445 L538,443 L457,419 L380,422 L300,425 L216,420 L112,323 L37,288 L25,145 Z";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

// Location Search Component
function LocationSearch({ t, onSearch }: { t: any, onSearch: (val: string) => void }) {
  const [searchValue, setSearchValue] = useState("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const placesLib = useMapsLibrary('places');
  const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  useEffect(() => {
    if (placesLib) {
      sessionToken.current = new placesLib.AutocompleteSessionToken();
    }
  }, [placesLib]);

  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY') {
    return (
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-[10px] text-slate-500 flex items-center justify-between group">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
            <Search size={14} className="text-slate-400" />
          </div>
          <div>
            <p className="font-bold text-slate-700">Google Maps Search Unavailable</p>
            <p>Add <code>GOOGLE_MAPS_PLATFORM_KEY</code> in Settings to enable real-time search.</p>
          </div>
        </div>
        <Globe size={20} className="text-slate-200 group-hover:text-blue-400 transition-colors" />
      </div>
    );
  }

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (!value || !placesLib) {
      setPredictions([]);
      return;
    }

    const service = new placesLib.AutocompleteService();
    service.getPlacePredictions(
      {
        input: value,
        sessionToken: sessionToken.current!,
        componentRestrictions: { country: 'np' }
      },
      (results) => {
        setPredictions(results || []);
        setShowPredictions(true);
      }
    );
  };

  const handleSelect = (pred: google.maps.places.AutocompletePrediction) => {
    setSearchValue(pred.description);
    setPredictions([]);
    setShowPredictions(false);
    onSearch(pred.description);
  };

  return (
    <div className="relative group z-[70]">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ochre-400 group-focus-within:text-ochre-600 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder={t.search}
          className="w-full bg-ochre-50 border border-ochre-100 rounded-2xl py-4 pl-12 pr-4 text-ochre-900 focus:ring-2 focus:ring-ochre-500 outline-none shadow-sm transition-all"
          value={searchValue}
          onChange={handleInputChange}
          onFocus={() => predictions.length > 0 && setShowPredictions(true)}
        />
      </div>
      
      <AnimatePresence>
        {showPredictions && predictions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute mt-2 w-full bg-white border border-ochre-100 rounded-2xl shadow-xl overflow-hidden z-[80]"
          >
            {predictions.map((p) => (
              <button
                key={p.place_id}
                onClick={() => handleSelect(p)}
                className="w-full text-left px-6 py-4 hover:bg-ochre-50 transition-colors border-b border-ochre-50 last:border-none flex items-center gap-3"
              >
                <MapPin size={16} className="text-ochre-400" />
                <span className="text-sm font-medium text-slate-700">{p.description}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const OFFLINE_TIPS = [
  { id: 'plastic', title: "Reduce Plastic", desc: "Use cloth bags instead of single-use plastic.", icon: <Trash2 size={20} /> },
  { id: 'transport', title: "Public Transport", desc: "Use Sajha Yatayat or electric tempos to reduce smog.", icon: <Activity size={20} /> },
  { id: 'water', title: "Water Saving", desc: "Harvest rainwater for gardening and cleaning.", icon: <Droplets size={20} /> },
  { id: 'waste', title: "Waste Segregation", desc: "Separate organic and inorganic waste at home.", icon: <Factory size={20} /> }
];

export default function App() {
  const [lang, setLang] = useState<'en' | 'ne'>('en');
  const t = translations[lang];
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const [location, setLocation] = useState('Kathmandu');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cachedReports, setCachedReports] = useState<any[]>([]);
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [selectedTipId, setSelectedTipId] = useState<string | null>(null);
  const [mapTooltip, setMapTooltip] = useState<{ id: string; x: number; y: number } | null>(null);
  const [riversData, setRiversData] = useState(MAJOR_WATER_BODIES.rivers);
  const [lakesData, setLakesData] = useState(MAJOR_WATER_BODIES.lakes);

  // Simulate real-time water quality updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRiversData(prev => prev.map(river => {
        const fluctuate = Math.random() > 0.5;
        if (fluctuate) {
          const change = Math.floor(Math.random() * 5) - 2;
          const newWqi = Math.max(10, Math.min(95, river.wqi + change));
          let newStatus = river.status;
          if (newWqi > 85) newStatus = "Pristine";
          else if (newWqi > 75) newStatus = "Excellent";
          else if (newWqi > 60) newStatus = "Good";
          else if (newWqi > 40) newStatus = "Moderate";
          else newStatus = "Critical";
          return { ...river, wqi: newWqi, status: newStatus };
        }
        return river;
      }));
      setLakesData(prev => prev.map(lake => {
        const fluctuate = Math.random() > 0.7;
        if (fluctuate) {
          const change = Math.floor(Math.random() * 3) - 1;
          const newWqi = Math.max(10, Math.min(99, lake.wqi + change));
          let newStatus = lake.status;
          if (newWqi > 85) newStatus = "Pristine";
          else if (newWqi > 60) newStatus = "Good";
          else if (newWqi > 40) newStatus = "Moderate";
          else newStatus = "Polluted";
          return { ...lake, wqi: newWqi, status: newStatus };
        }
        return lake;
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Sync user profile
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        // Listen for real-time updates to points/badges
        profileUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            // Initialize profile if not exists
            const initialProfile = {
              uid: currentUser.uid,
              displayName: currentUser.displayName || 'Guardian',
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              points: 0,
              badges: ['Early Adopter'],
              joinedAt: new Date().toISOString()
            };
            setDoc(userDocRef, initialProfile);
            setUserProfile(initialProfile);
          }
        });
      } else {
        setUserProfile(null);
        if (profileUnsubscribe) profileUnsubscribe();
      }
    });

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingReports();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial Cache
    const savedKnowledge = localStorage.getItem('sn_knowledge');
    if (!savedKnowledge) {
      localStorage.setItem('sn_knowledge', JSON.stringify(translations.en.knowledge));
    }

    const savedReports = localStorage.getItem('sn_reports');
    if (savedReports) {
      setCachedReports(JSON.parse(savedReports));
    }

    const savedPending = localStorage.getItem('sn_pending_reports');
    if (savedPending) {
      const pending = JSON.parse(savedPending);
      setPendingReports(pending);
      if (navigator.onLine) syncPendingReports(pending);
    }

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const [showCamera, setShowCamera] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'air' | 'water' | 'reports' | 'profile'>('home');
  const [mapMode, setMapMode] = useState<'air' | 'water'>('air');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState({
    type: '',
    location: '',
    description: '',
    image: null as string | null
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData(location);
  }, []);

  const fetchData = async (loc: string) => {
    if (!navigator.onLine) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await getNepalPollutionData(loc);
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(searchQuery);
      fetchData(searchQuery);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    setImageAnalysis(null);
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied.");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        if (videoRef.current.srcObject) {
          (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        }
        setShowCamera(false);
        handleAnalyzeImage(imageData);
      }
    }
  };

  const handleAnalyzeImage = async (base64: string) => {
    setAnalyzingImage(true);
    setReportData(prev => ({ ...prev, image: base64 }));
    
    if (!navigator.onLine) {
      setImageAnalysis("Offline: Analysis requires an internet connection. However, your report has been drafted and ready for manual submission.");
      setAnalyzingImage(false);
      return;
    }

    try {
      const result = await analyzePollutionImage(base64);
      setImageAnalysis(result || "Analysis failed.");
      // Pre-fill description with AI summary if possible
      if (result) {
        setReportData(prev => ({ 
          ...prev, 
          description: result.split('\n')[0].replace(/[*#]/g, '') 
        }));
      }
    } catch (error) {
      setImageAnalysis("Error analyzing image.");
    } finally {
      setAnalyzingImage(false);
    }
  };

  const syncPendingReports = async (pendingToSync?: any[]) => {
    const list = pendingToSync || JSON.parse(localStorage.getItem('sn_pending_reports') || '[]');
    if (list.length === 0 || !navigator.onLine || !auth.currentUser) return;

    setIsSyncing(true);
    console.log(`Attempting to sync ${list.length} reports...`);
    const successfulSyncs: any[] = [];
    
    for (const report of list) {
      try {
        await addDoc(collection(db, 'reports'), {
          ...report.data,
          createdAt: serverTimestamp()
        });
        successfulSyncs.push(report.id);
      } catch (err) {
        console.error("Failed to sync individual report:", err);
      }
    }

    if (successfulSyncs.length > 0) {
      const remainingPending = list.filter((r: any) => !successfulSyncs.includes(r.id));
      setPendingReports(remainingPending);
      localStorage.setItem('sn_pending_reports', JSON.stringify(remainingPending));
      
      // Update cached reports view
      const savedReports = JSON.parse(localStorage.getItem('sn_reports') || '[]');
      const updatedReports = savedReports.map((r: any) => 
        successfulSyncs.includes(r.id) ? { ...r, status: 'Synced' } : r
      );
      setCachedReports(updatedReports);
      localStorage.setItem('sn_reports', JSON.stringify(updatedReports));
    }
    setIsSyncing(false);
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setLoading(true);

    const newReportId = Date.now();
    const reportPayload = {
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      location: reportData.location,
      description: reportData.description,
      type: reportData.type,
      photoUrl: reportData.image,
      status: 'pending'
    };

    const uiReport = {
      ...reportData,
      id: newReportId,
      date: new Date().toLocaleString(),
      status: navigator.onLine ? 'Syncing...' : 'Pending Sync'
    };

    // Add to UI cache immediately
    const updatedReports = [uiReport, ...cachedReports];
    setCachedReports(updatedReports);
    localStorage.setItem('sn_reports', JSON.stringify(updatedReports));

    if (!navigator.onLine) {
      // Save to outbox
      const pending = [...pendingReports, { id: newReportId, data: reportPayload }];
      setPendingReports(pending);
      localStorage.setItem('sn_pending_reports', JSON.stringify(pending));
      
      setLoading(false);
      setShowReportForm(false);
      setCapturedImage(null);
      setReportData({ type: '', location: '', description: '', image: null });
      alert("Offline: Report saved locally. It will sync automatically when you are back online.");
      return;
    }

    try {
      // Award points for participation (even if pending verification)
      const userRef = doc(db, 'users', user.uid);
      
      await addDoc(collection(db, 'reports'), {
        ...reportPayload,
        createdAt: serverTimestamp()
      });

      // Update points and check for new badges
      const newPoints = (userProfile?.points || 0) + 10;
      const newBadges = [...(userProfile?.badges || [])];
      
      if (newPoints >= 50 && !newBadges.includes('Nature Protector')) newBadges.push('Nature Protector');
      if (newPoints >= 150 && !newBadges.includes('Himalayan Sentinel')) newBadges.push('Himalayan Sentinel');
      
      await updateDoc(userRef, {
        points: increment(10),
        badges: newBadges
      });

      // Update status to Synced
      const finalizedReports = updatedReports.map(r => 
        r.id === newReportId ? { ...r, status: 'Synced' } : r
      );
      setCachedReports(finalizedReports);
      localStorage.setItem('sn_reports', JSON.stringify(finalizedReports));

      setShowReportForm(false);
      setCapturedImage(null);
      setImageAnalysis(null);
      setShowCamera(false);
      setReportData({ type: '', location: '', description: '', image: null });
      alert(t.reportForm.success);
    } catch (err) {
      console.error("Submission error:", err);
      // Even if firestore fail (e.g. timeout but online), save to pending
      const pending = [...pendingReports, { id: newReportId, data: reportPayload }];
      setPendingReports(pending);
      localStorage.setItem('sn_pending_reports', JSON.stringify(pending));
      alert("Network Error: Report saved to outbox and will retry later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCapturedImage(base64);
        setShowCamera(false);
        handleAnalyzeImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} version="weekly">
      <div className="min-h-screen flex flex-col bg-white font-sans">
        {/* Offline & Sync Banner */}
      <AnimatePresence>
        {(!isOnline || pendingReports.length > 0) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={cn(
              "text-white text-[10px] py-1.5 px-4 flex items-center justify-center gap-4 font-bold uppercase tracking-widest sticky top-0 z-[60] shadow-md transition-colors",
              isOnline ? "bg-ochre-600" : "bg-red-600"
            )}
          >
            <div className="flex items-center gap-2">
              {isOnline ? <Activity size={12} /> : <ShieldAlert size={12} />}
              <span>
                {!isOnline ? "Offline Mode: Using Local Cache" : "Connected: Ready to Sync"}
              </span>
            </div>

            {pendingReports.length > 0 && (
              <div className="flex items-center gap-3 border-l border-white/20 pl-4">
                <span className="flex items-center gap-1.5">
                  <Clock size={12} />
                  {pendingReports.length} {pendingReports.length === 1 ? 'Report' : 'Reports'} Pending
                </span>
                
                {isOnline && (
                  <button
                    onClick={() => syncPendingReports()}
                    disabled={isSyncing || !auth.currentUser}
                    className="flex items-center gap-1.5 bg-white text-ochre-700 px-3 py-1 rounded-full hover:bg-ochre-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white"
                  >
                    {isSyncing ? (
                      <RefreshCw size={10} className="animate-spin" />
                    ) : (
                      <Upload size={10} />
                    )}
                    {isSyncing ? "Syncing..." : "Sync Now"}
                  </button>
                )}
                
                {!auth.currentUser && isOnline && (
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="underline text-white/90 hover:text-white"
                  >
                    Login to Sync
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-ochre-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-ochre-700 hover:bg-ochre-50 rounded-lg transition-colors border border-ochre-100/50"
              >
                <Menu size={24} />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-ochre-100 overflow-hidden z-[60]"
                  >
                    <div className="p-2 space-y-1">
                      <button 
                        onClick={() => { setShowMenu(false); setActiveView('home'); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-ochre-700 hover:bg-ochre-50 rounded-xl transition-colors"
                      >
                        <BookOpen size={18} className="text-ochre-500" />
                        {t.menu.home}
                      </button>
                      <button 
                        onClick={() => { setShowMenu(false); setMapMode('air'); setActiveView('air'); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-ochre-700 hover:bg-ochre-50 rounded-xl transition-colors"
                      >
                        <Wind size={18} className="text-ochre-500" />
                        {t.menu.air}
                      </button>
                      <button 
                        onClick={() => { setShowMenu(false); setMapMode('water'); setActiveView('water'); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-ochre-700 hover:bg-ochre-50 rounded-xl transition-colors"
                      >
                        <Waves size={18} className="text-blue-500" />
                        {t.menu.water}
                      </button>
                      <button 
                        onClick={() => { setShowMenu(false); setActiveView('profile'); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-ochre-700 hover:bg-ochre-50 rounded-xl transition-colors"
                      >
                        <User size={18} className="text-ochre-500" />
                        {t.profile.title}
                      </button>
                      <button 
                        onClick={() => { setShowMenu(false); setActiveView('reports'); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-ochre-700 hover:bg-ochre-50 rounded-xl transition-colors border-t border-ochre-50 mt-1 pt-3"
                      >
                        <ShieldCheck size={18} className="text-emerald-500" />
                        {t.savedReports}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'en' ? 'ne' : 'en')}
              className="flex items-center gap-1.5 text-sm font-bold text-ochre-600 hover:text-ochre-800 transition-all bg-ochre-50 px-3 py-2 rounded-xl border border-ochre-100"
            >
              <Globe size={16} /> {t.lang}
            </button>

            {user ? (
              <button 
                onClick={logout}
                className="hidden md:flex items-center gap-2 text-sm font-bold text-red-600 border border-red-100 bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="hidden md:flex items-center gap-2 text-sm font-bold text-white bg-ochre-600 px-4 py-2 rounded-xl hover:bg-ochre-700 transition-colors shadow-sm"
              >
                Login
              </button>
            )}
          </div>
          </div>

          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => user ? setActiveView('profile') : setShowLoginModal(true)}>
            <div className="flex flex-col items-end text-right">
              <span className="font-bold text-lg leading-none text-ochre-900 group-hover:text-ochre-600 transition-colors">{t.title}</span>
              <span className="text-[10px] text-ochre-500 font-medium uppercase tracking-wider hidden sm:block">
                {user ? `Guardian: ${user.displayName?.split(' ')[0]}` : t.tagline}
              </span>
            </div>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-xl shadow-lg border-2 border-ochre-100 group-hover:scale-105 transition-transform" />
            ) : (
              <div className="w-10 h-10 bg-ochre-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                {user ? <User size={24} /> : <Leaf size={24} />}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-10">
        <AnimatePresence mode="wait">
          {activeView === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              {/* Environmental Knowledge Section */}
              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="text-left space-y-2">
                    <h2 className="text-3xl font-bold text-ochre-900">{t.knowledge.title}</h2>
                    <div className="h-1 w-20 bg-ochre-500 rounded-full" />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-100 shadow-sm">
                    <CheckCircle2 size={12} />
                    {t.cached}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    onClick={() => { setActiveView('air'); setMapMode('air'); }}
                    className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 space-y-4 cursor-pointer relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                        <Wind size={24} />
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{t.aqi}</span>
                        <span className="text-xl font-black text-emerald-700">{data?.data?.aqi || '158'}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-emerald-900 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{t.knowledge.air.title}</h3>
                    <p className="text-emerald-800/80 leading-relaxed text-sm whitespace-pre-line">
                      {t.knowledge.air.desc}
                    </p>
                    <div className="pt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                      <span>Live Air Quality Stats</span>
                      <ChevronRight size={12} />
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -5 }}
                    onClick={() => { setActiveView('water'); setMapMode('water'); }}
                    className="bg-blue-50 p-8 rounded-3xl border border-blue-100 space-y-4 cursor-pointer relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                        <Droplets size={24} />
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{t.wqi}</span>
                        <span className="text-xl font-black text-blue-700">65</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-blue-900 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{t.knowledge.water.title}</h3>
                    <p className="text-blue-800/80 leading-relaxed text-sm whitespace-pre-line">
                      {t.knowledge.water.desc}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-blue-200/50">
                      {MAJOR_WATER_BODIES.rivers.slice(0, 3).map(r => (
                        <span key={r.name} className="flex items-center gap-1 text-[8px] font-bold text-blue-700 bg-white/60 px-2 py-1 rounded-full border border-blue-100">
                          <Waves size={8} /> {r.name}
                        </span>
                      ))}
                      {MAJOR_WATER_BODIES.lakes.slice(0, 2).map(l => (
                        <span key={l.name} className="flex items-center gap-1 text-[8px] font-bold text-cyan-700 bg-white/60 px-2 py-1 rounded-full border border-cyan-100 shadow-sm">
                          <Droplets size={8} /> {l.name}
                        </span>
                      ))}
                    </div>
                    <div className="pt-2 flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase">
                      <span>Live River Health Data</span>
                      <ChevronRight size={12} />
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -5 }}
                    onClick={() => { document.getElementById('eco-tips')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="bg-ochre-50 p-8 rounded-3xl border border-ochre-100 space-y-4 cursor-pointer relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-ochre-600 shadow-sm group-hover:scale-110 transition-transform">
                        <ShieldCheck size={24} />
                      </div>
                      <div className="px-2 py-1 bg-ochre-100/50 rounded-lg">
                        <span className="text-[10px] font-bold text-ochre-600 uppercase tracking-widest">Action Guide</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-ochre-900 group-hover:text-ochre-700 transition-colors uppercase tracking-tight">{t.knowledge.prevention.title}</h3>
                    <p className="text-ochre-800/80 leading-relaxed text-sm whitespace-pre-line">
                      {t.knowledge.prevention.desc}
                    </p>
                    <div className="pt-2 flex items-center gap-1 text-[10px] font-bold text-ochre-600 uppercase">
                      <span>Explore Eco Tips</span>
                      <ChevronRight size={12} />
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-slate-900 p-8 rounded-3xl text-white space-y-4 relative overflow-hidden group"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-ochre-400 group-hover:scale-110 transition-transform">
                          <Leaf size={24} />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold uppercase tracking-tight">{t.knowledge.role.title}</h3>
                      <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">
                        {t.knowledge.role.desc}
                      </p>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-ochre-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
                  </motion.div>
                </div>
              </section>

              {/* Offline Tips Section */}
              <section id="eco-tips" className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="text-ochre-500" />
                  <h2 className="text-2xl font-bold text-ochre-900">{t.offlineTips}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {OFFLINE_TIPS.map((tip) => (
                    <button 
                      key={tip.id} 
                      onClick={() => setSelectedTipId(tip.id)}
                      className="bg-ochre-50 border border-ochre-100 p-6 rounded-3xl hover:bg-white hover:shadow-lg hover:-translate-y-1 text-left transition-all group"
                    >
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-ochre-500 mb-4 group-hover:scale-110 transition-transform">
                        {tip.icon}
                      </div>
                      <h4 className="font-bold text-ochre-900 mb-2">{t.tipDetails[tip.id as keyof typeof t.tipDetails].title}</h4>
                      <p className="text-xs text-ochre-600 leading-relaxed line-clamp-2">{t.tipDetails[tip.id as keyof typeof t.tipDetails].desc}</p>
                      <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-ochre-500 uppercase">
                        <span>Details</span>
                        <ArrowRight size={10} />
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : activeView === 'reports' ? (
            <motion.div
              key="reports"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setActiveView('home')}
                    className="p-2 -ml-2 text-ochre-400 hover:text-ochre-600 hover:bg-ochre-50 rounded-xl transition-all"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <div>
                    <h2 className="text-3xl font-bold text-ochre-900">{t.savedReports}</h2>
                    <p className="text-sm text-ochre-500 leading-relaxed font-medium">Locally cached pollution data and submission status.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowReportForm(true)}
                    className="bg-ochre-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-ochre-700 transition-colors shadow-sm"
                  >
                    <Upload size={16} /> New Report
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cachedReports.length > 0 ? cachedReports.map((report) => (
                  <div key={report.id} className="ochre-card overflow-hidden group">
                    <div className="aspect-video relative overflow-hidden">
                      <img src={report.image} alt="Evidence" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-ochre-900 shadow-sm">
                        {report.date}
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-1 bg-ochre-100 text-ochre-700 rounded text-[10px] font-bold uppercase tracking-wider">
                          {report.type || 'General'}
                        </span>
                        <div className={cn(
                          "flex items-center gap-1.5 text-[10px] font-bold uppercase",
                          report.status === 'Synced' ? 'text-emerald-600' : 'text-ochre-500'
                        )}>
                          {report.status === 'Synced' ? <CheckCircle2 size={12} /> : <RefreshCw size={12} className="animate-spin" />}
                          {report.status === 'Synced' ? t.synced : report.status === 'Pending Sync' ? t.pendingSync : t.syncing}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-ochre-900 flex items-center gap-2">
                          <MapPin size={14} className="text-ochre-400" />
                          {report.location}
                        </h4>
                        <p className="text-xs text-ochre-600 leading-relaxed mt-2 line-clamp-3">
                          {report.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-ochre-50 rounded-full flex items-center justify-center text-ochre-200 mx-auto">
                      <Trash2 size={32} />
                    </div>
                    <p className="text-ochre-400 font-medium">{t.noReports}</p>
                    <button 
                      onClick={() => setActiveView('home')}
                      className="text-ochre-600 font-bold text-sm hover:underline"
                    >
                      Browse Knowledge Base
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeView === 'profile' ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveView('home')}
                  className="p-2 -ml-2 text-ochre-400 hover:text-ochre-600 hover:bg-ochre-50 rounded-xl transition-all"
                >
                  <ArrowLeft size={24} />
                </button>
                <h2 className="text-3xl font-bold text-ochre-900">{t.profile.title}</h2>
              </div>

              <div className="ochre-card p-8 space-y-8 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="w-32 h-32 bg-gradient-to-br from-ochre-400 to-ochre-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-xl overflow-hidden">
                    {userProfile?.photoURL ? (
                      <img src={userProfile.photoURL} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      userProfile?.displayName?.charAt(0) || user?.displayName?.charAt(0) || 'G'
                    )}
                  </div>
                  <div className="text-center md:text-left space-y-2">
                    <h3 className="text-2xl font-black text-ochre-900">{userProfile?.displayName || user?.displayName || 'Environmental Guardian'}</h3>
                    <p className="text-sm font-bold text-ochre-500 flex items-center justify-center md:justify-start gap-2">
                      <Mail size={14} />
                      {userProfile?.email || user?.email}
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                        {userProfile?.points >= 500 ? t.profile.rankNames[500] : 
                         userProfile?.points >= 150 ? t.profile.rankNames[150] :
                         userProfile?.points >= 50 ? t.profile.rankNames[50] : t.profile.rankNames[0]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="bg-ochre-50 rounded-2xl p-6 text-center space-y-1">
                    <p className="text-[10px] font-bold text-ochre-500 uppercase tracking-widest">{t.profile.points}</p>
                    <p className="text-2xl font-black text-ochre-900">{userProfile?.points || 0}</p>
                  </div>
                  <div className="bg-ochre-50 rounded-2xl p-6 text-center space-y-1">
                    <p className="text-[10px] font-bold text-ochre-500 uppercase tracking-widest">{t.profile.reportsCount}</p>
                    <p className="text-2xl font-black text-ochre-900">{cachedReports.length}</p>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <h4 className="text-sm font-black text-ochre-900 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={16} className="text-ochre-500" />
                    Achieved Badges
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {(userProfile?.badges || t.profile.badges).map((badge: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 bg-white border border-ochre-100 px-4 py-2 rounded-xl shadow-sm">
                        <div className="w-6 h-6 bg-ochre-50 rounded-full flex items-center justify-center text-ochre-500">
                          <CheckCircle2 size={12} />
                        </div>
                        <span className="text-xs font-bold text-ochre-700">{badge}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-ochre-100 flex items-center justify-between text-[10px] font-bold text-ochre-400 uppercase tracking-widest relative z-10">
                  <span>{t.profile.joined}</span>
                  <span>{userProfile?.joinedAt ? new Date(userProfile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'May 2026'}</span>
                </div>
                <Leaf size={300} className="absolute -right-20 -bottom-20 text-ochre-50/50 -rotate-12 pointer-events-none" />
              </div>

              <div className="text-center">
                <button 
                  onClick={() => setActiveView('home')}
                  className="text-ochre-600 font-bold hover:underline"
                >
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quality-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveView('home')}
                  className="p-2 -ml-2 text-ochre-400 hover:text-ochre-600 hover:bg-ochre-50 rounded-xl transition-all"
                >
                  <ArrowLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-ochre-900">
                  {activeView === 'air' ? t.menu.air : t.menu.water}
                </h2>
              </div>
              
              {/* Search Bar */}
              <LocationSearch 
                t={t} 
                onSearch={(val) => {
                  setLocation(val);
                  fetchData(val);
                }} 
              />

              {/* Nepal Pollution Map Section */}
              <section id="map-section" className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-ochre-900">{mapMode === 'air' ? t.menu.air : t.menu.water}</h2>
                    <p className="text-sm text-ochre-500">{mapMode === 'air' ? t.aqi : t.wqi} {t.status} across Nepal</p>
                  </div>
                  <div className="flex bg-ochre-50 p-1 rounded-xl border border-ochre-100">
                    <button 
                      onClick={() => setMapMode('air')}
                      className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", mapMode === 'air' ? "bg-white text-ochre-900 shadow-sm" : "text-ochre-400")}
                    >
                      {t.aqi}
                    </button>
                    <button 
                      onClick={() => setMapMode('water')}
                      className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", mapMode === 'water' ? "bg-white text-ochre-900 shadow-sm" : "text-ochre-400")}
                    >
                      {t.wqi}
                    </button>
                  </div>
                </div>

                <div ref={mapContainerRef} className="bg-white rounded-3xl p-4 border border-ochre-100 relative overflow-hidden min-h-[450px] flex flex-col items-center justify-center shadow-inner">
                  {/* Nepal Flag Branding */}
                  <div className="absolute top-6 right-6 flex flex-col items-center gap-1 z-20 bg-white/60 backdrop-blur-sm p-2 rounded-lg">
                    <svg viewBox="0 0 100 120" className="w-8 h-10 drop-shadow-md">
                      <path d="M0,0 L100,60 L30,60 L100,120 L0,120 Z" fill="#DC143C" stroke="#003893" strokeWidth="4" />
                      <circle cx="25" cy="40" r="12" fill="white" />
                      <path d="M15,95 Q25,75 35,95 Q25,105 15,95" fill="white" />
                    </svg>
                    <span className="text-[8px] font-black text-ochre-900 tracking-tighter">NEPAL</span>
                  </div>

                  {/* Real Map Image Background - Restored for absolute accuracy */}
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center p-8 pointer-events-none">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Nepal_Provinces_Map.png" 
                      alt="Detailed Nepal Provinces Map" 
                      className="w-full h-full object-contain opacity-30 mix-blend-multiply"
                    />
                  </div>
                  
                  {/* Interactive Heatmap Overlay */}
                  <svg 
                    viewBox="0 0 800 450" 
                    className="relative w-full h-full max-h-[450px] z-10 transition-all duration-500"
                    onClick={() => setMapTooltip(null)}
                  >
                    <defs>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Accurate Map Outline Border */}
                    <path 
                      d={NEPAL_OUTLINE} 
                      fill="white" 
                      stroke="#cbd5e1" 
                      strokeWidth="24" 
                      strokeLinejoin="round" 
                      className="opacity-10"
                    />
                    <path 
                      d={NEPAL_OUTLINE} 
                      fill="none" 
                      stroke="#94a3b8" 
                      strokeWidth="1" 
                      strokeLinejoin="round" 
                      className="opacity-40"
                    />

                    {NEPAL_PROVINCES.map((prov) => {
                      const value = mapMode === 'air' ? prov.aqi : prov.wqi;
                      let color = '#22c55e';
                      if (mapMode === 'air') {
                        if (value > 150) color = '#ef4444';
                        else if (value > 80) color = '#fbbf24';
                      } else {
                        if (value < 40) color = '#ef4444';
                        else if (value < 70) color = '#d97706';
                      }

                      const isSelected = mapTooltip?.id === prov.id;

                      return (
                        <motion.path
                          key={prov.id}
                          d={prov.path}
                          fill={color}
                          stroke={isSelected ? "white" : "white"}
                          strokeWidth={isSelected ? "3" : "1.5"}
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: isSelected ? 0.7 : 0.25,
                            scale: 1,
                            strokeWidth: isSelected ? 3 : 1
                          }}
                          whileHover={{ 
                            opacity: 0.5, 
                            scale: 1, 
                            filter: "url(#glow)",
                            strokeWidth: 2
                          }}
                          className="cursor-pointer transition-all duration-300"
                          onClick={(e) => { 
                            e.stopPropagation();
                            setLocation(prov.name); 
                            fetchData(prov.name);
                            if (mapContainerRef.current) {
                              const rect = mapContainerRef.current.getBoundingClientRect();
                              setMapTooltip({ 
                                id: prov.id, 
                                x: e.clientX - rect.left, 
                                y: e.clientY - rect.top 
                              });
                            }
                          }}
                        />
                      );
                    })}
                    {/* Synchronized Labels - Updated with official names and better positions */}
                    <text x="700" y="350" className="fill-slate-900 text-[11px] font-black pointer-events-none drop-shadow-sm opacity-60 uppercase tracking-tighter">Koshi</text>
                    <text x="630" y="420" className="fill-slate-900 text-[11px] font-black pointer-events-none drop-shadow-sm opacity-60 uppercase tracking-tighter">Madhesh</text>
                    <text x="540" y="320" className="fill-slate-900 text-[11px] font-black pointer-events-none drop-shadow-sm opacity-60 uppercase tracking-tighter">Bagmati</text>
                    <text x="410" y="270" className="fill-slate-900 text-[11px] font-black pointer-events-none drop-shadow-sm opacity-60 uppercase tracking-tighter">Gandaki</text>
                    <text x="310" y="380" className="fill-slate-900 text-[11px] font-black pointer-events-none drop-shadow-sm opacity-60 uppercase tracking-tighter">Lumbini</text>
                    <text x="230" y="220" className="fill-slate-900 text-[11px] font-black pointer-events-none drop-shadow-sm opacity-60 uppercase tracking-tighter">Karnali</text>
                    <text x="80" y="240" className="fill-slate-900 text-[11px] font-black pointer-events-none drop-shadow-sm opacity-60 uppercase tracking-tighter text-center">Sudurpashchim</text>
                  </svg>

                  {/* Province Tooltip */}
                  <AnimatePresence>
                    {mapTooltip && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        style={{ 
                          left: mapTooltip.x, 
                          top: mapTooltip.y - 100,
                          pointerEvents: 'auto'
                        }}
                        className="absolute z-50"
                      >
                        <div className="bg-slate-900/95 backdrop-blur-md text-white px-5 py-4 rounded-2xl shadow-2xl border border-white/20 -translate-x-1/2 whitespace-nowrap group relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setMapTooltip(null);
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white text-white hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <X size={12} strokeWidth={4} />
                          </button>

                          {(() => {
                            const p = NEPAL_PROVINCES.find(prov => prov.id === mapTooltip.id);
                            if (!p) return null;
                            const val = mapMode === 'air' ? p.aqi : p.wqi;
                            const statusColor = mapMode === 'air' ? (val > 150 ? 'text-red-400' : val > 80 ? 'text-amber-400' : 'text-emerald-400') : (val < 40 ? 'text-red-400' : val < 70 ? 'text-amber-400' : 'text-emerald-400');
                            
                            return (
                              <div className="space-y-3">
                                <div className="border-b border-white/10 pb-2">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">National Guardian Network</span>
                                  <span className="text-sm font-black text-white">{p.name}</span>
                                </div>
                                <div className="flex items-center justify-between gap-8">
                                  <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">{mapMode === 'air' ? 'AQI Score' : 'WQI Health'}</span>
                                    <span className={cn("text-xl font-black", statusColor)}>{val}</span>
                                  </div>
                                  <div className="flex flex-col text-right">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Live Status</span>
                                    <span className={cn("text-xs font-bold uppercase tracking-wider", statusColor)}>
                                      {val > (mapMode === 'air' ? 150 : 80) && mapMode === 'air' ? 'Critical' : 
                                       val > (mapMode === 'air' ? 80 : 40) ? 'Moderate' : 'Healthy'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900/95" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="absolute top-6 left-6 hidden lg:block bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-ochre-100 shadow-xl z-20 overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
                    <table className="text-[9px] font-bold text-slate-800 w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="pb-2 pr-4 text-left font-black uppercase text-slate-400">Province</th>
                          <th className="pb-2 pr-4 text-left font-black uppercase text-slate-400">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {NEPAL_PROVINCES.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-1.5 pr-4 whitespace-nowrap">{p.name.split(' (')[0]}</td>
                            <td className="py-1.5 flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                (mapMode === 'air' ? p.aqi : p.wqi) > (mapMode === 'air' ? 150 : 80) ? 'bg-red-500' :
                                (mapMode === 'air' ? p.aqi : p.wqi) > (mapMode === 'air' ? 80 : 40) ? 'bg-orange-500' : 'bg-emerald-500'
                              }`} />
                              <span className="opacity-80">
                                {mapMode === 'air' ? p.aqi : p.wqi}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="absolute bottom-6 left-6 flex flex-col gap-2 bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-lg z-20">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#ef4444] rounded-full shadow-sm" />
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Polluted</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#d97706] rounded-full shadow-sm" />
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Moderate</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#22c55e] rounded-full shadow-sm" />
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Clean</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Dashboard Overview Section */}
              <section id="dashboard-section" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-ochre-900">{t.dashboard}</h2>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-4">
                    {loading ? (
                      <div className="ochre-card h-64 animate-pulse flex items-center justify-center">
                        <RefreshCw className="animate-spin text-ochre-300" />
                      </div>
                    ) : data && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="ochre-card flex flex-col md:flex-row gap-8"
                      >
                        <div className="flex-1 space-y-6">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-ochre-400 uppercase tracking-widest">{location}</span>
                            <div className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase", 
                              data.status === 'Clean' ? 'bg-emerald-100 text-emerald-700' :
                              data.status === 'Moderate' ? 'bg-ochre-100 text-ochre-700' : 'bg-red-100 text-red-700'
                            )}>
                              {data.status}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex items-center justify-between bg-ochre-50 p-4 rounded-2xl">
                              <div className="flex items-center gap-2">
                                <Wind className="text-ochre-500" size={20} />
                                <span className="text-sm font-medium text-slate-600">{t.aqi}</span>
                              </div>
                              <span className="text-2xl font-bold text-ochre-900">{data.aqi}</span>
                            </div>
                            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-2xl">
                              <div className="flex items-center gap-2">
                                <Droplets className="text-blue-500" size={20} />
                                <span className="text-sm font-medium text-slate-600">{t.wqi}</span>
                              </div>
                              <span className="text-2xl font-bold text-blue-900">{data.waterQuality}</span>
                            </div>
                          </div>

                          <div className="pt-6 border-t border-ochre-50">
                            <h4 className="text-xs font-bold text-ochre-400 uppercase mb-3">{t.sources}</h4>
                            <div className="flex flex-wrap gap-2">
                              {data.sources.map((s: string) => (
                                <span key={s} className="px-3 py-1 bg-ochre-50 text-ochre-700 text-[10px] font-bold rounded-full">{s}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-between gap-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                              <div className="flex items-center gap-2 mb-2">
                                <Beaker size={18} className="text-emerald-600" />
                                <span className="text-xs font-bold text-emerald-800 uppercase">{t.waterSafety}</span>
                              </div>
                              <span className="text-sm font-bold text-emerald-600">{t.safe}</span>
                            </div>
                            <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                              <div className="flex items-center gap-2 mb-2">
                                <Factory size={18} className="text-red-600" />
                                <span className="text-xs font-bold text-red-800 uppercase">{t.industrial}</span>
                              </div>
                              <span className="text-sm font-bold text-red-600">{t.tracking}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between bg-ochre-50 p-4 rounded-2xl">
                            <div className="flex items-center gap-2">
                              <Activity className="text-ochre-500" size={20} />
                              <span className="text-sm font-bold text-ochre-900">{data.citizenReports} {t.reports}</span>
                            </div>
                            <ChevronRight size={20} className="text-ochre-400" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </section>

              {/* Water Bodies Dashboard Section */}
              <section id="water-bodies-section" className="space-y-10">
                {activeView === 'water' ? (
                  <>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-ochre-900">{t.knowledge.water.riversTitle}</h2>
                        <span className="text-[10px] font-bold text-ochre-400 uppercase tracking-widest hidden sm:block">{t.knowledge.water.wqiScale}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {riversData.map((river) => (
                          <div key={river.name} className="ochre-card p-6 border-blue-50 hover:bg-blue-50/30 transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4 relative z-10">
                              <div>
                                <h3 className="text-lg font-black text-ochre-900 leading-none mb-1">{river.name}</h3>
                                <span className="text-[9px] font-bold text-ochre-400 uppercase tracking-widest">{river.location}</span>
                              </div>
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm",
                                river.wqi > 75 ? "bg-emerald-50 text-emerald-600" :
                                river.wqi > 45 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                              )}>
                                {river.wqi}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-4 relative z-10">
                              <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border",
                                river.wqi > 75 ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                                river.wqi > 45 ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-red-100 text-red-700 border-red-200"
                              )}>
                                {river.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-ochre-600 leading-relaxed font-medium relative z-10">{river.desc}</p>
                            <Waves size={100} className="absolute -right-12 -bottom-12 text-blue-100/30 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6 pt-10 border-t border-ochre-100">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-ochre-900">{t.knowledge.water.lakesTitle}</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lakesData.map((lake) => (
                          <div key={lake.name} className="ochre-card p-6 border-cyan-50 hover:bg-cyan-50/30 transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4 relative z-10">
                              <div>
                                <h3 className="text-lg font-black text-ochre-900 leading-none mb-1">{lake.name}</h3>
                                <span className="text-[9px] font-bold text-ochre-400 uppercase tracking-widest">{lake.location}</span>
                              </div>
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm",
                                lake.wqi > 75 ? "bg-emerald-50 text-emerald-600" :
                                lake.wqi > 45 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                              )}>
                                {lake.wqi}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-4 relative z-10">
                              <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border",
                                lake.wqi > 75 ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                                lake.wqi > 45 ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-red-100 text-red-700 border-red-200"
                              )}>
                                {lake.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-ochre-600 leading-relaxed font-medium relative z-10">{lake.desc}</p>
                            <Droplets size={100} className="absolute -right-12 -bottom-12 text-cyan-100/30 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-12 text-center bg-emerald-50 rounded-3xl border border-emerald-100">
                     <Wind size={48} className="mx-auto text-emerald-200 mb-4" />
                     <p className="text-emerald-800 font-bold uppercase tracking-widest text-sm">National AQI Monitoring Active</p>
                  </div>
                )}
              </section>

                {/* River Quality Comparison Chart */}
                <div className="bg-white border border-ochre-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-ochre-900">National WQI Comparison</h3>
                      <p className="text-xs text-ochre-400 uppercase font-bold tracking-wider">Water Quality Index across Major Rivers</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black border border-blue-100 animate-pulse">
                      <Droplets size={12} />
                      LIVE ANALYTICS
                    </div>
                  </div>
                  
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={riversData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                          dx={-10}
                        />
                        <ChartTooltip 
                           cursor={{ fill: '#f8fafc' }}
                           contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                           itemStyle={{ fontWeight: 800, fontSize: '14px' }}
                           labelStyle={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: 700 }}
                        />
                        <Bar 
                          dataKey="wqi" 
                          fill="#3b82f6" 
                          radius={[8, 8, 0, 0]} 
                          barSize={40}
                          animationDuration={1500}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>WQI VALUE</span>
                      </div>
                    </div>
                    <span className="uppercase tracking-widest italic opacity-60">Data: Department of Hydrology & Meteorology</span>
                  </div>
                </div>

              {/* Report Section (Camera) */}
              <section className="bg-ochre-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="max-w-md space-y-4 text-center md:text-left">
                    <h2 className="text-3xl font-bold">{t.report}</h2>
                    <p className="text-ochre-200">{t.reportTagline}</p>
                    <button 
                      onClick={() => setShowReportForm(true)}
                      className="bg-white text-ochre-900 font-bold px-8 py-4 rounded-full flex items-center gap-2 hover:bg-ochre-50 transition-all mx-auto md:mx-0 shadow-xl"
                    >
                      <BookOpen size={20} className="text-emerald-500" /> Open Report Form
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 border border-white/10">
                      <Factory size={24} className="text-ochre-400" />
                      <span className="text-[10px] uppercase font-bold">Industry</span>
                    </div>
                    <div className="w-24 h-24 bg-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 border border-white/10">
                      <Waves size={24} className="text-blue-400" />
                      <span className="text-[10px] uppercase font-bold">Sewage</span>
                    </div>
                    <div className="w-24 h-24 bg-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 border border-white/10">
                      <Trash2 size={24} className="text-red-400" />
                      <span className="text-[10px] uppercase font-bold">Waste</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-ochre-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Unified Report Overlay */}
      <AnimatePresence>
        {showReportForm && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[105] bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-0 md:p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white w-full max-w-3xl md:rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden flex flex-col h-full md:h-auto md:max-h-[90vh]"
            >
              <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{t.reportForm.title}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Public Interest Litigation System</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowReportForm(false);
                    setCapturedImage(null);
                    setShowCamera(false);
                    if (videoRef.current?.srcObject) {
                      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
                    }
                  }}
                  className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-hide">
                <form onSubmit={submitReport} className="space-y-8">
                  {/* Step 1: Evidence */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-ochre-500 uppercase tracking-wider mb-2">
                      <Camera size={12} /> Step 1: Visual Evidence
                    </div>
                    
                    {!capturedImage && !showCamera ? (
                      <div className="grid grid-cols-2 gap-4 h-40">
                        <button 
                          type="button"
                          onClick={() => startCamera()}
                          className="border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-slate-50 hover:border-ochre-200 transition-all group"
                        >
                          <div className="w-12 h-12 bg-ochre-50 rounded-2xl flex items-center justify-center text-ochre-500 group-hover:scale-110 transition-transform">
                            <Camera size={24} />
                          </div>
                          <span className="text-xs font-bold text-slate-600">Open Camera</span>
                        </button>
                        <label className="border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-slate-50 hover:border-ochre-200 transition-all group cursor-pointer">
                          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                            <Upload size={24} />
                          </div>
                          <span className="text-xs font-bold text-slate-600">Upload Photo</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </label>
                      </div>
                    ) : (
                      <div className="relative aspect-video rounded-[2rem] overflow-hidden border-4 border-white shadow-lg bg-slate-900">
                        {showCamera && <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />}
                        {capturedImage && <img src={capturedImage} className="w-full h-full object-cover" />}
                        
                        {showCamera && (
                          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                            <button 
                              type="button"
                              onClick={capturePhoto} 
                              className="w-14 h-14 bg-white rounded-full border-4 border-ochre-500 flex items-center justify-center shadow-xl hover:scale-105 transition-all"
                            >
                              <div className="w-10 h-10 bg-ochre-500 rounded-full" />
                            </button>
                          </div>
                        )}
                        
                        {(capturedImage || showCamera) && (
                          <button 
                            type="button"
                            onClick={() => { 
                              setCapturedImage(null); 
                              setShowCamera(false); 
                              if (videoRef.current?.srcObject) {
                                (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
                              }
                            }}
                            className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 backdrop-blur-sm"
                          >
                            <RefreshCw size={16} />
                          </button>
                        )}

                        {analyzingImage && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white text-center p-4">
                            <RefreshCw size={32} className="animate-spin mb-4 text-ochre-400" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Analyzing with Swachha AI...</p>
                            <p className="text-[8px] opacity-60 mt-1 max-w-[200px]">Classifying pollution level and type for government submission.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Step 2: Information */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-ochre-500 uppercase tracking-wider mb-2">
                       <FileText size={12} /> Step 2: Report Details
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.reportForm.type}</label>
                        <select 
                          required
                          className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-4 text-sm font-medium focus:ring-2 focus:ring-ochre-500 outline-none transition-all"
                          value={reportData.type}
                          onChange={(e) => setReportData({...reportData, type: e.target.value})}
                        >
                          <option value="">Select Category</option>
                          {t.reportForm.types.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.reportForm.location}</label>
                        <div className="relative">
                          <input 
                            required
                            type="text"
                            placeholder={t.reportForm.placeholderLoc}
                            className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-4 pl-10 text-sm font-medium focus:ring-2 focus:ring-ochre-500 outline-none transition-all"
                            value={reportData.location}
                            onChange={(e) => setReportData({...reportData, location: e.target.value})}
                          />
                          <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.reportForm.desc}</label>
                      <textarea 
                        required
                        rows={4}
                        placeholder={t.reportForm.placeholderDesc}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-ochre-500 outline-none transition-all resize-none shadow-inner"
                        value={reportData.description}
                        onChange={(e) => setReportData({...reportData, description: e.target.value})}
                      />
                      {imageAnalysis && (
                        <p className="text-[10px] text-ochre-600 bg-ochre-50 p-2 rounded-lg font-medium border border-ochre-100 animate-pulse">
                          AI Suggestion: {imageAnalysis.slice(0, 100)}...
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col md:flex-row gap-4">
                    <button 
                      type="submit"
                      disabled={loading || isSubmitted}
                      className="flex-1 h-14 bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading || isSubmitted ? <RefreshCw className="animate-spin" size={20} /> : <Upload size={20} className="text-ochre-400" />}
                      {t.reportForm.submit}
                    </button>
                    {!user && (
                       <p className="text-[10px] text-center md:text-left text-slate-400 font-medium md:max-w-[200px] flex items-center">
                         <AlertCircle size={12} className="mr-1 text-red-400" />
                         You need to login to submit reports to the national database.
                       </p>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-ochre-400 via-ochre-600 to-ochre-400 animate-gradient-x" />
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center space-y-8 py-4">
                <div className="w-20 h-20 bg-ochre-50 rounded-3xl flex items-center justify-center text-ochre-600 mx-auto shadow-inner">
                  <Leaf size={40} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 leading-tight">Welcome to Swachha Nepal</h2>
                  <p className="text-slate-500 text-sm font-medium">Join thousands of citizens in protecting our environment. Register your efforts and help us track pollution in real-time.</p>
                </div>

                <div className="space-y-4 pt-4">
                  <button 
                    onClick={async () => {
                      try {
                        await signInWithGoogle();
                        setShowLoginModal(false);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="w-full h-14 bg-white border-2 border-slate-100 flex items-center justify-center gap-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm active:scale-[0.98]"
                  >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                    <span>Continue with Google</span>
                  </button>
                  
                  <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Secure Access</span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                    By continuing, you agree to Swachha Nepal's <span className="text-ochre-600 cursor-pointer underline">Terms of Service</span> and <span className="text-ochre-600 cursor-pointer underline">Privacy Policy</span>.
                  </p>
                </div>
              </div>
              
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-ochre-50 rounded-full blur-3xl opacity-50" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedTipId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-10"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              <div className="w-full md:w-1/2 bg-slate-100 relative min-h-[300px]">
                {selectedTipId === 'transport' ? (
                  <div className="h-full grid grid-cols-2 gap-1 p-1">
                    {t.tipDetails.transport.images.map((img, i) => (
                      <img key={i} src={img} className={`w-full h-full object-cover ${i === 0 ? 'col-span-2' : ''}`} alt="Nepal transport" />
                    ))}
                  </div>
                ) : (
                  <img 
                    src={(t.tipDetails[selectedTipId as keyof typeof t.tipDetails] as any).pollutionImg || (t.tipDetails[selectedTipId as keyof typeof t.tipDetails] as any).guideImg} 
                    className="w-full h-full object-cover" 
                    alt={selectedTipId} 
                  />
                )}
                <button 
                  onClick={() => setSelectedTipId(null)}
                  className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg text-slate-900 hover:scale-110 transition-transform"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
                <div className="space-y-8 text-left">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-ochre-500 font-black text-[10px] uppercase tracking-[0.2em]">
                      <Leaf size={14} />
                      {t.takeAction}
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 leading-tight">
                      {t.tipDetails[selectedTipId as keyof typeof t.tipDetails].title}
                    </h2>
                    <p className="text-slate-500 text-lg">
                      {t.tipDetails[selectedTipId as keyof typeof t.tipDetails].desc}
                    </p>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                       <ShieldCheck className="text-emerald-500" size={18} />
                       {t.tipDetails[selectedTipId as keyof typeof t.tipDetails].processTitle}
                    </h3>
                    <ul className="space-y-4">
                      {t.tipDetails[selectedTipId as keyof typeof t.tipDetails].steps.map((step, i) => (
                        <li key={i} className="flex gap-4 group">
                          <div className="flex-shrink-0 w-8 h-8 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <span className="text-xs font-black">{i + 1}</span>
                          </div>
                          <p className="text-slate-600 text-sm font-medium leading-relaxed pt-1">
                            {step}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    onClick={() => setSelectedTipId(null)}
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-sm uppercase tracking-widest hover:bg-slate-800 transition-colors"
                  >
                    Got it, I'll help!
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="bg-ochre-50 border-t border-ochre-100 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Leaf size={24} className="text-ochre-500" />
            <span className="font-bold text-xl text-ochre-900">{t.title}</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-ochre-600">
            <a href="#" className="hover:text-ochre-900">{t.dashboard}</a>
            <a href="#" className="hover:text-ochre-900">{t.rivers}</a>
            <button onClick={() => setShowReportForm(true)} className="hover:text-ochre-900 cursor-pointer">{t.report}</button>
          </div>
          <div className="text-xs text-ochre-400">
            © 2026 {t.title} Initiative. Kathmandu, Nepal.
          </div>
        </div>
      </footer>
    </div>
    </APIProvider>
  );
}

