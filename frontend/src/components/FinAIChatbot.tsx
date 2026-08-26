"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  RotateCcw,
  Headphones,
  CheckCircle2,
  AlertCircle,
  Clock,
  PhoneCall,
  MessageCircle,
  Star,
  Sparkles,
  ShieldCheck,
  BatteryCharging,
  CreditCard,
  Volume2,
  Smartphone,
  ArrowRightLeft,
  QrCode,
  Printer,
  Landmark,
  Languages,
  ShieldAlert,
  Wifi,
  FileText,
  UserCheck,
  Check,
  ChevronDown,
  Globe,
  HelpCircle,
  Bot
} from "lucide-react";
import axios from "axios";
import { getApiBaseUrl } from "@/utils/api";

export type LanguageCode = "en" | "hi" | "te" | "ta" | "kn" | "mr" | "bn" | "hinglish";

interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", flag: "🇮🇳" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు", flag: "🇮🇳" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", flag: "🇮🇳" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", flag: "🇮🇳" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা", flag: "🇮🇳" },
  { code: "hinglish", label: "Hinglish", nativeLabel: "Hinglish", flag: "🇮🇳" },
];

interface ProblemItem {
  id: string;
  icon: any;
  category: string;
  titles: Record<LanguageCode, string>;
  summaries: Record<LanguageCode, string>;
  steps: Record<LanguageCode, string[]>;
}

