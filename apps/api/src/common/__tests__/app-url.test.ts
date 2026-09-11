import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { getAppBaseUrl, sanitizeDomainUrl, containsRawIp } from '../app-url';

describe('app-url utils', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('containsRawIp', () => {
    it('detects IPv4 addresses correctly', () => {
      expect(containsRawIp('http://54.37.226.228')).toBe(true);
      expect(containsRawIp('http://127.0.0.1:3000')).toBe(true);
      expect(containsRawIp('https://usmonastir.tn')).toBe(false);
      expect(containsRawIp('usmonastir.tn')).toBe(false);
    });
  });

  describe('getAppBaseUrl', () => {
    it('returns official domain by default', () => {
      delete process.env.APP_URL;
      delete process.env.APP_DOMAIN;
      delete process.env.CLIENT_URL;
      expect(getAppBaseUrl()).toBe('https://usmonastir.tn');
    });

    it('uses valid APP_URL without trailing slash', () => {
      process.env.APP_URL = 'https://usmonastir.tn/';
      expect(getAppBaseUrl()).toBe('https://usmonastir.tn');
    });

    it('rejects raw IP in APP_URL and falls back to official domain', () => {
      process.env.APP_URL = 'http://54.37.226.228';
      expect(getAppBaseUrl()).toBe('https://usmonastir.tn');
    });

    it('uses APP_DOMAIN when available', () => {
      delete process.env.APP_URL;
      process.env.APP_DOMAIN = 'usmonastir.tn';
      expect(getAppBaseUrl()).toBe('https://usmonastir.tn');
    });

    it('uses non-localhost CLIENT_URL if set', () => {
      delete process.env.APP_URL;
      delete process.env.APP_DOMAIN;
      process.env.CLIENT_URL = 'https://usmonastir.tn,http://localhost:3000';
      expect(getAppBaseUrl()).toBe('https://usmonastir.tn');
    });
  });

  describe('sanitizeDomainUrl', () => {
    it('replaces raw VPS IP with https://usmonastir.tn', () => {
      const dirty = 'http://54.37.226.228/verify-email?token=abcdef123456';
      expect(sanitizeDomainUrl(dirty)).toBe('https://usmonastir.tn/verify-email?token=abcdef123456');
    });

    it('leaves clean domain URLs untouched', () => {
      const clean = 'https://usmonastir.tn/verify-email?token=abcdef123456';
      expect(sanitizeDomainUrl(clean)).toBe('https://usmonastir.tn/verify-email?token=abcdef123456');
    });
  });
});
