import { Injectable, Logger } from '@nestjs/common';
import {
  CompetitionSummaryDto,
  FixtureDto,
  SportsDataProvider,
  StandingDto,
  TeamProfileDto,
} from '../interfaces/sports-provider.interface';
import { ApiFootballProvider } from './api-football.provider';

const TEAM_CANONICAL_NAMES: Record<string, string> = {
  'ps sakiet eddaier': 'PS Sakiet Eddaier',
  'ca bizertin': 'CA Bizertin',
  'club africain': 'Club Africain',
  'cs sfaxien': 'CS Sfaxien',
  'club sportif sfaxien': 'CS Sfaxien',
  'us monastirienne': 'US Monastir',
  'us monastir': 'US Monastir',
  'us ben guerdane': 'US Ben Guerdane',
  'etoile du sahel': 'Étoile Sportive du Sahel',
  'etoile sportive du sahel': 'Étoile Sportive du Sahel',
  'js omrane': 'JS Omrane',
  'esperance de zarzis': 'Espérance Sportive de Zarzis',
  'esperance sportive de zarzis': 'Espérance Sportive de Zarzis',
  'esperance de tunis': 'Espérance Sportive de Tunis',
  'esperance sportive de tunis': 'Espérance Sportive de Tunis',
  'stade tunisien': 'Stade Tunisien',
  'as marsa': 'Avenir Sportif de La Marsa',
  'avenir sportif de la marsa': 'Avenir Sportif de La Marsa',
  'es hammam sousse': 'ES Hammam Sousse',
  'olympique de beja': 'Olympique de Béja',
  'olympique beja': 'Olympique de Béja',
  'es metlaoui': 'Étoile Sportive de Métlaoui',
  'etoile sportive de metlaoui': 'Étoile Sportive de Métlaoui',
  'cs hammam-lif': 'CS Hammam-Lif',
};

const TEAM_DEFAULT_LOGOS: Record<string, string> = {
  'ps sakiet eddaier': '/teams/pss.svg',
  'ca bizertin': '/teams/cab.png',
  'club africain': '/teams/ca.png',
  'cs sfaxien': '/teams/css.png',
  'club sportif sfaxien': '/teams/css.png',
  'us monastir': '/logo.png',
  'us monastirienne': '/logo.png',
  'us ben guerdane': '/teams/usbg.png',
  'etoile du sahel': '/teams/ess.png',
  'etoile sportive du sahel': '/teams/ess.png',
  'js omrane': '/teams/jso.png',
  'esperance de zarzis': '/teams/esz.png',
  'esperance sportive de zarzis': '/teams/esz.png',
  'esperance de tunis': '/teams/est.png',
  'esperance sportive de tunis': '/teams/est.png',
  'stade tunisien': '/teams/st.png',
  'as marsa': '/teams/asm.png',
  'avenir sportif de la marsa': '/teams/asm.png',
  'es hammam sousse': '/teams/eshs.png',
  'olympique de beja': '/teams/ob.png',
  'olympique beja': '/teams/ob.png',
  'es metlaoui': '/teams/esm.png',
  'etoile sportive de metlaoui': '/teams/esm.png',
  'cs hammam-lif': '/teams/cshl.png',
};

const normalizeTeamKey = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

@Injectable()
export class KawarjiProvider implements SportsDataProvider {
  readonly providerName = 'kawarji-live';
  private readonly logger = new Logger(KawarjiProvider.name);

  constructor(private readonly apiFootballProvider: ApiFootballProvider) {}

