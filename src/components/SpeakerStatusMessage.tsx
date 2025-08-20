import { cn } from "@/lib/utils";

interface SpeakerStatusMessageProps {
  isProcessing?: boolean;
  isRecording?: boolean;
  currentStep?: string;
  speaker?: "A" | "B";
  language: string;
  className?: string;
}

// Translations for different processing states
const translations = {
  // Processing messages
  "Processing...": {
    "English": "Processing...",
    "Spanish": "Procesando...",
    "French": "Traitement...",
    "German": "Wird verarbeitet...",
    "Italian": "Elaborazione...",
    "Portuguese": "Processando...",
    "Dutch": "Verwerken...",
    "Russian": "Обработка...",
    "Chinese (Simplified)": "处理中...",
    "Chinese (Traditional)": "處理中...",
    "Japanese": "処理中...",
    "Korean": "처리 중...",
    "Arabic": "معالجة...",
    "Hebrew": "מעבד...",
    "Hindi": "प्रसंस्करण...",
    "Thai": "กำลังประมวลผล...",
    "Vietnamese": "Đang xử lý...",
    "Turkish": "İşleniyor...",
    "Polish": "Przetwarzanie...",
    "Czech": "Zpracovává se...",
    "Hungarian": "Feldolgozás...",
    "Romanian": "Se procesează...",
    "Bulgarian": "Обработва се...",
    "Croatian": "Obrađuje se...",
    "Slovak": "Spracováva sa...",
    "Slovenian": "Obdelava...",
    "Estonian": "Töötlemine...",
    "Latvian": "Apstrāde...",
    "Lithuanian": "Apdorojimas...",
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
  // CRITICAL FIX: Don't show individual speaker status when recording
  // The central status display handles recording state to prevent duplication
  // This eliminates the duplicate "Listening..." indicators from the screenshots
  if (isRecording) return null;
  
  // Only show processing status (not recording status) for individual speakers
  if (!isProcessing) return null;

  const getTranslation = (key: string, lang: string): string => {
    return translations[key]?.[lang] || translations[key]?.["English"] || key;
  };

  const getStatusMessage = () => {
    // Only handle processing states, not recording states
    if (currentStep) {
      switch (currentStep) {
        case 'transcribing':
          return getTranslation("Processing...", language);
        case 'translating':
          return getTranslation("Processing...", language);
        case 'generating':
          return getTranslation("Processing...", language);
        default:
          return getTranslation("Processing...", language);
      }
    }
    
    if (isProcessing) {
      return getTranslation("Processing...", language);
    }
    
    return "";
  };

  const statusMessage = getStatusMessage();
  if (!statusMessage) return null;

  return (
    <div className={cn(
      "text-xs theme-text opacity-60 text-center mt-1",
      className
    )}>
      {statusMessage}
    </div>
  );
};