import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { Feuille, Icone, useNav } from '../ui'
import { compresserImage, correspond0, fmtM, plage, uid } from '../lib'
import { ouvrirLien } from '../native'
import type { Projet, Tissu } from '../types'

export const euro = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
export const qte = (t: Pick<Tissu, 'unite' | 'quantite'>, q = t.quantite) =>
  t.unite === 'm' ? fmtM(q) : `${String(Math.round(q * 100) / 100).replace('.', ',')} ${t.unite}${q > 1 ? 's' : ''}`
export const coutTissu = (t: Tissu) => (t.prix ?? 0) * t.quantite
const num = (v: string) => {
  const n = parseFloat(v.replace(',', '.'))
  return isNaN(n) ? undefined : n
}

export const ORIGINES = ['Achat en boutique', 'Achat en ligne', 'Marché / salon', 'Don', 'Récupération', 'Coupon / chute', 'Héritage']

/* ---------- ligne d'article (projet et stock) ---------- */
export function LigneArticle({
  t,
  onClick,
  actions,
  sousTitre,
}: {
  t: Tissu
  onClick: () => void
  actions?: React.ReactNode
  sousTitre?: string
}) {
  return (
    <li className={'tissu' + (t.achete ? ' achete' : '') + (t.quantite <= 0 ? ' epuise' : '')}>
      <button className="tissu-corps" onClick={onClick}>
        {t.photo ? (
          <img src={t.photo} alt="" />
        ) : (
          <span className="tissu-pastille" style={{ background: t.couleur || 'var(--papier-2)' }}>
            {!t.couleur && <Icone n={t.role === 'fourniture' ? 'ciseaux' : 'tissu'} />}
          </span>
        )}
        <span className="tissu-texte">
          <strong>{t.nom}</strong>
          <small>
            {t.quantite <= 0 ? 'Épuisé' : qte(t)}
            {t.prix !== undefined && t.quantite > 0 && ` × ${euro(t.prix)}${t.unite === 'm' ? '/m' : ''} = ${euro(coutTissu(t))}`}
          </small>
          {sousTitre !== undefined ? (
            sousTitre && <small>{sousTitre}</small>
          ) : (
            (t.boutique || t.laize || t.composition) && (
              <small>{[t.composition, t.boutique, t.laize && `laize ${t.laize} cm`].filter(Boolean).join(' · ')}</small>
            )
          )}
          {t.notes && <em className="tissu-notes">{t.notes}</em>}
        </span>
      </button>
      {actions && <div className="tissu-actions">{actions}</div>}
    </li>
  )
}

