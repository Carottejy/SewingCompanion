import type { Epoque, Patron, Projet, Public, StatutEtape, StatutProjet, TypeVetement } from './types'

export const EPOQUES: { id: Epoque; label: string; dates: string; couleur: string }[] = [
  { id: 'moderne', label: 'Moderne', dates: 'aujourd’hui', couleur: '#3f6e8c' },
  { id: 'vintage', label: 'Vintage', dates: '1920–1960', couleur: '#b5584a' },
  { id: 'edouardien', label: 'Édouardien', dates: '1900–1919', couleur: '#8a6fa8' },
  { id: 'victorien', label: 'Victorien', dates: '1837–1901', couleur: '#6b3f52' },
  { id: 'regence', label: 'Régence / Empire', dates: '1795–1825', couleur: '#5c8a7a' },
  { id: 'xviiie', label: 'XVIIIᵉ siècle', dates: '1700–1795', couleur: '#c28a3a' },
  { id: 'renaissance', label: 'Renaissance', dates: '1500–1620', couleur: '#8c3b2e' },
  { id: 'medieval', label: 'Médiéval', dates: '1000–1500', couleur: '#4d5b2f' },
  { id: 'viking', label: 'Viking / haut Moyen Âge', dates: '800–1100', couleur: '#5a5048' },
  { id: 'monde', label: 'Costumes du monde', dates: 'traditions', couleur: '#2f6b5e' },
]

export const TYPES: { id: TypeVetement; label: string }[] = [
  { id: 'robe', label: 'Robe' },
  { id: 'jupe', label: 'Jupe' },
  { id: 'haut', label: 'Haut / chemise' },
  { id: 'pantalon', label: 'Pantalon / short' },
  { id: 'combinaison', label: 'Combinaison' },
  { id: 'veste', label: 'Veste / manteau' },
  { id: 'dessous', label: 'Dessous / corps' },
  { id: 'ensemble', label: 'Ensemble' },
  { id: 'accessoire', label: 'Accessoire' },
]

export const PUBLICS: { id: Public; label: string }[] = [
  { id: 'femme', label: 'Femme' },
  { id: 'homme', label: 'Homme' },
  { id: 'mixte', label: 'Mixte' },
  { id: 'enfant', label: 'Enfant' },
]

export const DIFFICULTES = ['', 'Débutant', 'Facile', 'Intermédiaire', 'Avancé', 'Expert']

export const STATUTS_PROJET: { id: StatutProjet; label: string }[] = [
  { id: 'idee', label: 'Idée' },
  { id: 'en_cours', label: 'En cours' },
  { id: 'pause', label: 'En pause' },
  { id: 'termine', label: 'Terminé' },
]

export const STATUTS_ETAPE: { id: StatutEtape; label: string }[] = [
  { id: 'a_faire', label: 'À faire' },
  { id: 'en_cours', label: 'En cours' },
  { id: 'fait', label: 'Fait' },
]

export const epoque = (id: Epoque) => EPOQUES.find((e) => e.id === id) ?? EPOQUES[0]
export const typeLabel = (id: TypeVetement) => TYPES.find((t) => t.id === id)?.label ?? id
export const statutLabel = (id: StatutProjet) => STATUTS_PROJET.find((s) => s.id === id)?.label ?? id

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

export const aujourdhui = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** jours entre aujourd'hui et la date (négatif = dépassé) */
export function joursRestants(date: string): number {
  const [y, m, d] = date.split('-').map(Number)
  const cible = new Date(y, m - 1, d)
  const t = new Date()
  const auj = new Date(t.getFullYear(), t.getMonth(), t.getDate())
  return Math.round((cible.getTime() - auj.getTime()) / 86400000)
}

