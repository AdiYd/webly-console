'use client';

import { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { Website, WebsitePage, WebsiteTheme, exampleWebsite, examplePage } from '@/types/mock';
import { daisyThemeName } from '@/types/schemaOld';

export type EditingMode = 'preview' | 'text' | 'image' | 'theme' | 'layout' | 'ai';

export interface EditorState {
  // Website data
  website: Website;
  currentPage: WebsitePage;
  currentPageId: string;
  theme: Partial<WebsiteTheme>;
  daisyTheme: daisyThemeName;

  // Editor state
  editingMode: EditingMode;
  selectedSectionId: string | null;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  screenMode: 'desktop' | 'tablet' | 'mobile';

  // UI state
  chatVisible: boolean;
  chatWidth: number;
  rightDrawerOpen: boolean;
  leftDrawerOpen: boolean;

  // History
  history: EditorState[];
  historyIndex: number;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;
}

type EditorAction =
  | { type: 'SET_WEBSITE'; payload: Website }
  | { type: 'SET_CURRENT_PAGE'; payload: { page: WebsitePage; pageId: string } }
  | { type: 'UPDATE_CURRENT_PAGE'; payload: Partial<WebsitePage> }
  | { type: 'SET_THEME'; payload: Partial<WebsiteTheme> }
  | { type: 'SET_DAISY_THEME'; payload: daisyThemeName }
  | { type: 'SET_EDITING_MODE'; payload: EditingMode }
  | { type: 'SET_SCREEN_MODE'; payload: 'desktop' | 'tablet' | 'mobile' }
  | { type: 'SET_SELECTED_SECTION'; payload: string | null }
  | { type: 'SET_IS_EDITING'; payload: boolean }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'SET_CHAT_VISIBLE'; payload: boolean }
  | { type: 'SET_CHAT_WIDTH'; payload: number }
  | { type: 'SET_RIGHT_DRAWER'; payload: boolean }
  | { type: 'SET_LEFT_DRAWER'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SAVE_TO_HISTORY' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'UPDATE_SECTION'; payload: { sectionId: string; section: any } }
  | { type: 'MOVE_SECTION'; payload: { sectionId: string; direction: 'up' | 'down' } }
  | { type: 'DUPLICATE_SECTION'; payload: { sectionId: string } }
  | { type: 'REORDER_SECTION'; payload: { sectionId: string; newIndex: number } }
  | { type: 'DELETE_SECTION'; payload: { sectionId: string } };

const initialTheme: Partial<WebsiteTheme> = {
  colors: {
    light: {
      primary: '#4CAF50',
      secondary: '#00BCD4',
      accent: '#FFC107',
      background: '#F5F5F5',
      card: '#FFFFFF',
      text: '#212121',
      border: '#E0E0E0',
    },
    dark: {
      primary: '#81C784',
      secondary: '#4DD0E1',
      accent: '#FFD54F',
      background: '#263238',
      card: '#37474F',
      text: '#ECEFF1',
      border: '#455A64',
    },
  },
  typography: {
    fontFamily: 'Inter',
  },
  radius: {
    button: 8,
    card: 16,
  },
};

const initialState: EditorState = {
  website: exampleWebsite,
  currentPage: examplePage,
  currentPageId: 'landing-page',
  theme: initialTheme,
  daisyTheme: 'webly-light',
  editingMode: 'preview',
  screenMode: 'desktop',
  selectedSectionId: null,
  isEditing: false,
  hasUnsavedChanges: false,
  chatVisible: true,
  chatWidth: 400,
  rightDrawerOpen: false,
  leftDrawerOpen: true,
  history: [],
  historyIndex: -1,
  isLoading: false,
  isSaving: false,
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_WEBSITE':
      return { ...state, website: action.payload, hasUnsavedChanges: true };

    case 'SET_CURRENT_PAGE':
      return {
        ...state,
        currentPage: action.payload.page,
        currentPageId: action.payload.pageId,
        selectedSectionId: null,
      };

    case 'UPDATE_CURRENT_PAGE':
      return {
        ...state,
        currentPage: { ...state.currentPage, ...action.payload },
        hasUnsavedChanges: true,
      };

    case 'SET_THEME':
      return { ...state, theme: action.payload, hasUnsavedChanges: true };

    case 'SET_DAISY_THEME':
      return { ...state, daisyTheme: action.payload };

    case 'SET_EDITING_MODE':
      return { ...state, editingMode: action.payload };

    case 'SET_SCREEN_MODE':
      return { ...state, screenMode: action.payload };

    case 'SET_SELECTED_SECTION':
      return { ...state, selectedSectionId: action.payload };

    case 'SET_IS_EDITING':
      return { ...state, isEditing: action.payload };

    case 'SET_UNSAVED_CHANGES':
      return { ...state, hasUnsavedChanges: action.payload };

    case 'SET_CHAT_VISIBLE':
      return { ...state, chatVisible: action.payload };

    case 'SET_CHAT_WIDTH':
      return { ...state, chatWidth: action.payload };

    case 'SET_RIGHT_DRAWER':
      return { ...state, rightDrawerOpen: action.payload };

    case 'SET_LEFT_DRAWER':
      return { ...state, leftDrawerOpen: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };

    case 'SAVE_TO_HISTORY':
      return {
        ...state,
        history: [...state.history.slice(0, state.historyIndex + 1), { ...state }],
        historyIndex: state.historyIndex + 1,
      };

    case 'UNDO':
      if (state.historyIndex > 0) {
        return state.history[state.historyIndex - 1];
      }
      return state;

    case 'REDO':
      if (state.historyIndex < state.history.length - 1) {
        return state.history[state.historyIndex + 1];
      }
      return state;

    case 'UPDATE_SECTION':
      const updatedSections = state.currentPage.sections.map(section =>
        section.id === action.payload.sectionId
          ? { ...section, ...action.payload.section }
          : section
      );
      return {
        ...state,
        currentPage: { ...state.currentPage, sections: updatedSections },
        hasUnsavedChanges: true,
      };
    case 'MOVE_SECTION':
      const { sectionId, direction } = action.payload;
      const sections = state.currentPage.sections;
      const index = sections.findIndex(section => section.id === sectionId);
      if (index !== -1) {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < sections.length) {
          const updatedSections = [...sections];
          [updatedSections[index], updatedSections[newIndex]] = [
            updatedSections[newIndex],
            updatedSections[index],
          ];
          return {
            ...state,
            currentPage: { ...state.currentPage, sections: updatedSections },
            hasUnsavedChanges: true,
          };
        }
      }
      return state;

    case 'DUPLICATE_SECTION':
      const sectionToDuplicate = state.currentPage.sections.find(
        section => section.id === action.payload.sectionId
      );
      const sectionIndex = state.currentPage.sections.findIndex(
        section => section.id === action.payload.sectionId
      );
      const generateUniqueId = () =>
        `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      if (sectionToDuplicate) {
        const duplicatedSection = { ...sectionToDuplicate, id: generateUniqueId() };

        return {
          ...state,
          currentPage: {
            ...state.currentPage,
            sections: [
              ...state.currentPage.sections.slice(0, sectionIndex + 1),
              duplicatedSection,
              ...state.currentPage.sections.slice(sectionIndex + 1),
            ],
          },
          hasUnsavedChanges: true,
        };
      }
      return state;

    case 'REORDER_SECTION':
      const { sectionId: reorderSectionId, newIndex } = action.payload;
      const currentSections = state.currentPage.sections;
      const sectionToMove = currentSections.find(section => section.id === reorderSectionId);
      if (sectionToMove) {
        const updatedSections = currentSections.filter(section => section.id !== reorderSectionId);
        updatedSections.splice(newIndex, 0, sectionToMove);
        return {
          ...state,
          currentPage: { ...state.currentPage, sections: updatedSections },
          hasUnsavedChanges: true,
        };
      }
      return state;

    case 'DELETE_SECTION':
      const { sectionId: deleteSectionId } = action.payload;
      const filteredSections = state.currentPage.sections.filter(
        section => section.id !== deleteSectionId
      );
      return {
        ...state,
        currentPage: { ...state.currentPage, sections: filteredSections },
        hasUnsavedChanges: true,
      };
    default:
      return state;
  }
}

const initializer = (): EditorState => {
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('editorState');
      if (saved) {
        // parsed may be a partial snapshot — merge onto initialState
        return { ...initialState, ...JSON.parse(saved) };
      }
    }
  } catch (err) {
    // ignore parse errors
    console.warn('Failed to parse editorState from localStorage', err);
  }
  return initialState;
};

interface EditorContextType {
  state: EditorState;
  actions: {
    setWebsite: (website: Website) => void;
    setCurrentPage: (page: WebsitePage, pageId: string) => void;
    updateCurrentPage: (updates: Partial<WebsitePage>) => void;
    setTheme: (theme: Partial<WebsiteTheme>) => void;
    setDaisyTheme: (theme: daisyThemeName) => void;
    setEditingMode: (mode: EditingMode) => void;
    setScreenMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
    setSelectedSection: (sectionId: string | null) => void;
    setIsEditing: (editing: boolean) => void;
    setChatVisible: (visible: boolean) => void;
    setChatWidth: (width: number) => void;
    setRightDrawer: (open: boolean) => void;
    setLeftDrawer: (open: boolean) => void;
    updateSection: (sectionId: string, section: any) => void;
    moveSection: (sectionId: string, direction: 'up' | 'down') => void;
    duplicateSection: (sectionId: string) => void;
    reorderSection: (sectionId: string, newIndex: number) => void;
    deleteSection: (sectionId: string) => void;
    saveToHistory: () => void;
    undo: () => void;
    redo: () => void;
    handleSave: () => Promise<void>;
  };
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState, initializer);

  useEffect(() => {
    const {
      leftDrawerOpen,
      rightDrawerOpen,
      chatVisible,
      chatWidth,
      hasUnsavedChanges,
      daisyTheme,
      theme,
      editingMode,
      selectedSectionId,
    } = state;
    localStorage.setItem(
      'editorState',
      JSON.stringify({
        leftDrawerOpen,
        rightDrawerOpen,
        chatVisible,
        chatWidth,
        hasUnsavedChanges,
        daisyTheme,
        editingMode,
        selectedSectionId,
        theme,
      })
    );
  }, [state]);

  useEffect(() => {
    if (state.editingMode !== 'preview') {
      actions.setRightDrawer(true);
    } else {
      actions.setRightDrawer(false);
      actions.setLeftDrawer(false);
      actions.setSelectedSection(null);
      actions.setIsEditing(false);
      actions.setChatVisible(false);
    }
  }, [state.editingMode]);

  // Actions
  const setWebsite = useCallback((website: Website) => {
    dispatch({ type: 'SET_WEBSITE', payload: website });
  }, []);

  const setCurrentPage = useCallback((page: WebsitePage, pageId: string) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: { page, pageId } });
  }, []);

  const updateCurrentPage = useCallback((updates: Partial<WebsitePage>) => {
    dispatch({ type: 'UPDATE_CURRENT_PAGE', payload: updates });
  }, []);

  const setTheme = useCallback((theme: Partial<WebsiteTheme>) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const setDaisyTheme = useCallback((theme: daisyThemeName) => {
    dispatch({ type: 'SET_DAISY_THEME', payload: theme });
  }, []);

  const setEditingMode = useCallback((mode: EditingMode) => {
    dispatch({ type: 'SET_EDITING_MODE', payload: mode });
  }, []);

  const setScreenMode = useCallback((mode: 'desktop' | 'tablet' | 'mobile') => {
    dispatch({ type: 'SET_SCREEN_MODE', payload: mode });
  }, []);

  const setSelectedSection = useCallback((sectionId: string | null) => {
    dispatch({ type: 'SET_SELECTED_SECTION', payload: sectionId });
  }, []);

  const setIsEditing = useCallback((editing: boolean) => {
    dispatch({ type: 'SET_IS_EDITING', payload: editing });
  }, []);

  const setChatVisible = useCallback((visible: boolean) => {
    dispatch({ type: 'SET_CHAT_VISIBLE', payload: visible });
  }, []);

  const setChatWidth = useCallback((width: number) => {
    dispatch({ type: 'SET_CHAT_WIDTH', payload: width });
  }, []);

  const setRightDrawer = useCallback((open: boolean) => {
    dispatch({ type: 'SET_RIGHT_DRAWER', payload: open });
  }, []);

  const setLeftDrawer = useCallback((open: boolean) => {
    dispatch({ type: 'SET_LEFT_DRAWER', payload: open });
  }, []);

  const updateSection = useCallback((sectionId: string, section: any) => {
    dispatch({ type: 'UPDATE_SECTION', payload: { sectionId, section } });
  }, []);

  const moveSection = useCallback((sectionId: string, direction: 'up' | 'down') => {
    dispatch({ type: 'MOVE_SECTION', payload: { sectionId, direction } });
  }, []);

  const duplicateSection = useCallback((sectionId: string) => {
    dispatch({ type: 'DUPLICATE_SECTION', payload: { sectionId } });
  }, []);

  const reorderSection = useCallback((sectionId: string, newIndex: number) => {
    dispatch({ type: 'REORDER_SECTION', payload: { sectionId, newIndex } });
  }, []);

  const deleteSection = useCallback((sectionId: string) => {
    dispatch({ type: 'DELETE_SECTION', payload: { sectionId } });
  }, []);

  const saveToHistory = useCallback(() => {
    dispatch({ type: 'SAVE_TO_HISTORY' });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const handleSave = useCallback(async () => {
    dispatch({ type: 'SET_SAVING', payload: true });

    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Saving website context:', {
        website: state.website,
        currentPage: state.currentPage,
        theme: state.theme,
        timestamp: new Date().toISOString(),
      });

      dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false });

      // TODO: Implement actual save to backend/localStorage
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  }, [state.website, state.currentPage, state.theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              redo();
            } else {
              e.preventDefault();
              undo();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, undo, redo]);

  const actions = {
    setWebsite,
    setCurrentPage,
    updateCurrentPage,
    setTheme,
    setDaisyTheme,
    setEditingMode,
    setScreenMode,
    setSelectedSection,
    setIsEditing,
    setChatVisible,
    setChatWidth,
    setRightDrawer,
    setLeftDrawer,
    updateSection,
    moveSection,
    duplicateSection,
    deleteSection,
    reorderSection,
    saveToHistory,
    undo,
    redo,
    handleSave,
  };

  return <EditorContext.Provider value={{ state, actions }}>{children}</EditorContext.Provider>;
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
