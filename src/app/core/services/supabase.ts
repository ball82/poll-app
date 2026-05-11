import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

type RuntimeEnvironment = {
  supabaseUrl?: string;
  supabaseKey?: string;
};

/**
 * Liest zur Laufzeit injizierte Umgebungsvariablen aus `globalThis.__POLL_APP_ENV__`.
 * Ermöglicht das Überschreiben der Build-Zeit-Konfiguration ohne Rebuild.
 */
function getRuntimeEnvironment(): RuntimeEnvironment | undefined {
  return (
    globalThis as typeof globalThis & { __POLL_APP_ENV__?: RuntimeEnvironment }
  ).__POLL_APP_ENV__;
}

/**
 * Gibt die Supabase-URL zurück — Runtime-Wert hat Vorrang vor dem Build-Zeit-Environment.
 */
function getSupabaseUrl(): string {
  return getRuntimeEnvironment()?.supabaseUrl || environment.supabaseUrl;
}

/**
 * Gibt den Supabase-API-Key zurück — Runtime-Wert hat Vorrang vor dem Build-Zeit-Environment.
 */
function getSupabaseKey(): string {
  return getRuntimeEnvironment()?.supabaseKey || environment.supabaseKey;
}

/**
 * Singleton-Service, der den initialisierten Supabase-Client bereitstellt.
 *
 * @remarks
 * Wird app-weit als einzige Supabase-Instanz verwendet.
 * URL und Key werden zur Laufzeit aufgelöst, damit Docker-Deployments
 * ohne Rebuild konfiguriert werden können.
 */
@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  /** Initialisierter Supabase-Client für Datenbankzugriffe. */
  readonly client: SupabaseClient = createClient(getSupabaseUrl(), getSupabaseKey());
}
