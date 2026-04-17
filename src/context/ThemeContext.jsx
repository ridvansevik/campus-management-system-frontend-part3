import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Tema konfigürasyonları
const getDesignTokens = (mode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // Light Mode
                primary: {
                    main: '#4f46e5',
                    light: '#818cf8',
                    dark: '#3730a3',
                    contrastText: '#ffffff',
                },
                secondary: {
                    main: '#ec4899',
                    light: '#f472b6',
                    dark: '#db2777',
                },
                background: {
                    default: '#f8fafc',
                    paper: '#ffffff',
                },
                text: {
                    primary: '#1e293b',
                    secondary: '#64748b',
                },
                divider: 'rgba(0, 0, 0, 0.08)',
            }
            : {
                // Dark Mode
                primary: {
                    main: '#818cf8',
                    light: '#a5b4fc',
                    dark: '#6366f1',
                    contrastText: '#ffffff',
                },
                secondary: {
                    main: '#f472b6',
                    light: '#f9a8d4',
                    dark: '#ec4899',
                },
                background: {
                    default: '#0f172a',
                    paper: '#1e293b',
                },
                text: {
                    primary: '#f1f5f9',
                    secondary: '#94a3b8',
                },
                divider: 'rgba(255, 255, 255, 0.08)',
            }),
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 8,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: mode === 'light'
                        ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        : '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundImage: 'none',
                },
            },
        },
    },
});

export const ThemeProvider = ({ children }) => {
    // localStorage'dan tema tercihini al veya sistem tercihini kullan
    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem('themeMode');
        if (savedMode) return savedMode;

        // Sistem tercihini kontrol et
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    // Tema değişikliğini kaydet
    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    // Sistem teması değişirse güncelle (opsiyonel)
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            const savedMode = localStorage.getItem('themeMode');
            if (!savedMode) {
                setMode(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

    const value = {
        mode,
        toggleTheme,
        isDarkMode: mode === 'dark',
    };

    return (
        <ThemeContext.Provider value={value}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