export function formatDate(date: string): string {
  const [y, m, d] = date.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function libelleEcheance(date: string): { texte: string; niveau: 'ok' | 'proche' | 'urgent' | 'depasse' } {
  const j = joursRestants(date)
  if (j < 0) return { texte: `En retard de ${-j} j`, niveau: 'depasse' }
  if (j === 0) return { texte: 'Aujourd’hui !', niveau: 'urgent' }
  if (j === 1) return { texte: 'Demain', niveau: 'urgent' }
  if (j <= 7) return { texte: `Dans ${j} jours`, niveau: 'urgent' }
  if (j <= 30) return { texte: `Dans ${j} jours`, niveau: 'proche' }
  if (j < 60) return { texte: `Dans ${Math.round(j / 7)} semaines`, niveau: 'ok' }
  return { texte: `Dans ${Math.round(j / 30)} mois`, niveau: 'ok' }
}

export const fmtH = (h: number) => {
  if (h < 1 && h > 0) return `${Math.round(h * 60)} min`
  const r = Math.round(h * 10) / 10
  return `${String(r).replace('.', ',')} h`
}
export const fmtM = (m: number) => `${String(Math.round(m * 10) / 10).replace('.', ',')} m`
export const plage = (a: number, b: number, f: (n: number) => string) =>
  a === b ? f(a) : `${f(a).replace(/ (h|m|min)$/, '')}–${f(b)}`

export const moyenneHeures = (p: Patron) => (p.heuresMin + p.heuresMax) / 2

export interface Bilan {
  heuresEstimees: number
  heuresMin: number
  heuresMax: number
  heuresPassees: number
  heuresRestantes: number
  tissuMin: number
  tissuMax: number
  piecesFaites: number
  piecesTotal: number
  progression: number // 0..1
  heuresParSemaine?: number
}

export function bilanProjet(projet: Projet, trouver: (id: string) => Patron | undefined): Bilan {
  let hMin = 0, hMax = 0, hEst = 0, tMin = 0, tMax = 0, faites = 0
  for (const e of projet.patrons) {
    const p = trouver(e.patronId)
    const est = e.heures ?? (p ? moyenneHeures(p) : 0)
    hEst += est
    hMin += e.heures ?? p?.heuresMin ?? 0
    hMax += e.heures ?? p?.heuresMax ?? 0
    tMin += p?.tissuMin ?? 0
    tMax += p?.tissuMax ?? 0
    if (e.statut === 'fait') faites++
  }
  const heuresEstimees = projet.heuresManuelles ?? hEst
  const heuresPassees = projet.sessions.reduce((s, x) => s + x.heures, 0)
  const heuresRestantes = Math.max(0, heuresEstimees - heuresPassees)
  const progression =
    projet.statut === 'termine' ? 1 : heuresEstimees > 0 ? Math.min(1, heuresPassees / heuresEstimees) : 0
  let heuresParSemaine: number | undefined
  if (projet.dateLimite && projet.statut !== 'termine' && heuresRestantes > 0) {
    const j = joursRestants(projet.dateLimite)
    if (j > 0) heuresParSemaine = heuresRestantes / Math.max(1, j / 7)
  }
  return {
    heuresEstimees,
    heuresMin: projet.heuresManuelles ?? hMin,
    heuresMax: projet.heuresManuelles ?? hMax,
    heuresPassees,
    heuresRestantes,
    tissuMin: tMin,
    tissuMax: tMax,
    piecesFaites: faites,
    piecesTotal: projet.patrons.length,
    progression,
    heuresParSemaine,
  }
}

const sansAccents = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
/** recherche sans accents sur une liste de textes */
export function correspond0(champs: (string | number | undefined)[], q: string): boolean {
  if (!q.trim()) return true
  const texte = sansAccents(champs.filter(Boolean).join(' '))
  return sansAccents(q)
    .split(/\s+/)
    .filter(Boolean)
    .every((mot) => texte.includes(mot))
}

export function correspond(p: Patron, q: string): boolean {
  if (!q.trim()) return true
  const texte = sansAccents(
    [p.nom, p.marque, p.periode, p.description, p.tissus, typeLabel(p.type), epoque(p.epoque).label].join(' '),
  )
  return sansAccents(q)
    .split(/\s+/)
    .filter(Boolean)
    .every((mot) => texte.includes(mot))
}

/** Redimensionne une image choisie pour la stocker sans gonfler la base */
export function compresserImage(fichier: File, max = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(fichier)
    img.onload = () => {
      const r = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * r)
      c.height = Math.round(img.height * r)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', 0.78))
    }
    img.onerror = reject
    img.src = url
  })
}
