import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

type RuntimeEnvironment = {
  supabaseUrl?: string;
  supabaseKey?: string;
};

function getRuntimeEnvironment(): RuntimeEnvironment | undefined {
  return (
    globalThis as typeof globalThis & { __POLL_APP_ENV__?: RuntimeEnvironment }
  ).__POLL_APP_ENV__;
}

function getSupabaseUrl(): string {
  return getRuntimeEnvironment()?.supabaseUrl || environment.supabaseUrl;
}

function getSupabaseKey(): string {
  return getRuntimeEnvironment()?.supabaseKey || environment.supabaseKey;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  readonly client: SupabaseClient = createClient(getSupabaseUrl(), getSupabaseKey());
}
