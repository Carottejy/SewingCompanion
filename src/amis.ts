import { useSyncExternalStore } from 'react'
import type { Compte, Tissu } from './types'

/**
 * Amies et partage de stock — serveur Supabase (tables sc_*).
 * Pas d'email ni de mot de passe : le téléphone garde un secret aléatoire,
 * le serveur n'en stocke que l'empreinte. On se retrouve entre amies grâce à un code à 6 caractères.
 */
const API = 'https://qqrmozqxzeicbxwauiqt.supabase.co/rest/v1/rpc/'
const CLE_PUBLIQUE = 'sb_publishable_doGPithS7QQzmp0up3bRLw_zeg2jnDw'

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  let r: Response
  try {
    r = await fetch(API + fn, {
      method: 'POST',
      headers: { apikey: CLE_PUBLIQUE, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    })
  } catch {
    throw new Error('Pas de connexion internet')
  }
  const texte = await r.text()
  if (!r.ok) {
    let msg = texte
    try {
      msg = JSON.parse(texte).message ?? texte
    } catch {
      /* texte brut */
    }
    throw new Error(msg || 'Erreur du serveur (' + r.status + ')')
  }
  return (texte ? JSON.parse(texte) : null) as T
}

export interface Profil {
  id: string
  code: string
  pseudo: string
  partage: boolean
  stock_maj: string | null
}
export interface Amie {
  id: string
  pseudo: string
  code: string
  etat: 'amie' | 'envoyee' | 'recue'
  partage: boolean
  stock_maj: string | null
  articles: number | null
}
export interface StockAmie {
  pseudo: string
  stock_maj: string | null
  partage: boolean
  stock: Tissu[]
}

export function nouveauSecret() {
  const b = new Uint8Array(32)
  crypto.getRandomValues(b)
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
}

export const api = {
  inscrire: (secret: string, pseudo: string) => rpc<Profil>('sc_inscrire', { p_secret: secret, p_pseudo: pseudo }),
  moi: (secret: string) => rpc<Profil | null>('sc_moi', { p_secret: secret }),
  regler: (secret: string, pseudo: string | null, partage: boolean | null) =>
    rpc<Profil>('sc_regler', { p_secret: secret, p_pseudo: pseudo, p_partage: partage }),
  publier: (secret: string, stock: unknown[]) => rpc<string>('sc_publier_stock', { p_secret: secret, p_stock: stock }),
  demander: (secret: string, code: string) =>
    rpc<'code_inconnu' | 'soi_meme' | 'acceptee' | 'deja_demande' | 'demandee'>('sc_demander_ami', { p_secret: secret, p_code: code }),
  repondre: (secret: string, ami: string, accepter: boolean) => rpc<void>('sc_repondre', { p_secret: secret, p_ami: ami, p_accepter: accepter }),
  retirer: (secret: string, ami: string) => rpc<void>('sc_retirer_ami', { p_secret: secret, p_ami: ami }),
  amis: (secret: string) => rpc<Amie[]>('sc_amis', { p_secret: secret }),
  stockAmie: (secret: string, ami: string) => rpc<StockAmie>('sc_stock_ami', { p_secret: secret, p_ami: ami }),
  supprimer: (secret: string) => rpc<void>('sc_supprimer_profil', { p_secret: secret }),
}

/* ---------- état de synchronisation (non persistant) ---------- */
interface EtatSync {
  enCours: boolean
  derniere?: string
  erreur?: string
  demandesRecues: number
}
let etat: EtatSync = { enCours: false, demandesRecues: 0 }
const abonnes = new Set<() => void>()
const changer = (p: Partial<EtatSync>) => {
  etat = { ...etat, ...p }
  abonnes.forEach((f) => f())
}
export const useEtatSync = () =>
  useSyncExternalStore(
    (f) => {
      abonnes.add(f)
      return () => abonnes.delete(f)
    },
    () => etat,
  )
export const signalerDemandes = (n: number) => changer({ demandesRecues: n })

/* ---------- préparation du stock à publier : photos réduites ---------- */
const vignettes = new Map<string, string>()
function reduire(dataUrl: string, max = 260): Promise<string> {
  const deja = vignettes.get(dataUrl)
  if (deja) return Promise.resolve(deja)
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const r = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * r)
      c.height = Math.round(img.height * r)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      const v = c.toDataURL('image/jpeg', 0.7)
      vignettes.set(dataUrl, v)
      resolve(v)
    }
    img.onerror = () => resolve('')
    img.src = dataUrl
  })
}

export async function publierStock(compte: Compte, stock: Tissu[]) {
  changer({ enCours: true, erreur: undefined })
  try {
    const donnees = compte.partage
      ? await Promise.all(
          stock
            .filter((t) => t.quantite > 0)
            .map(async (t) => {
              // on ne partage pas le lien vers le projet d'origine
              const { stockId: _s, achete: _a, ...reste } = t
              void _s
              void _a
              return { ...reste, photo: t.photo ? (await reduire(t.photo)) || undefined : undefined }
            }),
        )
      : []
    const quand = await api.publier(compte.secret, donnees)
    changer({ enCours: false, derniere: quand })
  } catch (e) {
    changer({ enCours: false, erreur: (e as Error).message })
  }
}

export async function rafraichirDemandes(compte: Compte) {
  try {
    const a = await api.amis(compte.secret)
    signalerDemandes(a.filter((x) => x.etat === 'recue').length)
    return a
  } catch {
    return null
  }
}
