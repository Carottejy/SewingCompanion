import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { Icone } from '../ui'
import { aujourdhui, compresserImage, formatDate } from '../lib'
import { chargerPhoto } from '../apercu'
import { ouvrirLien } from '../native'
import type { Avis, Patron } from '../types'

const q = (s: string) => encodeURIComponent(s)

export function PhotoModele({ p }: { p: Patron }) {
  const [src, setSrc] = useState<string | null | undefined>(p.image ?? undefined)
  const [ko, setKo] = useState(false)
  useEffect(() => {
    if (p.image) return
    let vivant = true
    chargerPhoto(p).then((s) => vivant && setSrc(s))
    return () => {
      vivant = false
    }
  }, [p])

  if (src === undefined) return <div className="photo-modele chargement-photo" aria-hidden="true" />
  if (!src || ko)
    return (
      <button className="photo-absente" onClick={() => ouvrirLien(`https://www.google.com/search?tbm=isch&q=${q(`${p.marque} ${p.nom} sewing pattern`)}`)}>
        <Icone n="photo" />
        <span>Voir des photos du modèle</span>
        <small>Recherche d’images sur le web</small>
      </button>
    )
  return (
    <figure className="photo-modele">
      <img src={src} alt={`Modèle ${p.nom}`} onError={() => setKo(true)} referrerPolicy="no-referrer" />
      {!p.image && (
        <figcaption>
          Photo : {p.marque} ·{' '}
          <button className="btn lien petit" onClick={() => ouvrirLien(p.url)}>
            voir la fiche
          </button>
        </figcaption>
      )}
    </figure>
  )
}

export function Etoiles({ n, onChange, taille = 'normal' }: { n?: number; onChange?: (v: number) => void; taille?: 'petit' | 'normal' }) {
  return (
    <span className={'etoiles ' + taille} role={onChange ? 'radiogroup' : undefined} aria-label={n ? `${n} étoiles sur 5` : 'Pas encore noté'}>
      {[1, 2, 3, 4, 5].map((i) =>
        onChange ? (
          <button key={i} type="button" role="radio" aria-checked={n === i} aria-label={`${i} étoile${i > 1 ? 's' : ''}`} className={i <= (n ?? 0) ? 'pleine' : ''} onClick={() => onChange(n === i ? 0 : i)}>
            ★
          </button>
        ) : (
          <i key={i} className={i <= (n ?? 0) ? 'pleine' : ''}>
            ★
          </i>
        ),
      )}
    </span>
  )
}

export function MonAvis({ p }: { p: Patron }) {
  const { state, majAvis } = useStore()
  const a = state.avis[p.id]
  const [edition, setEdition] = useState(false)
  const [f, setF] = useState<Avis>(a ?? { cousu: false, photos: [], date: aujourdhui() })

  const enregistrer = (x: Avis) => {
    const vide = !x.note && !x.cousu && !x.taille && !x.commentaire && x.photos.length === 0
    majAvis(p.id, vide ? null : { ...x, note: x.note || undefined, date: aujourdhui() })
  }

  if (!edition) {
    return (
      <section className="bloc">
        <div className="bloc-titre">
          <h2>Mon avis</h2>
          <button
            className="btn petit"
            onClick={() => {
              setF(a ?? { cousu: false, photos: [], date: aujourdhui() })
              setEdition(true)
            }}
          >
            <Icone n="crayon" petite /> {a ? 'Modifier' : 'Donner mon avis'}
          </button>
        </div>
        {!a ? (
          <p className="note-discrete">Note ce patron, indique la taille cousue et ajoute des photos de ta réalisation.</p>
        ) : (
          <>
            <div className="avis-ligne">
              <Etoiles n={a.note} onChange={(v) => enregistrer({ ...a, note: v })} />
              {a.cousu && <span className="pastille gratuit">Cousu ✓</span>}
              {a.taille && <span className="pastille">Taille {a.taille}</span>}
            </div>
            {a.commentaire && <p className="texte-libre">{a.commentaire}</p>}
            {a.photos.length > 0 && (
              <div className="galerie">
                {a.photos.map((ph, i) => (
                  <img key={i} src={ph} alt={`Ma réalisation ${i + 1}`} />
                ))}
              </div>
            )}
            <p className="note-discrete">Mis à jour le {formatDate(a.date)}</p>
          </>
        )}
      </section>
    )
  }

  return (
    <section className="bloc">
      <h2>Mon avis</h2>
      <div className="formulaire">
        <label>
          Ma note
          <Etoiles n={f.note} onChange={(v) => setF({ ...f, note: v })} />
        </label>
        <label className="bascule">
          <input type="checkbox" checked={f.cousu} onChange={(e) => setF({ ...f, cousu: e.target.checked })} /> Je l’ai cousu
        </label>
        <label>
          Taille cousue
          <input value={f.taille ?? ''} placeholder="38, M, bonnet C…" onChange={(e) => setF({ ...f, taille: e.target.value || undefined })} />
        </label>
        <label>
          Mon commentaire
          <textarea rows={4} value={f.commentaire ?? ''} placeholder="Taille grand ? Explications claires ? Retouches faites ?" onChange={(e) => setF({ ...f, commentaire: e.target.value || undefined })} />
        </label>
        <div>
          <span className="etiquette">Photos de ma réalisation</span>
          <div className="galerie edition">
            {f.photos.map((ph, i) => (
              <span key={i} className="vignette-suppr">
                <img src={ph} alt={`Photo ${i + 1}`} />
                <button type="button" aria-label="Retirer la photo" onClick={() => setF({ ...f, photos: f.photos.filter((_, j) => j !== i) })}>
                  ×
                </button>
              </span>
            ))}
            {f.photos.length < 6 && (
              <label className="zone-photo mini">
                <Icone n="photo" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const fi = e.target.files?.[0]
                    if (fi) {
                      const img = await compresserImage(fi, 1000)
                      setF((x) => ({ ...x, photos: [...x.photos, img] }))
                    }
                    e.target.value = ''
                  }}
                />
              </label>
            )}
          </div>
        </div>
        <div className="deux-colonnes">
          <button type="button" className="btn" onClick={() => setEdition(false)}>
            Annuler
          </button>
          <button
            type="button"
            className="btn primaire"
            onClick={() => {
              enregistrer(f)
              setEdition(false)
            }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </section>
  )
}

export function AvisEnLigne({ p }: { p: Patron }) {
  const nom = `${p.marque} ${p.nom}`
  const liens = [
    { t: 'PatternReview', s: 'Avis détaillés de couturières', u: `https://www.google.com/search?q=${q(`site:patternreview.com ${nom}`)}` },
    { t: 'Blogs & tests', s: 'Articles « pattern review »', u: `https://www.google.com/search?q=${q(`${nom} pattern review`)}` },
    { t: 'Vidéos', s: 'Tests et cousus-main sur YouTube', u: `https://www.youtube.com/results?search_query=${q(`${nom} sewing`)}` },
    { t: 'Réalisations', s: 'Versions cousues par d’autres', u: `https://www.pinterest.com/search/pins/?q=${q(nom)}` },
  ]
  return (
    <section className="bloc">
      <h2>Avis de la communauté</h2>
      <p className="note-discrete">Les avis restent sur les sites où ils ont été publiés : ces liens les cherchent pour ce patron.</p>
      <div className="grille-liens">
        {liens.map((l) => (
          <button key={l.t} className="lien-carte" onClick={() => ouvrirLien(l.u)}>
            <strong>{l.t}</strong>
            <small>{l.s}</small>
          </button>
        ))}
      </div>
    </section>
  )
}
