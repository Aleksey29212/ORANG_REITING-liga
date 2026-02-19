'use server';

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

const DEFAULT_THEME = {
  background: '260 20% 9%',
  foreground: '0 0% 98%',
  primary: '270 80% 65%',
  accent: '300 70% 60%',
  gold: '45 93% 48%',
  silver: '220 13% 75%',
  bronze: '28 65% 55%',
};

export async function updateThemeAction(theme: { primary: string; accent: string; background: string; foreground: string; gold: string; silver: string; bronze: string; } | null) {
  const cssFilePath = path.join(process.cwd(), 'src/app/globals.css');
  
  const themeToApply = theme || DEFAULT_THEME;

  try {
    const cssContent = await fs.readFile(cssFilePath, 'utf-8');

    const darkThemeRegex = /\.dark\s*\{([^}]+)\}/;
    const match = cssContent.match(darkThemeRegex);

    if (!match) {
        throw new Error('Не удалось найти блок темы .dark в файле globals.css');
    }

    const existingVarsContent = match[1];
    const varLines = existingVarsContent.split(';').map(line => line.trim()).filter(line => line);
    const existingVars: Record<string, string> = {};

    varLines.forEach(line => {
        const firstColonIndex = line.indexOf(':');
        if (firstColonIndex > -1) {
            const key = line.substring(0, firstColonIndex).trim();
            const value = line.substring(firstColonIndex + 1).trim();
            const commentIndex = value.indexOf('/*');
            
            if (commentIndex > -1) {
                existingVars[key] = value.substring(0, commentIndex).trim();
            } else {
                existingVars[key] = value;
            }
        }
    });

    const newVars = {
        ...existingVars,
        '--background': themeToApply.background,
        '--foreground': themeToApply.foreground,
        '--primary': themeToApply.primary,
        '--accent': themeToApply.accent,
        '--gold': themeToApply.gold,
        '--silver': themeToApply.silver,
        '--bronze': themeToApply.bronze,
    };

    const newVarsString = Object.entries(newVars)
        .map(([key, value]) => `    ${key}: ${value};`)
        .join('\n');

    const newDarkBlock = `\n  .dark {\n${newVarsString}\n  }`;
    const newCssContent = cssContent.replace(darkThemeRegex, newDarkBlock);

    await fs.writeFile(cssFilePath, newCssContent, 'utf-8');
    
    revalidatePath('/', 'layout');

    return { success: true, message: theme ? 'Тема успешно применена!' : 'Тема сброшена к стандартной.' };
  } catch (error) {
    console.error('Failed to update theme:', error);
    const errorMessage = error instanceof Error ? error.message : 'Не удалось обновить CSS файл темы.';
    return { success: false, message: errorMessage };
  }
}
