import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'

export const estNatif = () => Capacitor.isNativePlatform()

export async function ouvrirLien(url: string) {
  if (estNatif()) await Browser.open({ url })
  else window.open(url, '_blank', 'noopener')
}

export const lienRecherche = (q: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(q + ' sewing pattern')}`

/** Exporte un fichier JSON : partage Android natif, téléchargement sur le web */
export async function exporterJSON(nom: string, contenu: string) {
  if (estNatif()) {
    const res = await Filesystem.writeFile({
      path: nom,
      data: contenu,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    })
    await Share.share({ title: 'Sauvegarde Sewing Companion', url: res.uri, dialogTitle: 'Enregistrer la sauvegarde' })
    return
  }
  const blob = new Blob([contenu], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = nom
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}