  /**
   * Fetch live 16-team standings directly from Kawarji Ligue 1 table.
   */
  async getStandings(leagueExternalId: string, season: string): Promise<StandingDto[]> {
    try {
      const seasonSlug = season && season.includes('-') ? season : '2026-2027';
      const url = `https://www.kawarji.com/classement/ligue1/${seasonSlug}`;

      this.logger.log(`Fetching live Tunisian Ligue 1 standings from ${url}...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} from Kawarji standings URL`);
      }

      const html = await res.text();
      const startIdx = html.indexOf('classement général');
      if (startIdx === -1) {
        throw new Error('Section "classement général" introuvable dans le HTML de Kawarji');
      }

      const ulStart = html.indexOf('<ul class="clearfix">', startIdx);
      const ulEnd = html.indexOf('</ul>', ulStart);
      if (ulStart === -1 || ulEnd === -1) {
        throw new Error('Liste de classement <ul> introuvable dans le HTML de Kawarji');
      }

      const ulContent = html.slice(ulStart, ulEnd);
      const liRegex = /<li>([\s\S]*?)<\/li>/gi;
      let match;
      const rows: StandingDto[] = [];

      while ((match = liRegex.exec(ulContent)) !== null) {
        const li = match[1];
        const colRegex = /<div[^>]*>([\s\S]*?)<\/div>/gi;
        const cols: string[] = [];
        let colMatch;
        while ((colMatch = colRegex.exec(li)) !== null) {
          cols.push(colMatch[1].replace(/<[^>]+>/g, '').trim());
        }

        if (cols.length >= 10) {
          const rawName = cols[1];
          const normKey = normalizeTeamKey(rawName);
          const canonicalName = TEAM_CANONICAL_NAMES[normKey] || rawName;
          const isUSM =
            normKey.includes('monastir') ||
            normKey.includes('usm');

          const teamLogo = isUSM ? '/logo.png' : (TEAM_DEFAULT_LOGOS[normKey] || null);
          const goalDiffStr = cols[8] || '0';
          const goalDiff = parseInt(goalDiffStr.replace('+', ''), 10) || 0;

          rows.push({
            position: parseInt(cols[0], 10) || rows.length + 1,
            teamId: isUSM ? '992' : `kw-${rows.length + 1}`,
            teamName: canonicalName,
            teamLogo,
            played: parseInt(cols[2], 10) || 0,
            won: parseInt(cols[3], 10) || 0,
            drawn: parseInt(cols[4], 10) || 0,
            lost: parseInt(cols[5], 10) || 0,
            goalsFor: parseInt(cols[6], 10) || 0,
            goalsAgainst: parseInt(cols[7], 10) || 0,
            goalDifference: goalDiff,
            points: parseInt(cols[9], 10) || 0,
            form: '',
            isUSM,
          });
        }
      }

      if (rows.length >= 10) {
        this.logger.log(`Kawarji live standings parse successful: ${rows.length} teams received.`);
        return rows;
      }

      this.logger.warn(`Kawarji standings parsed fewer than 10 teams (${rows.length}).`);
    } catch (err: any) {
      this.logger.error(`Failed to fetch live standings from Kawarji: ${err.message}`);
    }

    return [];
  }

  // Forward matches & fixtures to ApiFootballProvider
  async getFixtures(teamExternalId: string, leagueExternalId?: string, season?: string): Promise<FixtureDto[]> {
    return this.apiFootballProvider.getFixtures(teamExternalId, leagueExternalId, season);
  }

  async getResults(teamExternalId: string, leagueExternalId?: string, season?: string, limit?: number): Promise<FixtureDto[]> {
    return this.apiFootballProvider.getResults(teamExternalId, leagueExternalId, season, limit);
  }

  async getMatch(matchExternalId: string): Promise<FixtureDto | null> {
    return this.apiFootballProvider.getMatch(matchExternalId);
  }

  async getLiveMatches(teamExternalId?: string, leagueExternalId?: string): Promise<FixtureDto[]> {
    return this.apiFootballProvider.getLiveMatches(teamExternalId, leagueExternalId);
  }

  async getTeamInfo(teamExternalId: string): Promise<TeamProfileDto | null> {
    return this.apiFootballProvider.getTeamInfo(teamExternalId);
  }

  async getCompetitionInfo(leagueExternalId: string): Promise<CompetitionSummaryDto | null> {
    return this.apiFootballProvider.getCompetitionInfo(leagueExternalId);
  }
}
