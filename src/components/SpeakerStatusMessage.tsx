import { cn } from "@/lib/utils";

interface SpeakerStatusMessageProps {
  isProcessing?: boolean;
  isRecording?: boolean;
  currentStep?: string;
  speaker?: "A" | "B";
  language: string;
  className?: string;
}

// Translation mappings for status messages
const translations = {
  // Processing messages
  "Processing...": {
    "English": "Processing...",
    "Spanish": "Procesando...",
    "French": "Traitement...",
    "German": "Verarbeitung...",
    "Italian": "Elaborazione...",
    "Portuguese": "Processando...",
    "Dutch": "Verwerking...",
    "Russian": "Обработка...",
    "Chinese (Simplified)": "处理中...",
    "Chinese (Traditional)": "處理中...",
    "Japanese": "処理中...",
    "Korean": "처리 중...",
    "Arabic": "جاري المعالجة...",
    "Hebrew": "מעבד...",
    "Hindi": "प्रसंस्करण...",
    "Thai": "กำลังประมวลผล...",
    "Vietnamese": "Đang xử lý...",
    "Turkish": "İşleniyor...",
    "Polish": "Przetwarzanie...",
    "Czech": "Zpracovává se...",
    "Hungarian": "Feldolgozás...",
    "Romanian": "Procesare...",
    "Bulgarian": "Обработка...",
    "Croatian": "Obrađuje se...",
    "Slovak": "Spracováva sa...",
    "Slovenian": "Obdelava...",
    "Estonian": "Töötlemine...",
    "Latvian": "Apstrāde...",
    "Lithuanian": "Apdorojimas...",
  },
  // Listening messages
  "Listening...": {
    "English": "Listening...",
    "Spanish": "Escuchando...",
    "French": "Écoute...",
    "German": "Zuhören...",
    "Italian": "Ascolto...",
    "Portuguese": "Ouvindo...",
    "Dutch": "Luisteren...",
    "Russian": "Прослушивание...",
    "Chinese (Simplified)": "聆听中...",
    "Chinese (Traditional)": "聆聽中...",
    "Japanese": "聞いています...",
    "Korean": "듣고 있습니다...",
    "Arabic": "يستمع...",
    "Hebrew": "מאזין...",
    "Hindi": "सुन रहा है...",
    "Thai": "กำลังฟัง...",
    "Vietnamese": "Đang nghe...",
    "Turkish": "Dinliyor...",
    "Polish": "Słuchanie...",
    "Czech": "Poslouchá...",
    "Hungarian": "Hallgat...",
    "Romanian": "Ascultă...",
    "Bulgarian": "Слуша...",
    "Croatian": "Sluša...",
    "Slovak": "Počúva...",
    "Slovenian": "Posluša...",
    "Estonian": "Kuulab...",
    "Latvian": "Klausās...",
    "Lithuanian": "Klauso...",
  }
};

export const SpeakerStatusMessage = ({ 
  isProcessing = false,
  isRecording = false,
  currentStep,
  speaker,
  language,
  className 
}: SpeakerStatusMessageProps) => {
  const isActive = isProcessing || isRecording;
  
  if (!isActive) return null;

  const getStatusText = () => {
    if (isRecording && speaker) {
      return getTranslation("Listening...", language);
    }
    if (currentStep) {
      return currentStep;
    }
    if (isProcessing) {
      return getTranslation("Processing...", language);
    }
    return "";
  };

  const getTranslation = (key: string, targetLanguage: string) => {
    const translationMap = translations[key as keyof typeof translations];
    if (translationMap && translationMap[targetLanguage as keyof typeof translationMap]) {
      return translationMap[targetLanguage as keyof typeof translationMap];
    }
    return key; // Fallback to English
  };

  return (
    <div className={cn(
      "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
      "text-sm theme-text opacity-75 font-medium text-center animate-fade-in",
      "px-3 py-1 rounded-md theme-surface/50 backdrop-blur-sm",
      className
    )}>
      {getStatusText()}
    </div>
  );
};