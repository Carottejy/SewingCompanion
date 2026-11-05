import { useEffect, useMemo, useState } from 'react'
import { prechargerCache } from '../apercu'
import { useStore } from '../store'
import { CartePatron, Entete, Icone, Vide, useNav } from '../ui'
import { correspond, DIFFICULTES, EPOQUES, moyenneHeures, TYPES } from '../lib'
import type { Epoque, TypeVetement } from '../types'

type Tri = 'pertinence' | 'nom' | 'facile' | 'rapide' | 'note'

export default function Catalogue({ seulementPerso = false }: { seulementPerso?: boolean }) {
  const { catalogue, state } = useStore()
  const nav = useNav()
  const [q, setQ] = useState('')
  const [ep, setEp] = useState<Epoque | 'toutes'>('toutes')
  const [type, setType] = useState<TypeVetement | ''>('')
  const [diffMax, setDiffMax] = useState(5)
  const [gratuit, setGratuit] = useState(false)
  const [favoris, setFavoris] = useState(false)
  const [cousus, setCousus] = useState(false)
  const [possedes, setPossedes] = useState(false)
  const [, forcer] = useState(0)
  const [tri, setTri] = useState<Tri>('pertinence')
  const [filtresOuverts, setFiltresOuverts] = useState(false)

  const base = seulementPerso ? state.patronsPerso : catalogue
  useEffect(() => {
    prechargerCache(base).then(() => forcer((n) => n + 1))
  }, [base])
  const liste = useMemo(() => {
    const r = base.filter(
      (p) =>
        (ep === 'toutes' || p.epoque === ep) &&
        (!type || p.type === type) &&
        p.difficulte <= diffMax &&
        (!gratuit || p.gratuit) &&
        (!favoris || state.favoris.includes(p.id)) &&
        (!cousus || !!state.avis[p.id]?.cousu) &&
        (!possedes || state.possedes.includes(p.id)) &&
        correspond(p, q),
    )
    if (tri === 'nom') r.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
    if (tri === 'facile') r.sort((a, b) => a.difficulte - b.difficulte || moyenneHeures(a) - moyenneHeures(b))
    if (tri === 'rapide') r.sort((a, b) => moyenneHeures(a) - moyenneHeures(b))
    if (tri === 'note') r.sort((a, b) => (state.avis[b.id]?.note ?? 0) - (state.avis[a.id]?.note ?? 0))
    return r
  }, [base, ep, type, diffMax, gratuit, favoris, cousus, q, tri, state.favoris, state.avis, possedes, state.possedes])

  const compte = (e: Epoque) => base.filter((p) => p.epoque === e).length
  const nbFiltres = (type ? 1 : 0) + (diffMax < 5 ? 1 : 0) + (gratuit ? 1 : 0) + (favoris ? 1 : 0) + (cousus ? 1 : 0) + (possedes ? 1 : 0)

  return (
    <div className="page">
      <Entete
        titre={seulementPerso ? 'Mes patrons' : 'Catalogue'}
        sousTitre={seulementPerso ? `${base.length} patron${base.length > 1 ? 's' : ''} ajouté${base.length > 1 ? 's' : ''}` : `${base.length} patrons, du Moyen Âge à aujourd’hui`}
        actions={
          seulementPerso && (
            <button className="btn primaire petit" onClick={() => nav.ouvrir({ nom: 'patronForm' })}>
              <Icone n="plus" petite /> Ajouter
            </button>
          )
        }
      />

      {(!seulementPerso || base.length > 0) && (
        <div className="barre-recherche">
          <label className="champ-recherche">
            <Icone n="loupe" petite />
            <input
              type="search"
              placeholder="Robe, corset, Tudor, lin…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Rechercher un patron"
            />
          </label>
          <button
            className={'icone-btn bord' + (nbFiltres ? ' actif' : '')}
            onClick={() => setFiltresOuverts((o) => !o)}
            aria-label="Filtres"
            aria-expanded={filtresOuverts}
          >
            <Icone n="filtre" />
            {nbFiltres > 0 && <span className="compteur">{nbFiltres}</span>}
          </button>
        </div>
      )}

      {!seulementPerso && (
        <div className="puces-defilantes" role="tablist" aria-label="Époques">
          <button className={'puce' + (ep === 'toutes' ? ' active' : '')} onClick={() => setEp('toutes')}>
            Toutes
          </button>
          {EPOQUES.map((e) =>
            compte(e.id) ? (
              <button
                key={e.id}
                className={'puce' + (ep === e.id ? ' active' : '')}
                style={{ ['--c' as string]: e.couleur }}
                onClick={() => setEp(e.id)}
              >
                {e.label} <small>{compte(e.id)}</small>
              </button>
            ) : null,
          )}
        </div>
      )}

      {filtresOuverts && (
        <div className="panneau-filtres">
          <label>
            Type
            <select value={type} onChange={(e) => setType(e.target.value as TypeVetement | '')}>
              <option value="">Tous les types</option>
              {TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Difficulté max : <b>{DIFFICULTES[diffMax]}</b>
            <input type="range" min={1} max={5} value={diffMax} onChange={(e) => setDiffMax(+e.target.value)} />
          </label>
          <label>
            Trier par
            <select value={tri} onChange={(e) => setTri(e.target.value as Tri)}>
              <option value="pertinence">Époque</option>
              <option value="nom">Nom</option>
              <option value="facile">Le plus facile</option>
              <option value="rapide">Le plus rapide</option>
              <option value="note">Mes mieux notés</option>
            </select>
          </label>
          <div className="ligne-bascules">
            <label className="bascule">
              <input type="checkbox" checked={gratuit} onChange={(e) => setGratuit(e.target.checked)} /> Gratuits
            </label>
            <label className="bascule">
              <input type="checkbox" checked={favoris} onChange={(e) => setFavoris(e.target.checked)} /> Favoris
            </label>
            <label className="bascule">
              <input type="checkbox" checked={possedes} onChange={(e) => setPossedes(e.target.checked)} /> Possédés
            </label>
            <label className="bascule">
              <input type="checkbox" checked={cousus} onChange={(e) => setCousus(e.target.checked)} /> Déjà cousus
            </label>
          </div>
          {nbFiltres > 0 && (
            <button
              className="btn lien"
              onClick={() => {
                setType('')
                setDiffMax(5)
                setGratuit(false)
                setFavoris(false)
                setCousus(false)
                setPossedes(false)
              }}
            >
              Effacer les filtres
            </button>
          )}
        </div>
      )}

      {seulementPerso && base.length === 0 ? (
        <Vide
          titre="Aucun patron perso"
          texte="Ajoute tes propres patrons (papier, PDF, magazine…) avec une photo, le métrage et le temps estimé."
          action={
            <button className="btn primaire" onClick={() => nav.ouvrir({ nom: 'patronForm' })}>
              <Icone n="plus" petite /> Ajouter un patron
            </button>
          }
        />
      ) : liste.length === 0 ? (
        <Vide titre="Aucun résultat" texte="Essaie un autre mot ou élargis les filtres." />
      ) : (
        <div className="liste-cartes">
          {liste.map((p) => (
            <CartePatron
              key={p.id}
              p={p}
              favori={state.favoris.includes(p.id)}
              avis={state.avis[p.id]}
              possede={state.possedes.includes(p.id)}
              onClick={() => nav.ouvrir({ nom: 'patron', id: p.id })}
            />
          ))}
        </div>
      )}
    </div>
  )
}
