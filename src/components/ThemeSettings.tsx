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
    name: 'neo-light',
    label: 'Neo Light',
    description: 'Clean neutral design with blue accents',
    colors: {
      primary: '#2979FF',
      micBg: '#2979FF',
      actionBg: '#222222',
      surface: '#FFFFFF'
    }
  },
  {
    name: 'aqua-light',
    label: 'Aqua Light',
    description: 'Calm teal palette for relaxed conversations',
    colors: {
      primary: '#00BFA6',
      micBg: '#00BFA6',
      actionBg: '#2B2F31',
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