export type Epoque =
  | 'moderne'
  | 'vintage'
  | 'edouardien'
  | 'victorien'
  | 'regence'
  | 'xviiie'
  | 'renaissance'
  | 'medieval'
  | 'viking'
  | 'monde'

export type TypeVetement =
  | 'robe'
  | 'jupe'
  | 'haut'
  | 'pantalon'
  | 'combinaison'
  | 'veste'
  | 'dessous'
  | 'ensemble'
  | 'accessoire'

export type Public = 'femme' | 'homme' | 'mixte' | 'enfant'

export interface Patron {
  id: string
  nom: string
  marque: string
  epoque: Epoque
  periode?: string
  type: TypeVetement
  public: Public
  /** 1 (débutant) à 5 (expert) */
  difficulte: number
  heuresMin: number
  heuresMax: number
  /** mètres, laize 140-150 cm */
  tissuMin: number
  tissuMax: number
  tissus: string
  description: string
  url: string
  gratuit: boolean
  sourceMetrage: 'editeur' | 'estimation'
  /** patron ajouté par l'utilisatrice */
  perso?: boolean
  notes?: string
  image?: string
  /** URL directe d'une photo du modèle (facultatif) */
  photo?: string
}

export type StatutProjet = 'idee' | 'en_cours' | 'pause' | 'termine'
export type StatutEtape = 'a_faire' | 'en_cours' | 'fait'

export interface PatronDansProjet {
  uid: string
  patronId: string
  statut: StatutEtape
  /** surcharge du temps estimé pour cette pièce */
  heures?: number
  note?: string
}

export interface Session {
  id: string
  date: string // YYYY-MM-DD
  heures: number
  note?: string
}

export interface Tissu {
  id: string
  nom: string
  role: 'tissu' | 'doublure' | 'fourniture'
  quantite: number
  unite: string // 'm', 'pièce', 'bobine', 'paquet'
  /** prix au mètre (ou à l'unité) en euros */
  prix?: number
  lien?: string
  boutique?: string
  laize?: number
  composition?: string
  couleur?: string
  photo?: string
  achete?: boolean
}

export interface Projet {
  id: string
  nom: string
  description?: string
  statut: StatutProjet
  dateLimite?: string // YYYY-MM-DD
  creeLe: string
  patrons: PatronDansProjet[]
  sessions: Session[]
  /** estimation manuelle (remplace la somme des patrons) */
  heuresManuelles?: number
  /** ancien champ texte libre, conservé pour les projets existants */
  tissuNotes?: string
  tissus?: Tissu[]
  image?: string
}

export interface CatalogueFichier {
  version: number
  misAJour: string
  patrons: Patron[]
}

/** Mon avis personnel sur un patron (catalogue ou perso) */
export interface Avis {
  note?: number // 1 à 5
  cousu: boolean
  taille?: string
  commentaire?: string
  photos: string[] // mes réalisations (data URL compressées)
  date: string
}

export interface AppState {
  projets: Projet[]
  patronsPerso: Patron[]
  favoris: string[]
  avis: Record<string, Avis>
  catalogueDistant?: CatalogueFichier
}