/* ---------- section du projet ---------- */
export function SectionTissus({
  projet,
  maj,
  besoin,
}: {
  projet: Projet
  maj: (patch: Partial<Projet>) => void
  besoin: { min: number; max: number }
}) {
  const { state, majStock } = useStore()
  const nav = useNav()
  const [edition, setEdition] = useState<Tissu | 'nouveau' | null>(null)
  const tissus = projet.tissus ?? []
  const total = tissus.reduce((s, t) => s + coutTissu(t), 0)
  const resteAAcheter = tissus.filter((t) => !t.achete).reduce((s, t) => s + coutTissu(t), 0)
  const metres = tissus.filter((t) => t.unite === 'm' && t.role !== 'fourniture').reduce((s, t) => s + t.quantite, 0)

  const enregistrer = (t: Tissu, prisDuStock?: number) => {
    const existe = tissus.some((x) => x.id === t.id)
    maj({ tissus: existe ? tissus.map((x) => (x.id === t.id ? t : x)) : [...tissus, t] })
    if (prisDuStock && t.stockId) {
      const s = state.stock.find((x) => x.id === t.stockId)
      if (s) {
        majStock({ ...s, quantite: Math.max(0, Math.round((s.quantite - prisDuStock) * 100) / 100) })
        nav.toast(`${qte(s, prisDuStock)} retiré${prisDuStock > 1 ? 's' : ''} du stock`)
      }
    }
    setEdition(null)
  }

  const supprimer = (t: Tissu) => {
    const s = t.stockId ? state.stock.find((x) => x.id === t.stockId) : undefined
    if (!s && !confirm(`Retirer « ${t.nom} » du projet ?`)) return
    if (s && confirm(`Remettre ${qte(t)} de « ${s.nom} » dans le stock ?`)) {
      majStock({ ...s, quantite: Math.round((s.quantite + t.quantite) * 100) / 100 })
    }
    maj({ tissus: tissus.filter((x) => x.id !== t.id) })
    setEdition(null)
  }

  return (
    <section className="bloc">
      <div className="bloc-titre">
        <h2>Tissus & fournitures</h2>
        <button className="btn petit" onClick={() => setEdition('nouveau')}>
          <Icone n="plus" petite /> Ajouter
        </button>
      </div>

      {tissus.length === 0 ? (
        <p className="note-discrete">
          Ajoute les tissus et fournitures un par un, ou prends-les dans ton stock.
          {besoin.max > 0 && ` Les patrons du projet demandent environ ${plage(besoin.min, besoin.max, fmtM)} de tissu.`}
        </p>
      ) : (
        <>
          <div className="resume-tissus">
            <div>
              <span className="etiquette">Budget</span>
              <b>{euro(total)}</b>
              {resteAAcheter > 0 && resteAAcheter < total && <small>reste {euro(resteAAcheter)} à acheter</small>}
              {resteAAcheter === 0 && total > 0 && <small>tout est acheté</small>}
            </div>
            <div>
              <span className="etiquette">Tissu prévu</span>
              <b>{fmtM(metres)}</b>
              {besoin.max > 0 && (
                <small className={metres > 0 && metres < besoin.min ? 'alerte-texte' : ''}>
                  conseillé : {plage(besoin.min, besoin.max, fmtM)}
                </small>
              )}
            </div>
          </div>
          <ul className="liste-tissus">
            {tissus.map((t) => (
              <LigneArticle
                key={t.id}
                t={t}
                onClick={() => setEdition(t)}
                sousTitre={
                  t.stockId
                    ? ['Pris dans le stock', t.composition, t.laize && `laize ${t.laize} cm`].filter(Boolean).join(' · ')
                    : undefined
                }
                actions={
                  <>
                    <label className="bascule petite">
                      <input type="checkbox" checked={!!t.achete} onChange={(e) => enregistrer({ ...t, achete: e.target.checked })} /> Acheté
                    </label>
                    {t.lien && (
                      <button className="icone-btn petit" aria-label="Ouvrir le lien" onClick={() => ouvrirLien(t.lien!)}>
                        <Icone n="lien" petite />
                      </button>
                    )}
                  </>
                }
              />
            ))}
          </ul>
        </>
      )}

      {edition && (
        <FormArticle
          mode="projet"
          initial={edition === 'nouveau' ? undefined : edition}
          onFermer={() => setEdition(null)}
          onEnregistrer={enregistrer}
          onSupprimer={supprimer}
        />
      )}
    </section>
  )
}

/* ---------- choix d'un article du stock ---------- */
function ChoixStock({ onChoix, onAnnuler }: { onChoix: (t: Tissu) => void; onAnnuler: () => void }) {
  const { state } = useStore()
  const [q, setQ] = useState('')
  const dispo = useMemo(
    () => state.stock.filter((t) => t.quantite > 0 && correspond0([t.nom, t.composition, t.boutique, t.notes], q)),
    [state.stock, q],
  )
  return (
    <div className="choix-stock">
      <div className="bloc-titre">
        <span className="etiquette">Mon stock</span>
        <button type="button" className="btn lien petit" onClick={onAnnuler}>
          Saisir à la main
        </button>
      </div>
      <label className="champ-recherche" style={{ marginBottom: 10 }}>
        <Icone n="loupe" petite />
        <input type="search" placeholder="Chercher dans le stock…" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <ul className="liste-tissus">
        {dispo.map((t) => (
          <LigneArticle key={t.id} t={t} onClick={() => onChoix(t)} />
        ))}
      </ul>
      {dispo.length === 0 && <p className="note-discrete">Rien de disponible dans le stock.</p>}
    </div>
  )
}

