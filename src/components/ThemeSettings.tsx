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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themeOptions.map((option) => (
          <Card 
            key={option.name} 
            className={`cursor-pointer transition-all ${
              theme === option.name 
                ? 'ring-2 ring-primary' 
                : 'hover:shadow-md'
            }`}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{option.label}</CardTitle>
                {theme === option.name && (
                  <Badge variant="default" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
              <CardDescription className="text-sm">
                {option.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Theme Preview */}
              <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-lg">
                {/* Mic button preview */}
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: option.colors.micBg }}
                >
                  <Mic className="w-4 h-4" style={{ color: '#FFFFFF' }} />
                </div>
                
                {/* Action button preview */}
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: option.colors.actionBg }}
                >
                  <ArrowUpDown className="w-4 h-4" style={{ color: '#FFFFFF' }} />
                </div>
                
                {/* Surface preview */}
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center border"
                  style={{ backgroundColor: option.colors.surface }}
                >
                  <MessageSquare className="w-4 h-4" style={{ color: option.colors.primary }} />
                </div>
              </div>

              {/* Action button */}
              <Button
                size="sm"
                className="w-full min-h-[44px]"
                onClick={() => handleApply(option.name)}
                disabled={theme === option.name}
              >
                Apply
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-4 border-t theme-divider">
        <Button 
          variant="ghost" 
          className="min-h-[44px] theme-button"
          onClick={() => handleApply('neo-light')}
          disabled={theme === 'neo-light'}
        >
          Reset to Default
        </Button>
      </div>
    </div>
  );
};