import { useState, type ReactNode } from 'react'
import { useStore } from '../store'
import { Entete, Icone, useNav } from '../ui'
import { aujourdhui, compresserImage, DIFFICULTES, EPOQUES, PUBLICS, STATUTS_PROJET, TYPES, uid } from '../lib'
import type { Patron, Projet } from '../types'

function ChampPhoto({ valeur, onChange }: { valeur?: string; onChange: (v?: string) => void }) {
  return (
    <div className="champ-photo">
      {valeur ? (
        <>
          <img src={valeur} alt="Aperçu" />
          <button type="button" className="btn lien petit" onClick={() => onChange(undefined)}>
            Retirer la photo
          </button>
        </>
      ) : (
        <label className="zone-photo">
          <Icone n="photo" />
          <span>Ajouter une photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (f) onChange(await compresserImage(f))
            }}
          />
        </label>
      )}
    </div>
  )
}

const Champ = ({ label, children, aide }: { label: string; children: ReactNode; aide?: string }) => (
  <label>
    {label}
    {children}
    {aide && <small>{aide}</small>}
  </label>
)

const num = (v: string) => {
  const n = parseFloat(v.replace(',', '.'))
  return isNaN(n) ? 0 : n
}

export function ProjetForm({ id, ajouterPatron }: { id?: string; ajouterPatron?: string }) {
  const { state, majProjet, trouverPatron } = useStore()
  const nav = useNav()
  const existant = id ? state.projets.find((p) => p.id === id) : undefined
  const [f, setF] = useState<Projet>(
    () =>
      existant ?? {
        id: uid(),
        nom: '',
        statut: 'idee',
        creeLe: aujourdhui(),
        patrons: ajouterPatron ? [{ uid: uid(), patronId: ajouterPatron, statut: 'a_faire' }] : [],
        sessions: [],
      },
  )
  const [manuel, setManuel] = useState(existant?.heuresManuelles !== undefined)
  const set = <K extends keyof Projet>(k: K, v: Projet[K]) => setF((x) => ({ ...x, [k]: v }))
  const patronInitial = ajouterPatron ? trouverPatron(ajouterPatron) : undefined

  const enregistrer = () => {
    const final: Projet = { ...f, nom: f.nom.trim(), heuresManuelles: manuel ? f.heuresManuelles ?? 0 : undefined }
    majProjet(final)
    if (existant) nav.retour()
    else nav.remplacer({ nom: 'projet', id: final.id })
  }

  return (
    <div className="page">
      <Entete titre={existant ? 'Modifier le projet' : 'Nouveau projet'} retour />
      <form
        className="formulaire"
        onSubmit={(e) => {
          e.preventDefault()
          if (f.nom.trim()) enregistrer()
        }}
      >
        {patronInitial && (
          <p className="note-discrete">
            Avec le patron <b>{patronInitial.nom}</b>. Tu pourras en ajouter d’autres ensuite.
          </p>
        )}
        <Champ label="Nom du projet *">
          <input required autoFocus={!existant} value={f.nom} placeholder="Tenue Tudor pour la fête médiévale" onChange={(e) => set('nom', e.target.value)} />
        </Champ>
        <Champ label="Description">
          <textarea rows={3} value={f.description ?? ''} placeholder="Pour qui, pour quelle occasion…" onChange={(e) => set('description', e.target.value || undefined)} />
        </Champ>
        <div className="deux-colonnes">
          <Champ label="Date limite">
            <input type="date" value={f.dateLimite ?? ''} onChange={(e) => set('dateLimite', e.target.value || undefined)} />
          </Champ>
          <Champ label="Statut">
            <select value={f.statut} onChange={(e) => set('statut', e.target.value as Projet['statut'])}>
              {STATUTS_PROJET.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </Champ>
        </div>
        <label className="bascule">
          <input type="checkbox" checked={manuel} onChange={(e) => setManuel(e.target.checked)} />
          Fixer moi-même le temps total estimé
        </label>
        {manuel ? (
          <Champ label="Temps total estimé (heures)">
            <input type="number" inputMode="decimal" min={0} step={0.5} value={f.heuresManuelles ?? ''} onChange={(e) => set('heuresManuelles', num(e.target.value))} />
          </Champ>
        ) : (
          <p className="note-discrete">Le temps estimé est calculé à partir des patrons du projet.</p>
        )}
        <Champ label="Tissus & fournitures" aide="Liste de courses, références de tissu, boutons…">
          <textarea rows={3} value={f.tissuNotes ?? ''} onChange={(e) => set('tissuNotes', e.target.value || undefined)} />
        </Champ>
        <Champ label="Photo (inspiration ou résultat)">
          <ChampPhoto valeur={f.image} onChange={(v) => set('image', v)} />
        </Champ>
        <button type="submit" className="btn primaire large" disabled={!f.nom.trim()}>
          <Icone n="check" petite /> {existant ? 'Enregistrer' : 'Créer le projet'}
        </button>
      </form>
    </div>
  )
}

export function PatronForm({ id }: { id?: string }) {
  const { state, majPatronPerso } = useStore()
  const nav = useNav()
  const existant = id ? state.patronsPerso.find((p) => p.id === id) : undefined
  const [f, setF] = useState<Patron>(
    () =>
      existant ?? {
        id: 'perso-' + uid(),
        nom: '',
        marque: '',
        epoque: 'moderne',
        type: 'robe',
        public: 'femme',
        difficulte: 2,
        heuresMin: 4,
        heuresMax: 8,
        tissuMin: 2,
        tissuMax: 2.5,
        tissus: '',
        description: '',
        url: '',
        gratuit: false,
        sourceMetrage: 'editeur',
        perso: true,
      },
  )
  const set = <K extends keyof Patron>(k: K, v: Patron[K]) => setF((x) => ({ ...x, [k]: v }))

  return (
    <div className="page">
      <Entete titre={existant ? 'Modifier le patron' : 'Nouveau patron'} retour />
      <form
        className="formulaire"
        onSubmit={(e) => {
          e.preventDefault()
          if (!f.nom.trim()) return
          const final = {
            ...f,
            nom: f.nom.trim(),
            heuresMax: Math.max(f.heuresMin, f.heuresMax),
            tissuMax: Math.max(f.tissuMin, f.tissuMax),
          }
          majPatronPerso(final)
          if (existant) nav.retour()
          else nav.remplacer({ nom: 'patron', id: final.id })
        }}
      >
        <Champ label="Photo de l’enveloppe ou du modèle">
          <ChampPhoto valeur={f.image} onChange={(v) => set('image', v)} />
        </Champ>
        <Champ label="Nom du patron *">
          <input required value={f.nom} placeholder="Robe Myosotis" onChange={(e) => set('nom', e.target.value)} />
        </Champ>
        <Champ label="Marque / source">
          <input value={f.marque} placeholder="Deer & Doe, Burda n°…, patron maison" onChange={(e) => set('marque', e.target.value)} />
        </Champ>
        <div className="deux-colonnes">
          <Champ label="Époque">
            <select value={f.epoque} onChange={(e) => set('epoque', e.target.value as Patron['epoque'])}>
              {EPOQUES.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.label}
                </option>
              ))}
            </select>
          </Champ>
          <Champ label="Période précise">
            <input value={f.periode ?? ''} placeholder="1885, XIVᵉ…" onChange={(e) => set('periode', e.target.value || undefined)} />
          </Champ>
        </div>
        <div className="deux-colonnes">
          <Champ label="Type">
            <select value={f.type} onChange={(e) => set('type', e.target.value as Patron['type'])}>
              {TYPES.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.label}
                </option>
              ))}
            </select>
          </Champ>
          <Champ label="Pour">
            <select value={f.public} onChange={(e) => set('public', e.target.value as Patron['public'])}>
              {PUBLICS.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.label}
                </option>
              ))}
            </select>
          </Champ>
        </div>
        <Champ label={`Difficulté : ${DIFFICULTES[f.difficulte]}`}>
          <input type="range" min={1} max={5} value={f.difficulte} onChange={(e) => set('difficulte', +e.target.value)} />
        </Champ>
        <fieldset>
          <legend>Temps de travail estimé (heures)</legend>
          <div className="deux-colonnes">
            <Champ label="Minimum">
              <input type="number" inputMode="decimal" min={0} step={0.5} value={f.heuresMin} onChange={(e) => set('heuresMin', num(e.target.value))} />
            </Champ>
            <Champ label="Maximum">
              <input type="number" inputMode="decimal" min={0} step={0.5} value={f.heuresMax} onChange={(e) => set('heuresMax', num(e.target.value))} />
            </Champ>
          </div>
        </fieldset>
        <fieldset>
          <legend>Métrage de tissu (m, laize 150 cm)</legend>
          <div className="deux-colonnes">
            <Champ label="Minimum">
              <input type="number" inputMode="decimal" min={0} step={0.1} value={f.tissuMin} onChange={(e) => set('tissuMin', num(e.target.value))} />
            </Champ>
            <Champ label="Maximum">
              <input type="number" inputMode="decimal" min={0} step={0.1} value={f.tissuMax} onChange={(e) => set('tissuMax', num(e.target.value))} />
            </Champ>
          </div>
        </fieldset>
        <Champ label="Tissus conseillés">
          <input value={f.tissus} placeholder="Lin, viscose…" onChange={(e) => set('tissus', e.target.value)} />
        </Champ>
        <Champ label="Description">
          <textarea rows={3} value={f.description} onChange={(e) => set('description', e.target.value)} />
        </Champ>
        <Champ label="Lien (boutique, PDF, tutoriel)">
          <input type="url" inputMode="url" value={f.url} placeholder="https://…" onChange={(e) => set('url', e.target.value)} />
        </Champ>
        <Champ label="Mes notes" aide="Taille choisie, retouches faites, astuces…">
          <textarea rows={3} value={f.notes ?? ''} onChange={(e) => set('notes', e.target.value || undefined)} />
        </Champ>
        <label className="bascule">
          <input type="checkbox" checked={f.gratuit} onChange={(e) => set('gratuit', e.target.checked)} /> Patron gratuit
        </label>
        <button type="submit" className="btn primaire large" disabled={!f.nom.trim()}>
          <Icone n="check" petite /> {existant ? 'Enregistrer' : 'Ajouter à mes patrons'}
        </button>
      </form>
    </div>
  )
}