const MULTILINGUAL_PROBLEMS: ProblemItem[] = [
  {
    id: "sim",
    icon: Smartphone,
    category: "Soundbox & POS - SIM Card & Connectivity",
    titles: {
      en: "Facing issue with the SIM card",
      hi: "SIM कार्ड में समस्या आ रही है",
      te: "SIM కార్డుతో సమస్య ఎదురవుతోంది",
      ta: "SIM கார்டில் பிரச்சனை உள்ளது",
      kn: "SIM ಕಾರ್ಡ್‌ನಲ್ಲಿ ಸಮಸ್ಯೆ ಉಂಟಾಗಿದೆ",
      mr: "SIM कार्ड मध्ये समस्या येत आहे",
      bn: "SIM কার্ডে সমস্যা হচ্ছে",
      hinglish: "SIM card me issue aa raha hai",
    },
    summaries: {
      en: "SIM card not detected / no mobile signal in soundbox slot.",
      hi: "SIM कार्ड स्लॉट में डिटेक्ट नहीं हो रहा है या सिग्नल नहीं आ रहा है।",
      te: "సౌండ్‌బాక్స్ స్లాట్‌లో SIM గుర్తించబడలేదు / సిగ్నల్ రావడం లేదు.",
      ta: "SIM கார்டு கண்டறியப்படவில்லை / நெட்வொர்க் சிக்னல் இல்லை.",
      kn: "SIM ಕಾರ್ಡ್ ಪತ್ತೆಯಾಗುತ್ತಿಲ್ಲ ಅಥವಾ ಸಿಗ್ನಲ್ ಬರುತ್ತಿಲ್ಲ.",
      mr: "SIM कार्ड डिटेक्ट होत नाहीये किंवा नेटवर्क सिग्नल नाहीये.",
      bn: "SIM কার্ড শনাক্ত হচ্ছে না বা নেটওয়ার্ক সংকেত নেই।",
      hinglish: "SIM card detect nahi ho raha / network signal nahi hai.",
    },
    steps: {
      en: [
        "Locate the small pin hole beside/underneath the soundbox or POS machine.",
        "Insert a safety pin or SIM ejector pin gently into the hole to pop open the SIM tray.",
        "Remove the SIM card and gently clean the gold chip with a dry, clean cloth.",
        "Re-insert the SIM securely with the gold contact chip facing downward.",
        "Power ON the device and wait 30-45 seconds for network signal LED lights to turn solid blue/green."
      ],
      hi: [
        "साउंड बॉक्स या POS मशीन के साइड/नीचे दिए गए छोटे छेद को देखें।",
        "सेफ्टी पिन या सिम इजेक्टर पिन डालकर सिम ट्रे को बाहर निकालें।",
        "सिम कार्ड को निकालें और इसके गोल्डन चिप को सूखे साफ कपड़े से पोंछ लें।",
        "सिम को सही तरीके से गोल्डन चिप नीचे की ओर रखते हुए वापस लगाएं।",
        "डिवाइस चालू करें और नेटवर्क लाइट हरी/नीली होने तक 30-45 सेकंड प्रतीक्षा करें।"
      ],
      te: [
        "సౌండ్‌బాక్స్ లేదా POS మెషిన్ పక్కన ఉన్న చిన్న రంధ్రంలో పిన్ ఉంచండి.",
        "సేఫ్టీ పిన్ లేదా SIM ఎజెక్టర్‌తో SIM ట్రేని బయటకు తీయండి.",
        "SIM కార్డును తీసి దానిపై ఉన్న బంగారు రంగు చిప్‌ను పొడి గుడ్డతో శుభ్రం చేయండి.",
        "గోల్డెన్ చిప్ క్రింది వైపు ఉండేలా SIMను మళ్ళీ సరిగ్గా అమర్చండి.",
        "డివైజ్‌ని ఆన్ చేసి నెట్‌వర్క్ లైట్ ఆకుపచ్చ/నీలంగా మారే వరకు 30 సెకన్లు ఆగండి."
      ],
      ta: [
        "சவுண்ட்பாக்ஸின் பக்கத்திலுள்ள சிறிய துளையில் பின்னை மெதுவாக செருகவும்.",
        "SIM டிரேயை வெளியே எடுத்து SIM கார்டை அகற்றவும்.",
        "தங்க நிற சிப் பகுதியை உலர்ந்த துணியால் மென்மையாக துடைக்கவும்.",
        "SIM கார்டை மீண்டும் சரியாகப் பொருத்தி சாதனத்தை ஆன் செய்யவும்.",
        "நெட்வொர்க் லைட் பச்சை/நீல நிறமாக மாறும் வரை 30 வினாடிகள் காத்திருக்கவும்."
      ],
      kn: [
        "ಸೌಂಡ್‌ಬಾಕ್ಸ್ ಬದಿಯಲ್ಲಿರುವ ಸಣ್ಣ ರಂಧ್ರದಲ್ಲಿ ಎಜೆಕ್ಟರ್ ಪಿನ್ ಹಾಕಿ SIM ಟ್ರೇ ತೆರೆಯಿರಿ.",
        "SIM ಕಾರ್ಡ್ ಹೊರತೆಗೆದು ಅದರ ಗೋಲ್ಡನ್ ಚಿಪ್ ಅನ್ನು ಒಣ ಬಟ್ಟೆಯಿಂದ ಸ್ವಚ್ಛಗೊಳಿಸಿ.",
        "SIM ಅನ್ನು ಮರಳಿ ಸರಿಯಾಗಿ ಹಾಕಿ ಡಿವೈಸ್ ಆನ್ ಮಾಡಿ.",
        "ನೆಟ್‌ವರ್ಕ್ ಸಿಗ್ನಲ್ ಲೈಟ್ ಆನ್ ಆಗಲು 30-45 ಸೆಕೆಂಡು ಕಾಯಿರಿ."
      ],
      mr: [
        "साउंड बॉक्सच्या बाजूला असलेल्या छोट्या छिद्रामध्ये पिन घालून SIM ट्रे बाहेर काढा.",
        "SIM कार्डवरील सोनेरी चिप कोरड्या कापडाने स्वच्छ पुसून घ्या.",
        "SIM योग्य दिशेने पुन्हा ट्रेमध्ये बसवा आणि डिव्हाइस चालू करा.",
        "नेटवर्क लाइट स्थिर हिरवी/निळी होईपर्यंत 30 सेकंद प्रतीक्षा करा."
      ],
      bn: [
        "সাউন্ডবক্সের পাশের ছোট ছিদ্রে পিন ঢুকিয়ে SIM ট্রে বের করুন।",
        "SIM কার্ডের গোল্ডেন চিপটি শুকনো কাপড় দিয়ে পরিষ্কার করুন।",
        "SIM পুনরায় সঠিকভাবে প্রবেশ করিয়ে ডিভাইসটি অন করুন।",
        "নেটওয়ার্ক সিগন্যাল লাইট জ্বলার জন্য ৩০-৪৫ সেকেন্ড অপেক্ষা করুন।"
      ],
      hinglish: [
        "Soundbox ke side me diye gaye chote hole me safety pin ya ejector pin daalein.",
        "SIM tray bahar nikalein aur SIM card ke golden chip ko dry cloth se saaf karein.",
        "SIM ko proper downward direction me wapas slot me lagayein.",
        "Device Power ON karein aur 30-45 seconds wait karein jab tak network LED solid green/blue na ho jaye."
      ]
    }
  },
  {
    id: "soundbox",
    icon: Volume2,
    category: "Hardware - Sound Box Device",
    titles: {
      en: "Sound box not working / No voice",
      hi: "साउंड बॉक्स काम नहीं कर रहा / आवाज नहीं आ रही",
      te: "సౌండ్‌బాక్స్ పనిచేయడం లేదు / వాయిస్ రావడం లేదు",
      ta: "சவுண்ட்பாக்ஸ் வேலை செய்யவில்லை / ஒலி கேட்கவில்லை",
      kn: "ಸೌಂಡ್‌ಬಾಕ್ಸ್ ಕೆಲಸ ಮಾಡುತ್ತಿಲ್ಲ / ಧ್ವನಿ ಬರುತ್ತಿಲ್ಲ",
      mr: "साउंड बॉक्स काम करत नाहीये / आवाज येत नाहीये",
      bn: "সাউন্ডবক্স কাজ করছে না / কোনো শব্দ নেই",
      hinglish: "Soundbox kaam nahi kar raha / voice nahi aa rahi",
    },
    summaries: {
      en: "Soundbox power failure or payment announcement speaker mute/error.",
      hi: "साउंड बॉक्स ऑन नहीं हो रहा या पेमेंट अनाउंसमेंट की आवाज नहीं आ रही।",
      te: "సౌండ్‌బాక్స్ ఆన్ కావడం లేదు లేదా పేమెంట్ వాయిస్ రావడం లేదు.",
      ta: "சவுண்ட்பாக்ஸ் ஆன் ஆகவில்லை அல்லது அறிவிப்பு ஒலி வரவில்லை.",
      kn: "ಸೌಂಡ್‌ಬಾಕ್ಸ್ ಆನ್ ಆಗುತ್ತಿಲ್ಲ ಅಥವಾ ಪಾವತಿ ಧ್ವನಿ ಬರುತ್ತಿಲ್ಲ.",
      mr: "साउंड बॉक्स चालू होत नाहीये किंवा पेमेंट अनाउन्समेंट येत नाहीये.",
      bn: "সাউন্ডবক্স অন হচ্ছে না বা পেমেন্টের সাউন্ড আসছে না।",
      hinglish: "Soundbox ON nahi ho raha ya payment confirmation voice nahi aa rahi.",
    },
    steps: {
      en: [
        "Hold and press the Power ON/OFF button for 5-10 seconds to reboot the soundbox.",
        "Press the Volume '+' button on the side panel multiple times to increase audio to maximum.",
        "Press the 'Replay / Audio Test' button on top to trigger test audio announcement.",
        "Check battery LED status: Solid Blue/Green indicates ready; Blinking Red means battery is low.",
        "If muted or unresponsive, connect charger for 20 minutes and restart."
      ],
      hi: [
        "साउंडबॉक्स को रीबूट करने के लिए पावर बटन को 5-10 सेकंड तक दबाकर रखें।",
        "साइड में दिए गए वॉल्यूम '+' बटन को दबाकर आवाज पूरी तेज करें।",
        "ऊपर दिए गए 'ऑडियो टेस्ट / रिपीट' बटन को दबाकर आवाज चेक करें।",
        "बैटरी लाइट चेक करें: नीली/हरी लाइट तैयार है; लाल लाइट का मतलब कम चार्ज है।"
      ],
      te: [
        "సౌండ్‌బాక్స్ రీబూట్ చేయడానికి పవర్ బటన్‌ను 5-10 సెకన్లు నొక్కి ఉంచండి.",
        "పక్కన ఉన్న వాల్యూమ్ '+' బటన్ నొక్కి శబ్దాన్ని గరిష్ట స్థాయికి పెంచండి.",
        "పైన ఉన్న 'ఆడియో టెస్ట్' బటన్ నొక్కి వాయిస్ చెక్ చేయండి.",
        "బ్యాటరీ లైట్ గమనించండి: బ్లూ/గ్రీన్ ఉంటే సిద్ధంగా ఉంది; రెడ్ బ్లింక్ అయితే ఛార్జ్ చేయండి."
      ],
      ta: [
        "சவுண்ட்பாக்ஸை மறுதொடக்கம் செய்ய பவர் பட்டனை 5-10 வினாடிகள் அழுத்திப் பிடிக்கவும்.",
        "பக்கவாட்டு வால்யூம் '+' பட்டனை அழுத்தி ஒலியை அதிகரிக்கவும்.",
        "மேலே உள்ள 'ஆடியோ டெஸ்ட்' பட்டனை அழுத்தி ஒலியை பரிசோதிக்கவும்."
      ],
      kn: [
        "ಪವರ್ ಬಟನ್ ಅನ್ನು 5-10 ಸೆಕೆಂಡುಗಳ ಕಾಲ ಒತ್ತಿ ಹಿಡಿದು ರಿಸ್ಟಾರ್ಟ್ ಮಾಡಿ.",
        "ವಾಲ್ಯೂಮ್ '+' ಬಟನ್ ಒತ್ತಿ ಧ್ವನಿ ಹೆಚ್ಚಿಸಿ.",
        "ಆಡಿಯೋ ಟೆಸ್ಟ್ ಬಟನ್ ಒತ್ತಿ ಪರಿಶೀಲಿಸಿ."
      ],
      mr: [
        "पॉवर बटण 5-10 सेकंद दाबून धरून साउंडबॉक्स रीस्टार्ट करा.",
        "बाजूचे व्हॉल्यूम '+' बटण दाबून आवाज वाढवा.",
        "वरचे 'ऑडिओ टेस्ट' बटण दाबून आवाज तपासा."
      ],
      bn: [
        "পাওয়ার বাটন ৫-১০ সেকেন্ড চেপে ধরে সাউন্ডবক্স রিস্টার্ট করুন।",
        "ভলিউম '+' বাটন চেপে আওয়াজ বাড়িয়ে নিন।",
        "অডিও টেস্ট বাটন চেপে সাউন্ড পরীক্ষা করুন।"
      ],
      hinglish: [
        "Soundbox ko reboot karne ke liye Power button 5-10 seconds hold karein.",
        "Side panel me Volume '+' button daba kar full volume karein.",
        "Top par 'Audio Test' button press karke speaker test karein."
      ]
    }
  },
  {
    id: "battery",
    icon: BatteryCharging,
    category: "Hardware - Battery & Power Charging",
    titles: {
      en: "Facing battery or charging issue",
      hi: "बैटरी या चार्जिंग में समस्या आ रही है",
      te: "బ్యాటరీ లేదా ఛార్జింగ్ సమస్య ఉంది",
      ta: "பேட்டரி அல்லது சார்ஜிங் பிரச்சனை",
      kn: "ಬ್ಯಾಟರಿ ಅಥವಾ ಚಾರ್ಜಿಂಗ್ ಸಮಸ್ಯೆ ಇದೆ",
      mr: "बॅटरी किंवा चार्जिंग समस्या येत आहे",
      bn: "ব্যাটারি বা চার্জিং সংক্রান্ত সমস্যা",
      hinglish: "Battery ya charging issue aa raha hai",
    },
    summaries: {
      en: "Soundbox or POS device fast battery drain or not charging.",
      hi: "डिवाइस चार्ज नहीं हो रहा या बैटरी बहुत जल्दी खत्म हो रही है।",
      te: "డివైజ్ ఛార్జ్ కావడం లేదు లేదా బ్యాటరీ త్వరగా అయిపోతోంది.",
      ta: "சாதனம் சார்ஜ் ஆகவில்லை அல்லது பேட்டரி விரைவில் தீர்ந்துவிடுகிறது.",
      kn: "ಡಿವೈಸ್ ಚಾರ್ಜ್ ಆಗುತ್ತಿಲ್ಲ ಅಥವಾ ಬ್ಯಾಟರಿ ಬೇಗ ಖಾಲಿಯಾಗುತ್ತಿದೆ.",
      mr: "डिव्हाइस चार्ज होत नाहीये किंवा बॅटरी लगेच उतरते.",
      bn: "ডিভাইস চার্জ হচ্ছে না অথবা ব্যাটারি খুব দ্রুত শেষ হয়ে যাচ্ছে।",
      hinglish: "Device charge nahi ho raha ya battery fast drain ho rahi hai.",
    },
    steps: {
      en: [
        "Connect the official 5V / 2A fast adapter and certified Type-C charging cable.",
        "Leave the device on uninterrupted charge for at least 25-30 minutes.",
        "Verify that the Red LED charging indicator glows when plugged in.",
        "Inspect the Type-C port and clean any lint or debris with a soft dry brush.",
        "After charging, hold the Power ON button for 10 seconds to start the terminal."
      ],
      hi: [
        "ओरिजिनल 5V/2A चार्जर और Type-C केबल को कनेक्ट करें।",
        "डिवाइस को कम से कम 25-30 मिनट तक लगातार चार्ज होने दें।",
        "चेक करें कि केबल लगाने पर लाल चार्जिंग लाइट जल रही है या नहीं।",
        "चार्जिंग पोर्ट में धूल होने पर सूखे ब्रश से साफ करें।",
        "चार्ज होने के बाद पावर बटन को 10 सेकंड दबाकर चालू करें।"
      ],
      te: [
        "ఒరిజినల్ 5V/2A అడాప్టర్ మరియు Type-C కేబుల్ కనెక్ట్ చేయండి.",
        "కనీసం 25-30 నిమిషాలు అంతరాయం లేకుండా ఛార్జ్ చేయండి.",
        "రెడ్ LED ఛార్జింగ్ లైట్ వెలుగుతుందో లేదో చూడండి.",
        "ఛార్జింగ్ తర్వాత పవర్ బటన్‌ను 10 సెకన్లు నొక్కి ఆన్ చేయండి."
      ],
      ta: [
        "அங்கீகரிக்கப்பட்ட Type-C சார்ஜரை இணைக்கவும்.",
        "குறைந்தது 25-30 நிமிடங்கள் தொடர்ந்து சார்ஜ் ஆக விடவும்.",
        "சிவப்பு நிற சார்ஜிங் LED லைட் எரிகிறதா என்று சரிபார்க்கவும்."
      ],
      kn: [
        "ಅಧಿಕೃತ Type-C ಚಾರ್ಜರ್ ಕನೆಕ್ಟ್ ಮಾಡಿ 25-30 ನಿಮಿಷ ಚಾರ್ಜ್ ಮಾಡಿ.",
        "ರೆಡ್ ಚಾರ್ಜಿಂಗ್ ಲೈಟ್ ಚೆಕ್ ಮಾಡಿ.",
        "ಪವರ್ ಬಟನ್ ಒತ್ತಿ ಆನ್ ಮಾಡಿ."
      ],
      mr: [
        "ओरिजिनल Type-C चार्जरने किमान 25-30 मिनिटे सलग चार्ज करा.",
        "लाल चार्जिंग इंडिकेटर लाइट सुरू आहे का ते तपासा."
      ],
      bn: [
        "আসল Type-C চার্জার দিয়ে ২৫-৩০ মিনিট একটানা চার্জ দিন।",
        "লাল চার্জিং লাইট জ্বলছে কিনা নিশ্চিত করুন।"
      ],
      hinglish: [
        "Official 5V/2A adapter and Type-C cable connect karein.",
        "Device ko minimum 25-30 minutes continuously charge hone dein.",
        "Check karein ki Red charging indicator LED on hai ya nahi.",
        "Charge hone ke baad Power button 10 seconds hold karke start karein."
      ]
    }
  },
  {
    id: "payments",
    icon: ArrowRightLeft,
    category: "Transactions - Payment Gateway Routing",
    titles: {
      en: "Payment failed / Money deducted",
      hi: "पेमेंट फेल हो गया / ग्राहक के पैसे कट गए",
      te: "చెల్లింపు విఫలమైంది / డబ్బులు కట్ అయ్యాయి",
      ta: "பணம் கழிக்கப்பட்டது / கட்டணம் தோல்வி",
      kn: "ಪಾವತಿ ವಿಫಲವಾಗಿದೆ / ಹಣ ಕಡಿತವಾಗಿದೆ",
      mr: "पेमेंट अयशस्वी झाले / ग्राहकाचे पैसे कापले",
      bn: "পেমেন্ট ব্যর্থ হয়েছে / টাকা কেটে নিয়েছে",
      hinglish: "Payment fail ho gaya / customer ke paise kat gaye",
    },
    summaries: {
      en: "Amount debited from customer bank account but transaction failed on POS.",
      hi: "ग्राहक के बैंक से पैसे कट गए पर मशीन पर फेल्ड दिखा रहा है।",
      te: "కస్టమర్ ఖాతా నుండి డబ్బులు కట్ అయ్యాయి కానీ మెషీన్‌లో ఫెయిల్ వచ్చింది.",
      ta: "வாடிக்கையாளர் கணக்கிலிருந்து பணம் கழிக்கப்பட்டு இயந்திரத்தில் தோல்வியடைந்தது.",
      kn: "ಗ್ರಾಹಕರ ಬ್ಯಾಂಕ್‌ನಿಂದ ಹಣ ಕಡಿತವಾಗಿದ್ದು, ಮೆಷಿನ್‌ನಲ್ಲಿ ಫೇಲ್ ಆಗಿದೆ.",
      mr: "ग्राहकाच्या खात्यातून पैसे कट झाले पण मशीनवर फेल आले.",
      bn: "গ্রাহকের অ্যাকাউন্ট থেকে টাকা কেটেছে কিন্তু মেশিনে ব্যর্থ দেখাচ্ছে।",
      hinglish: "Customer ke account se paise deduct ho gaye par terminal par failed dikha raha hai.",
    },
    steps: {
      en: [
        "Ask the customer for the 12-digit Bank Reference / UTR Number from their UPI SMS.",
        "Open your FinAI Transactions tab to verify real-time status of the transaction.",
        "If money was deducted from customer during a failed transaction, NPCI banking systems auto-refund the full amount to customer account within 24 to 48 hours.",
        "Do NOT hand over goods until you receive green 'Success' status or audio confirmation."
      ],
      hi: [
        "ग्राहक के बैंक SMS से 12 अंकों का UTR / RRN नंबर प्राप्त करें।",
        "FinAI के 'Transactions' टैब में जाकर स्टेटस चेक करें।",
        "यदि पैसे कट गए हैं और मशीन पर फेल्ड है, तो बैंक NPCI नियम अनुसार 24-48 घंटों में ग्राहक को स्वतः रिफंड कर देता है।",
        "जब तक साउंड बॉक्स पर सक्सेस आवाज या ग्रीन टिक न आए, सामान न दें।"
      ],
      te: [
        "కస్టమర్ బ్యాంక్ SMS నుండి 12 అంకెల UTR / RRN నంబర్ తీసుకోండి.",
        "FinAI 'Transactions' ట్యాబ్‌లో స్టేటస్ చెక్ చేయండి.",
        "డబ్బులు కట్ అయి ఫెయిల్ అయితే, NPCI బ్యాంకింగ్ నిబంధనల ప్రకారం 24-48 గంటల్లో కస్టమర్ ఖాతాకి ఆటో-రీఫండ్ అవుతుంది."
      ],
      ta: [
        "வாடிக்கையாளரிடம் 12 இலக்க UTR எண்ணை கேட்கவும்.",
        "FinAI Transactions பக்கத்தில் நிலையை சரிபார்க்கவும்.",
        "தோல்வியடைந்த பரிவர்த்தனைகளுக்கு 24-48 மணிநேரத்திற்குள் வங்கி தானாகவே பணத்தை திருப்பி செலுத்தும்."
      ],
      kn: [
        "ಗ್ರಾಹಕರಿಂದ 12 ಅಂಕೆಯ UTR ಸಂಖ್ಯೆಯನ್ನು ಪಡೆಯಿರಿ.",
        "ಫೇಲ್ ಆದ ವಹಿವಾಟುಗಳಿಗೆ ಬ್ಯಾಂಕ್ 24-48 ಗಂಟೆಗಳಲ್ಲಿ ಹಣವನ್ನು ಮರಳಿ ಜಮಾ ಮಾಡುತ್ತದೆ."
      ],
      mr: [
        "ग्राहकाकडून 12 अंकी UTR नंबर घ्या आणि ट्रान्झॅक्शन टॅबमध्ये तपासा.",
        "पैसे कट झाले असल्यास 24-48 तासांत ग्राहकाला बँक रिफंड करते."
      ],
      bn: [
        "গ্রাহকের থেকে ১২ ডিজিটের UTR নম্বর নিন।",
        "২৪-৪৮ ঘণ্টার মধ্যে ব্যাংক স্বয়ংক্রিয়ভাবে গ্রাহককে টাকা ফেরত দিয়ে দেয়।"
      ],
      hinglish: [
        "Customer se unke payment SMS ka 12-digit UTR/RRN number lein.",
        "FinAI ke 'Transactions' tab me status live check karein.",
        "Agar transaction Failed hai aur paise kat gaye hain, to NPCI 24-48 hours me auto-refund kar deta hai."
      ]
    }
  },
  {
    id: "card",
    icon: CreditCard,
    category: "Swiping Machine - Card Reader & NFC",
    titles: {
      en: "Card swipe / chip / NFC tap not working",
      hi: "स्वाइप मशीन पर कार्ड / चिप / टैप काम नहीं कर रहा",
      te: "కార్డ్ స్వైప్ / చిప్ / ట్యాప్ పనిచేయడం లేదు",
      ta: "கார்டு ஸ்வைப் / சிப் / NFC வேலை செய்யவில்லை",
      kn: "ಕಾರ್ಡ್ ಸ್ವೈಪ್ ಅಥವಾ ಚಿಪ್ ಕೆಲಸ ಮಾಡುತ್ತಿಲ್ಲ",
      mr: "कार्ड स्वाइप / चिप / NFC टॅप चालत नाहीये",
      bn: "কার্ড সোয়াইপ বা চিপ কাজ করছে না",
      hinglish: "Card swipe / chip insert / tap fail ho raha hai",
    },
    summaries: {
      en: "POS card reader chip error, magnetic stripe read failure, or NFC contactless tap issue.",
      hi: "स्वाइप मशीन में कार्ड रीड नहीं हो रहा या चिप एरर आ रहा है।",
      te: "POS కార్డ్ రీడర్ చిప్ ఎర్రర్ లేదా స్వైప్ కావడం లేదు.",
      ta: "கார்டு ரீடர் சிப் அல்லது ஸ்வைப் வேலை செய்யவில்லை.",
      kn: "ಕಾರ್ಡ್ ರೀಡರ್ ಸಮಸ್ಯೆ ಕಂಡುಬಂದಿದೆ.",
      mr: "कार्ड रीडर चिप किंवा स्वाइप त्रुटी येत आहे.",
      bn: "কার্ড রিডার চিপ বা সোয়াইপে সমস্যা হচ্ছে।",
      hinglish: "POS machine me card chip read nahi ho raha ya swipe error aa raha hai.",
    },
    steps: {
      en: [
        "Gently wipe the gold EMV chip of the card with a soft clean cloth.",
        "For Chip Insert: Insert card firmly into the bottom slot until you hear the audio beep.",
        "For Contactless (NFC Tap): Hold the card steady 2-3 cm directly above the LCD screen for 3 seconds.",
        "For Swipe: Swipe the magnetic stripe smoothly from top to bottom in a continuous motion.",
        "If POS displays 'Host Timeout', restart the device using Power button."
      ],
      hi: [
        "कार्ड के गोल्डन चिप को सूखे साफ कपड़े से पोंछें।",
        "चिप इंसर्ट: कार्ड को नीचे वाले स्लॉट में पूरी तरह डालें जब तक बीप की आवाज न आए।",
        "टैप एंड पे (NFC): कार्ड को स्क्रीन के ऊपर 2-3 सेमी की दूरी पर 3 सेकंड तक स्थिर रखें।",
        "स्वाइप: कार्ड को ऊपर से नीचे एक समान गति में स्वाइप करें।",
        "यदि मशीन पर 'होस्ट टाइमआउट' दिखे, तो मशीन को रीस्टार्ट करें।"
      ],
      te: [
        "కార్డ్ గోల్డెన్ చిప్‌ను శుభ్రమైన గుడ్డతో తుడవండి.",
        "చిప్ ఇన్సర్ట్: బీప్ శబ్దం వచ్చే వరకు కార్డ్‌ను క్రింది స్లాట్‌లో పూర్తిగా ఉంచండి.",
        "NFC ట్యాప్: స్క్రీన్ పైన 2-3 సెం.మీ దూరంలో 3 సెకన్లు పట్టుకోండి.",
        "స్వైప్: కార్డ్‌ను పై నుండి క్రిందికి ఒకే రీతిలో స్వైప్ చేయండి."
      ],
      ta: [
        "கார்டின் தங்க சிப்பை மென்மையான துணியால் துடைக்கவும்.",
        "சிப்பை கீழே உள்ள ஸ்லாட்டில் பீப் சத்தம் வரும் வரை முழுமையாக செருகவும்.",
        "NFC டாப்: திரைக்கு மேலே 2-3 செ.மீ தூரத்தில் 3 வினாடிகள் வைத்திருக்கவும்."
      ],
      kn: [
        "ಕಾರ್ಡ್‌ನ ಗೋಲ್ಡನ್ ಚಿಪ್ ಅನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ ಮತ್ತು ಸರಿಯಾಗಿ ಇನ್ಸರ್ಟ್ ಮಾಡಿ.",
        "NFC ಟ್ಯಾಪ್ ಮಾಡಲು ಕಾರ್ಡ್ ಅನ್ನು ಸ್ಕ್ರೀನ್ ಮೇಲೆ 3 ಸೆಕೆಂಡು ಇರಿಸಿ."
      ],
      mr: [
        "कार्डची सोनेरी चिप स्वच्छ पुसून स्लॉटमध्ये व्यवस्थित टाका.",
        "NFC टॅपसाठी कार्ड स्क्रीनच्या वर 3 सेकंद स्थिर धरा."
      ],
      bn: [
        "কার্ডের গোল্ডেন চিপটি পরিষ্কার করে স্লটে প্রবেশ করান।",
        "ট্যাপ পেমেন্টের জন্য স্ক্রিনের ওপর ৩ সেকেন্ড কার্ডটি ধরে রাখুন।"
      ],
      hinglish: [
        "Card ke golden chip ko clean cloth se wipe karein.",
        "Chip Insert: Bottom slot me card insert karein jab tak beep sound na aaye.",
        "NFC Tap: Screen ke upar 2-3 cm par card 3 seconds tak hold karein.",
        "Swipe: Top to bottom smoothly card swipe karein."
      ]
    }
  },
  {
    id: "settlement",
    icon: Landmark,
    category: "Merchant Account - Bank Settlement",
    titles: {
      en: "Daily settlement / payout pending",
      hi: "दैनिक सेटलमेंट / बैंक खाता क्रेडिट पेंडिंग",
      te: "రోజువారీ సెటిల్‌మెంట్ / బ్యాంక్ జమ కాలేదు",
      ta: "தினசரி செட்டில்மென்ட் / வங்கி கணக்கு வரவு நிலுவை",
      kn: "ದೈನಂದಿನ ಸೆಟಲ್‌ಮೆಂಟ್ ಬಾಕಿ ಇದೆ",
      mr: "दैनिक सेटलमेंट / बँक खात्यात पैसे जमा झाले नाहीत",
      bn: "দৈনিক সেটেলমেন্ট / ব্যাংকে টাকা জমা হয়নি",
      hinglish: "Daily settlement / payout account me nahi aaya",
    },
    summaries: {
      en: "Daily merchant settlement payout pending or bank holiday delay.",
      hi: "दैनिक व्यापारिक सेटलमेंट बैंक खाते में पेंडिंग है।",
      te: "రోజువారీ పేమెంట్స్ బ్యాంక్ ఖాతాలో ఇంకా జమ కాలేదు.",
      ta: "வங்கி செட்டில்மென்ட் கணக்கில் வரவு வைக்கப்படவில்லை.",
      kn: "ಬ್ಯಾಂಕ್ ಸೆಟಲ್‌ಮೆಂಟ್ ಖಾತೆಗೆ ಜಮೆಯಾಗಿಲ್ಲ.",
      mr: "बँक खात्यात दैनंदिन सेटलमेंट जमा झाले नाही.",
      bn: "দৈনিক সেটেলমেন্টের টাকা ব্যাংক অ্যাকাউন্টে জমা হয়নি।",
      hinglish: "Daily settlement bank account me pending hai.",
    },
    steps: {
      en: [
        "Automated batch settlement credits your registered bank account daily at 11:30 PM (T+1 schedule).",
        "To settle immediately, perform Manual Batch Close on POS: Go to Menu -> 'Settlement' -> 'Batch Settle Now'.",
        "Check your registered IFSC and Bank Account number in the Merchant Profile tab.",
        "Settlements on RBI bank holidays are processed on the next banking business morning."
      ],
      hi: [
        "ऑटोमेटेड बैच सेटलमेंट रोज रात 11:30 बजे आपके पंजीकृत बैंक खाते में भेजा जाता है।",
        "तुरंत सेटलमेंट के लिए POS मशीन के मेनू में जाएं -> 'Settlement' -> 'Batch Settle Now' दबाएं।",
        "अपने मर्चेंट प्रोफाइल में रजिस्टर्ड बैंक खाता और IFSC कोड सही होना सुनिश्चित करें।",
        "बैंक अवकाश (Holiday) होने पर अगले कार्य दिवस की सुबह सेटलमेंट क्रेडिट होता है।"
      ],
      te: [
        "ఆటోమేటెడ్ బ్యాచ్ సెటిల్‌మెంట్ ప్రతిరోజూ రాత్రి 11:30 గంటలకు మీ బ్యాంక్ ఖాతాలో జమ అవుతుంది.",
        "వెంటనే పొందడానికి POS మెను -> 'Settlement' -> 'Batch Settle Now' నొక్కండి.",
        "బ్యాంక్ సెలవు దినాల్లో తర్వాతి బ్యాంకింగ్ పని దినం ఉదయం సెటిల్‌మెంట్ అవుతుంది."
      ],
      ta: [
        "தினசரி செட்டில்மென்ட் தானாகவே இரவு 11:30 மணிக்கு வங்கி கணக்கில் வரவு வைக்கப்படும்.",
        "உடனடி செட்டில்மென்ட்டுக்கு மெனுவில் 'Batch Settle Now' அழுத்தவும்."
      ],
      kn: [
        "ಸ್ವಯಂಚಾಲಿತ ಸೆಟಲ್‌ಮೆಂಟ್ ರಾತ್ರಿ 11:30ಕ್ಕೆ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮೆಯಾಗುತ್ತದೆ.",
        "ತುರ್ತು ಸೆಟಲ್‌ಮೆಂಟ್‌ಗಾಗಿ POS ಮೆನುವಿನಲ್ಲಿ 'Batch Settle Now' ಒತ್ತಿರಿ."
      ],
      mr: [
        "दररोज रात्री 11:30 वाजता सेटलमेंट बँक खात्यात आपोआप जमा होते.",
        "तातडीने सेटलमेंटसाठी मेनूमध्ये जाऊन 'Batch Settle Now' निवडा."
      ],
      bn: [
        "প্রতিদিন রাত ১১:৩০ টায় স্বয়ংক্রিয়ভাবে ব্যাংকে টাকা জমা হয়।",
        "তাৎক্ষণিক সেটেলমেন্টের জন্য POS মেনু থেকে 'Batch Settle Now' সিলেক্ট করুন।"
      ],
      hinglish: [
        "Daily automated settlement raat 11:30 PM par direct registered bank account me credit hota hai.",
        "Instant settlement ke liye POS Menu -> 'Settlement' -> 'Batch Settle Now' press karein.",
        "Bank holiday hone par agle official banking day subah settlement process hota hai."
      ]
    }
  },
  {
    id: "qr_display",
    icon: QrCode,
    category: "Smart Soundbox & POS - Dynamic QR",
    titles: {
      en: "Dynamic QR code not displaying",
      hi: "स्क्रीन पर QR कोड नहीं आ रहा",
      te: "స్క్రీన్‌పై QR కోడ్ కనిపించడం లేదు",
      ta: "QR குறியீடு திரையில் தெரியவில்லை",
      kn: "QR ಕೋಡ್ ಡಿಸ್ಪ್ಲೇ ಆಗುತ್ತಿಲ್ಲ",
      mr: "स्क्रीनवर QR कोड दिसत नाहीये",
      bn: "স্ক্রিনে QR কোড দেখা যাচ্ছে না",
      hinglish: "Display par QR code show nahi ho raha",
    },
    summaries: {
      en: "Dynamic UPI QR code screen blank or failed to render on terminal display.",
      hi: "साउंडबॉक्स या POS स्क्रीन पर डायनेमिक QR कोड नहीं दिख रहा है।",
      te: "డైనమిక్ QR కోడ్ స్క్రీన్‌పై లోడ్ కావడం లేదు.",
      ta: "QR குறியீடு திரையில் வரவில்லை.",
      kn: "QR ಕೋಡ್ ಸ್ಕ್ರೀನ್ ಮೇಲೆ ಬರುತ್ತಿಲ್ಲ.",
      mr: "स्क्रीनवर QR कोड लोड होत नाहीये.",
      bn: "স্ক্রিনে QR কোড লোড হচ্ছে না।",
      hinglish: "POS ya Soundbox display par dynamic QR generate nahi ho raha.",
    },
    steps: {
      en: [
        "Verify your terminal has active 4G data or connected Wi-Fi signal.",
        "Press the 'Cancel / Clear' button on keypad to refresh display buffer.",
        "Restart the device by holding Power button to synchronize NPCI dynamic encryption keys.",
        "Use your backup static QR standee while device re-syncs."
      ],
      hi: [
        "सुनिश्चित करें कि डिवाइस में सक्रिय 4G नेटवर्क या Wi-Fi कनेक्ट है।",
        "डिस्प्ले बफर रीसेट करने के लिए 'Cancel / Clear' बटन दबाएं।",
        "NPCI सुरक्षा कीज़ सिंक करने के लिए मशीन को रीस्टार्ट करें।",
        "सिंक होने तक बैकअप स्टैंडी QR कोड का उपयोग करें।"
      ],
      te: [
        "డివైజ్‌లో 4G నెట్‌వర్క్ లేదా Wi-Fi సిగ్నల్ ఉందో లేదో చూడండి.",
        "డిస్‌ప్లే రీసెట్ చేయడానికి 'Cancel' బటన్ నొక్కండి.",
        "మెషిన్‌ని రీస్టార్ట్ చేసి మళ్ళీ ప్రయత్నించండి."
      ],
      ta: [
        "இணைய இணைப்பு சரியாக உள்ளதா என்று சரிபார்க்கவும்.",
        "'Cancel' பொத்தானை அழுத்தி திரையை புதுப்பிக்கவும்.",
        "சாதனத்தை மறுதொடக்கம் செய்யவும்."
      ],
      kn: [
        "ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ.",
        "ಕ್ಯಾನ್ಸಲ್ ಬಟನ್ ಒತ್ತಿ ಡಿವೈಸ್ ರಿಸ್ಟಾರ್ಟ್ ಮಾಡಿ."
      ],
      mr: [
        "इंटरनेट कनेक्शन चालू आहे का ते तपासा.",
        "डिव्हाइस रीस्टार्ट करून पुन्हा प्रयत्न करा."
      ],
      bn: [
        "ইন্টারনেট কানেকশন চেক করুন।",
        "ডিভাইস রিস্টার্ট করে আবার চেষ্টা করুন।"
      ],
      hinglish: [
        "Verify karein ki terminal me active 4G data ya Wi-Fi connected hai.",
        "Keypad par 'Cancel / Clear' button press karke buffer clear karein.",
        "Machine ko restart karein taaki NPCI QR encryption keys sync ho sakein."
      ]
    }
  },
  {
    id: "language_change",
    icon: Languages,
    category: "Sound Box - Audio Localization",
    titles: {
      en: "Change soundbox voice language",
      hi: "साउंडबॉक्स बोलने की भाषा बदलें",
      te: "సౌండ్‌బాక్స్ వాయిస్ భాషను మార్చండి",
      ta: "சவுண்ட்பாக்ஸ் குரல் மொழியை மாற்றவும்",
      kn: "ಸೌಂಡ್‌ಬಾಕ್ಸ್ ಧ್ವನಿ ಭಾಷೆ ಬದಲಾಯಿಸಿ",
      mr: "साउंडबॉक्स बोलण्याची भाषा बदला",
      bn: "সাउंडবক্সের ভয়েস ভাষা পরিবর্তন করুন",
      hinglish: "Soundbox ki voice announcement language change karein",
    },
    summaries: {
      en: "Change soundbox payment alert voice between Hindi, English, Telugu, Tamil, etc.",
      hi: "साउंडबॉक्स की पेमेंट अनाउंसमेंट भाषा हिंदी, तेलुगु, तमिल, अंग्रेजी आदि में बदलें।",
      te: "సౌండ్‌బాక్స్ వాయిస్ భాషను తెలుగు, హిందీ, ఇంగ్లీష్‌లలో మార్చడం.",
      ta: "சவுண்ட்பாக்ஸ் குரல் மொழியை மாற்றும் முறை.",
      kn: "ಸೌಂಡ್‌ಬಾಕ್ಸ್ ಭಾಷೆ ಬದಲಾವಣೆ.",
      mr: "साउंडबॉक्सची भाषा बदलण्याची पद्धत.",
      bn: "সাउंडবক্সের ভাষা পরিবর্তন করার নিয়ম।",
      hinglish: "Soundbox audio alert language ko Hindi/Telugu/Tamil me switch karna.",
    },
    steps: {
      en: [
        "Press and hold the dedicated 'Language' button on top or side of the soundbox for 3 seconds.",
        "The soundbox will cycle through audio prompts: 'Hindi', 'English', 'Telugu', 'Tamil', 'Kannada', 'Marathi', 'Bengali'.",
        "Release the button immediately when you hear your preferred language.",
        "Or open Payswiff App -> Soundbox Settings -> 'Audio Language' -> Tap 'Sync Device'."
      ],
      hi: [
        "साउंडबॉक्स के ऊपर या साइड में दिए गए 'Language' बटन को 3 सेकंड तक दबाकर रखें।",
        "साउंडबॉक्स सभी भाषाओं के नाम बोलेगा: 'हिंदी', 'अंग्रेजी', 'तेलुगु', 'तमिल', 'मराठी' आदि।",
        "जैसे ही आपकी पसंदीदा भाषा की आवाज आए, तुरंत बटन छोड़ दें।",
        "या Payswiff ऐप में जाकर 'Soundbox Settings' से भाषा सिंक करें।"
      ],
      te: [
        "సౌండ్‌బాక్స్ పైన ఉన్న 'Language' బటన్‌ను 3 సెకన్లు నొక్కి ఉంచండి.",
        "సౌండ్‌బాక్స్ వరుసగా భాషల పేర్లను వినిపిస్తుంది (తెలుగు, హిందీ, ఇంగ్లీష్...)",
        "మీకు కావలసిన భాష వినిపించిన వెంటనే బటన్‌ను వదిలేయండి."
      ],
      ta: [
        "சவுண்ட்பாக்ஸில் உள்ள 'Language' பட்டனை 3 வினாடிகள் அழுத்திப் பிடிக்கவும்.",
        "விரும்பிய மொழி ஒலித்தவுடன் பட்டனை விட்டுவிடவும்."
      ],
      kn: [
        "ಸೌಂಡ್‌ಬಾಕ್ಸ್‌ನಲ್ಲಿರುವ 'Language' ಬಟನ್ ಅನ್ನು 3 ಸೆಕೆಂಡುಗಳ ಕಾಲ ಒತ್ತಿ ಹಿಡಿಯಿರಿ.",
        "ನಿಮ್ಮ ಆಯ್ಕೆಯ ಭಾಷೆ ಕೇಳಿದಾಗ ಬಟನ್ ಬಿಡಿ."
      ],
      mr: [
        "साउंडबॉक्सवरील 'Language' बटण 3 सेकंद दाबून ठेवा.",
        "तुमची आवडती भाषा ऐकू आल्यावर बटण सोडून द्या."
      ],
      bn: [
        "সাউন্ডবক্সের 'Language' বাটনটি ৩ সেকেন্ড চেপে ধরে রাখুন।",
        "পছন্দের ভাষা শোনার সাথে সাথে বাটনটি ছেড়ে দিন।"
      ],
      hinglish: [
        "Soundbox ke top ya side me 'Language' button ko 3 seconds tak hold karein.",
        "Soundbox languages cycle karega: Hindi, English, Telugu, Tamil, Marathi, Bengali.",
        "Jaise hi aapki preferred language sunai de, button chhod dein."
      ]
    }
  }
];

