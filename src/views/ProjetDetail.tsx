import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { BadgeEpoque, Difficulte, Entete, Feuille, Icone, Vide, useNav } from '../ui'
import {
  aujourdhui,
  correspond,
  bilanProjet,
  epoque,
  fmtH,
  fmtM,
  formatDate,
  libelleEcheance,
  moyenneHeures,
  plage,
  STATUTS_ETAPE,
  STATUTS_PROJET,
  uid,
} from '../lib'
import type { Projet, StatutEtape } from '../types'

export default function ProjetDetail({ id }: { id: string }) {
  const { state, trouverPatron, majProjet, supprimerProjet } = useStore()
  const nav = useNav()
  const [ajoutTemps, setAjoutTemps] = useState(false)
  const [choixPatron, setChoixPatron] = useState(false)
  const p = state.projets.find((x) => x.id === id)
  if (!p) return <div className="page"><Entete titre="Projet" retour /><Vide titre="Projet introuvable" texte="Il a peut-être été supprimé." /></div>

  const b = bilanProjet(p, trouverPatron)
  const ech = p.dateLimite ? libelleEcheance(p.dateLimite) : null
  const maj = (patch: Partial<Projet>) => majProjet({ ...p, ...patch })

  const changerEtape = (u: string, statut: StatutEtape) =>
    maj({ patrons: p.patrons.map((e) => (e.uid === u ? { ...e, statut } : e)) })

  return (
    <div className="page detail">
      <Entete
        titre=""
        retour
        actions={
          <button className="icone-btn" aria-label="Modifier le projet" onClick={() => nav.ouvrir({ nom: 'projetForm', id: p.id })}>
            <Icone n="crayon" />
          </button>
        }
      />
      {p.image && <img className="detail-image" src={p.image} alt={`Photo du projet ${p.nom}`} />}
      <div className="detail-tete">
        <h1 className="detail-titre">{p.nom}</h1>
        {p.description && <p className="detail-marque">{p.description}</p>}
      </div>

      <div className="segments statuts" role="radiogroup" aria-label="Statut du projet">
        {STATUTS_PROJET.map((s) => (
          <button key={s.id} role="radio" aria-checked={p.statut === s.id} className={p.statut === s.id ? 'actif ' + s.id : ''} onClick={() => maj({ statut: s.id })}>
            {s.label}
          </button>
        ))}
      </div>

      <section className="bloc tableau-bord">
        <div className="jauge">
          <div className="jauge-texte">
            <b>{fmtH(b.heuresPassees)}</b> passées sur <b>{fmtH(b.heuresEstimees)}</b> estimées
            {p.heuresManuelles === undefined && b.heuresMin !== b.heuresMax && (
              <small> (fourchette {plage(b.heuresMin, b.heuresMax, fmtH)})</small>
            )}
          </div>
          <div className="progression grande">
            <span style={{ width: `${b.progression * 100}%` }} />
          </div>
        </div>
        <div className="fiche-chiffres">
          <div>
            <span className="etiquette">Date limite</span>
            {p.dateLimite ? (
              <>
                <b>{formatDate(p.dateLimite)}</b>
                {p.statut !== 'termine' && <span className={'echeance ' + ech!.niveau}>{ech!.texte}</span>}
              </>
            ) : (
              <button className="btn lien petit" onClick={() => nav.ouvrir({ nom: 'projetForm', id: p.id })}>
                Ajouter
              </button>
            )}
          </div>
          <div>
            <span className="etiquette">Reste à coudre</span>
            <b>{fmtH(b.heuresRestantes)}</b>
            {b.heuresParSemaine !== undefined && <small>≈ {fmtH(b.heuresParSemaine)} / semaine</small>}
          </div>
          <div>
            <span className="etiquette">Tissu à prévoir</span>
            <b>{b.tissuMax ? plage(b.tissuMin, b.tissuMax, fmtM) : '—'}</b>
            <small>laize 150 cm</small>
          </div>
        </div>
        {p.statut !== 'termine' && (
          <button className="btn primaire large" onClick={() => setAjoutTemps(true)}>
            <Icone n="horloge" petite /> Noter du temps de couture
          </button>
        )}
      </section>

      <section className="bloc">
        <div className="bloc-titre">
          <h2>Patrons du projet</h2>
          <button className="btn petit" onClick={() => setChoixPatron(true)}>
            <Icone n="plus" petite /> Ajouter
          </button>
        </div>
        {p.patrons.length === 0 ? (
          <p className="note-discrete">Aucun patron pour l’instant : appuie sur « Ajouter » pour en choisir dans le catalogue ou parmi tes patrons.</p>
        ) : (
          <ul className="liste-etapes">
            {p.patrons.map((e) => {
              const pat = trouverPatron(e.patronId)
              return (
                <li key={e.uid} className={'etape ' + e.statut} style={{ ['--c' as string]: pat ? epoque(pat.epoque).couleur : '#999' }}>
                  <button className="etape-corps" onClick={() => pat && nav.ouvrir({ nom: 'patron', id: pat.id })}>
                    {pat ? (
                      <>
                        <BadgeEpoque p={pat} />
                        <strong>{pat.nom}</strong>
                        <span className="carte-chiffres">
                          <Difficulte n={pat.difficulte} />
                          <span>
                            <Icone n="horloge" petite /> {e.heures !== undefined ? fmtH(e.heures) : plage(pat.heuresMin, pat.heuresMax, fmtH)}
                          </span>
                          <span>
                            <Icone n="tissu" petite /> {plage(pat.tissuMin, pat.tissuMax, fmtM)}
                          </span>
                        </span>
                      </>
                    ) : (
                      <strong>Patron supprimé</strong>
                    )}
                  </button>
                  <div className="etape-actions">
                    <select
                      value={e.statut}
                      onChange={(ev) => changerEtape(e.uid, ev.target.value as StatutEtape)}
                      aria-label="Avancement de la pièce"
                    >
                      {STATUTS_ETAPE.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn lien petit"
                      onClick={() => {
                        const v = prompt(
                          'Temps estimé pour cette pièce (heures) — vide pour revenir à l’estimation du patron',
                          String(e.heures ?? (pat ? moyenneHeures(pat) : '')),
                        )
                        if (v === null) return
                        const n = parseFloat(v.replace(',', '.'))
                        maj({ patrons: p.patrons.map((x) => (x.uid === e.uid ? { ...x, heures: isNaN(n) ? undefined : n } : x)) })
                      }}
                    >
                      Ajuster le temps
                    </button>
                    <button
                      className="icone-btn petit"
                      aria-label="Retirer du projet"
                      onClick={() => confirm('Retirer ce patron du projet ?') && maj({ patrons: p.patrons.filter((x) => x.uid !== e.uid) })}
                    >
                      <Icone n="poubelle" petite />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {p.tissuNotes && (
        <section className="bloc">
          <h2>Tissus & fournitures</h2>
          <p className="texte-libre">{p.tissuNotes}</p>
        </section>
      )}

      <section className="bloc">
        <h2>Journal de couture</h2>
        {p.sessions.length === 0 ? (
          <p className="note-discrete">Note ton temps après chaque séance pour suivre l’avancement réel.</p>
        ) : (
          <ul className="journal">
            {[...p.sessions]
              .sort((a, z) => z.date.localeCompare(a.date))
              .map((s) => (
                <li key={s.id}>
                  <span>{formatDate(s.date)}</span>
                  <b>{fmtH(s.heures)}</b>
                  {s.note && <em>{s.note}</em>}
                  <button className="icone-btn petit" aria-label="Supprimer la séance" onClick={() => maj({ sessions: p.sessions.filter((x) => x.id !== s.id) })}>
                    <Icone n="poubelle" petite />
                  </button>
                </li>
              ))}
          </ul>
        )}
      </section>

      <div className="actions-colonne">
        <button
          className="btn danger lien"
          onClick={() => {
            if (confirm(`Supprimer le projet « ${p.nom} » ?`)) {
              supprimerProjet(p.id)
              nav.retour()
            }
          }}
        >
          <Icone n="poubelle" petite /> Supprimer le projet
        </button>
      </div>

      {choixPatron && (
        <ChoixPatron
          onFermer={() => setChoixPatron(false)}
          onChoix={(pid) => {
            maj({ patrons: [...p.patrons, { uid: uid(), patronId: pid, statut: 'a_faire' }] })
            setChoixPatron(false)
            nav.toast('Patron ajouté au projet')
          }}
        />
      )}

      {ajoutTemps && (
        <AjoutTemps
          onFermer={() => setAjoutTemps(false)}
          onAjout={(heures, date, note) => {
            maj({
              sessions: [...p.sessions, { id: uid(), date, heures, note: note || undefined }],
              statut: p.statut === 'idee' ? 'en_cours' : p.statut,
            })
            setAjoutTemps(false)
            nav.toast(`${fmtH(heures)} ajoutée${heures >= 2 ? 's' : ''}`)
          }}
        />
      )}
    </div>
  )
}

function AjoutTemps({ onFermer, onAjout }: { onFermer: () => void; onAjout: (h: number, date: string, note: string) => void }) {
  const [h, setH] = useState(1)
  const [date, setDate] = useState(aujourdhui())
  const [note, setNote] = useState('')
  return (
    <Feuille titre="Temps de couture" onFermer={onFermer}>
      <div className="raccourcis">
        {[0.5, 1, 1.5, 2, 3, 4].map((v) => (
          <button key={v} className={'puce' + (h === v ? ' active' : '')} onClick={() => setH(v)}>
            {fmtH(v)}
          </button>
        ))}
      </div>
      <div className="formulaire">
        <label>
          Durée (heures)
          <input type="number" inputMode="decimal" min={0.25} step={0.25} value={h} onChange={(e) => setH(parseFloat(e.target.value) || 0)} />
        </label>
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          Note (facultatif)
          <input type="text" placeholder="Coupe du corsage, essayage…" value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <button className="btn primaire large" disabled={!h || !date} onClick={() => onAjout(h, date, note)}>
          <Icone n="check" petite /> Enregistrer
        </button>
      </div>
    </Feuille>
  )
}

function ChoixPatron({ onFermer, onChoix }: { onFermer: () => void; onChoix: (id: string) => void }) {
  const { catalogue, state } = useStore()
  const [q, setQ] = useState('')
  const liste = useMemo(() => {
    const r = catalogue.filter((x) => correspond(x, q))
    // favoris et patrons perso en premier
    const score = (id: string, perso?: boolean) => (perso ? 2 : 0) + (state.favoris.includes(id) ? 1 : 0)
    return r.sort((a, b) => score(b.id, b.perso) - score(a.id, a.perso)).slice(0, 60)
  }, [catalogue, q, state.favoris])
  return (
    <Feuille titre="Ajouter un patron" onFermer={onFermer}>
      <label className="champ-recherche" style={{ marginBottom: 12 }}>
        <Icone n="loupe" petite />
        <input type="search" autoFocus placeholder="Rechercher dans le catalogue…" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <div className="liste-choix">
        {liste.map((x) => (
          <button key={x.id} className="choix choix-patron" style={{ ['--c' as string]: epoque(x.epoque).couleur }} onClick={() => onChoix(x.id)}>
            <i className="pastille-c" />
            <span className="choix-texte">
              <strong>{x.nom}</strong>
              <small>
                {x.perso ? 'Mon patron · ' : state.favoris.includes(x.id) ? '★ ' : ''}
                {epoque(x.epoque).label} · {x.marque} · {plage(x.heuresMin, x.heuresMax, fmtH)}
              </small>
            </span>
            <Icone n="plus" petite />
          </button>
        ))}
        {liste.length === 0 && <p className="note-discrete">Aucun patron trouvé.</p>}
      </div>
    </Feuille>
  )
}
