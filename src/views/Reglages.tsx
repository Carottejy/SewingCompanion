import { useEffect, useRef, useState } from 'react'
import { URL_CATALOGUE, useStore } from '../store'
import { Entete, Icone, useNav } from '../ui'
import { buildInstalle } from '../maj'
import { aujourdhui, formatDate } from '../lib'
import { exporterJSON } from '../native'
import type { AppState, CatalogueFichier } from '../types'

export default function Reglages() {
  const { state, catalogueInfo, remplacerTout, definirCatalogueDistant } = useStore()
  const [msg, setMsg] = useState<string>()
  const [maj, setMaj] = useState(false)
  const fichier = useRef<HTMLInputElement>(null)
  const nav = useNav()
  const [version, setVersion] = useState(__APP_VERSION__)
  const [verifApp, setVerifApp] = useState(false)
  useEffect(() => {
    buildInstalle().then((v) => setVersion(v.version)).catch(() => {})
  }, [])

  const exporter = async () => {
    const { catalogueDistant: _ignore, ...donnees } = state
    void _ignore
    try {
      await exporterJSON(
        `sewing-companion-${aujourdhui()}.json`,
        JSON.stringify({ app: 'sewing-companion', version: 1, ...donnees }, null, 1),
      )
      setMsg('Sauvegarde exportée.')
    } catch (e) {
      setMsg('Export annulé ou impossible : ' + (e as Error).message)
    }
  }

  const importer = async (f: File) => {
    try {
      const d = JSON.parse(await f.text()) as Partial<AppState> & { app?: string }
      if (d.app !== 'sewing-companion' || !Array.isArray(d.projets)) throw new Error('Ce fichier n’est pas une sauvegarde Sewing Companion.')
      if (!confirm(`Remplacer tes données actuelles par cette sauvegarde (${d.projets.length} projets) ?`)) return
      remplacerTout({
        projets: d.projets,
        patronsPerso: d.patronsPerso ?? [],
        favoris: d.favoris ?? [],
        possedes: d.possedes ?? [],
        stock: d.stock ?? [],
        avis: d.avis ?? {},
        catalogueDistant: state.catalogueDistant,
      })
      setMsg('Sauvegarde restaurée.')
    } catch (e) {
      setMsg((e as Error).message)
    }
  }

  const mettreAJour = async () => {
    setMaj(true)
    setMsg(undefined)
    try {
      const r = await fetch(URL_CATALOGUE + '?t=' + Date.now(), { cache: 'no-store' })
      if (!r.ok) throw new Error('HTTP ' + r.status)
      const c = (await r.json()) as CatalogueFichier
      if (!Array.isArray(c.patrons)) throw new Error('format inattendu')
      if (c.misAJour <= catalogueInfo.misAJour) {
        setMsg('Le catalogue est déjà à jour.')
      } else {
        definirCatalogueDistant(c)
        setMsg(`Catalogue mis à jour : ${c.patrons.length} patrons (${formatDate(c.misAJour)}).`)
      }
    } catch (e) {
      setMsg('Mise à jour impossible (connexion ?) : ' + (e as Error).message)
    } finally {
      setMaj(false)
    }
  }

  return (
    <div className="page">
      <Entete titre="Réglages" sousTitre="Sauvegarde et catalogue" />

      <section className="bloc">
        <h2>Application</h2>
        <p>
          Version installée : <b>{version}</b>
        </p>
        <p className="note-discrete">
          L’application vérifie toute seule les nouvelles versions à l’ouverture (au plus toutes les 6 h) et te propose de les installer.
        </p>
        <button
          className="btn large"
          disabled={verifApp}
          onClick={async () => {
            setVerifApp(true)
            setMsg(await nav.verifierMaj())
            setVerifApp(false)
          }}
        >
          {verifApp ? 'Vérification…' : 'Vérifier les mises à jour'}
        </button>
      </section>

      <section className="bloc">
        <h2>Catalogue de patrons</h2>
        <p>
          <b>{catalogueInfo.patrons}</b> patrons · mis à jour le {formatDate(catalogueInfo.misAJour)}
        </p>
        <p className="note-discrete">
          Le catalogue est intégré à l’application et fonctionne hors ligne. Il peut être enrichi sans réinstaller l’APK.
        </p>
        <button className="btn large" onClick={mettreAJour} disabled={maj}>
          {maj ? 'Recherche…' : 'Chercher une mise à jour du catalogue'}
        </button>
      </section>

      <section className="bloc">
        <h2>Mes données</h2>
        <p>
          {state.projets.length} projet{state.projets.length > 1 ? 's' : ''} · {state.patronsPerso.length} patron
          {state.patronsPerso.length > 1 ? 's' : ''} perso · {state.favoris.length} favori{state.favoris.length > 1 ? 's' : ''} ·{' '}
          {state.possedes.length} possédé{state.possedes.length > 1 ? 's' : ''} ·{' '}
          {state.stock.length} article{state.stock.length > 1 ? 's' : ''} en stock
        </p>
        <p className="note-discrete">
          Tout est enregistré sur ton téléphone uniquement. Exporte une sauvegarde de temps en temps (avant de changer de téléphone, par exemple).
        </p>
        <div className="actions-colonne">
          <button className="btn primaire large" onClick={exporter}>
            Exporter une sauvegarde
          </button>
          <button className="btn large" onClick={() => fichier.current?.click()}>
            Restaurer une sauvegarde
          </button>
          <input
            ref={fichier}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importer(f)
              e.target.value = ''
            }}
          />
        </div>
      </section>

      {msg && (
        <p className="message" role="status">
          <Icone n="check" petite /> {msg}
        </p>
      )}

      <section className="bloc">
        <h2>À propos</h2>
        <p className="note-discrete">
          Sewing Companion. Les temps de travail et métrages du catalogue sont des estimations pour
          une taille moyenne (sauf mention « d’après l’éditeur ») : réfère-toi toujours aux indications du patron pour ta taille.
          Les patrons appartiennent à leurs éditeurs ; l’application renvoie vers leurs pages.
        </p>
      </section>
    </div>
  )
}
