import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import { Theme, ThemeStyles, FontStyle } from '../types';
import { useThemes } from '../hooks/useThemes';
import { PlusIcon, PencilIcon, TrashIcon, ArrowLeftIcon } from './icons';

// --- Helper Functions and Components --- //

const FONT_FAMILIES = [
  // Google Fonts
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Raleway', 'Playfair Display', 'Nunito', 'Merriweather', 'Poppins',
  // Web Safe Fonts
  'Arial', 'Verdana', 'Helvetica', 'Georgia', 'Times New Roman', 'Courier New', 'Impact', 'Brush Script MT',
  // Generic Fallbacks
  'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy',
];

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

const parseRgbaString = (rgba: string): { r: number; g: number; b: number; a: number } | null => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return null;
    return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: match[4] ? parseFloat(match[4]) : 1,
    };
};

interface FontEditorProps {
    font: FontStyle;
    color: string;
    onFontChange: (font: FontStyle) => void;
    onColorChange: (color: string) => void;
    label: string;
}

const FontEditor: React.FC<FontEditorProps> = ({ font, color, onFontChange, onColorChange, label }) => {
    const handleFontPropChange = (prop: keyof FontStyle, value: any) => {
        onFontChange({ ...font, [prop]: value });
    };

    const toggleBold = () => handleFontPropChange('weight', font.weight === 'bold' ? 'normal' : 'bold');
    const toggleItalic = () => handleFontPropChange('style', font.style === 'italic' ? 'normal' : 'italic');

    return (
        <div className="space-y-2 p-3 bg-slate-900/50 rounded-lg">
            <h5 className="font-semibold text-slate-300">{label}</h5>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-xs text-slate-400">Font Family</label>
                    <select value={font.family} onChange={e => handleFontPropChange('family', e.target.value)} className="w-full text-sm bg-slate-800 border border-slate-600 rounded p-1 focus:outline-none focus:ring-1 focus:ring-sky-500">
                        {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="text-xs text-slate-400">Font Size (px)</label>
                    <input type="number" value={font.size} onChange={e => handleFontPropChange('size', parseInt(e.target.value, 10))} className="w-full text-sm bg-slate-800 border border-slate-600 rounded p-1 focus:outline-none focus:ring-1 focus:ring-sky-500"/>
                </div>
                 <div>
                    <label className="text-xs text-slate-400">Color</label>
                    <input type="color" value={color} onChange={e => onColorChange(e.target.value)} className="w-full h-8 p-0.5 bg-slate-800 border border-slate-600 rounded cursor-pointer"/>
                </div>
                 <div>
                    <label className="text-xs text-slate-400">Style</label>
                    <div className="flex gap-1">
                        <button onClick={toggleBold} className={`w-full text-sm p-1 rounded border ${font.weight === 'bold' ? 'bg-sky-600 text-white border-sky-500' : 'bg-slate-800 border-slate-600'}`}><b>B</b></button>
                        <button onClick={toggleItalic} className={`w-full text-sm p-1 rounded border ${font.style === 'italic' ? 'bg-sky-600 text-white border-sky-500' : 'bg-slate-800 border-slate-600'}`}><i>I</i></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Components --- //

interface ThemeEditorProps {
    theme: Partial<Theme> | null;
    onSave: (name: string, styles: ThemeStyles) => void;
    onCancel: () => void;
}

const ThemeEditor: React.FC<ThemeEditorProps> = ({ theme, onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [styles, setStyles] = useState<ThemeStyles>({
        backgroundColor: '#1e293b',
        titleFont: { family: 'sans-serif', size: 72, weight: 'bold', style: 'normal' },
        titleColor: '#e2e8f0',
        captionFont: { family: 'sans-serif', size: 48, weight: 'normal', style: 'normal' },
        captionColor: '#cbd5e1',
        shadowColor: 'rgba(0, 0, 0, 0.5)',
    });
    
    const [shadowRgb, setShadowRgb] = useState('#000000');
    const [shadowAlpha, setShadowAlpha] = useState(0.5);

    useEffect(() => {
        if (theme) {
            setName(theme.name || '');
            setStyles(theme.styles || styles);
            const parsedShadow = parseRgbaString(theme.styles?.shadowColor || 'rgba(0,0,0,0.5)');
            if (parsedShadow) {
                setShadowRgb(rgbToHex(parsedShadow.r, parsedShadow.g, parsedShadow.b));
                setShadowAlpha(parsedShadow.a);
            }
        }
    }, [theme]);
    
    const handleStyleChange = useCallback((field: keyof ThemeStyles, value: any) => {
        setStyles(prev => ({ ...prev, [field]: value }));
    }, []);

    useEffect(() => {
        const rgb = hexToRgb(shadowRgb);
        if (rgb) {
            handleStyleChange('shadowColor', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${shadowAlpha})`);
        }
    }, [shadowRgb, shadowAlpha, handleStyleChange]);
    
    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim(), styles);
        } else {
            alert('Theme name cannot be empty.');
        }
    }

    const getPreviewFont = (font: FontStyle) => {
        return [font.style, font.weight, `${font.size * 0.3}px`, font.family].filter(Boolean).join(' ');
    }

    return (
        <div className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Theme Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="My Awesome Theme" className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Background Color</label>
                        <input type="color" value={styles.backgroundColor} onChange={e => handleStyleChange('backgroundColor', e.target.value)} className="w-full h-10 p-1 bg-slate-900 border border-slate-600 rounded cursor-pointer"/>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-lg space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Shadow</label>
                        <div className="flex items-center gap-2">
                           <input type="color" value={shadowRgb} onChange={e => setShadowRgb(e.target.value)} className="w-1/4 h-10 p-1 bg-slate-800 border border-slate-600 rounded cursor-pointer"/>
                           <div className="flex-grow">
                                <label className="text-xs text-slate-400">Opacity: {Math.round(shadowAlpha * 100)}%</label>
                                <input type="range" min="0" max="1" step="0.05" value={shadowAlpha} onChange={e => setShadowAlpha(parseFloat(e.target.value))} className="w-full"/>
                           </div>
                        </div>
                    </div>
                </div>
                 <div className="flex flex-col items-center justify-center p-4">
                    <p className="text-sm font-semibold text-slate-400 mb-2">Live Preview</p>
                    <div className="w-full h-40 rounded-lg border-2 border-slate-600 flex flex-col items-center justify-center gap-4 transition-all duration-300" style={{backgroundColor: styles.backgroundColor}}>
                        <span style={{font: getPreviewFont(styles.titleFont), color: styles.titleColor, textShadow: `1px 1px 2px ${styles.shadowColor}`}}>Title</span>
                        <span style={{font: getPreviewFont(styles.captionFont), color: styles.captionColor, textShadow: `1px 1px 2px ${styles.shadowColor}`}}>Caption</span>
                    </div>
                 </div>
            </div>

            <div className="border-t border-slate-700 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <FontEditor label="Title Font" font={styles.titleFont} color={styles.titleColor} onFontChange={font => handleStyleChange('titleFont', font)} onColorChange={color => handleStyleChange('titleColor', color)} />
                <FontEditor label="Caption Font" font={styles.captionFont} color={styles.captionColor} onFontChange={font => handleStyleChange('captionFont', font)} onColorChange={color => handleStyleChange('captionColor', color)} />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
                <button onClick={onCancel} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">Cancel</button>
                <button onClick={handleSave} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">Save Theme</button>
            </div>
        </div>
    );
};


interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTheme: (themeId: string) => void;
  activeThemeId?: string;
}

const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose, onSelectTheme, activeThemeId }) => {
    const { themes, addTheme, updateTheme, deleteTheme } = useThemes();
    const [view, setView] = useState<'list' | 'edit'>('list');
    const [themeToEdit, setThemeToEdit] = useState<Partial<Theme> | null>(null);
    
    useEffect(() => {
        if (!isOpen) {
            setView('list');
            setThemeToEdit(null);
        }
    }, [isOpen]);

    const handleCreateNew = () => {
        setThemeToEdit(null);
        setView('edit');
    };
    
    const handleEdit = (theme: Theme) => {
        setThemeToEdit(theme);
        setView('edit');
    };

    const handleDelete = (themeId: string) => {
        if(window.confirm('Are you sure you want to delete this theme? This cannot be undone.')) {
            deleteTheme(themeId);
        }
    }

    const handleSaveTheme = (name: string, styles: ThemeStyles) => {
        if(themeToEdit?.id) {
            updateTheme({ ...themeToEdit, name, styles } as Theme);
            setView('list');
        } else {
            const newTheme = addTheme(name, styles);
            onSelectTheme(newTheme.id);
            onClose();
        }
    }
    
    const Title = () => {
        if (view === 'edit') {
            return (
                <div className="flex items-center gap-2">
                    <button onClick={() => setView('list')} className="text-slate-400 hover:text-white transition-colors"><ArrowLeftIcon /></button>
                    <h2 className="text-xl font-semibold text-sky-300">{themeToEdit?.id ? 'Edit Theme' : 'Create New Theme'}</h2>
                </div>
            )
        }
        return <h2 className="text-xl font-semibold text-sky-300">Select a Theme</h2>;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={<Title />} size="3xl">
            {view === 'list' ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-1">
                        {themes.map(theme => (
                            <div key={theme.id} onClick={() => onSelectTheme(theme.id)} className={`rounded-lg p-3 cursor-pointer border-2 transition-all ${activeThemeId === theme.id ? 'border-sky-500 bg-sky-900/50' : 'border-slate-700 bg-slate-900/30 hover:border-slate-500'}`}>
                                <div className="w-full h-24 rounded-md flex flex-col items-center justify-center gap-2" style={{ backgroundColor: theme.styles.backgroundColor }}>
                                    <span style={{ font: 'bold 20px sans-serif', color: theme.styles.titleColor, textShadow: `1px 1px 2px ${theme.styles.shadowColor}`}}>Title</span>
                                    <span style={{ font: '14px sans-serif', color: theme.styles.captionColor, textShadow: `1px 1px 2px ${theme.styles.shadowColor}`}}>Caption Text</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <h4 className="font-semibold text-slate-200">{theme.name}</h4>
                                    {theme.isCustom && (
                                        <div className="flex items-center">
                                            <button onClick={(e) => { e.stopPropagation(); handleEdit(theme); }} className="p-1 text-slate-400 hover:text-sky-400"><PencilIcon className="h-4 w-4"/></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(theme.id); }} className="p-1 text-slate-400 hover:text-red-400"><TrashIcon className="h-4 w-4"/></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pt-4 border-t border-slate-700">
                         <button onClick={handleCreateNew} className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                            <PlusIcon /> Create New Theme
                        </button>
                    </div>
                </div>
            ) : (
                <ThemeEditor theme={themeToEdit} onSave={handleSaveTheme} onCancel={() => setView('list')} />
            )}
        </Modal>
    );
};

export default ThemeSelectorModal;