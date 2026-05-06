import { TestBed } from '@angular/core/testing';

import { SupabaseService } from './supabase';

function setRuntimeEnvironment(): void {
  (globalThis as any).__POLL_APP_ENV__ = {
    supabaseUrl: 'https://example.supabase.co',
    supabaseKey: 'test-publishable-key',
  };
}

describe('SupabaseService', () => {
  let service: SupabaseService;

  beforeEach(() => {
    setRuntimeEnvironment();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
