import { Injectable } from '@nestjs/common';
import { NewsService } from '../news/news.service';
import { ProductsService } from '../products/products.service';
import { PlayersService } from '../players/players.service';
import { StaffService } from '../staff/staff.service';
import { SponsorsService } from '../sponsors/sponsors.service';
import { LegendsService } from '../legends/legends.service';
import { VenuesService } from '../stadium/venues.service';

export interface SearchResult {
  type: 'news' | 'product' | 'player' | 'staff' | 'sponsor' | 'legend' | 'venue';
  id: string;
  label: string;
  labelAr: string;
  image?: string;
  href: string;
}

@Injectable()
export class SearchService {
  constructor(
    private readonly newsService: NewsService,
    private readonly productsService: ProductsService,
    private readonly playersService: PlayersService,
    private readonly staffService: StaffService,
    private readonly sponsorsService: SponsorsService,
    private readonly legendsService: LegendsService,
    private readonly venuesService: VenuesService,
  ) {}

  async search(q: string): Promise<SearchResult[]> {
    const query = q.trim().toLowerCase();
    if (!query) return [];

    const [newsRes, productsRes, players, staff, sponsors, legends, venues] = await Promise.all([
      this.newsService.findAll({ search: q, published: true, limit: 5 }).catch(() => ({ news: [] })),
      this.productsService.findAll({ search: q, status: 'published', limit: 5 }).catch(() => ({ products: [] })),
      this.playersService.findPublic().catch(() => []),
      this.staffService.findPublic().catch(() => []),
      this.sponsorsService.findAll({ activeOnly: true }).catch(() => []),
      this.legendsService.findPublic().catch(() => []),
      this.venuesService.findPublic().catch(() => []),
    ]);

    const results: SearchResult[] = [];

    for (const n of newsRes.news || []) {
      results.push({
        type: 'news', id: String(n._id), label: n.title, labelAr: n.titleAr,
        image: (n as any).image, href: n.slug ? `/actualites/${n.slug}` : '/actualites',
      });
    }

    for (const p of productsRes.products || []) {
      results.push({
        type: 'product', id: String(p._id), label: p.name, labelAr: p.nameAr || p.name,
        image: (p as any).images?.[0], href: `/product/${p.slug}`,
      });
    }

    for (const p of players as any[]) {
      if (p.name?.toLowerCase().includes(query) || p.nameAr?.includes(q)) {
        results.push({
          type: 'player', id: String(p._id), label: p.name, labelAr: p.nameAr, image: p.image,
          href: `/${p.sport}/joueurs/${p.slug}`,
        });
      }
    }

    for (const s of staff as any[]) {
      if (s.name?.toLowerCase().includes(query) || s.nameAr?.includes(q)) {
        results.push({
          type: 'staff', id: String(s._id), label: s.name, labelAr: s.nameAr, image: s.image,
          href: s.sport ? `/${s.sport}/staff` : '/equipe',
        });
      }
    }

    for (const s of sponsors as any[]) {
      if (s.name?.toLowerCase().includes(query)) {
        results.push({
          type: 'sponsor', id: String(s._id), label: s.name, labelAr: s.name, image: s.logo,
          href: '/sponsors',
        });
      }
    }

    for (const l of legends as any[]) {
      if (l.name?.toLowerCase().includes(query) || l.nameAr?.includes(q)) {
        results.push({
          type: 'legend', id: String(l._id), label: l.name, labelAr: l.nameAr, image: l.image,
          href: '/legendes',
        });
      }
    }

    for (const v of venues as any[]) {
      if (v.name?.toLowerCase().includes(query) || v.nameAr?.includes(q)) {
        results.push({
          type: 'venue', id: String(v._id), label: v.name, labelAr: v.nameAr, image: v.image,
          href: '/stadium',
        });
      }
    }

    return results.slice(0, 20);
  }
}
