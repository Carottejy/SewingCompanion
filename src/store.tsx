import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { get, set } from 'idb-keyval'
import catalogueEmbarque from './data/catalogue.json'
import type { AppState, Avis, CatalogueFichier, Patron, Projet } from './types'

const CLE = 'sewing-companion-state-v1'
export const URL_CATALOGUE =
  'https://raw.githubusercontent.com/Carottejy/SewingCompanion/main/src/data/catalogue.json'

const VIDE: AppState = { projets: [], patronsPerso: [], favoris: [], avis: {} }

interface Store {
  pret: boolean
  state: AppState
  catalogue: Patron[]
  catalogueInfo: { patrons: number; misAJour: string; source: 'embarque' | 'distant' }
  trouverPatron: (id: string) => Patron | undefined
  majProjet: (p: Projet) => void
  supprimerProjet: (id: string) => void
  majPatronPerso: (p: Patron) => void
  supprimerPatronPerso: (id: string) => void
  basculerFavori: (id: string) => void
  majAvis: (id: string, a: Avis | null) => void
  remplacerTout: (s: AppState) => void
  definirCatalogueDistant: (c: CatalogueFichier) => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(VIDE)
  const [pret, setPret] = useState(false)
  const charge = useRef(false)

  useEffect(() => {
    get<AppState>(CLE)
      .then((s) => {
        if (s) setState({ ...VIDE, ...s })
      })
      .catch(() => {})
      .finally(() => {
        charge.current = true
        setPret(true)
      })
  }, [])

  useEffect(() => {
    if (!charge.current) return
    set(CLE, state).catch((e) => console.error('Sauvegarde impossible', e))
  }, [state])

  const base = catalogueEmbarque as CatalogueFichier
  const distant = state.catalogueDistant
  const source = distant && distant.misAJour > base.misAJour ? distant : base

  const catalogue = useMemo(() => [...state.patronsPerso, ...source.patrons], [state.patronsPerso, source])
  const index = useMemo(() => {
    const m = new Map<string, Patron>()
    // les patrons des deux catalogues restent trouvables pour les projets existants
    for (const p of base.patrons) m.set(p.id, p)
    for (const p of distant?.patrons ?? []) m.set(p.id, p)
    for (const p of state.patronsPerso) m.set(p.id, p)
    return m
  }, [base, distant, state.patronsPerso])

  const trouverPatron = useCallback((id: string) => index.get(id), [index])

  const majProjet = useCallback((p: Projet) => {
    setState((s) => {
      const existe = s.projets.some((x) => x.id === p.id)
      return { ...s, projets: existe ? s.projets.map((x) => (x.id === p.id ? p : x)) : [p, ...s.projets] }
    })
  }, [])

  const value: Store = {
    pret,
    state,
    catalogue,
    catalogueInfo: {
      patrons: source.patrons.length,
      misAJour: source.misAJour,
      source: source === base ? 'embarque' : 'distant',
    },
    trouverPatron,
    majProjet,
    supprimerProjet: (id) => setState((s) => ({ ...s, projets: s.projets.filter((x) => x.id !== id) })),
    majPatronPerso: (p) =>
      setState((s) => {
        const existe = s.patronsPerso.some((x) => x.id === p.id)
        return {
          ...s,
          patronsPerso: existe ? s.patronsPerso.map((x) => (x.id === p.id ? p : x)) : [p, ...s.patronsPerso],
        }
      }),
    supprimerPatronPerso: (id) =>
      setState((s) => ({
        ...s,
        patronsPerso: s.patronsPerso.filter((x) => x.id !== id),
        projets: s.projets.map((pr) => ({ ...pr, patrons: pr.patrons.filter((e) => e.patronId !== id) })),
      })),
    basculerFavori: (id) =>
      setState((s) => ({
        ...s,
        favoris: s.favoris.includes(id) ? s.favoris.filter((f) => f !== id) : [...s.favoris, id],
      })),
    majAvis: (id, a) =>
      setState((s) => {
        const avis = { ...s.avis }
        if (a) avis[id] = a
        else delete avis[id]
        return { ...s, avis }
      }),
    remplacerTout: (s) => setState({ ...VIDE, ...s }),
    definirCatalogueDistant: (c) => setState((s) => ({ ...s, catalogueDistant: c })),
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('StoreProvider manquant')
  return s
}
