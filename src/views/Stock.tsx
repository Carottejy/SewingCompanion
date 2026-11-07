import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { Entete, Icone, Vide, useNav } from '../ui'
import { correspond0, fmtM, formatDate } from '../lib'
import { ouvrirLien } from '../native'
import { coutTissu, euro, FormArticle, LigneArticle } from './Tissus'
import type { Tissu } from '../types'

type Filtre = 'tous' | 'tissu' | 'doublure' | 'fourniture'
type Tri = 'recent' | 'nom' | 'quantite'

export default function Stock() {
  const { state, majStock, supprimerStock } = useStore()
  const nav = useNav()
  const [edition, setEdition] = useState<Tissu | 'nouveau' | null>(null)
  const [filtre, setFiltre] = useState<Filtre>('tous')
  const [q, setQ] = useState('')
  const [tri, setTri] = useState<Tri>('recent')
  const [epuises, setEpuises] = useState(false)

  // projets qui utilisent chaque article du stock
  const utilisations = useMemo(() => {
    const m = new Map<string, string[]>()
    for (const p of state.projets)
      for (const t of p.tissus ?? []) if (t.stockId) m.set(t.stockId, [...(m.get(t.stockId) ?? []), p.nom])
    return m
  }, [state.projets])

  const liste = useMemo(() => {
    const r = state.stock.filter(
      (t) =>
        (filtre === 'tous' || t.role === filtre) &&
        (epuises || t.quantite > 0) &&
        correspond0([t.nom, t.composition, t.boutique, t.origine, t.emplacement, t.notes], q),
    )
    if (tri === 'nom') r.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
    if (tri === 'quantite') r.sort((a, b) => b.quantite - a.quantite)
    return r
  }, [state.stock, filtre, q, tri, epuises])

  const dispo = state.stock.filter((t) => t.quantite > 0)
  const metres = dispo.filter((t) => t.unite === 'm' && t.role !== 'fourniture').reduce((s, t) => s + t.quantite, 0)
  const valeur = dispo.reduce((s, t) => s + coutTissu(t), 0)
  const nbEpuises = state.stock.length - dispo.length
  const compte = (f: Filtre) => dispo.filter((t) => f === 'tous' || t.role === f).length

  return (
    <div className="page">
      <Entete
        titre="Stock"
        sousTitre={state.stock.length ? `${dispo.length} article${dispo.length > 1 ? 's' : ''} disponible${dispo.length > 1 ? 's' : ''}` : 'Tissus et fournitures que tu as chez toi'}
      />

      {state.stock.length === 0 ? (
        <Vide
          titre="Ton stock est vide"
          texte="Ajoute tes tissus, doublures et fournitures avec leur quantité, leur origine et une photo. Tu pourras ensuite les prendre dans tes projets."
          action={
            <button className="btn primaire" onClick={() => setEdition('nouveau')}>
              <Icone n="plus" petite /> Ajouter au stock
            </button>
          }
        />
      ) : (
        <>
          <div className="resume-tissus">
            <div>
              <span className="etiquette">Tissus en stock</span>
              <b>{fmtM(metres)}</b>
            </div>
            <div>
              <span className="etiquette">Valeur estimée</span>
              <b>{euro(valeur)}</b>
            </div>
          </div>

          <div className="barre-recherche">
            <label className="champ-recherche">
              <Icone n="loupe" petite />
              <input type="search" placeholder="Lin, boutons, boîte 2…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher dans le stock" />
            </label>
            <select className="tri-compact" value={tri} onChange={(e) => setTri(e.target.value as Tri)} aria-label="Trier">
              <option value="recent">Récents</option>
              <option value="nom">Nom</option>
              <option value="quantite">Quantité</option>
            </select>
          </div>

          <div className="segments sources" role="tablist">
            {(
              [
                ['tous', 'Tous'],
                ['tissu', 'Tissus'],
                ['doublure', 'Doublures'],
                ['fourniture', 'Fournitures'],
              ] as [Filtre, string][]
            ).map(([f, l]) => (
              <button key={f} role="tab" aria-selected={filtre === f} className={filtre === f ? 'actif' : ''} onClick={() => setFiltre(f)}>
                {l} <small>{compte(f)}</small>
              </button>
            ))}
          </div>

          {nbEpuises > 0 && (
            <label className="bascule petite" style={{ marginBottom: 10 }}>
              <input type="checkbox" checked={epuises} onChange={(e) => setEpuises(e.target.checked)} /> Afficher les articles épuisés ({nbEpuises})
            </label>
          )}

          {liste.length === 0 ? (
            <Vide titre="Rien ici" texte="Aucun article ne correspond." />
          ) : (
            <ul className="liste-tissus">
              {liste.map((t) => {
                const projets = utilisations.get(t.id)
                const infos = [t.composition, t.laize && `laize ${t.laize} cm`, t.origine, t.emplacement && `rangé : ${t.emplacement}`]
                  .filter(Boolean)
                  .join(' · ')
                return (
                  <LigneArticle
                    key={t.id}
                    t={t}
                    onClick={() => setEdition(t)}
                    sousTitre={infos}
                    actions={
                      projets || t.lien || t.dateAchat ? (
                        <>
                          <small className="note-discrete">
                            {projets ? `Utilisé dans : ${[...new Set(projets)].join(', ')}` : t.dateAchat ? `Depuis le ${formatDate(t.dateAchat)}` : ''}
                          </small>
                          {t.lien && (
                            <button className="icone-btn petit" aria-label="Ouvrir le lien" onClick={() => ouvrirLien(t.lien!)}>
                              <Icone n="lien" petite />
                            </button>
                          )}
                        </>
                      ) : undefined
                    }
                  />
                )
              })}
            </ul>
          )}
        </>
      )}

      <button className="fab" onClick={() => setEdition('nouveau')} aria-label="Ajouter au stock">
        <Icone n="plus" />
      </button>

      {edition && (
        <FormArticle
          mode="stock"
          initial={edition === 'nouveau' ? undefined : edition}
          onFermer={() => setEdition(null)}
          onEnregistrer={(t) => {
            majStock(t)
            setEdition(null)
            if (edition === 'nouveau') nav.toast('Ajouté au stock')
          }}
          onSupprimer={(t) => {
            supprimerStock(t.id)
            setEdition(null)
          }}
        />
      )}
    </div>
  )
}
