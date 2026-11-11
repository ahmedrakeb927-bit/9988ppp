import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { UI_TEXT } from '../../data/translations';
import { Language } from '../../types/academic';

export function Header() {
  const { lang, setLang, dir, t } = useLanguage();
  const { isAuthenticated, role } = useAuth();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (targetLang: Language) => {
    setLang(targetLang);
    setLangMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Main Curved Deep Navy Top Bar */}
      <div className="relative bg-[#101D2D] text-[#F7F6F0] rounded-b-[28px] sm:rounded-b-[36px] border-b-[1.5px] border-[#B99B68]/65 shadow-[0_8px_24px_rgba(16,29,45,0.16)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 px-5 sm:px-8 h-16 sm:h-18">
          {/* Brand Name + Thin Golden Divider */}
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            <Link
              to={isAuthenticated ? (role === 'admin' ? '/admin' : '/student') : '/login'}
              className="text-lg sm:text-xl font-display font-bold tracking-tight text-[#F7F6F0] hover:text-[#B99B68] transition-colors truncate"
            >
              {t(UI_TEXT.brandName)}
            </Link>
            <span
              aria-hidden="true"
              className="h-6 w-[1.5px] rounded-full bg-[#B99B68]/70 shrink-0"
            />
          </div>

          {/* Action Controls: Icon-Only Golden Globe Language Selector */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                data-testid="language-selector-btn"
                onClick={() => setLangMenuOpen((prev) => !prev)}
                aria-label={lang === 'ar' ? 'اختيار اللغة' : 'Choisir la langue'}
                aria-expanded={langMenuOpen}
                aria-haspopup="menu"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#152438] border border-[#B99B68]/65 hover:border-[#B99B68] flex items-center justify-center text-[#B99B68] transition-all cursor-pointer shadow-xs"
              >
                <Globe className="w-5 h-5 text-[#B99B68]" strokeWidth={1.75} />
              </button>

              {langMenuOpen && (
                <div
                  role="menu"
                  data-testid="language-dropdown-menu"
                  aria-label={lang === 'ar' ? 'قائمة اللغات المتاحة' : 'Langues disponibles'}
                  className={`absolute mt-2 w-40 rounded-2xl bg-[#101D2D] border border-[#B99B68]/60 shadow-xl py-1.5 z-50 ${
                    dir === 'rtl' ? 'left-0' : 'right-0'
                  }`}
                >
                  <button
                    type="button"
                    role="menuitem"
                    data-testid="lang-option-ar"
                    onClick={() => handleSelectLanguage('ar')}
                    className={`w-full px-4 py-2.5 text-xs font-display flex items-center justify-between transition-colors cursor-pointer ${
                      lang === 'ar'
                        ? 'text-[#B99B68] font-bold bg-[#17283F]'
                        : 'text-[#F7F6F0]/90 hover:bg-[#17283F] hover:text-[#B99B68]'
                    }`}
                  >
                    <span>العربية</span>
                    {lang === 'ar' && <Check className="w-3.5 h-3.5 text-[#B99B68]" />}
                  </button>
                  <div className="my-0.5 border-t border-[#B99B68]/20" />
                  <button
                    type="button"
                    role="menuitem"
                    data-testid="lang-option-fr"
                    onClick={() => handleSelectLanguage('fr')}
                    className={`w-full px-4 py-2.5 text-xs font-display flex items-center justify-between transition-colors cursor-pointer ${
                      lang === 'fr'
                        ? 'text-[#B99B68] font-bold bg-[#17283F]'
                        : 'text-[#F7F6F0]/90 hover:bg-[#17283F] hover:text-[#B99B68]'
                    }`}
                  >
                    <span>Français</span>
                    {lang === 'fr' && <Check className="w-3.5 h-3.5 text-[#B99B68]" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
