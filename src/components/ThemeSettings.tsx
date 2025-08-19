import { useState } from 'react';
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
  const [previewTheme, setPreviewTheme] = useState<ThemeName | null>(null);

  if (!enableThemes) {
    return null;
  }

  const handlePreview = (themeName: ThemeName) => {
    setPreviewTheme(themeName);
    document.documentElement.dataset.theme = themeName;
  };

  const handleApply = (themeName: ThemeName) => {
    setTheme(themeName);
    setPreviewTheme(null);
  };

  const handleReset = () => {
    if (previewTheme) {
      document.documentElement.dataset.theme = theme;
      setPreviewTheme(null);
    }
  };

  const currentTheme = previewTheme || theme;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Theme</h3>
        <p className="text-sm text-muted-foreground">
          Choose a visual style for your interface
        </p>
      </div>

      {previewTheme && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">Preview Mode</p>
              <p className="text-sm text-blue-700">
                Previewing {themeOptions.find(t => t.name === previewTheme)?.label}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleReset}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleApply(previewTheme)}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themeOptions.map((option) => (
          <Card 
            key={option.name} 
            className={`cursor-pointer transition-all ${
              currentTheme === option.name 
                ? 'ring-2 ring-primary' 
                : 'hover:shadow-md'
            }`}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{option.label}</CardTitle>
                {currentTheme === option.name && (
                  <Badge variant="default" className="text-xs">
                    {previewTheme ? 'Preview' : 'Active'}
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
                  <Mic className="w-4 h-4 text-white" />
                </div>
                
                {/* Action button preview */}
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: option.colors.actionBg }}
                >
                  <ArrowUpDown className="w-4 h-4 text-white" />
                </div>
                
                {/* Surface preview */}
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center border"
                  style={{ backgroundColor: option.colors.surface }}
                >
                  <MessageSquare className="w-4 h-4" style={{ color: option.colors.primary }} />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handlePreview(option.name)}
                  disabled={currentTheme === option.name}
                >
                  Preview
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleApply(option.name)}
                  disabled={theme === option.name && !previewTheme}
                >
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={() => handleApply('neo-light')}
          disabled={theme === 'neo-light' && !previewTheme}
        >
          Reset to Default
        </Button>
      </div>
    </div>
  );
};