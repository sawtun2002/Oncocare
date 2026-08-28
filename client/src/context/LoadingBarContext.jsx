import { createContext, useContext, useState, useRef, useCallback } from 'react';
import LoadingBar from 'react-top-loading-bar';

const LoadingBarContext = createContext(null);

export function LoadingBarProvider({ children }) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const startLoading = useCallback(() => {
    // Clear any pending timers
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Jump to initial active state
    setProgress(30);

    // Increment gradually if a page load takes longer
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(intervalRef.current);
          return prev;
        }
        return prev + 10;
      });
    }, 200);
  }, []);

  const completeLoading = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(100);
  }, []);

  const resetLoading = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(0);
  }, []);

  return (
    <LoadingBarContext.Provider
      value={{
        startLoading,
        completeLoading,
        resetLoading,
        setProgress,
        progress,
      }}
    >
      <LoadingBar
        color="#0284c7" // Accent Blue (Sky 600)
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
        height={3}
        shadow={true}
        shadowStyle={{
          boxShadow: '0 0 10px #0284c7, 0 0 5px #0284c7'
        }}
        waitingTime={300}
        transitionTime={200}
        loaderSpeed={400}
        className="z-[99999]"
      />
      {children}
    </LoadingBarContext.Provider>
  );
}

export function useLoadingBar() {
  const context = useContext(LoadingBarContext);
  if (!context) {
    throw new Error('useLoadingBar must be used within LoadingBarProvider');
  }
  return context;
}