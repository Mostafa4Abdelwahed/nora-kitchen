"use client";

import { useSyncExternalStore } from "react";

type Entry = { raw: string; value: unknown[] };

const EMPTY: unknown[] = [];
const entries = new Map<string, Entry>();
const listeners = new Map<string, Set<() => void>>();

function parseRaw(raw: string): unknown[] {
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function snapshot(key: string): unknown[] {
  let raw: string;
  try {
    raw = window.localStorage.getItem(key) ?? "[]";
  } catch {
    raw = "[]";
  }
  const entry = entries.get(key);
  if (entry && entry.raw === raw) return entry.value;
  const value = parseRaw(raw);
  entries.set(key, { raw, value });
  return value;
}

function emit(key: string) {
  listeners.get(key)?.forEach((cb) => cb());
}

export function useLocalList<T>(key: string): T[] {
  const value = useSyncExternalStore(
    (cb) => {
      let set = listeners.get(key);
      if (!set) {
        set = new Set();
        listeners.set(key, set);
      }
      set.add(cb);
      const onStorage = (e: StorageEvent) => {
        if (e.key === null || e.key === key) cb();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        set.delete(cb);
        window.removeEventListener("storage", onStorage);
      };
    },
    () => snapshot(key),
    () => EMPTY,
  );
  return value as T[];
}

export function setLocalList<T>(key: string, next: T[]): void {
  const raw = JSON.stringify(next);
  try {
    window.localStorage.setItem(key, raw);
  } catch {}
  entries.set(key, { raw, value: next as unknown[] });
  emit(key);
}
