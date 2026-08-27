import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Mock MapLibre GL for JSDOM environments
vi.mock('maplibre-gl', () => {
  class Map {
    on = vi.fn();
    off = vi.fn();
    remove = vi.fn();
    flyTo = vi.fn();
    easeTo = vi.fn();
    jumpTo = vi.fn();
    getCenter = () => ({ lng: -0.6, lat: 52.85 });
    getZoom = () => 7;
    getBearing = () => 0;
    getPitch = () => 0;
    getBounds = () => ({
      getNorth: () => 55,
      getSouth: () => 50,
      getEast: () => 2,
      getWest: () => -4,
    });
    project = () => ({ x: 0, y: 0 });
    unproject = () => ({ lng: 0, lat: 0 });
    getContainer = () => document.createElement('div');
    getCanvas = () => document.createElement('canvas');
    loaded = () => true;
    isStyleLoaded = () => true;
    addControl = vi.fn();
    removeControl = vi.fn();
    addSource = vi.fn();
    removeSource = vi.fn();
    addLayer = vi.fn();
    removeLayer = vi.fn();
    getSource = vi.fn();
    getLayer = vi.fn();
    setLayoutProperty = vi.fn();
    setPaintProperty = vi.fn();
    setFilter = vi.fn();
    resize = vi.fn();
  }

  class Marker {
    element: HTMLElement;
    lngLat = { lng: 0, lat: 0 };
    constructor(options?: any) {
      this.element = options?.element || document.createElement('div');
    }
    setLngLat = vi.fn().mockImplementation((coords: any) => {
      if (Array.isArray(coords)) {
        this.lngLat = { lng: coords[0], lat: coords[1] };
      } else if (coords && typeof coords === 'object') {
        this.lngLat = coords;
      }
      return this;
    });
    getLngLat = () => this.lngLat;
    addTo = vi.fn().mockReturnThis();
    remove = vi.fn().mockReturnThis();
    setPopup = vi.fn().mockReturnThis();
    getPopup = vi.fn();
    togglePopup = vi.fn().mockReturnThis();
    getElement = () => this.element;
    isDraggable = () => false;
    setDraggable = vi.fn().mockReturnThis();
    getOffset = () => [0, 0];
    setOffset = vi.fn().mockReturnThis();
    getRotation = () => 0;
    setRotation = vi.fn().mockReturnThis();
    getPitchAlignment = () => 'auto';
    setPitchAlignment = vi.fn().mockReturnThis();
    getRotationAlignment = () => 'auto';
    setRotationAlignment = vi.fn().mockReturnThis();
    on = vi.fn().mockReturnThis();
    off = vi.fn().mockReturnThis();
  }

  class Popup {
    setLngLat = vi.fn().mockReturnThis();
    setDOMContent = vi.fn().mockReturnThis();
    setHTML = vi.fn().mockReturnThis();
    setText = vi.fn().mockReturnThis();
    setMaxWidth = vi.fn().mockReturnThis();
    addClassName = vi.fn().mockReturnThis();
    removeClassName = vi.fn().mockReturnThis();
    setOffset = vi.fn().mockReturnThis();
    addTo = vi.fn().mockReturnThis();
    remove = vi.fn().mockReturnThis();
    isOpen = () => false;
    on = vi.fn().mockReturnThis();
    off = vi.fn().mockReturnThis();
  }

  class NavigationControl {}
  class GeolocateControl {}
  class FullscreenControl {}

  return {
    default: { Map, Marker, Popup, NavigationControl, GeolocateControl, FullscreenControl },
    Map,
    Marker,
    Popup,
    NavigationControl,
    GeolocateControl,
    FullscreenControl,
    getVersion: () => '6.0.0',
    getWorkerUrl: () => '',
    setWorkerUrl: () => {},
  };
});
