import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { Entete, Icone, Vide, useNav } from '../ui'
import { bilanProjet, epoque, fmtH, formatDate, libelleEcheance, statutLabel } from '../lib'
import type { Projet } from '../types'

type Filtre = 'actifs' | 'tous' | 'termines'

export default function Projets() {
  const { state, trouverPatron } = useStore()
  const nav = useNav()
  const [filtre, setFiltre] = useState<Filtre>('actifs')

  const liste = useMemo(() => {
    const r = state.projets.filter((p) =>
      filtre === 'tous' ? true : filtre === 'termines' ? p.statut === 'termine' : p.statut !== 'termine',
    )
    // les échéances les plus proches d'abord, puis sans date
    return r.sort((a, b) => {
      if (a.dateLimite && b.dateLimite) return a.dateLimite.localeCompare(b.dateLimite)
      if (a.dateLimite) return -1
      if (b.dateLimite) return 1
      return b.creeLe.localeCompare(a.creeLe)
    })
  }, [state.projets, filtre])

  const actifs = state.projets.filter((p) => p.statut !== 'termine')
  const totalRestant = actifs.reduce((s, p) => s + bilanProjet(p, trouverPatron).heuresRestantes, 0)
  const prochain = actifs.filter((p) => p.dateLimite).sort((a, b) => a.dateLimite!.localeCompare(b.dateLimite!))[0]

  return (
    <div className="page">
      <Entete
        titre="Mes projets"
        sousTitre={
          actifs.length
            ? `${actifs.length} en cours · environ ${fmtH(totalRestant)} de couture restantes`
            : 'Ton atelier de couture'
        }
      />

      {prochain && (
        <button className="encart-echeance" onClick={() => nav.ouvrir({ nom: 'projet', id: prochain.id })}>
          <span className="etiquette">Prochaine échéance</span>
          <strong>{prochain.nom}</strong>
          <span className={'echeance ' + libelleEcheance(prochain.dateLimite!).niveau}>
            {libelleEcheance(prochain.dateLimite!).texte} · {formatDate(prochain.dateLimite!)}
          </span>
        </button>
      )}

      {state.projets.length > 0 && (
        <div className="segments" role="tablist">
          {(
            [
              ['actifs', 'En cours'],
              ['termines', 'Terminés'],
              ['tous', 'Tous'],
            ] as [Filtre, string][]
          ).map(([f, l]) => (
            <button key={f} role="tab" aria-selected={filtre === f} className={filtre === f ? 'actif' : ''} onClick={() => setFiltre(f)}>
              {l}
            </button>
          ))}
        </div>
      )}

      {state.projets.length === 0 ? (
        <Vide
          titre="Aucun projet pour l’instant"
          texte="Crée un projet, fixe une date limite et ajoute-y un ou plusieurs patrons du catalogue."
          action={
            <div className="actions-colonne">
              <button className="btn primaire" onClick={() => nav.ouvrir({ nom: 'projetForm' })}>
                <Icone n="plus" petite /> Nouveau projet
              </button>
              <button className="btn" onClick={() => nav.allerOnglet('catalogue')}>
                Parcourir le catalogue
              </button>
            </div>
          }
        />
      ) : liste.length === 0 ? (
        <Vide titre="Rien ici" texte={filtre === 'termines' ? 'Aucun projet terminé pour le moment.' : 'Tous tes projets sont terminés, bravo !'} />
      ) : (
        <div className="liste-cartes">
          {liste.map((p) => (
            <CarteProjet key={p.id} p={p} />
          ))}
        </div>
      )}

      <button className="fab" onClick={() => nav.ouvrir({ nom: 'projetForm' })} aria-label="Nouveau projet">
        <Icone n="plus" />
      </button>
    </div>
  )
}

function CarteProjet({ p }: { p: Projet }) {
  const { trouverPatron } = useStore()
  const nav = useNav()
  const b = bilanProjet(p, trouverPatron)
  const ech = p.dateLimite ? libelleEcheance(p.dateLimite) : null
  const couleurs = [...new Set(p.patrons.map((e) => trouverPatron(e.patronId)?.epoque).filter(Boolean))]
    .slice(0, 4)
    .map((e) => epoque(e!).couleur)
  return (
    <button className={'carte-projet statut-' + p.statut} onClick={() => nav.ouvrir({ nom: 'projet', id: p.id })}>
      {p.image && <img src={p.image} alt="" className="carte-projet-image" />}
      <span className="carte-projet-haut">
        <span className={'pastille statut ' + p.statut}>{statutLabel(p.statut)}</span>
        {ech && p.statut !== 'termine' && <span className={'echeance ' + ech.niveau}>{ech.texte}</span>}
      </span>
      <strong className="carte-nom">{p.nom}</strong>
      <span className="carte-marque">
        {p.patrons.length === 0
          ? 'Aucun patron'
          : `${b.piecesFaites}/${b.piecesTotal} pièce${b.piecesTotal > 1 ? 's' : ''} terminée${b.piecesTotal > 1 ? "s" : ""}`}
        {couleurs.length > 0 && (
          <span className="mini-epoques">
            {couleurs.map((c) => (
              <i key={c} style={{ background: c }} />
            ))}
          </span>
        )}
      </span>
      <span className="progression" aria-label={`Progression ${Math.round(b.progression * 100)} %`}>
        <span style={{ width: `${b.progression * 100}%` }} />
      </span>
      <span className="carte-chiffres">
        <span>
          <Icone n="horloge" petite /> {fmtH(b.heuresPassees)} / {fmtH(b.heuresEstimees)}
        </span>
        {p.dateLimite && (
          <span>
            <Icone n="calendrier" petite /> {formatDate(p.dateLimite)}
          </span>
        )}
      </span>
    </button>
  )
}
