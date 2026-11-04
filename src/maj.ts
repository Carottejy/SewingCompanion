import { registerPlugin, type PluginListenerHandle } from '@capacitor/core'
import { App } from '@capacitor/app'
import { estNatif, ouvrirLien } from './native'

interface ApkUpdaterPlugin {
  canInstall(): Promise<{ value: boolean }>
  openInstallSettings(): Promise<void>
  downloadAndInstall(o: { url: string }): Promise<void>
  addListener(e: 'progress', f: (d: { percent: number }) => void): Promise<PluginListenerHandle>
}
const ApkUpdater = registerPlugin<ApkUpdaterPlugin>('ApkUpdater')

const API = 'https://api.github.com/repos/Carottejy/SewingCompanion/releases/latest'
export const PAGE_RELEASES = 'https://github.com/Carottejy/SewingCompanion/releases/latest'
const CLE_VERIF = 'sc-maj-derniere-verif'
const CLE_IGNOREE = 'sc-maj-ignoree'

export interface MiseAJour {
  version: string
  build: number
  url: string
  taille: number
  notes: string
}

/** numéro de build installé (versionCode) ; 0 en mode web */
export async function buildInstalle(): Promise<{ version: string; build: number }> {
  if (!estNatif()) return { version: __APP_VERSION__ + ' (web)', build: 0 }
  const i = await App.getInfo()
  return { version: i.version, build: parseInt(i.build, 10) || 0 }
}

const stockage = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v)
    } catch {
      /* rien */
    }
  },
}

/**
 * Interroge GitHub. Renvoie la mise à jour si une version plus récente existe.
 * `auto` : vérification silencieuse au lancement (au plus toutes les 6 h, versions ignorées exclues).
 */
export async function chercherMiseAJour(auto = false): Promise<MiseAJour | null> {
  if (!estNatif()) return null
  if (auto) {
    const derniere = Number(stockage.get(CLE_VERIF) || 0)
    if (Date.now() - derniere < 6 * 3600 * 1000) return null
  }
  const r = await fetch(API, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' })
  if (!r.ok) throw new Error('GitHub a répondu ' + r.status)
  const d = await r.json()
  stockage.set(CLE_VERIF, String(Date.now()))
  const version = String(d.tag_name || '').replace(/^v/, '')
  const build = parseInt(version.split('.').pop() || '0', 10)
  const asset = (d.assets || []).find((a: { name: string }) => a.name.endsWith('.apk'))
  const { build: actuel } = await buildInstalle()
  if (!asset || !build || build <= actuel) return null
  if (auto && stockage.get(CLE_IGNOREE) === version) return null
  return { version, build, url: asset.browser_download_url, taille: asset.size, notes: d.body || '' }
}

export const ignorerVersion = (v: string) => stockage.set(CLE_IGNOREE, v)

export async function installer(m: MiseAJour, progression: (pct: number) => void) {
  if (!estNatif()) return ouvrirLien(m.url)
  const h = await ApkUpdater.addListener('progress', (e) => progression(e.percent))
  try {
    await ApkUpdater.downloadAndInstall({ url: m.url })
  } catch (e) {
    // plan B : téléchargement via le navigateur
    await ouvrirLien(m.url)
    throw e
  } finally {
    h.remove()
  }
}

export const peutInstaller = async () => (estNatif() ? (await ApkUpdater.canInstall()).value : true)
export const ouvrirReglagesInstallation = () => ApkUpdater.openInstallSettings()