const UI_TEXTS: Record<LanguageCode, {
  welcome1: string;
  welcome2: string;
  selectLanguagePrompt: string;
  quickOptionsTitle: string;
  othersButton: string;
  troubleshootHeader: string;
  solvedQuestion: string;
  solvedBtn: string;
  notSolvedBtn: string;
  ticketRaisedTitle: string;
  ticketSub: string;
  merchantProfile: string;
  problemFaced: string;
  sla: string;
  slaValue: string;
  callAgentBtn: string;
  liveChatBtn: string;
  inputPlaceholder: string;
  restartTooltip: string;
  restartBtn: string;
  feedbackTitle: string;
  feedbackPlaceholder: string;
  feedbackSubmit: string;
  feedbackThankYou: string;
  onlineSupport: string;
}> = {
  en: {
    welcome1: "Hello! Welcome to the FinAI 24/7 Customer Care Assistant.",
    welcome2: "How can we assist your business or hardware today? Select a common issue or type anything below in your preferred language.",
    selectLanguagePrompt: "🌐 Choose your preferred language / अपनी भाषा चुनें:",
    quickOptionsTitle: "Frequently Asked Questions & Quick Solutions",
    othersButton: "Others / Talk to Specialist",
    troubleshootHeader: "Step-by-Step Diagnostic Troubleshooting",
    solvedQuestion: "Did this troubleshooting solve your problem?",
    solvedBtn: "Yes, issue is solved!",
    notSolvedBtn: "No, contact support person",
    ticketRaisedTitle: "Customer Care Ticket Raised",
    ticketSub: "Our support executive will contact you shortly",
    merchantProfile: "Merchant Account",
    problemFaced: "Problem Reported",
    sla: "Response SLA",
    slaValue: "Executive Calling Within < 10 Mins",
    callAgentBtn: "Call Support Helpline",
    liveChatBtn: "Request Instant Callback",
    inputPlaceholder: "Type your query in English, Hindi, Telugu, Tamil, Hinglish...",
    restartTooltip: "Click here to restart conversation",
    restartBtn: "Restart",
    feedbackTitle: "Please rate your support experience:",
    feedbackPlaceholder: "Share any feedback or suggestions (optional)...",
    feedbackSubmit: "Submit Feedback",
    feedbackThankYou: "Thank you for your rating! Your feedback helps us deliver exceptional service.",
    onlineSupport: "Payswiff POS & Soundbox Care",
  },
  hi: {
    welcome1: "नमस्ते! FinAI 24/7 कस्टमर केयर सहायक में आपका स्वागत है।",
    welcome2: "आज हम आपकी क्या सहायता कर सकते हैं? नीचे से कोई समस्या चुनें या अपनी भाषा में कोई भी प्रश्न टाइप करें।",
    selectLanguagePrompt: "🌐 अपनी पसंदीदा भाषा चुनें / Choose your language:",
    quickOptionsTitle: "अक्सर पूछे जाने वाले प्रश्न एवं त्वरित समाधान",
    othersButton: "अन्य समस्या / प्रतिनिधि से बात करें",
    troubleshootHeader: "चरण-दर-चरण समस्या निवारण प्रक्रिया",
    solvedQuestion: "क्या इस समाधान से आपकी समस्या ठीक हो गई?",
    solvedBtn: "हाँ, समस्या हल हो गई!",
    notSolvedBtn: "नहीं, कस्टमर केयर प्रतिनिधि से संपर्क करें",
    ticketRaisedTitle: "सपोर्ट टिकट दर्ज कर दिया गया है",
    ticketSub: "हमारे सपोर्ट अधिकारी जल्द ही आपसे संपर्क करेंगे",
    merchantProfile: "मर्चेंट खाता",
    problemFaced: "दर्ज समस्या",
    sla: "प्रतिक्रिया समय",
    slaValue: "10 मिनट के भीतर कॉल बैक",
    callAgentBtn: "हेल्पलाइन पर कॉल करें",
    liveChatBtn: "कॉल बैक का अनुरोध करें",
    inputPlaceholder: "अपना प्रश्न हिंदी, हिंग्लिश या किसी भी भाषा में लिखें...",
    restartTooltip: "बातचीत फिर से शुरू करने के लिए यहाँ क्लिक करें",
    restartBtn: "रीस्टार्ट",
    feedbackTitle: "कृपया अपने अनुभव को रेटिंग दें:",
    feedbackPlaceholder: "कोई सुझाव या प्रतिक्रिया साझा करें (वैकल्पिक)...",
    feedbackSubmit: "रेटिंग सबमिट करें",
    feedbackThankYou: "आपकी रेटिंग के लिए धन्यवाद! हम निरंतर बेहतर सेवा प्रदान करने के लिए प्रतिबद्ध हैं।",
    onlineSupport: "Payswiff POS एवं साउंडबॉक्स सहायता",
  },
  te: {
    welcome1: "నమస్కారం! FinAI 24/7 కస్టమర్ కేర్ అసిస్టెంట్‌కు స్వాగతం.",
    welcome2: "ఈరోజు మేము మీకు ఎలా సహాయపడగలము? క్రింది సమస్యలలో ఒకదాన్ని ఎంచుకోండి లేదా మీ ప్రశ్నను టైప్ చేయండి.",
    selectLanguagePrompt: "🌐 మీ భాషను ఎంచుకోండి / Choose your language:",
    quickOptionsTitle: "తరచుగా అడిగే ప్రశ్నలు & త్వరిత పరిష్కారాలు",
    othersButton: "ఇతర సమస్య / ప్రతినిధితో మాట్లాడండి",
    troubleshootHeader: "దశలవారీ పరిష్కార విధానం",
    solvedQuestion: "ఈ పరిష్కారంతో మీ సమస్య పరిష్కారం అయిందా?",
    solvedBtn: "అవును, సమస్య పరిష్కారమైంది!",
    notSolvedBtn: "లేదు, సపోర్ట్ ఏజెంట్‌ను సంప్రదించండి",
    ticketRaisedTitle: "కస్టమర్ కేర్ టికెట్ నమోదైంది",
    ticketSub: "మా సాంకేతిక నిపుణులు త్వరలోనే మిమ్మల్ని సంప్రదిస్తారు",
    merchantProfile: "వ్యాపారి ఖాతా",
    problemFaced: "నమోదైన సమస్య",
    sla: "స్పందన సమయం",
    slaValue: "< 10 నిమిషాల్లో కాల్ వస్తుంది",
    callAgentBtn: "హెల్ప్‌లైన్‌కు కాల్ చేయండి",
    liveChatBtn: "కాల్ బ్యాక్ అభ్యర్థించండి",
    inputPlaceholder: "మీ ప్రశ్నను తెలుగు, ఇంగ్లీష్ లేదా ఏదైనా భాషలో టైప్ చేయండి...",
    restartTooltip: "సంభాషణను మళ్ళీ ప్రారంభించండి",
    restartBtn: "రీస్టార్ట్",
    feedbackTitle: "దయచేసి మీ రేటింగ్ ఇవ్వండి:",
    feedbackPlaceholder: "మీ అభిప్రాయాన్ని తెలపండి (ఐచ్ఛికం)...",
    feedbackSubmit: "రేటింగ్ సమర్పించండి",
    feedbackThankYou: "మీ అభిప్రాయానికి ధన్యవాదాలు!",
    onlineSupport: "Payswiff సౌండ్‌బాక్స్ & POS కేర్",
  },
  ta: {
    welcome1: "வணக்கம்! FinAI 24/7 வாடிக்கையாளர் சேவைக்கு வரவேற்கிறோம்.",
    welcome2: "இன்று நாங்கள் உங்களுக்கு எவ்வாறு உதவ முடியும்? கீழே உள்ள விருப்பங்களில் ஒன்றைத் தேர்ந்தெடுக்கவும் அல்லது உங்கள் கேள்வியை தட்டச்சு செய்யவும்.",
    selectLanguagePrompt: "🌐 உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்:",
    quickOptionsTitle: "பொதுவான பிரச்சனைகள் & தீர்வுகள்",
    othersButton: "பிற பிரச்சனைகள் / அதிகாரியிடம் பேசவும்",
    troubleshootHeader: "படி-படியான தீர்வு வழிகாட்டி",
    solvedQuestion: "உங்கள் பிரச்சனை தீர்க்கப்பட்டதா?",
    solvedBtn: "ஆம், பிரச்சனை தீர்ந்தது!",
    notSolvedBtn: "இல்லை, சேவை அதிகாரியை தொடர்பு கொள்ளவும்",
    ticketRaisedTitle: "ஆதரவு டிக்கெட் பதிவு செய்யப்பட்டது",
    ticketSub: "எங்கள் சேவை அதிகாரி விரைவில் உங்களை தொடர்புகொள்வார்",
    merchantProfile: "வணிகர் கணக்கு",
    problemFaced: "தெரிவிக்கப்பட்ட பிரச்சனை",
    sla: "பதில் நேரம்",
    slaValue: "< 10 நிமிடங்களில் அழைப்பு வரும்",
    callAgentBtn: "உதவி மையத்தை அழைக்கவும்",
    liveChatBtn: "உடனடி அழைப்பை கோரவும்",
    inputPlaceholder: "உங்கள் கேள்வியை தமிழ் அல்லது ஆங்கிலத்தில் தட்டச்சு செய்யவும்...",
    restartTooltip: "மறுதொடக்கம் செய்ய கிளிக் செய்யவும்",
    restartBtn: "மறுதொடக்கம்",
    feedbackTitle: "உங்கள் மதிப்பீட்டை வழங்கவும்:",
    feedbackPlaceholder: "உங்கள் கருத்துக்களை பகிரவும்...",
    feedbackSubmit: "சமர்ப்பிக்கவும்",
    feedbackThankYou: "உங்கள் மதிப்பீட்டிற்கு நன்றி!",
    onlineSupport: "Payswiff POS & சவுண்ட்பாக்ஸ் சேவை",
  },
  kn: {
    welcome1: "ನಮಸ್ಕಾರ! FinAI 24/7 ಗ್ರಾಹಕ ಸೇವೆಗೆ ಸುಸ್ವಾಗತ.",
    welcome2: "ನಾವು ನಿಮಗೆ ಇಂದು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು? ಕೆಳಗಿನ ಆಯ್ಕೆಗಳಲ್ಲಿ ಒಂದನ್ನು ಆರಿಸಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ.",
    selectLanguagePrompt: "🌐 ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ:",
    quickOptionsTitle: "ಸಾಮಾನ್ಯ ಸಮಸ್ಯೆಗಳು & ತ್ವರಿತ ಪರಿಹಾರಗಳು",
    othersButton: "ಇತರ ಸಮಸ್ಯೆ / ತಜ್ಞರೊಂದಿಗೆ ಮಾತನಾಡಿ",
    troubleshootHeader: "ಹಂತ-ಹಂತದ ಪರಿಹಾರ ವಿಧಾನ",
    solvedQuestion: "ನಿಮ್ಮ ಸಮಸ್ಯೆ ಪರಿಹಾರವಾಗಿದೆಯೇ?",
    solvedBtn: "ಹೌದು, ಪರಿಹಾರವಾಗಿದೆ!",
    notSolvedBtn: "ಇಲ್ಲ, ಸಪೋರ್ಟ್ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ",
    ticketRaisedTitle: "ಗ್ರಾಹಕ ಸೇವಾ ಟಿಕೆಟ್ ರಚಿಸಲಾಗಿದೆ",
    ticketSub: "ನಮ್ಮ ತಂಡವು ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತದೆ",
    merchantProfile: "ವರ್ತಕರ ಖಾತೆ",
    problemFaced: "ವರದಿ ಮಾಡಿದ ಸಮಸ್ಯೆ",
    sla: "ಪ್ರತಿಕ್ರಿಯೆ ಸಮಯ",
    slaValue: "< 10 ನಿಮಿಷಗಳಲ್ಲಿ ಕರೆ",
    callAgentBtn: "ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಿ",
    liveChatBtn: "ಕಾಲ್‌ಬ್ಯಾಕ್ ವಿನಂತಿಸಿ",
    inputPlaceholder: "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...",
    restartTooltip: "ಮತ್ತೆ ಪ್ರಾರಂಭಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ",
    restartBtn: "ರೀಸ್ಟಾರ್ಟ್",
    feedbackTitle: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ರೇಟಿಂಗ್ ನೀಡಿ:",
    feedbackPlaceholder: "ನಿಮ್ಮ ಅಭಿಪ್ರಾಯ ಹಂಚಿಕೊಳ್ಳಿ...",
    feedbackSubmit: "ಸಲ್ಲಿಸಿ",
    feedbackThankYou: "ನಿಮ್ಮ ರೇಟಿಂಗ್‌ಗೆ ಧನ್ಯವಾದಗಳು!",
    onlineSupport: "Payswiff ಗ್ರಾಹಕ ಸೇವೆ",
  },
  mr: {
    welcome1: "नमस्कार! FinAI 24/7 ग्राहक सेवा सहाय्यकामध्ये आपले स्वागत आहे.",
    welcome2: "आम्ही आज तुम्हाला कशी मदत करू शकतो? खालीलपैकी एक पर्याय निवडा किंवा टाइप करा.",
    selectLanguagePrompt: "🌐 तुमची भाषा निवडा:",
    quickOptionsTitle: "सामान्य समस्या आणि उपाय",
    othersButton: "इतर समस्या / प्रतिनिधीशी बोला",
    troubleshootHeader: "टप्प्याटप्प्याने समस्यानिवारण प्रक्रिया",
    solvedQuestion: "आपली समस्या सुटली का?",
    solvedBtn: "होय, समस्या सुटली!",
    notSolvedBtn: "नाही, कस्टमर केअरशी संपर्क साधा",
    ticketRaisedTitle: "सपोर्ट तिकीट नोंदवले गेले आहे",
    ticketSub: "आमचे प्रतिनिधी लवकरच आपल्याशी संपर्क साधतील",
    merchantProfile: "व्यापारी खाते",
    problemFaced: "नोंदवलेली समस्या",
    sla: "प्रतिक्रिया वेळ",
    slaValue: "< 10 मिनिटांत कॉल येईल",
    callAgentBtn: "हेल्पलाइनवर कॉल करा",
    liveChatBtn: "कॉल बॅकची विनंती करा",
    inputPlaceholder: "तुमचा प्रश्न मराठी किंवा इंग्रजीत लिहा...",
    restartTooltip: "पुन्हा सुरू करण्यासाठी येथे क्लिक करा",
    restartBtn: "रीस्टार्ट",
    feedbackTitle: "कृपया आपला अनुभव रेट करा:",
    feedbackPlaceholder: "आपला अभिप्राय द्या...",
    feedbackSubmit: "रेटिंग सबमिट करा",
    feedbackThankYou: "आपल्या रेटिंगबद्दल धन्यवाद!",
    onlineSupport: "Payswiff POS व साउंडबॉक्स सेवा",
  },
  bn: {
    welcome1: "নমস্কার! FinAI 24/7 কাস্টমার কেয়ার সহায়িকাতে স্বাগতম।",
    welcome2: "আজ আমরা কীভাবে আপনাকে সাহায্য করতে পারি? নিচের বিকল্পগুলি বেছে নিন অথবা আপনার প্রশ্ন লিখুন।",
    selectLanguagePrompt: "🌐 আপনার পছন্দের ভাষা নির্বাচন করুন:",
    quickOptionsTitle: "সাধারণ সমস্যা ও সমাধান",
    othersButton: "অন্যান্য সমস্যা / প্রতিনিধির সাথে কথা বলুন",
    troubleshootHeader: "ধাপে ধাপে সমাধান প্রক্রিয়া",
    solvedQuestion: "আপনার সমস্যা সমাধান হয়েছে কি?",
    solvedBtn: "হ্যাঁ, সমস্যা সমাধান হয়েছে!",
    notSolvedBtn: "না, কাস্টমার কেয়ার প্রতিনিধির সাথে যোগাযোগ করুন",
    ticketRaisedTitle: "সাপোর্ট টিকিট তৈরি করা হয়েছে",
    ticketSub: "আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন",
    merchantProfile: "মার্চেন্ট প্রোফাইল",
    problemFaced: "রিপোর্ট করা সমস্যা",
    sla: "প্রতিক্রিয়ার সময়",
    slaValue: "< ১০ মিনিটের মধ্যে কল ব্যাক",
    callAgentBtn: "হেল্পলাইনে কল করুন",
    liveChatBtn: "কল ব্যাকের অনুরোধ করুন",
    inputPlaceholder: "আপনার প্রশ্ন বাংলা বা ইংরেজিতে লিখুন...",
    restartTooltip: "আবার শুরু করতে ক্লিক করুন",
    restartBtn: "রিস্টার্ট",
    feedbackTitle: "আপনার রেটিং দিন:",
    feedbackPlaceholder: "আপনার মতামত জানান...",
    feedbackSubmit: "জমা দিন",
    feedbackThankYou: "আপনার মূল্যবান রেটিংয়ের জন্য ধন্যবাদ!",
    onlineSupport: "Payswiff সাপোর্ট কেয়ার",
  },
  hinglish: {
    welcome1: "Hello! FinAI 24/7 Customer Care Assistant me aapka swagat hai.",
    welcome2: "Aaj hum aapki kya help kar sakte hain? Neeche diye options me se choose karein ya apna question type karein.",
    selectLanguagePrompt: "🌐 Apni preferred language choose karein:",
    quickOptionsTitle: "Frequently Asked Questions & Quick Solutions",
    othersButton: "Others / Executive se baat karein",
    troubleshootHeader: "Step-by-Step Troubleshooting Procedure",
    solvedQuestion: "Kya is troubleshooting se aapka issue solve ho gaya?",
    solvedBtn: "Haan, problem solve ho gaya!",
    notSolvedBtn: "Nahi, Support Executive se connect karein",
    ticketRaisedTitle: "Customer Care Ticket Raised",
    ticketSub: "Humare support officer jaldi hi aapse connect karenge",
    merchantProfile: "Merchant Account",
    problemFaced: "Reported Problem",
    sla: "Response SLA",
    slaValue: "< 10 Mins me Direct Call",
    callAgentBtn: "Call Support Helpline",
    liveChatBtn: "Request Instant Callback",
    inputPlaceholder: "Apna question Hinglish, Hindi ya English me type karein...",
    restartTooltip: "Conversation restart karne ke liye click karein",
    restartBtn: "Restart",
    feedbackTitle: "Apne experience ko rate karein:",
    feedbackPlaceholder: "Koi feedback ya suggestion share karein (optional)...",
    feedbackSubmit: "Submit Feedback",
    feedbackThankYou: "Thank you for your rating! Hum best service provide karne ke liye committed hain.",
    onlineSupport: "Payswiff POS & Soundbox Care",
  }
};

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  showLanguagePicker?: boolean;
  showOptions?: boolean;
  troubleshootingData?: {
    title: string;
    steps: string[];
    category: string;
    summary: string;
  };
  feedbackPending?: boolean;
  ticketData?: {
    ticket_id: string;
    merchant_name: string;
    category: string;
    problem_details: string;
    troubleshooting_attempted: string;
    status: string;
    assigned_to: string;
    priority: string;
    estimated_resolution_time: string;
  };
  resolved?: boolean;
}

