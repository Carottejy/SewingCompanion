import { useState } from 'react'
import { useStore } from '../store'
import { BadgeEpoque, Difficulte, Entete, Feuille, Icone, Vide, useNav } from '../ui'
import { epoque, fmtH, fmtM, plage, PUBLICS, typeLabel, uid } from '../lib'
import { lienRecherche, ouvrirLien } from '../native'

export default function PatronDetail({ id }: { id: string }) {
  const { trouverPatron, state, basculerFavori, majProjet, supprimerPatronPerso } = useStore()
  const nav = useNav()
  const [choix, setChoix] = useState(false)
  const p = trouverPatron(id)
  if (!p) return <div className="page"><Entete titre="Patron" retour /><Vide titre="Patron introuvable" texte="Il a peut-être été supprimé." /></div>

  const favori = state.favoris.includes(p.id)
  const projetsOuverts = state.projets.filter((x) => x.statut !== 'termine')
  const utilisations = state.projets.filter((x) => x.patrons.some((e) => e.patronId === p.id))

  const ajouterA = (projetId: string) => {
    const pr = state.projets.find((x) => x.id === projetId)!
    majProjet({ ...pr, patrons: [...pr.patrons, { uid: uid(), patronId: p.id, statut: 'a_faire' }] })
    setChoix(false)
    nav.toast(`Ajouté à « ${pr.nom} »`)
  }

  return (
    <div className="page detail" style={{ ['--c' as string]: epoque(p.epoque).couleur }}>
      <Entete
        titre=""
        retour
        actions={
          <>
            {p.perso && (
              <button className="icone-btn" aria-label="Modifier" onClick={() => nav.ouvrir({ nom: 'patronForm', id: p.id })}>
                <Icone n="crayon" />
              </button>
            )}
            <button className={'icone-btn' + (favori ? ' favori' : '')} aria-label={favori ? 'Retirer des favoris' : 'Ajouter aux favoris'} onClick={() => basculerFavori(p.id)}>
              <Icone n={favori ? 'etoile-pleine' : 'etoile'} />
            </button>
          </>
        }
      />
      {p.image && <img className="detail-image" src={p.image} alt={`Photo du patron ${p.nom}`} />}
      <div className="detail-tete">
        <BadgeEpoque p={p} />
        <h1 className="detail-titre">{p.nom}</h1>
        <p className="detail-marque">
          {p.marque} · {typeLabel(p.type)} · {PUBLICS.find((x) => x.id === p.public)?.label}
          {p.gratuit && <span className="pastille gratuit">Gratuit</span>}
        </p>
      </div>

      <div className="fiche-chiffres">
        <div>
          <span className="etiquette">Difficulté</span>
          <Difficulte n={p.difficulte} avecTexte />
        </div>
        <div>
          <span className="etiquette">Temps estimé</span>
          <b>{plage(p.heuresMin, p.heuresMax, fmtH)}</b>
        </div>
        <div>
          <span className="etiquette">Tissu (laize 150)</span>
          <b>{plage(p.tissuMin, p.tissuMax, fmtM)}</b>
          <small>{p.sourceMetrage === 'editeur' ? 'd’après l’éditeur' : 'estimation'}</small>
        </div>
      </div>

      <section className="bloc">
        <p>{p.description}</p>
        {p.tissus && (
          <p>
            <span className="etiquette">Tissus conseillés</span>
            <br />
            {p.tissus}
          </p>
        )}
        {p.notes && (
          <p>
            <span className="etiquette">Mes notes</span>
            <br />
            {p.notes}
          </p>
        )}
        {!p.perso && (
          <p className="note-discrete">
            Temps et métrage indicatifs pour une taille moyenne : vérifie toujours le tableau de l’éditeur pour ta taille.
          </p>
        )}
      </section>

      <div className="actions-colonne">
        <button className="btn primaire large" onClick={() => setChoix(true)}>
          <Icone n="plus" petite /> Ajouter à un projet
        </button>
        {p.url && (
          <button className="btn large" onClick={() => ouvrirLien(p.url)}>
            <Icone n="lien" petite /> Voir le patron chez {p.perso ? 'la source' : p.marque}
          </button>
        )}
        {!p.perso && (
          <button className="btn lien" onClick={() => ouvrirLien(lienRecherche(`${p.marque} ${p.nom}`))}>
            <Icone n="loupe" petite /> Rechercher ce patron sur le web
          </button>
        )}
        {p.perso && (
          <button
            className="btn danger lien"
            onClick={() => {
              if (confirm(`Supprimer « ${p.nom} » ? Il sera aussi retiré des projets.`)) {
                supprimerPatronPerso(p.id)
                nav.retour()
              }
            }}
          >
            <Icone n="poubelle" petite /> Supprimer ce patron
          </button>
        )}
      </div>

      {utilisations.length > 0 && (
        <section className="bloc">
          <span className="etiquette">Utilisé dans</span>
          {utilisations.map((u) => (
            <button key={u.id} className="ligne-lien" onClick={() => nav.ouvrir({ nom: 'projet', id: u.id })}>
              {u.nom} <Icone n="retour" petite />
            </button>
          ))}
        </section>
      )}

      {choix && (
        <Feuille titre="Ajouter à…" onFermer={() => setChoix(false)}>
          <div className="liste-choix">
            {projetsOuverts.map((pr) => (
              <button key={pr.id} className="choix" onClick={() => ajouterA(pr.id)}>
                <strong>{pr.nom}</strong>
                <small>
                  {pr.patrons.length} patron{pr.patrons.length > 1 ? 's' : ''}
                </small>
              </button>
            ))}
            <button
              className="choix nouveau"
              onClick={() => {
                setChoix(false)
                nav.ouvrir({ nom: 'projetForm', ajouterPatron: p.id })
              }}
            >
              <Icone n="plus" petite /> <strong>Nouveau projet avec ce patron</strong>
            </button>
          </div>
        </Feuille>
      )}
    </div>
  )
}
