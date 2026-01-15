// src/hooks/useIsMobile.js
import { useEffect, useState } from 'react';

const WIDTH_QUERY = '(max-width: 768px)';
const POINTER_COARSE = '(pointer: coarse)';
const DEBUG = false;

function uaLooksLikeMobile() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || '';
  // keep this conservative
  return /android|iphone|ipad|ipod|windows phone|mobile/i.test(ua);
}

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

    // prefer the modern userAgentData when present
    const uaDataMobile = (navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean')
      ? navigator.userAgentData.mobile
      : undefined;

    try {
      const widthMatch = window.matchMedia(WIDTH_QUERY).matches;
      const pointerCoarse = window.matchMedia(POINTER_COARSE).matches;
      const touch = 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0;

      // decision logic:
      // - if userAgentData explicitly says mobile -> trust it
      // - else if width is small -> mobile
      // - else if pointer is coarse AND there's touch -> mobile (both, not touch alone)
      // - else fallback to UA regex
      const result = (uaDataMobile === true)
        || widthMatch
        || (pointerCoarse && touch)
        || uaLooksLikeMobile();

      if (DEBUG) console.log('useIsMobile init', { uaDataMobile, widthMatch, pointerCoarse, touch, uaLook: uaLooksLikeMobile(), result });

      return result;
    } catch (e) {
      if (DEBUG) console.error('useIsMobile init error', e);
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    const mqWidth = window.matchMedia(WIDTH_QUERY);
    const mqPointer = window.matchMedia(POINTER_COARSE);

    const compute = () => {
      const uaDataMobile = (navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean')
        ? navigator.userAgentData.mobile
        : undefined;

      const w = mqWidth.matches;
      const p = mqPointer.matches;
      const touch = 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0;
      const val = (uaDataMobile === true) || w || (p && touch) || uaLooksLikeMobile();

      if (DEBUG) console.log('useIsMobile compute', { uaDataMobile, w, p, touch, uaLook: uaLooksLikeMobile(), val });
      setIsMobile(val);
    };

    // use event listeners where supported
    const widthListener = (ev) => compute();
    const pointerListener = (ev) => compute();

    if (mqWidth.addEventListener) mqWidth.addEventListener('change', widthListener);
    else mqWidth.addListener(widthListener);

    if (mqPointer.addEventListener) mqPointer.addEventListener('change', pointerListener);
    else mqPointer.addListener(pointerListener);

    // handle resize (viewport changes)
    window.addEventListener('resize', compute);

    // initial compute
    compute();

    return () => {
      try {
        if (mqWidth.removeEventListener) mqWidth.removeEventListener('change', widthListener);
        else mqWidth.removeListener(widthListener);
      } catch (e) {}
      try {
        if (mqPointer.removeEventListener) mqPointer.removeEventListener('change', pointerListener);
        else mqPointer.removeListener(pointerListener);
      } catch (e) {}
      window.removeEventListener('resize', compute);
    };
  }, []);

  return isMobile;
}
