import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { DIFFICULTES, epoque, fmtH, fmtM, plage, typeLabel } from './lib'
import type { Patron } from './types'

/* ---------- navigation ---------- */
export type Onglet = 'projets' | 'catalogue' | 'mesPatrons' | 'reglages'
export type Ecran =
  | { nom: 'patron'; id: string }
  | { nom: 'projet'; id: string }
  | { nom: 'projetForm'; id?: string; ajouterPatron?: string }
  | { nom: 'patronForm'; id?: string }

export interface Nav {
  onglet: Onglet
  allerOnglet: (o: Onglet) => void
  ouvrir: (e: Ecran) => void
  remplacer: (e: Ecran) => void
  retour: () => void
  toast: (msg: string) => void
}
export const NavCtx = createContext<Nav | null>(null)
export const useNav = () => useContext(NavCtx)!

/* ---------- composants ---------- */
export function Entete({ titre, sousTitre, retour, actions }: { titre: string; sousTitre?: string; retour?: boolean; actions?: ReactNode }) {
  const nav = useNav()
  return (
    <header className="entete">
      {retour && (
        <button className="icone-btn" onClick={nav.retour} aria-label="Retour">
          <Icone n="retour" />
        </button>
      )}
      <div className="entete-titres">
        <h1>{titre}</h1>
        {sousTitre && <p>{sousTitre}</p>}
      </div>
      {actions && <div className="entete-actions">{actions}</div>}
    </header>
  )
}

export function Difficulte({ n, avecTexte }: { n: number; avecTexte?: boolean }) {
  return (
    <span className="difficulte" title={DIFFICULTES[n]} aria-label={`Difficulté ${n} sur 5 : ${DIFFICULTES[n]}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={i <= n ? 'plein' : ''} />
      ))}
      {avecTexte && <em>{DIFFICULTES[n]}</em>}
    </span>
  )
}

export function BadgeEpoque({ p }: { p: Pick<Patron, 'epoque' | 'periode'> }) {
  const e = epoque(p.epoque)
  return (
    <span className="badge-epoque" style={{ ['--c' as string]: e.couleur }}>
      {e.label}
      {p.periode ? ` · ${p.periode}` : ''}
    </span>
  )
}

export function CartePatron({ p, onClick, favori }: { p: Patron; onClick: () => void; favori?: boolean }) {
  return (
    <button className="carte-patron" onClick={onClick} style={{ ['--c' as string]: epoque(p.epoque).couleur }}>
      {p.image ? <img src={p.image} alt="" className="carte-vignette" /> : <span className="carte-liseret" />}
      <span className="carte-corps">
        <span className="carte-haut">
          <BadgeEpoque p={p} />
          {p.gratuit && <span className="pastille gratuit">Gratuit</span>}
          {p.perso && <span className="pastille perso">Mon patron</span>}
          {favori && <Icone n="etoile-pleine" petite />}
        </span>
        <strong className="carte-nom">{p.nom}</strong>
        <span className="carte-marque">
          {p.marque} · {typeLabel(p.type)}
        </span>
        <span className="carte-chiffres">
          <Difficulte n={p.difficulte} />
          <span>
            <Icone n="horloge" petite /> {plage(p.heuresMin, p.heuresMax, fmtH)}
          </span>
          <span>
            <Icone n="tissu" petite /> {plage(p.tissuMin, p.tissuMax, fmtM)}
          </span>
        </span>
      </span>
    </button>
  )
}

export function Feuille({ titre, onFermer, children }: { titre: string; onFermer: () => void; children: ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onFermer()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onFermer])
  return createPortal(
    <div className="feuille-fond" onClick={onFermer}>
      <div className="feuille" role="dialog" aria-label={titre} onClick={(e) => e.stopPropagation()}>
        <div className="feuille-poignee" />
        <h2>{titre}</h2>
        {children}
      </div>
    </div>,
    document.body,
  )
}

export function Vide({ titre, texte, action }: { titre: string; texte: string; action?: ReactNode }) {
  return (
    <div className="vide">
      <svg viewBox="0 0 120 80" aria-hidden="true">
        <path d="M10 60 Q 40 10 60 40 T 110 30" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
        <circle cx="110" cy="30" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="104" y1="36" x2="88" y2="62" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <h3>{titre}</h3>
      <p>{texte}</p>
      {action}
    </div>
  )
}

const CHEMINS: Record<string, string> = {
  retour: 'M15 5l-7 7 7 7',
  plus: 'M12 5v14M5 12h14',
  horloge: 'M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
  tissu: 'M4 6c3-2 5 2 8 0s5-2 8 0v12c-3-2-5 2-8 0s-5-2-8 0z',
  etoile: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  'etoile-pleine': 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  lien: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  loupe: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  crayon: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  poubelle: 'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13',
  calendrier: 'M5 5h14v15H5zM5 10h14M9 3v4M15 3v4',
  projets: 'M6 3h12v18l-6-4-6 4z',
  catalogue: 'M4 5h7v14H4zM13 5h7v14h-7z',
  ciseaux: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.5 7.5L20 18M8.5 16.5L20 6',
  reglages: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1',
  filtre: 'M4 5h16l-6 8v6l-4-2v-4z',
  check: 'M5 12l5 5 9-10',
  photo: 'M4 7h4l2-2h4l2 2h4v12H4zM12 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
}

export function Icone({ n, petite }: { n: string; petite?: boolean }) {
  const plein = n === 'etoile-pleine'
  return (
    <svg
      className={'icone' + (petite ? ' petite' : '')}
      viewBox="0 0 24 24"
      fill={plein ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={CHEMINS[n]} />
    </svg>
  )
}
