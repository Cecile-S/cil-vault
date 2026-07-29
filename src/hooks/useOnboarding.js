import { useState, useEffect, useCallback } from 'react';

const ONBOARDING_KEY = 'cil-onboarding-state';
const ONBOARDING_COMPLETE_KEY = 'cil-onboarding-complete';

const INITIAL_STATE = {
  step: 1,
  completed: false,
  skipped: false,
  stepData: {
    step1: { welcomed: false },
    step2: { propertyCreated: false },
    step3: { tourCompleted: false },
  },
};

export function useOnboarding() {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') return INITIAL_STATE;
    try {
      const stored = localStorage.getItem(ONBOARDING_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with initial state to handle new steps
        return { ...INITIAL_STATE, ...parsed, stepData: { ...INITIAL_STATE.stepData, ...parsed.stepData } };
      }
    } catch (e) {
      console.warn('Failed to parse onboarding state:', e);
    }
    return INITIAL_STATE;
  });

  const [isComplete, setIsComplete] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';
  });

  // Persist state to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to persist onboarding state:', e);
    }
  }, [state]);

  // Persist completion status
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ONBOARDING_COMPLETE_KEY, isComplete.toString());
    } catch (e) {
      console.warn('Failed to persist onboarding completion:', e);
    }
  }, [isComplete]);

  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      step: Math.min(prev.step + 1, 3),
      stepData: {
        ...prev.stepData,
        [`step${prev.step}`]: { ...prev.stepData[`step${prev.step}`], completed: true },
      },
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      step: Math.max(prev.step - 1, 1),
    }));
  }, []);

  const goToStep = useCallback((step) => {
    setState(prev => ({
      ...prev,
      step: Math.max(1, Math.min(step, 3)),
    }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState(prev => ({
      ...prev,
      step: 3,
      completed: true,
      stepData: {
        ...prev.stepData,
        step3: { ...prev.stepData.step3, tourCompleted: true },
      },
    }));
    setIsComplete(true);
  }, []);

  const skipOnboarding = useCallback(() => {
    setState(prev => ({
      ...prev,
      skipped: true,
      completed: true,
    }));
    setIsComplete(true);
  }, []);

  const resetOnboarding = useCallback(() => {
    setState(INITIAL_STATE);
    setIsComplete(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ONBOARDING_KEY);
      localStorage.removeItem(ONBOARDING_COMPLETE_KEY);
    }
  }, []);

  const markStepData = useCallback((stepKey, data) => {
    setState(prev => ({
      ...prev,
      stepData: {
        ...prev.stepData,
        [stepKey]: { ...prev.stepData[stepKey], ...data },
      },
    }));
  }, []);

  // Check if onboarding should be shown
  const shouldShow = !isComplete && typeof window !== 'undefined';

  return {
    state,
    isComplete,
    shouldShow,
    nextStep,
    prevStep,
    goToStep,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    markStepData,
  };
}

// Hook to check if onboarding is complete without triggering re-renders
export function useOnboardingStatus() {
  const [isComplete, setIsComplete] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const check = () => setIsComplete(localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true');
    check();
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  return isComplete;
}