export default function FinAIChatbot() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>("en");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const t = UI_TEXTS[currentLang] || UI_TEXTS.en;

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const startConversation = (lang: LanguageCode = "en") => {
    const timeNow = getCurrentTime();
    const txt = UI_TEXTS[lang] || UI_TEXTS.en;
    setRating(null);
    setRatingSubmitted(false);
    setFeedbackText("");
    
    setMessages([
      {
        id: "msg_lang_picker",
        sender: "bot",
        text: txt.selectLanguagePrompt,
        time: timeNow,
        showLanguagePicker: true,
      },
      {
        id: "msg_welcome_1",
        sender: "bot",
        text: txt.welcome1,
        time: timeNow,
      },
      {
        id: "msg_welcome_2",
        sender: "bot",
        text: txt.welcome2,
        time: timeNow,
        showOptions: true,
      },
    ]);
  };

  useEffect(() => {
    startConversation(currentLang);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleLanguageSelect = (lang: LanguageCode) => {
    setCurrentLang(lang);
    setLangMenuOpen(false);
    const selectedOpt = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
    const timeNow = getCurrentTime();
    const txt = UI_TEXTS[lang] || UI_TEXTS.en;

    const userMsg: Message = {
      id: `u_lang_${Date.now()}`,
      sender: "user",
      text: `${selectedOpt?.flag} ${selectedOpt?.label} (${selectedOpt?.nativeLabel})`,
      time: timeNow,
    };

    const confirmBotMsg: Message = {
      id: `b_lang_${Date.now() + 1}`,
      sender: "bot",
      text: `${txt.welcome1}\n\n${txt.welcome2}`,
      time: timeNow,
      showOptions: true,
    };

    setMessages((prev) => [...prev, userMsg, confirmBotMsg]);
  };

  const handleSelectProblem = (problemId: string) => {
    const problem = MULTILINGUAL_PROBLEMS.find((p) => p.id === problemId);
    if (!problem) return;

    const timeNow = getCurrentTime();
    const title = problem.titles[currentLang] || problem.titles.en;
    const summary = problem.summaries[currentLang] || problem.summaries.en;
    const steps = problem.steps[currentLang] || problem.steps.en;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: title,
      time: timeNow,
    };

    const botReply: Message = {
      id: `bot_${Date.now() + 1}`,
      sender: "bot",
      text: `📌 **${title}**:\n${summary}`,
      time: timeNow,
      troubleshootingData: {
        title: title,
        steps: steps,
        category: problem.category,
        summary: summary,
      },
      feedbackPending: true,
    };

    setMessages((prev) => [...prev, userMsg, botReply]);
  };

  const handleResolutionResponse = async (
    messageId: string,
    isSolved: boolean,
    category: string,
    problemTitle: string,
    problemSummary: string
  ) => {
    const timeNow = getCurrentTime();

    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedbackPending: false } : m))
    );

    if (isSolved) {
      const solvedMsg: Message = {
        id: `bot_solved_${Date.now()}`,
        sender: "bot",
        text: `🎉 **${currentLang === "hi" ? "बहुत बढ़िया! हमें खुशी है कि आपकी समस्या हल हो गई।" : currentLang === "te" ? "చాలా సంతోషం! మీ సమస్య పరిష్కారమైంది." : "Wonderful! We are delighted that your issue is resolved."}**\n\n${t.feedbackTitle}`,
        time: timeNow,
        resolved: true,
      };
      setMessages((prev) => [...prev, solvedMsg]);
    } else {
      setLoading(true);
      const merchantName = "Payswiff Merchant (Demo Store - ID: #1)";
      const problemFaced = problemSummary || problemTitle || category;

      try {
        const res = await axios.post(`${getApiBaseUrl()}/copilot/support-ticket`, {
          merchant_id: 1,
          category: category,
          details: `[${currentLang.toUpperCase()}] Problem: ${problemFaced}. Troubleshooting completed. Merchant requested priority callback.`,
          priority: "High",
        });

        const ticketData = res.data;
        const escalatedMsg: Message = {
          id: `bot_escalate_${Date.now()}`,
          sender: "bot",
          text: `👨‍💼 **${t.ticketRaisedTitle}**\n\n${t.ticketSub} (**Ticket #${ticketData.ticket_id}**).`,
          time: timeNow,
          resolved: true,
          ticketData: {
            ticket_id: ticketData.ticket_id,
            merchant_name: merchantName,
            category: ticketData.category,
            problem_details: problemFaced,
            troubleshooting_attempted: `Diagnostic troubleshooting steps executed in ${currentLang.toUpperCase()}.`,
            status: t.slaValue,
            assigned_to: ticketData.assigned_to || "Payswiff Support Specialist (On-Duty)",
            priority: ticketData.priority || "High (Urgent Hardware/Network Alert)",
            estimated_resolution_time: ticketData.estimated_resolution_time || "< 10 minutes",
          },
        };
        setMessages((prev) => [...prev, escalatedMsg]);
      } catch (err) {
        console.error(err);
        const fallbackTicket = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
        const fallbackMsg: Message = {
          id: `bot_escalate_${Date.now()}`,
          sender: "bot",
          text: `👨‍💼 **${t.ticketRaisedTitle}**\n\n${t.ticketSub} (Ticket #${fallbackTicket}).`,
          time: timeNow,
          resolved: true,
          ticketData: {
            ticket_id: fallbackTicket,
            merchant_name: merchantName,
            category: category,
            problem_details: problemFaced,
            troubleshooting_attempted: `Diagnostic troubleshooting completed.`,
            status: t.slaValue,
            assigned_to: "Payswiff Support Specialist (On-Duty)",
            priority: "High",
            estimated_resolution_time: "< 10 minutes",
          },
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSendCustom = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    const timeNow = getCurrentTime();

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: userText,
      time: timeNow,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Send message to multilingual customer care backend AI
      const res = await axios.post(`${getApiBaseUrl()}/copilot/customer-care-chat`, {
        message: userText,
        language: currentLang,
        merchant_id: 1,
        chat_history: messages.slice(-4).map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text,
        })),
      });

      const responseText = res.data.message || "I have analyzed your inquiry.";
      const detectedCategory = res.data.category || "General Technical Support";
      const detectedSummary = res.data.summary || userText;

      const botReply: Message = {
        id: `bot_${Date.now() + 1}`,
        sender: "bot",
        text: responseText,
        time: getCurrentTime(),
        feedbackPending: true,
        troubleshootingData: {
          title: userText.length > 50 ? `${userText.slice(0, 50)}...` : userText,
          steps: [
            currentLang === "hi"
              ? "दिए गए निर्देशों का पालन करें या डिवाइस को रीस्टार्ट करें।"
              : currentLang === "te"
              ? "పై సూచనలను అనుసరించండి లేదా డివైజ్‌ని రీస్టార్ట్ చేయండి."
              : "Follow the diagnostic guidance above or reboot the terminal.",
            currentLang === "hi"
              ? "यदि समस्या बनी रहती है, तो नीचे 'नहीं, कस्टमर केयर प्रतिनिधि से संपर्क करें' पर क्लिक करें।"
              : currentLang === "te"
              ? "సమస్య పరిష్కారం కాకపోతే, క్రింది బటన్ ద్వారా కస్టమర్ కేర్ ప్రతినిధితో మాట్లాడండి."
              : "If the problem continues, click 'No, contact support person' below to dispatch an on-duty specialist."
          ],
          category: detectedCategory,
          summary: detectedSummary,
        },
      };
      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error(err);
      const botReply: Message = {
        id: `bot_${Date.now() + 1}`,
        sender: "bot",
        text:
          currentLang === "hi"
            ? "नेटवर्क समस्या के कारण उत्तर देने में विलंब हो रहा है। कृपया नीचे दिए गए विकल्पों में से चुनें या सपोर्ट टीम से संपर्क करें।"
            : "I am having trouble connecting to the network. Please select one of the quick options or connect with Customer Care.",
        time: getCurrentTime(),
        showOptions: true,
      };
      setMessages((prev) => [...prev, botReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = () => {
    if (!rating) return;
    setRatingSubmitted(true);
    const timeNow = getCurrentTime();
    const thankYouMsg: Message = {
      id: `bot_thanks_${Date.now()}`,
      sender: "bot",
      text: `⭐ **${t.feedbackThankYou} (${rating}/5 Stars)**`,
      time: timeNow,
      showOptions: true,
    };
    setMessages((prev) => [...prev, thankYouMsg]);
  };

  const activeLanguageObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col h-[calc(100vh-6.5rem)] bg-white dark:bg-[#0c1017] rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden font-sans transition-colors duration-200">

      {/* ── Top Header with Multilingual Language Selector ──────────────────── */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 sm:px-6 py-3 flex items-center justify-between shadow-md relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-red-600 font-black text-xl shadow-md border-2 border-red-100 shrink-0">
            <span className="font-extrabold tracking-tighter">A</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base tracking-wide leading-tight">FinAI Care Bot</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                24/7 Multilingual
              </span>
            </div>
            <p className="text-[11px] text-red-100 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {t.onlineSupport}
            </p>
          </div>
        </div>

        {/* Header Actions: Language Switcher Dropdown + Restart */}
        <div className="flex items-center gap-2">
          
          {/* Active Language Pill Button */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 transition-all text-white border border-white/30 cursor-pointer shadow-sm"
              title="Change Language"
            >
              <Globe size={14} />
              <span className="hidden sm:inline">{activeLanguageObj.flag} {activeLanguageObj.nativeLabel}</span>
              <span className="sm:hidden">{activeLanguageObj.flag}</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${langMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Language Dropdown Menu */}
            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  Select Language
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                      currentLang === lang.code
                        ? "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 font-bold"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.nativeLabel}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({lang.label})</span>
                    </span>
                    {currentLang === lang.code && <Check size={14} className="text-red-600 dark:text-red-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => startConversation(currentLang)}
            title={t.restartTooltip}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white border border-white/20 cursor-pointer"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">{t.restartBtn}</span>
          </button>
        </div>
      </div>

      {/* ── Chat Messages Stream ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/60 dark:bg-[#07090e]">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-3">
            
            {/* Standard Chat Bubble */}
            <div
              className={`flex items-start gap-2.5 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "bot" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 mt-0.5">
                  <span>A</span>
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 text-sm shadow-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-red-600 text-white rounded-br-none shadow-red-500/10 font-medium"
                    : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800 rounded-bl-none"
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    msg.sender === "user" ? "text-red-100" : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {msg.time}
                </div>
              </div>
            </div>

            {/* Language Selection Quick Pills at beginning of conversation */}
            {msg.showLanguagePicker && (
              <div className="pl-10 pr-2 pt-1 pb-1">
                <div className="bg-gradient-to-r from-red-50/80 via-white to-amber-50/60 dark:from-slate-900 dark:to-slate-950 border border-red-200/70 dark:border-red-900/30 rounded-2xl p-3.5 shadow-sm space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-700 dark:text-red-400">
                    <Globe size={15} />
                    <span>Choose your language / अपनी भाषा चुनें:</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageSelect(lang.code)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 cursor-pointer ${
                          currentLang === lang.code
                            ? "bg-red-600 text-white border-red-600 shadow-md scale-102"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-red-400 hover:bg-red-50/50"
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.nativeLabel}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Default Problems Quick-Action Buttons (Red outline pill cards) */}
            {msg.showOptions && (
              <div className="pl-10 pr-2 pt-1 pb-2 flex flex-wrap gap-2 animate-fade-in">
                {MULTILINGUAL_PROBLEMS.map((problem) => {
                  const Icon = problem.icon;
                  const title = problem.titles[currentLang] || problem.titles.en;
                  return (
                    <button
                      key={problem.id}
                      onClick={() => handleSelectProblem(problem.id)}
                      className="group flex items-center gap-2 px-3.5 py-2 rounded-full border border-red-500/80 bg-white dark:bg-slate-900/90 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-600 active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                      <Icon size={14} className="text-red-500 group-hover:scale-110 transition-transform shrink-0" />
                      <span>{title}</span>
                    </button>
                  );
                })}

                {/* Others / Talk to Specialist */}
                <button
                  onClick={() => {
                    const timeNow = getCurrentTime();
                    setMessages((prev) => [
                      ...prev,
                      { id: `u_${Date.now()}`, sender: "user", text: t.othersButton, time: timeNow },
                      {
                        id: `b_${Date.now() + 1}`,
                        sender: "bot",
                        text:
                          currentLang === "hi"
                            ? "कृपया अपनी समस्या का विवरण नीचे मैसेज बॉक्स में लिखें, या कस्टमर केयर प्रतिनिधि से तुरंत कनेक्ट करने के लिए 'नहीं, कस्टमर केयर प्रतिनिधि से संपर्क करें' पर क्लिक करें।"
                            : currentLang === "te"
                            ? "దయచేసి మీ సమస్యను క్రింది బాక్స్‌లో వివరించండి లేదా మా ఏజెంట్‌తో నేరుగా మాట్లాడండి."
                            : "Please describe your specific inquiry or terminal error in the box below, or let us connect you directly with an on-duty specialist.",
                        time: timeNow,
                        feedbackPending: true,
                        troubleshootingData: {
                          title: t.othersButton,
                          steps: [
                            currentLang === "hi"
                              ? "नीचे दिए गए चैट बॉक्स में अपनी समस्या या टर्मिनल एरर टाइप करें।"
                              : "Type your query or terminal issue in detail in the chat box below.",
                            currentLang === "hi"
                              ? "आपकी भाषा में तुरंत AI सुझाव या ऑन-ड्यूटी सपोर्ट ऑफिसर से कनेक्ट किया जाएगा।"
                              : "Our multilingual AI will analyze your query and connect you with an on-duty support officer."
                          ],
                          category: "General Inquiry & Support",
                          summary: "Merchant requested specialist assistance.",
                        }
                      }
                    ]);
                  }}
                  className="px-3.5 py-2 rounded-full border border-red-500/80 bg-white dark:bg-slate-900/90 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 active:scale-95 transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Headphones size={13} className="text-red-500" />
                  <span>{t.othersButton}</span>
                </button>
              </div>
            )}

            {/* Step-by-Step Diagnostic Troubleshooting Card */}
            {msg.troubleshootingData && (
              <div className="ml-10 max-w-[88%] bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/40 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider border-b border-red-100 dark:border-red-900/30 pb-2">
                  <Sparkles size={14} className="text-red-500" />
                  <span>{t.troubleshootHeader}</span>
                </div>

                <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {msg.troubleshootingData.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>

                {/* Resolution Feedback Question (Solved vs Escalated) */}
                {msg.feedbackPending && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {t.solvedQuestion}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          handleResolutionResponse(
                            msg.id,
                            true,
                            msg.troubleshootingData!.category,
                            msg.troubleshootingData!.title,
                            msg.troubleshootingData!.summary
                          )
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        <CheckCircle2 size={14} />
                        <span>{t.solvedBtn}</span>
                      </button>
                      <button
                        onClick={() =>
                          handleResolutionResponse(
                            msg.id,
                            false,
                            msg.troubleshootingData!.category,
                            msg.troubleshootingData!.title,
                            msg.troubleshootingData!.summary
                          )
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        <AlertCircle size={14} />
                        <span>{t.notSolvedBtn}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Customer Care Raised Support Ticket Card */}
            {msg.ticketData && (
              <div className="ml-10 max-w-[92%] bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-white dark:from-slate-900 dark:via-[#161410] dark:to-slate-950 border-2 border-amber-400/80 dark:border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
                
                <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-800/50 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                      <Headphones size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                        {t.ticketRaisedTitle}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.ticketSub}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-amber-500 text-white shadow-sm">
                    {msg.ticketData.ticket_id}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-amber-200/60 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <UserCheck size={11} /> {t.merchantProfile}
                    </span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{msg.ticketData.merchant_name}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-amber-200/60 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <FileText size={11} /> Category
                    </span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{msg.ticketData.category}</p>
                  </div>

                  <div className="sm:col-span-2 p-2.5 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 tracking-wider flex items-center gap-1">
                      <AlertCircle size={11} /> {t.problemFaced}
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      {msg.ticketData.problem_details}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-amber-200/60 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Assigned Agent
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{msg.ticketData.assigned_to}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                      <Clock size={11} /> {t.sla}
                    </span>
                    <p className="font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      {msg.ticketData.status}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2.5">
                  <a
                    href="tel:1800-419-7443"
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 text-center cursor-pointer"
                  >
                    <PhoneCall size={14} />
                    <span>{t.callAgentBtn}</span>
                  </a>
                  <button
                    onClick={() => {
                      const timeNow = getCurrentTime();
                      setMessages((prev) => [
                        ...prev,
                        {
                          id: `b_live_${Date.now()}`,
                          sender: "bot",
                          text: `💬 **Ticket #${msg.ticketData?.ticket_id} Priority Dispatched**: An on-duty executive has been notified. You will receive an instant call on your registered number within 5 minutes.`,
                          time: timeNow,
                        }
                      ]);
                    }}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                    <MessageCircle size={14} />
                    <span>{t.liveChatBtn}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Satisfaction Rating & Feedback */}
            {msg.resolved && !ratingSubmitted && (
              <div className="ml-10 max-w-[88%] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t.feedbackTitle}
                  </p>
                  {rating && (
                    <span className="text-[11px] font-bold text-amber-500">
                      {rating} / 5 Stars
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1.5 rounded-lg transition-transform active:scale-125 cursor-pointer ${
                        rating && star <= rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300 dark:text-slate-700 hover:text-amber-300"
                      }`}
                    >
                      <Star size={20} className={rating && star <= rating ? "fill-amber-400" : ""} />
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={t.feedbackPlaceholder}
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <button
                    onClick={handleRatingSubmit}
                    disabled={!rating}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    {t.feedbackSubmit}
                  </button>
                </div>
              </div>
            )}

          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
              <span>A</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-bounce delay-0"></span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-bounce delay-150"></span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-bounce delay-300"></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Bottom Input & Message Box ────────────────────────────────────── */}
      <div className="p-3 sm:p-4 bg-white dark:bg-[#0c1017] border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 relative">
        
        {/* Restart Conversation Button */}
        <div className="relative group">
          <button
            onClick={() => startConversation(currentLang)}
            className="w-10 h-10 rounded-full border border-red-500/80 hover:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center transition-all active:scale-90 shadow-sm cursor-pointer"
            aria-label={t.restartTooltip}
          >
            <RotateCcw size={18} />
          </button>

          <div className="absolute bottom-12 left-0 hidden group-hover:block z-50 whitespace-nowrap bg-slate-900 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-xl border border-slate-800 animate-fade-in pointer-events-none">
            {t.restartTooltip}
            <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-800"></div>
          </div>
        </div>

        {/* Message Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendCustom();
          }}
          className="flex-1 flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-1.5 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 transition-all shadow-inner"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.inputPlaceholder}
            disabled={loading}
            className="flex-1 bg-transparent py-1.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 hover:text-red-700 hover:scale-110 disabled:opacity-30 disabled:scale-100 transition-all cursor-pointer"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

    </div>
  );
}
