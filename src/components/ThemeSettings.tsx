import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme, type ThemeName } from '@/hooks/useTheme';
import { Mic, ArrowUpDown, MessageSquare } from 'lucide-react';

const themeOptions: Array<{
  name: ThemeName;
  label: string;
  description: string;
  colors: {
    primary: string;
    micBg: string;
    actionBg: string;
    surface: string;
  };
}> = [
  {
    name: 'corporate',
    label: 'Corporate',
    description: 'Polished Apple/Google hybrid design',
    colors: {
      primary: '#4338CA',
      micBg: '#4338CA',
      actionBg: '#1F2937',
      surface: '#FFFFFF'
    }
  },
  {
    name: 'minimalist',
    label: 'Minimalist',
    description: 'Clean monochrome design with subtle grayscale tones',
    colors: {
      primary: '#333333',
      micBg: '#2D2D2D',
      actionBg: '#1A1A1A',
      surface: '#FFFFFF'
    }
  },
  {
    name: 'violet-material',
    label: 'Violet Material',
    description: 'Material-inspired purple theme',
    colors: {
      primary: '#6200EE',
      micBg: '#6200EE',
      actionBg: '#2C2C2C',
      surface: '#FFFFFF'
    }
  }
];

export const ThemeSettings = () => {
  const { theme, setTheme, enableThemes } = useTheme();

  if (!enableThemes) {
    return null;
  }

  const handleApply = (themeName: ThemeName) => {
    setTheme(themeName);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Theme</h3>
        <p className="text-sm text-muted-foreground">
          Choose a visual style for your interface
        </p>
      </div>

      <div className="space-y-3">
        {themeOptions.map((option) => (
          <div 
            key={option.name} 
            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
              theme === option.name 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-accent/50'
            }`}
          >
            <div>
              <div className="font-medium">{option.label}</div>
              <div className="text-sm text-muted-foreground">{option.description}</div>
            </div>
            
            <Button
              size="sm"
              onClick={() => handleApply(option.name)}
              disabled={theme === option.name}
              className="min-w-[70px]"
            >
              {theme === option.name ? 'Active' : 'Apply'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};