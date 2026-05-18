// Kairos - Data Store and State Management (v1)
// Uses localStorage for persistence and useSyncExternalStore for Reactivity.

const STORE_KEY = 'kairos:v1:state';
const EVENT_NAME = 'kairos_state_change';

// Default initial state
const defaultState = {
  version: 4,
  user: null, // { name, email, createdAt }
  onboarded: false,
  settings: {
    wakeTime: "06:30",
    sleepTime: "23:00",
    theme: "light",
  },
  categories: [
    { id: 'fisico', label: 'Físico', color: '#10b981', builtin: true },
    { id: 'estudio', label: 'Estudio', color: '#8b5cf6', builtin: true },
    { id: 'trabajo', label: 'Trabajo', color: '#3b82f6', builtin: true },
    { id: 'creativo', label: 'Creativo', color: '#f59e0b', builtin: true },
    { id: 'otro', label: 'Otro', color: '#6b7280', builtin: true }
  ],
  obligations: [
    { id: 'ob_uni', name: 'Universidad', categoryId: 'estudio', startTime: '08:00', endTime: '12:00', days: [0, 1, 2, 3, 4] } // Lunes a Viernes
  ],
  activities: [
    { id: 'act_gym', name: 'Ir al gimnasio', categoryId: 'fisico', type: 'flexible', frequency: { perWeek: 4, durationMin: 60 }, tracking: 'check' },
    { id: 'act_read', name: 'Leer libro', categoryId: 'creativo', type: 'flexible', frequency: { perWeek: 7, durationMin: 30 }, tracking: 'quant', goal: 20, unit: 'páginas' },
    { id: 'act_proj', name: 'Proyecto personal', categoryId: 'trabajo', type: 'flexible', frequency: { perWeek: 3, durationMin: 120 }, tracking: 'progress' }
  ],
  days: {}
};

// In-memory state copy
let currentState = defaultState;
let unsubFirestore = null;

function loadState() {
  try {
    const stored = localStorage.getItem(STORE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.version === 4) {
        currentState = parsed;
      } else {
        currentState = defaultState;
      }
    } else {
      currentState = defaultState;
    }
  } catch (e) {
    console.error("Failed to load state", e);
    currentState = defaultState;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(currentState));
    window.dispatchEvent(new Event(EVENT_NAME));
    
    // Save to Firestore if user is logged in and it's not the local user
    const user = currentState.user;
    if (user && user.uid && user.uid !== 'local' && window.db) {
      window.db.collection('users').doc(user.uid).set(currentState)
        .catch(e => console.error("Error saving to Firestore:", e));
    }
  } catch (e) {
    console.error("Failed to save state", e);
  }
}

// Listen to Auth State
if (window.firebase) {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      console.log("Usuario autenticado:", user.uid);
      // Load from Firestore
      if (unsubFirestore) unsubFirestore();
      
      unsubFirestore = window.db.collection('users').doc(user.uid).onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          if (data.version !== 4) {
            console.log("Resetting state due to version mismatch in Firestore");
            // Keep the user info but reset everything else
            const newState = { ...defaultState, user: data.user };
            window.db.collection('users').doc(user.uid).set(newState);
            currentState = newState;
          } else {
            console.log("Datos cargados desde Firestore");
            currentState = data;
          }
          window.dispatchEvent(new Event(EVENT_NAME));
        } else {
          console.log("No hay datos en Firestore, usando locales");
          // If no data in firestore, save current local data to firestore
          window.db.collection('users').doc(user.uid).set(currentState);
        }
      });
    } else {
      console.log("Usuario desautenticado");
      if (unsubFirestore) {
        unsubFirestore();
        unsubFirestore = null;
      }
    }
  });
}

// Initial load
loadState();

// Core subscription for useSyncExternalStore
function subscribe(callback) {
  window.addEventListener(EVENT_NAME, callback);
  return () => window.removeEventListener(EVENT_NAME, callback);
}

function getSnapshot() {
  return currentState;
}

// ---- Hooks ----

// Helper to create specific selectors
function createStoreHook(selector) {
  return () => {
    // We use React.useSyncExternalStore to subscribe to the global store
    // The selector isolates the return value, and useSyncExternalStore internally handles memoization
    const state = React.useSyncExternalStore(subscribe, getSnapshot);
    return selector(state);
  };
}

