import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const next = resolvedTheme === 'dark' ? 'light' : 'dark';
  return (
    <button className="icon-button" type="button" onClick={() => setTheme(next)} aria-label={`Ativar tema ${next === 'dark' ? 'escuro' : 'claro'}`} title={`Tema ${next === 'dark' ? 'escuro' : 'claro'}`}>
      {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
