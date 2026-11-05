'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

/** Local-only persistence. Reads before writes, rejects malformed saved data. */
export function useLocalData<T>(
  key: string,
  initial: T,
  validate: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>, { ready: boolean; error: string | null }] {
  const [data, setData] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        if (validate(parsed)) setData(parsed);
        else setError('本机旧数据格式不兼容，已使用默认内容。');
      }
    } catch {
      setError('无法读取本机存储；本次操作仍可使用。');
    }
    setReady(true);
    // Keys and validators are stable constants in all callers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      setError('浏览器未允许保存，或存储空间已满；本次改动未保存。');
    }
  }, [data, key, ready]);

  return [data, setData, { ready, error }];
}

export const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

export const isBooleanMap = (value: unknown): value is Record<string, boolean> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every((item) => typeof item === 'boolean');
