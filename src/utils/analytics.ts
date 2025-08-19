// Google Analytics utilities
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const initializeGA = (measurementId: string) => {
  if (!measurementId) return;
  
  // Store in localStorage for persistence
  localStorage.setItem('ga_measurement_id', measurementId);
  
  // Initialize dataLayer if not exists
  window.dataLayer = window.dataLayer || [];
  
  // Define gtag function
  function gtag(...args: any[]) {
    window.dataLayer?.push(arguments);
  }
  window.gtag = gtag;
  
  // Initialize with current date
  gtag('js', new Date());
  gtag('config', measurementId);
  
  // Load the GA script dynamically
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
};

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (window.gtag) {
    window.gtag('config', localStorage.getItem('ga_measurement_id'), {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
};