const useUser = createStoreHook(state => state.user);
const useSettings = createStoreHook(state => state.settings);
const useCategories = createStoreHook(state => state.categories);
const useObligations = createStoreHook(state => state.obligations);
const useActivities = createStoreHook(state => state.activities);
const useDays = createStoreHook(state => state.days);

function useDay(dateString) {
  const state = React.useSyncExternalStore(subscribe, getSnapshot);
  return state.days[dateString] || null;
}

// ---- Actions ----

const storeActions = {
  getState: () => currentState,

  setUser: (user) => {
    currentState = { ...currentState, user: { ...user, createdAt: new Date().toISOString() } };
    saveState();
  },
  
  updateSettings: (newSettings) => {
    currentState = { ...currentState, settings: { ...currentState.settings, ...newSettings } };
    saveState();
  },
  
  addCategory: (category) => {
    const cat = {
      ...category,
      id: Math.random().toString(36).substr(2, 9),
      builtin: false,
    };
    currentState = {
      ...currentState,
      categories: [...currentState.categories, cat]
    };
    saveState();
  },

  updateCategory: (id, updates) => {
    currentState = {
      ...currentState,
      categories: currentState.categories.map(cat => cat.id === id ? { ...cat, ...updates } : cat)
    };
    saveState();
  },

  deleteCategory: (id) => {
    currentState = {
      ...currentState,
      categories: currentState.categories.filter(cat => cat.id !== id)
    };
    saveState();
  },
  
  addObligation: (obligation) => {
    const ob = { 
      ...obligation, 
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString() 
    };
    currentState = { 
      ...currentState, 
      obligations: [...currentState.obligations, ob] 
    };
    saveState();
  },
  
  updateObligation: (id, updates) => {
    currentState = {
      ...currentState,
      obligations: currentState.obligations.map(ob => ob.id === id ? { ...ob, ...updates } : ob)
    };
    saveState();
  },
  
  deleteObligation: (id) => {
    currentState = {
      ...currentState,
      obligations: currentState.obligations.filter(ob => ob.id !== id)
    };
    saveState();
  },

  addActivity: (activity) => {
    const act = { 
      ...activity, 
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString() 
    };
    currentState = { 
      ...currentState, 
      activities: [...currentState.activities, act] 
    };
    saveState();
  },

  updateActivity: (id, updates) => {
    currentState = {
      ...currentState,
      activities: currentState.activities.map(act => act.id === id ? { ...act, ...updates } : act)
    };
    saveState();
  },

  deleteActivity: (id) => {
    currentState = {
      ...currentState,
      activities: currentState.activities.filter(act => act.id !== id)
    };
    saveState();
  },

  updateDay: (dateString, dayData) => {
    currentState = {
      ...currentState,
      days: {
        ...currentState.days,
        [dateString]: dayData
      }
    };
    saveState();
  },
  
  updateDayBlock: (dateString, blockId, updates) => {
    const day = currentState.days[dateString];
    if (!day) return;
    
    const updatedBlocks = day.blocks.map(b => {
      // Assuming blocks might use activityId as identifier for tracking, or a unique generated block ID
      // If we use blockId mapping:
      return b.id === blockId ? { ...b, ...updates } : b;
    });

    currentState = {
      ...currentState,
      days: {
        ...currentState.days,
        [dateString]: {
          ...day,
          blocks: updatedBlocks
        }
      }
    };
    saveState();
  },

  updateDayCheckin: (dateString, checkinData) => {
    const day = currentState.days[dateString] || { blocks: [] };
    currentState = {
      ...currentState,
      days: {
        ...currentState.days,
        [dateString]: {
          ...day,
          checkin: { ...day.checkin, ...checkinData, savedAt: new Date().toISOString() }
        }
      }
    };
    saveState();
  },

  // Bulk replace all days (used by scheduler)
  setDays: (daysObj) => {
    currentState = { ...currentState, days: daysObj };
    saveState();
  },

  // Mark onboarding as complete
  setOnboarded: () => {
    currentState = { ...currentState, onboarded: true };
    saveState();
  },

  // Developer / Seed Tool
  resetState: () => {
    currentState = defaultState;
    saveState();
  }
};

function useStoreActions() {
  return storeActions;
}

// Export to window so other Babel compiled scripts can use them globally
Object.assign(window, {
  useUser,
  useSettings,
  useCategories,
  useObligations,
  useActivities,
  useDays,
  useDay,
  useStoreActions,
  storeActions
});
