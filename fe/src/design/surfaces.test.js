/* Renders every surface in every design against a stubbed API.

   This is a smoke test, not a snapshot: it asserts that each page mounts,
   fetches, and settles without throwing. It is the cheapest guard against a
   design variant drifting out of sync with the shared hooks. */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { DesignProvider } from './DesignContext';
import { SURFACES, resolveSurface } from './registry';
import { DESIGN_IDS } from './config';

/* Leaflet measures elements; jsdom does not. */
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {} unobserve() {} disconnect() {}
  };
  Object.defineProperty(HTMLElement.prototype, 'clientWidth',  { configurable: true, value: 800 });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 600 });
});

const EVENT = {
  id: 1, organizationId: 2, title: 'Riverbank clean-up',
  description: 'Bring gloves.\n\nWe supply bags.',
  capacity: 20, duration: 180, date: '2026-09-12T14:00:00.000Z',
  address: '12 River Road, Springfield', latitude: 42.1, longitude: -71.2,
  image: null, Tags: [{ id: 1, slug: 'environment', name: 'Environment' }],
  createdAt: '2026-01-02T10:00:00.000Z', updatedAt: '2026-01-03T10:00:00.000Z',
};

const ORG = {
  id: 2, name: 'Green Future', description: 'We plant things.',
  email: 'hi@example.com', phone: '555-0100', address: '1 Main St',
  bannerImg: null, iconImg: null,
  createdAt: '2025-05-01T10:00:00.000Z', updatedAt: '2026-01-01T10:00:00.000Z',
};

const USER = {
  id: 7, username: 'jane', email: 'jane@example.com', displayName: 'Jane',
  profilePic: null, role: 'volunteer',
  createdAt: '2025-06-01T10:00:00.000Z', updatedAt: '2026-01-01T10:00:00.000Z',
};

function stubFetch(url) {
  const body =
    url.includes('/api/events/tags')       ? { tags: EVENT.Tags } :
    url.includes('/api/events/search')     ? { data: [EVENT], total: 1 } :
    /\/api\/events\/\d+$/.test(url)        ? { data: EVENT } :
    url.includes('/api/events')            ? { data: [EVENT], total: 1 } :
    url.includes('/events')                ? { data: [EVENT] } :
    /\/api\/orgs\/\d+$/.test(url)          ? { data: ORG } :
    url.includes('/api/orgs')              ? { data: [ORG] } :
    /\/api\/users\/\d+$/.test(url)         ? { data: USER } :
                                             { data: [] };
  return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) });
}

beforeEach(() => {
  jest.spyOn(global, 'fetch').mockImplementation(stubFetch);
});

afterEach(() => {
  jest.restoreAllMocks();
  localStorage.clear();
});

const ROUTE_FOR = {
  Landing:   '/',
  Events:    '/events',
  Event:     '/events/1',
  EventNew:  '/organizations/2/events/new',
  Orgs:      '/organizations',
  Org:       '/organizations/2',
  Volunteer: '/volunteer/7',
  Login:     '/login',
  Signup:    '/signup',
  About:     '/about',
  NotFound:  '/nowhere',
};

const PATH_PATTERN = {
  Event:     '/events/:id',
  EventNew:  '/organizations/:id/events/new',
  Org:       '/organizations/:id',
  Volunteer: '/volunteer/:id',
};

describe.each(DESIGN_IDS)('design: %s', (design) => {
  test.each(SURFACES)('%s mounts and settles', async (surface) => {
    localStorage.setItem('benevola_design', design);
    const Component = resolveSurface(design, surface);
    expect(Component).toBeTruthy();

    const route = ROUTE_FOR[surface];
    const path  = PATH_PATTERN[surface] ?? route;

    render(
      <AuthProvider>
        <DesignProvider>
          <MemoryRouter initialEntries={[route]}>
            <Routes>
              <Route path={path} element={<Component />} />
            </Routes>
          </MemoryRouter>
        </DesignProvider>
      </AuthProvider>
    );

    /* Every page renders the Benevola wordmark once it is past its first
       paint, whether it landed in a content, empty, or error state. */
    await waitFor(() => {
      expect(screen.getAllByText(/Benevola/i).length).toBeGreaterThan(0);
    });
  });
});
