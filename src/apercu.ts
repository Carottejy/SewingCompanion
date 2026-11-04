import { CapacitorHttp } from '@capacitor/core'
import { get, set } from 'idb-keyval'
import { estNatif } from './native'
import type { Patron } from './types'

/**
 * Photo du modèle : on lit l'image d'aperçu (og:image) que l'éditeur publie lui-même
 * sur la page du patron, comme le fait un aperçu de lien. Rien n'est copié dans l'app :
 * l'image reste hébergée chez l'éditeur et l'adresse est mise en cache.
 */

const PAS_UNE_FICHE = /(collections?\/(all|[^/]*(patterns?|patrons)[^/]*)\/?$|\/category\/|\/brand\/|sewing-school\/?$|google\.)/i

/** vrai si l'URL pointe vers la fiche d'un patron précis (et pas une boutique entière) */
export function estFicheProduit(url: string): boolean {
  try {
    const u = new URL(url)
    if (u.pathname === '/' || u.pathname === '') return false
    return !PAS_UNE_FICHE.test(u.hostname + u.pathname)
  } catch {
    return false
  }
}

const peutAvoirPhoto = (p: Patron) => !!p.photo || (!p.perso && estFicheProduit(p.url))

interface Cache {
  image: string | null
  t: number
}
const cle = (url: string) => 'apercu:' + url
const memoire = new Map<string, string | null>()

function extraireImage(html: string, base: string): string | null {
  const metas = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
  ]
  for (const re of metas) {
    const m = html.match(re)
    if (m?.[1]) {
      try {
        return new URL(m[1].replace(/&amp;/g, '&'), base).toString()
      } catch {
        /* suivant */
      }
    }
  }
  return null
}

/** image connue sans réseau (cache mémoire) — pour les vignettes */
export const photoEnCache = (p: Patron) => p.photo ?? memoire.get(p.url) ?? null

export async function chargerPhoto(p: Patron): Promise<string | null> {
  if (p.photo) return p.photo
  if (!peutAvoirPhoto(p)) return null
  if (memoire.has(p.url)) return memoire.get(p.url)!
  const c = await get<Cache>(cle(p.url)).catch(() => undefined)
  // échec mis en cache 3 jours, succès 30 jours
  if (c && Date.now() - c.t < (c.image ? 30 : 3) * 86400000) {
    memoire.set(p.url, c.image)
    return c.image
  }
  let image: string | null = null
  try {
    let html: string
    if (estNatif()) {
      const r = await CapacitorHttp.get({
        url: p.url,
        responseType: 'text',
        headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 14) SewingCompanion', Accept: 'text/html' },
        connectTimeout: 10000,
        readTimeout: 15000,
      })
      html = typeof r.data === 'string' ? r.data : ''
    } else {
      html = await (await fetch(p.url)).text() // souvent bloqué par CORS en version web
    }
    image = extraireImage(html, p.url)
  } catch {
    image = null
  }
  memoire.set(p.url, image)
  set(cle(p.url), { image, t: Date.now() } satisfies Cache).catch(() => {})
  return image
}

/** précharge en tâche de fond les images déjà en cache disque (vignettes du catalogue) */
export async function prechargerCache(patrons: Patron[]) {
  for (const p of patrons) {
    if (!peutAvoirPhoto(p) || memoire.has(p.url)) continue
    const c = await get<Cache>(cle(p.url)).catch(() => undefined)
    if (c) memoire.set(p.url, c.image)
  }
}
