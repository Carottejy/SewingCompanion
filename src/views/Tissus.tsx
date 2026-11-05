import { useState } from 'react'
import { Feuille, Icone } from '../ui'
import { compresserImage, fmtM, plage, uid } from '../lib'
import { ouvrirLien } from '../native'
import type { Projet, Tissu } from '../types'

const euro = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
const qte = (t: Tissu) =>
  t.unite === 'm' ? fmtM(t.quantite) : `${String(t.quantite).replace('.', ',')} ${t.unite}${t.quantite > 1 ? 's' : ''}`
export const coutTissu = (t: Tissu) => (t.prix ?? 0) * t.quantite
const num = (v: string) => {
  const n = parseFloat(v.replace(',', '.'))
  return isNaN(n) ? undefined : n
}

export function SectionTissus({
  projet,
  maj,
  besoin,
}: {
  projet: Projet
  maj: (patch: Partial<Projet>) => void
  besoin: { min: number; max: number }
}) {
  const [edition, setEdition] = useState<Tissu | 'nouveau' | null>(null)
  const tissus = projet.tissus ?? []
  const total = tissus.reduce((s, t) => s + coutTissu(t), 0)
  const resteAAcheter = tissus.filter((t) => !t.achete).reduce((s, t) => s + coutTissu(t), 0)
  const metres = tissus.filter((t) => t.unite === 'm' && t.role !== 'fourniture').reduce((s, t) => s + t.quantite, 0)

  const enregistrer = (t: Tissu) => {
    const existe = tissus.some((x) => x.id === t.id)
    maj({ tissus: existe ? tissus.map((x) => (x.id === t.id ? t : x)) : [...tissus, t] })
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
          Ajoute les tissus et fournitures un par un : lien vers la boutique, prix, quantité et photo.
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
              <li key={t.id} className={'tissu' + (t.achete ? ' achete' : '')}>
                <button className="tissu-corps" onClick={() => setEdition(t)}>
                  {t.photo ? <img src={t.photo} alt="" /> : <span className="tissu-pastille" style={{ background: t.couleur || 'var(--papier-2)' }}>
                      {!t.couleur && <Icone n={t.role === 'fourniture' ? 'ciseaux' : 'tissu'} />}
                    </span>}
                  <span className="tissu-texte">
                    <strong>{t.nom}</strong>
                    <small>
                      {qte(t)}
                      {t.prix !== undefined && ` × ${euro(t.prix)}${t.unite === 'm' ? '/m' : ''} = ${euro(coutTissu(t))}`}
                    </small>
                    {(t.boutique || t.laize || t.composition) && (
                      <small>
                        {[t.composition, t.boutique, t.laize && `laize ${t.laize} cm`].filter(Boolean).join(' · ')}
                      </small>
                    )}
                    {t.notes && <em className="tissu-notes">{t.notes}</em>}
                  </span>
                </button>
                <div className="tissu-actions">
                  <label className="bascule petite">
                    <input type="checkbox" checked={!!t.achete} onChange={(e) => enregistrer({ ...t, achete: e.target.checked })} /> Acheté
                  </label>
                  {t.lien && (
                    <button className="icone-btn petit" aria-label="Ouvrir le lien" onClick={() => ouvrirLien(t.lien!)}>
                      <Icone n="lien" petite />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {edition && (
        <FormTissu
          initial={edition === 'nouveau' ? undefined : edition}
          onFermer={() => setEdition(null)}
          onEnregistrer={enregistrer}
          onSupprimer={(id) => {
            maj({ tissus: tissus.filter((x) => x.id !== id) })
            setEdition(null)
          }}
        />
      )}
    </section>
  )
}

function FormTissu({
  initial,
  onFermer,
  onEnregistrer,
  onSupprimer,
}: {
  initial?: Tissu
  onFermer: () => void
  onEnregistrer: (t: Tissu) => void
  onSupprimer: (id: string) => void
}) {
  const [t, setT] = useState<Tissu>(initial ?? { id: uid(), nom: '', quantite: 1, unite: 'm', role: 'tissu' })
  const [prix, setPrix] = useState(initial?.prix !== undefined ? String(initial.prix).replace('.', ',') : '')
  const [quantite, setQuantite] = useState(String(t.quantite).replace('.', ','))
  const set = <K extends keyof Tissu>(k: K, v: Tissu[K]) => setT((x) => ({ ...x, [k]: v }))
  const q = num(quantite) ?? 0
  const p = num(prix)

  return (
    <Feuille titre={initial ? 'Modifier' : 'Ajouter un tissu ou une fourniture'} onFermer={onFermer}>
      <form
        className="formulaire"
        onSubmit={(e) => {
          e.preventDefault()
          if (t.nom.trim()) onEnregistrer({ ...t, nom: t.nom.trim(), quantite: q, prix: p })
        }}
      >
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
            Quantité
            <input inputMode="decimal" value={quantite} onChange={(e) => setQuantite(e.target.value)} />
          </label>
          <label>
            Unité
            <select value={t.unite} onChange={(e) => set('unite', e.target.value)}>
              <option value="m">mètres</option>
              <option value="pièce">pièce(s)</option>
              <option value="bobine">bobine(s)</option>
              <option value="paquet">paquet(s)</option>
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
          <textarea rows={3} value={t.notes ?? ''} placeholder="Lavage, rétrécissement, sens du motif, à commander en même temps que…" onChange={(e) => set('notes', e.target.value || undefined)} />
        </label>
        <label className="bascule">
          <input type="checkbox" checked={!!t.achete} onChange={(e) => set('achete', e.target.checked)} /> Déjà acheté
        </label>
        <button type="submit" className="btn primaire large" disabled={!t.nom.trim()}>
          <Icone n="check" petite /> {initial ? 'Enregistrer' : 'Ajouter au projet'}
        </button>
        {initial && (
          <button type="button" className="btn danger lien" onClick={() => confirm(`Retirer « ${initial.nom} » ?`) && onSupprimer(initial.id)}>
            <Icone n="poubelle" petite /> Retirer du projet
          </button>
        )}
      </form>
    </Feuille>
  )
}