/* ---------- formulaire partagé ---------- */
export function FormArticle({
  mode,
  initial,
  onFermer,
  onEnregistrer,
  onSupprimer,
}: {
  mode: 'projet' | 'stock'
  initial?: Tissu
  onFermer: () => void
  onEnregistrer: (t: Tissu, prisDuStock?: number) => void
  onSupprimer: (t: Tissu) => void
}) {
  const { state } = useStore()
  const stockDispo = state.stock.filter((t) => t.quantite > 0)
  const [choisirStock, setChoisirStock] = useState(mode === 'projet' && !initial && stockDispo.length > 0)
  const [t, setT] = useState<Tissu>(initial ?? { id: uid(), nom: '', quantite: 1, unite: 'm', role: 'tissu' })
  const [prix, setPrix] = useState(initial?.prix !== undefined ? String(initial.prix).replace('.', ',') : '')
  const [quantite, setQuantite] = useState(String(t.quantite).replace('.', ','))
  const set = <K extends keyof Tissu>(k: K, v: Tissu[K]) => setT((x) => ({ ...x, [k]: v }))
  const q = num(quantite) ?? 0
  const p = num(prix)
  const source = t.stockId ? state.stock.find((x) => x.id === t.stockId) : undefined
  const prendDuStock = mode === 'projet' && !initial && !!source

  const depuisStock = (s: Tissu) => {
    setT({
      ...s,
      id: uid(),
      stockId: s.id,
      achete: true,
      notes: undefined,
      origine: undefined,
      emplacement: undefined,
      dateAchat: undefined,
    })
    setPrix(s.prix !== undefined ? String(s.prix).replace('.', ',') : '')
    setQuantite(String(s.quantite).replace('.', ','))
    setChoisirStock(false)
  }

  const titre = initial ? 'Modifier' : mode === 'stock' ? 'Ajouter au stock' : 'Ajouter un tissu ou une fourniture'

  if (choisirStock)
    return (
      <Feuille titre={titre} onFermer={onFermer}>
        <ChoixStock onChoix={depuisStock} onAnnuler={() => setChoisirStock(false)} />
      </Feuille>
    )

  return (
    <Feuille titre={titre} onFermer={onFermer}>
      <form
        className="formulaire"
        onSubmit={(e) => {
          e.preventDefault()
          if (!t.nom.trim()) return
          const pris = prendDuStock ? Math.min(q, source!.quantite) : undefined
          onEnregistrer({ ...t, nom: t.nom.trim(), quantite: prendDuStock ? pris! : q, prix: p }, pris)
        }}
      >
        {mode === 'projet' && !initial && stockDispo.length > 0 && !source && (
          <button type="button" className="btn large" onClick={() => setChoisirStock(true)}>
            <Icone n="stock" petite /> Prendre dans mon stock
          </button>
        )}
        {prendDuStock && (
          <p className="message info">
            Pris dans le stock : {qte(source!)} disponible{source!.quantite > 1 ? 's' : ''}. La quantité choisie sera retirée du stock.
          </p>
        )}
        <div className="segments">
          {(
            [
              ['tissu', 'Tissu'],
              ['doublure', 'Doublure'],
              ['fourniture', 'Fourniture'],
            ] as const
          ).map(([r, l]) => (
            <button
              key={r}
              type="button"
              className={t.role === r ? 'actif' : ''}
              onClick={() => setT((x) => ({ ...x, role: r, unite: r === 'fourniture' && x.unite === 'm' && !initial ? 'pièce' : x.unite }))}
            >
              {l}
            </button>
          ))}
        </div>
        <label>
          Nom *
          <input required value={t.nom} placeholder={t.role === 'fourniture' ? 'Boutons nacre 12 mm' : 'Lin lavé terracotta'} onChange={(e) => set('nom', e.target.value)} />
        </label>
        <div className="deux-colonnes">
          <label>
            {prendDuStock ? 'Quantité à prendre' : 'Quantité'}
            <input inputMode="decimal" value={quantite} onChange={(e) => setQuantite(e.target.value)} />
          </label>
          <label>
            Unité
            <select value={t.unite} disabled={prendDuStock} onChange={(e) => set('unite', e.target.value)}>
              <option value="m">mètres</option>
              <option value="pièce">pièce(s)</option>
              <option value="bobine">bobine(s)</option>
              <option value="paquet">paquet(s)</option>
              <option value="pelote">pelote(s)</option>
            </select>
          </label>
        </div>
        <div className="deux-colonnes">
          <label>
            Prix {t.unite === 'm' ? 'au mètre' : 'unitaire'} (€)
            <input inputMode="decimal" value={prix} placeholder="12,90" onChange={(e) => setPrix(e.target.value)} />
          </label>
          <label>
            Total
            <output className="sortie">{p !== undefined ? euro(p * q) : '—'}</output>
          </label>
        </div>
        {t.unite === 'm' && (
          <div className="deux-colonnes">
            <label>
              Laize (cm)
              <input inputMode="numeric" value={t.laize ?? ''} placeholder="140" onChange={(e) => set('laize', num(e.target.value))} />
            </label>
            <label>
              Composition
              <input value={t.composition ?? ''} placeholder="100 % lin" onChange={(e) => set('composition', e.target.value || undefined)} />
            </label>
          </div>
        )}
        {mode === 'stock' && (
          <>
            <label>
              Origine
              <input list="origines" value={t.origine ?? ''} placeholder="Achat, don, récupération…" onChange={(e) => set('origine', e.target.value || undefined)} />
              <datalist id="origines">
                {ORIGINES.map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            </label>
            <div className="deux-colonnes">
              <label>
                Date d’achat / d’arrivée
                <input type="date" value={t.dateAchat ?? ''} onChange={(e) => set('dateAchat', e.target.value || undefined)} />
              </label>
              <label>
                Rangement
                <input value={t.emplacement ?? ''} placeholder="Boîte 2, armoire…" onChange={(e) => set('emplacement', e.target.value || undefined)} />
              </label>
            </div>
          </>
        )}
        <label>
          Lien (boutique)
          <input type="url" inputMode="url" value={t.lien ?? ''} placeholder="https://…" onChange={(e) => set('lien', e.target.value.trim() || undefined)} />
        </label>
        <div className="deux-colonnes">
          <label>
            Boutique
            <input value={t.boutique ?? ''} placeholder="Mercerie, site…" onChange={(e) => set('boutique', e.target.value || undefined)} />
          </label>
          <label>
            Couleur
            <span className="ligne-couleur">
              <input type="color" value={t.couleur ?? '#d9c9b0'} onChange={(e) => set('couleur', e.target.value)} aria-label="Couleur du tissu" />
              {t.couleur && (
                <button type="button" className="btn lien petit" onClick={() => set('couleur', undefined)}>
                  aucune
                </button>
              )}
            </span>
          </label>
        </div>
        <div>
          <span className="etiquette">Photo</span>
          {t.photo ? (
            <div className="champ-photo">
              <img src={t.photo} alt="Aperçu du tissu" />
              <button type="button" className="btn lien petit" onClick={() => set('photo', undefined)}>
                Retirer la photo
              </button>
            </div>
          ) : (
            <label className="zone-photo">
              <Icone n="photo" />
              <span>Photo du tissu ou de l’étiquette</span>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (f) set('photo', await compresserImage(f, 700))
                }}
              />
            </label>
          )}
        </div>
        <label>
          Notes
          <textarea rows={3} value={t.notes ?? ''} placeholder="Lavage, rétrécissement, sens du motif, idée de projet…" onChange={(e) => set('notes', e.target.value || undefined)} />
        </label>
        {mode === 'projet' && (
          <label className="bascule">
            <input type="checkbox" checked={!!t.achete} onChange={(e) => set('achete', e.target.checked)} /> Déjà acheté
          </label>
        )}
        <button type="submit" className="btn primaire large" disabled={!t.nom.trim()}>
          <Icone n="check" petite /> {initial ? 'Enregistrer' : mode === 'stock' ? 'Ajouter au stock' : 'Ajouter au projet'}
        </button>
        {initial && (
          <button type="button" className="btn danger lien" onClick={() => (mode === 'stock' ? confirm(`Supprimer « ${initial.nom} » du stock ?`) && onSupprimer(initial) : onSupprimer(initial))}>
            <Icone n="poubelle" petite /> {mode === 'stock' ? 'Supprimer du stock' : 'Retirer du projet'}
          </button>
        )}
      </form>
    </Feuille>
  )
}
