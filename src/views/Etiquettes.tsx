import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { Feuille, Icone } from '../ui'

/** couleur stable dérivée du nom de l'étiquette */
const TEINTES = ['#3f6e8c', '#b5584a', '#8a6fa8', '#5c8a7a', '#c28a3a', '#6b3f52', '#4d5b2f', '#2f6b5e', '#8c3b2e', '#5a5048']
export function couleurEtiquette(nom: string) {
  let h = 0
  for (const c of nom.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return TEINTES[h % TEINTES.length]
}

const normaliser = (s: string) => s.trim().replace(/\s+/g, ' ')
const cle = (s: string) => normaliser(s).toLocaleLowerCase('fr')

/** toutes les étiquettes utilisées dans le stock, avec leur nombre d'articles */
export function useEtiquettesStock() {
  const { state } = useStore()
  return useMemo(() => {
    const m = new Map<string, { nom: string; n: number }>()
    for (const t of state.stock)
      for (const e of t.etiquettes ?? []) {
        const k = cle(e)
        const x = m.get(k)
        if (x) x.n++
        else m.set(k, { nom: e, n: 1 })
      }
    return [...m.values()].sort((a, b) => b.n - a.n || a.nom.localeCompare(b.nom, 'fr'))
  }, [state.stock])
}

export function Etiquette({ nom, actif, onClick, compte, onRetirer }: { nom: string; actif?: boolean; onClick?: () => void; compte?: number; onRetirer?: () => void }) {
  const style = { ['--c' as string]: couleurEtiquette(nom) }
  const contenu = (
    <>
      <span className="etiquette-point" />
      {nom}
      {compte !== undefined && <small>{compte}</small>}
    </>
  )
  if (onRetirer)
    return (
      <span className="etiquette-puce choisie" style={style}>
        {contenu}
        <button type="button" aria-label={`Retirer l’étiquette ${nom}`} onClick={onRetirer}>
          ×
        </button>
      </span>
    )
  if (onClick)
    return (
      <button type="button" className={'etiquette-puce' + (actif ? ' active' : '')} style={style} aria-pressed={actif} onClick={onClick}>
        {contenu}
      </button>
    )
  return (
    <span className="etiquette-puce mini" style={style}>
      {contenu}
    </span>
  )
}

/** champ de saisie : choisir une étiquette existante ou en créer une */
export function ChampEtiquettes({ valeur, onChange }: { valeur: string[]; onChange: (v: string[]) => void }) {
  const existantes = useEtiquettesStock()
  const [saisie, setSaisie] = useState('')
  const choisies = new Set(valeur.map(cle))
  const s = cle(saisie)
  const suggestions = existantes.filter((e) => !choisies.has(cle(e.nom)) && (!s || cle(e.nom).includes(s)))
  const exacte = existantes.find((e) => cle(e.nom) === s)
  const ajouter = (nom: string) => {
    const n = normaliser(nom)
    if (!n || choisies.has(cle(n))) return
    // réutilise l'orthographe existante si l'étiquette existe déjà
    const existante = existantes.find((e) => cle(e.nom) === cle(n))
    onChange([...valeur, existante ? existante.nom : n])
    setSaisie('')
  }
  return (
    <div className="champ-etiquettes">
      {valeur.length > 0 && (
        <div className="ligne-etiquettes">
          {valeur.map((e) => (
            <Etiquette key={e} nom={e} onRetirer={() => onChange(valeur.filter((x) => x !== e))} />
          ))}
        </div>
      )}
      <div className="saisie-etiquette">
        <input
          value={saisie}
          placeholder="Ajouter une étiquette (été, à laver, coupon…)"
          enterKeyHint="done"
          onChange={(e) => setSaisie(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              ajouter(saisie)
            }
          }}
          aria-label="Nouvelle étiquette"
        />
        {s && !choisies.has(s) && (
          <button type="button" className="btn petit" onClick={() => ajouter(saisie)}>
            <Icone n="plus" petite /> {exacte ? 'Ajouter' : 'Créer'}
          </button>
        )}
      </div>
      {suggestions.length > 0 && (
        <div className="ligne-etiquettes suggestions">
          {suggestions.slice(0, 12).map((e) => (
            <Etiquette key={e.nom} nom={e.nom} onClick={() => ajouter(e.nom)} />
          ))}
        </div>
      )}
    </div>
  )
}

/** gestion : renommer ou supprimer une étiquette dans tout le stock */
export function GestionEtiquettes({ onFermer }: { onFermer: () => void }) {
  const { renommerEtiquette } = useStore()
  const etiquettes = useEtiquettesStock()
  return (
    <Feuille titre="Mes étiquettes" onFermer={onFermer}>
      {etiquettes.length === 0 ? (
        <p className="note-discrete">Aucune étiquette pour l’instant. Ajoute-en depuis la fiche d’un article du stock.</p>
      ) : (
        <ul className="liste-gestion">
          {etiquettes.map((e) => (
            <li key={e.nom}>
              <Etiquette nom={e.nom} compte={e.n} />
              <span className="gestion-actions">
                <button
                  className="btn lien petit"
                  onClick={() => {
                    const n = prompt('Nouveau nom de l’étiquette', e.nom)
                    if (n && normaliser(n) && normaliser(n) !== e.nom) renommerEtiquette(e.nom, normaliser(n))
                  }}
                >
                  Renommer
                </button>
                <button
                  className="icone-btn petit"
                  aria-label={`Supprimer l’étiquette ${e.nom}`}
                  onClick={() => confirm(`Retirer l’étiquette « ${e.nom} » de ${e.n} article${e.n > 1 ? 's' : ''} ?`) && renommerEtiquette(e.nom, null)}
                >
                  <Icone n="poubelle" petite />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Feuille>
  )
}

export const aEtiquette = (liste: string[] | undefined, nom: string) => (liste ?? []).some((e) => cle(e) === cle(nom))
