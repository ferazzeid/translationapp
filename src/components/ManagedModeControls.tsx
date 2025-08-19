import { ArrowUpDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Speaker } from "@/hooks/useManagedMode";

interface ManagedModeControlsProps {
  isEnabled: boolean;
  currentTurn: Speaker;
  onSwitchTurn: () => void;
  className?: string;
  speakerALanguage: string;
  speakerBLanguage: string;
  speaker: "A" | "B";
}

// Translations for managed mode instructions
const MANAGED_MODE_TRANSLATIONS = {
  en: {
    yourTurn: "Your turn to speak",
    waitTurn: "Wait for your turn",
    passTurn: "Pass Turn",
    tapToSpeak: "Tap and hold to speak"
  },
  hu: {
    yourTurn: "Te jössz",
    waitTurn: "Várd ki a sorod",
    passTurn: "Átadás",
    tapToSpeak: "Nyomd meg és tartsd a beszédhez"
  },
  es: {
    yourTurn: "Tu turno para hablar",
    waitTurn: "Espera tu turno",
    passTurn: "Pasar Turno",
    tapToSpeak: "Mantén presionado para hablar"
  },
  fr: {
    yourTurn: "Votre tour de parler",
    waitTurn: "Attendez votre tour",
    passTurn: "Passer le Tour",
    tapToSpeak: "Appuyez et maintenez pour parler"
  },
  de: {
    yourTurn: "Sie sind dran",
    waitTurn: "Warten Sie auf Ihren Zug",
    passTurn: "Zug Weitergeben",
    tapToSpeak: "Drücken und halten zum Sprechen"
  },
  it: {
    yourTurn: "Il tuo turno per parlare",
    waitTurn: "Aspetta il tuo turno",
    passTurn: "Passa il Turno",
    tapToSpeak: "Tieni premuto per parlare"
  },
  pt: {
    yourTurn: "Sua vez de falar",
    waitTurn: "Aguarde sua vez",
    passTurn: "Passar a Vez",
    tapToSpeak: "Mantenha pressionado para falar"
  },
  zh: {
    yourTurn: "轮到你说话了",
    waitTurn: "等待你的回合",
    passTurn: "传递回合",
    tapToSpeak: "按住说话"
  },
  ja: {
    yourTurn: "あなたの話す番です",
    waitTurn: "順番を待ってください",
    passTurn: "ターンを渡す",
    tapToSpeak: "長押しして話す"
  },
  ko: {
    yourTurn: "당신이 말할 차례입니다",
    waitTurn: "차례를 기다리세요",
    passTurn: "차례 넘기기",
    tapToSpeak: "길게 눌러서 말하기"
  }
};

export const ManagedModeControls = ({
  isEnabled,
  currentTurn,
  onSwitchTurn,
  className,
  speakerALanguage,
  speakerBLanguage,
  speaker
}: ManagedModeControlsProps) => {
  if (!isEnabled) return null;

  const isMyTurn = currentTurn === speaker;
  
  console.log(`ManagedModeControls: isEnabled=${isEnabled}, currentTurn=${currentTurn}, speaker=${speaker}, isMyTurn=${isMyTurn}`);

  // Only show for current speaker and keep it minimal
  if (!isMyTurn) return null;

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={onSwitchTurn}
        className="h-6 px-2 text-xs bg-background/90 border border-border shadow-sm hover:bg-foreground hover:text-background"
        title="Pass turn"
      >
        <ArrowUpDown className="h-3 w-3" />
      </Button>
    </div>
  );
};