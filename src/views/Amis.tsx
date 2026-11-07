import { useCallback, useEffect, useMemo, useState } from 'react'
import { Share } from '@capacitor/share'
import { useStore } from '../store'
import { Entete, Feuille, Icone, Vide, useNav } from '../ui'
import { correspond0, fmtM } from '../lib'
import { estNatif, ouvrirLien } from '../native'
import { api, nouveauSecret, publierStock, signalerDemandes, useEtatSync, type Amie, type StockAmie } from '../amis'
import { coutTissu, euro, LigneArticle, qte } from './Tissus'
import { aEtiquette, Etiquette } from './Etiquettes'
import type { Tissu } from '../types'

const depuis = (iso: string | null) => {
  if (!iso) return 'jamais'
  const d = new Date(iso)
  const min = Math.round((Date.now() - d.getTime()) / 60000)
  if (min < 1) return 'à l’instant'
  if (min < 60) return `il y a ${min} min`
  if (min < 60 * 24) return `il y a ${Math.round(min / 60)} h`
  return 'le ' + d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}

export default function Amis() {
  const { state, definirCompte } = useStore()
  const nav = useNav()
  const compte = state.compte
  const sync = useEtatSync()
  const [amis, setAmis] = useState<Amie[] | null>(null)
  const [erreur, setErreur] = useState<string>()
  const [code, setCode] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [occupe, setOccupe] = useState(false)
  const [reglages, setReglages] = useState(false)

  const charger = useCallback(async () => {
    if (!compte) return
    try {
      const a = await api.amis(compte.secret)
      setAmis(a)
      signalerDemandes(a.filter((x) => x.etat === 'recue').length)
      setErreur(undefined)
    } catch (e) {
      setErreur((e as Error).message)
    }
  }, [compte])

  useEffect(() => {
    charger()
  }, [charger])

  if (!compte) {
    return (
      <div className="page">
        <Entete titre="Amies" retour />
        <section className="bloc intro-amis">
          <h2>Partage ton stock avec tes amies</h2>
          <p>
            Crée ton profil avec un simple pseudo : tu reçois un <b>code ami</b> à donner aux personnes de ton choix. Une fois amies, vous voyez le
            stock de tissus et fournitures l’une de l’autre, mis à jour automatiquement.
          </p>
          <p className="note-discrete">
            Pas d’email ni de mot de passe. Seul ton stock est partagé (jamais tes projets ni tes notes de projet), et seulement avec tes amies
            acceptées. Tu peux arrêter le partage ou supprimer ton profil à tout moment.
          </p>
          <form
            className="formulaire"
            onSubmit={async (e) => {
              e.preventDefault()
              if (!pseudo.trim()) return
              setOccupe(true)
              try {
                const secret = nouveauSecret()
                const p = await api.inscrire(secret, pseudo.trim())
                const c = { secret, id: p.id, code: p.code, pseudo: p.pseudo, partage: p.partage }
                definirCompte(c)
                await publierStock(c, state.stock)
                nav.toast('Profil créé')
              } catch (err) {
                setErreur((err as Error).message)
              } finally {
                setOccupe(false)
              }
            }}
          >
            <label>
              Ton pseudo
              <input value={pseudo} maxLength={30} placeholder="Marie couture" onChange={(e) => setPseudo(e.target.value)} />
            </label>
            <button className="btn primaire large" disabled={!pseudo.trim() || occupe}>
              {occupe ? 'Création…' : 'Créer mon profil'}
            </button>
          </form>
          {erreur && <p className="message erreur">{erreur}</p>}
        </section>
      </div>
    )
  }

  const recues = amis?.filter((a) => a.etat === 'recue') ?? []
  const envoyees = amis?.filter((a) => a.etat === 'envoyee') ?? []
  const amies = amis?.filter((a) => a.etat === 'amie') ?? []

  const partagerCode = async () => {
    const texte = `Ajoute-moi sur Sewing Companion avec mon code ami : ${compte.code}`
    try {
      if (estNatif()) await Share.share({ title: 'Mon code ami', text: texte, dialogTitle: 'Envoyer mon code ami' })
      else {
        await navigator.clipboard.writeText(compte.code)
        nav.toast('Code copié')
      }
    } catch {
      /* annulé */
    }
  }

  return (
    <div className="page">
      <Entete
        titre="Amies"
        retour
        actions={
          <button className="icone-btn" aria-label="Réglages du partage" onClick={() => setReglages(true)}>
            <Icone n="reglages" />
          </button>
        }
      />

      <section className="bloc carte-code">
        <span className="etiquette">Mon code ami</span>
        <div className="code-ami" aria-label={`Code ami ${compte.code.split('').join(' ')}`}>
          {compte.code}
        </div>
        <p className="note-discrete">
          {compte.pseudo} ·{' '}
          {compte.partage
            ? sync.enCours
              ? 'synchronisation…'
              : sync.erreur
                ? `stock non synchronisé (${sync.erreur})`
                : `stock partagé ${sync.derniere ? depuis(sync.derniere) : ''}`
            : 'partage du stock désactivé'}
        </p>
        <button className="btn large" onClick={partagerCode}>
          <Icone n="lien" petite /> Envoyer mon code
        </button>
      </section>

      <section className="bloc">
        <h2>Ajouter une amie</h2>
        <form
          className="ajout-code"
          onSubmit={async (e) => {
            e.preventDefault()
            const c = code.trim().toUpperCase()
            if (c.length !== 6) return
            setOccupe(true)
            try {
              const r = await api.demander(compte.secret, c)
              const msg = {
                code_inconnu: 'Aucun profil avec ce code.',
                soi_meme: 'C’est ton propre code !',
                acceptee: 'Vous êtes maintenant amies 🎉',
                deja_demande: 'Demande déjà envoyée.',
                demandee: 'Demande envoyée : elle doit l’accepter.',
              }[r]
              nav.toast(msg)
              if (r !== 'code_inconnu' && r !== 'soi_meme') setCode('')
              await charger()
            } catch (err) {
              nav.toast((err as Error).message)
            } finally {
              setOccupe(false)
            }
          }}
        >
          <input
            value={code}
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            placeholder="CODE"
            aria-label="Code ami à 6 caractères"
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          />
          <button className="btn primaire" disabled={code.length !== 6 || occupe}>
            Ajouter
          </button>
        </form>
      </section>

      {erreur && (
        <p className="message erreur">
          {erreur}{' '}
          <button className="btn lien petit" onClick={charger}>
            Réessayer
          </button>
        </p>
      )}

      {recues.length > 0 && (
        <section className="bloc">
          <h2>Demandes reçues</h2>
          <ul className="liste-amis">
            {recues.map((a) => (
              <li key={a.id}>
                <span className="avatar">{a.pseudo.slice(0, 1).toUpperCase()}</span>
                <span className="ami-texte">
                  <strong>{a.pseudo}</strong>
                  <small>veut devenir ton amie</small>
                </span>
                <button
                  className="btn primaire petit"
                  onClick={async () => {
                    await api.repondre(compte.secret, a.id, true).catch((e) => nav.toast(e.message))
                    charger()
                  }}
                >
                  Accepter
                </button>
                <button
                  className="icone-btn petit"
                  aria-label="Refuser"
                  onClick={async () => {
                    await api.repondre(compte.secret, a.id, false).catch((e) => nav.toast(e.message))
                    charger()
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bloc">
        <h2>Mes amies</h2>
        {amis === null && !erreur ? (
          <p className="note-discrete">Chargement…</p>
        ) : amies.length === 0 ? (
          <p className="note-discrete">Pas encore d’amie. Envoie ton code ou ajoute celui d’une amie.</p>
        ) : (
          <ul className="liste-amis">
            {amies.map((a) => (
              <li key={a.id}>
                <button className="ami-ligne" onClick={() => nav.ouvrir({ nom: 'stockAmi', id: a.id, pseudo: a.pseudo })}>
                  <span className="avatar">{a.pseudo.slice(0, 1).toUpperCase()}</span>
                  <span className="ami-texte">
                    <strong>{a.pseudo}</strong>
                    <small>
                      {a.partage
                        ? `${a.articles ?? 0} article${(a.articles ?? 0) > 1 ? 's' : ''} · mis à jour ${depuis(a.stock_maj)}`
                        : 'ne partage pas son stock pour l’instant'}
                    </small>
                  </span>
                  <Icone n="retour" petite />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {envoyees.length > 0 && (
        <section className="bloc">
          <h2>En attente</h2>
          <ul className="liste-amis">
            {envoyees.map((a) => (
              <li key={a.id}>
                <span className="avatar pale">{a.pseudo.slice(0, 1).toUpperCase()}</span>
                <span className="ami-texte">
                  <strong>{a.pseudo}</strong>
                  <small>n’a pas encore accepté</small>
                </span>
                <button
                  className="btn lien petit"
                  onClick={async () => {
                    await api.retirer(compte.secret, a.id).catch((e) => nav.toast(e.message))
                    charger()
                  }}
                >
                  Annuler
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {reglages && <ReglagesPartage onFermer={() => setReglages(false)} onChange={charger} />}
    </div>
  )
}

function ReglagesPartage({ onFermer, onChange }: { onFermer: () => void; onChange: () => void }) {
  const { state, definirCompte } = useStore()
  const nav = useNav()
  const compte = state.compte!
  const [pseudo, setPseudo] = useState(compte.pseudo)
  const enregistrer = async (p: string | null, partage: boolean | null) => {
    try {
      const r = await api.regler(compte.secret, p, partage)
      const c = { ...compte, pseudo: r.pseudo, partage: r.partage }
      definirCompte(c)
      await publierStock(c, state.stock)
      onChange()
    } catch (e) {
      nav.toast((e as Error).message)
    }
  }
  return (
    <Feuille titre="Partage" onFermer={onFermer}>
      <div className="formulaire">
        <label>
          Mon pseudo
          <span className="saisie-etiquette">
            <input value={pseudo} maxLength={30} onChange={(e) => setPseudo(e.target.value)} />
            <button className="btn petit" disabled={!pseudo.trim() || pseudo.trim() === compte.pseudo} onClick={() => enregistrer(pseudo.trim(), null)}>
              Enregistrer
            </button>
          </span>
        </label>
        <label className="bascule">
          <input type="checkbox" checked={compte.partage} onChange={(e) => enregistrer(null, e.target.checked)} /> Partager mon stock avec mes amies
        </label>
        <p className="note-discrete">
          Ton stock (articles disponibles, avec photos réduites) est envoyé sur le serveur à chaque modification. Désactiver le partage l’efface du
          serveur. Ton profil est inclus dans la sauvegarde exportée depuis les Réglages : restaure-la sur un nouveau téléphone pour garder tes
          amies.
        </p>
        <button
          className="btn danger lien"
          onClick={async () => {
            if (!confirm('Supprimer ton profil en ligne ? Tes amitiés et ton stock partagé seront effacés du serveur (ton stock reste sur ton téléphone).'))
              return
            try {
              await api.supprimer(compte.secret)
              definirCompte(undefined)
              signalerDemandes(0)
              onFermer()
              nav.retour()
              nav.toast('Profil supprimé')
            } catch (e) {
              nav.toast((e as Error).message)
            }
          }}
        >
          <Icone n="poubelle" petite /> Supprimer mon profil en ligne
        </button>
      </div>
    </Feuille>
  )
}

/* ---------- stock d'une amie (lecture seule) ---------- */
export function StockAmi({ id, pseudo }: { id: string; pseudo: string }) {
  const { state } = useStore()
  const [donnees, setDonnees] = useState<StockAmie | null>(null)
  const [erreur, setErreur] = useState<string>()
  const [q, setQ] = useState('')
  const [filtre, setFiltre] = useState<'tous' | 'tissu' | 'fourniture'>('tous')
  const [etiq, setEtiq] = useState<string[]>([])
  const [detail, setDetail] = useState<Tissu | null>(null)
  const nav = useNav()
  const compte = state.compte

  useEffect(() => {
    if (!compte) return
    api
      .stockAmie(compte.secret, id)
      .then(setDonnees)
      .catch((e) => setErreur((e as Error).message === 'pas amies' ? 'Vous n’êtes plus amies.' : (e as Error).message))
  }, [compte, id])

  const stock = useMemo(() => donnees?.stock ?? [], [donnees])
  const etiquettes = useMemo(() => [...new Set(stock.flatMap((t) => t.etiquettes ?? []))].sort((a, b) => a.localeCompare(b, 'fr')), [stock])
  const liste = stock.filter(
    (t) =>
      (filtre === 'tous' || (filtre === 'fourniture' ? t.role === 'fourniture' : t.role !== 'fourniture')) &&
      etiq.every((e) => aEtiquette(t.etiquettes, e)) &&
      correspond0([t.nom, t.composition, t.boutique, t.origine, t.notes, ...(t.etiquettes ?? [])], q),
  )
  const metres = stock.filter((t) => t.unite === 'm' && t.role !== 'fourniture').reduce((s, t) => s + t.quantite, 0)

  return (
    <div className="page">
      <Entete titre={`Stock de ${pseudo}`} sousTitre={donnees ? `mis à jour ${depuis(donnees.stock_maj)}` : undefined} retour />
      {erreur ? (
        <Vide titre="Stock indisponible" texte={erreur} />
      ) : !donnees ? (
        <p className="note-discrete">Chargement…</p>
      ) : !donnees.partage || stock.length === 0 ? (
        <Vide titre="Rien à voir" texte={donnees.partage ? `${pseudo} n’a rien dans son stock pour l’instant.` : `${pseudo} ne partage pas son stock en ce moment.`} />
      ) : (
        <>
          <div className="resume-tissus">
            <div>
              <span className="etiquette">Articles</span>
              <b>{stock.length}</b>
            </div>
            <div>
              <span className="etiquette">Tissus</span>
              <b>{fmtM(metres)}</b>
            </div>
          </div>
          <div className="barre-recherche">
            <label className="champ-recherche">
              <Icone n="loupe" petite />
              <input type="search" placeholder="Chercher dans son stock…" value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
          </div>
          <div className="segments sources">
            {(
              [
                ['tous', 'Tous'],
                ['tissu', 'Tissus'],
                ['fourniture', 'Fournitures'],
              ] as const
            ).map(([f, l]) => (
              <button key={f} className={filtre === f ? 'actif' : ''} onClick={() => setFiltre(f)}>
                {l}
              </button>
            ))}
          </div>
          {etiquettes.length > 0 && (
            <div className="puces-defilantes">
              {etiquettes.map((e) => (
                <Etiquette key={e} nom={e} actif={etiq.includes(e)} onClick={() => setEtiq(etiq.includes(e) ? etiq.filter((x) => x !== e) : [...etiq, e])} />
              ))}
            </div>
          )}
          <ul className="liste-tissus">
            {liste.map((t) => (
              <LigneArticle
                key={t.id}
                t={t}
                onClick={() => setDetail(t)}
                sousTitre={[t.composition, t.laize && `laize ${t.laize} cm`, t.origine].filter(Boolean).join(' · ')}
              />
            ))}
          </ul>
          {liste.length === 0 && <p className="note-discrete">Aucun article ne correspond.</p>}
        </>
      )}

      {detail && (
        <Feuille titre={detail.nom} onFermer={() => setDetail(null)}>
          {detail.photo && <img className="photo-detail" src={detail.photo} alt={`Photo de ${detail.nom}`} />}
          <div className="fiche-chiffres deux">
            <div>
              <span className="etiquette">Quantité</span>
              <b>{qte(detail)}</b>
            </div>
            <div>
              <span className="etiquette">Prix</span>
              <b>{detail.prix !== undefined ? `${euro(detail.prix)}${detail.unite === 'm' ? '/m' : ''}` : '—'}</b>
              {detail.prix !== undefined && <small>total {euro(coutTissu(detail))}</small>}
            </div>
          </div>
          <p>{[detail.composition, detail.laize && `laize ${detail.laize} cm`, detail.boutique, detail.origine].filter(Boolean).join(' · ')}</p>
          {detail.etiquettes && (
            <div className="ligne-etiquettes">
              {detail.etiquettes.map((e) => (
                <Etiquette key={e} nom={e} />
              ))}
            </div>
          )}
          {detail.notes && <p className="texte-libre">{detail.notes}</p>}
          <div className="actions-colonne">
            {detail.lien && (
              <button className="btn large" onClick={() => ouvrirLien(detail.lien!)}>
                <Icone n="lien" petite /> Voir chez le vendeur
              </button>
            )}
            <button
              className="btn lien"
              onClick={async () => {
                const texte = `Coucou ${pseudo} ! Je suis intéressée par ton « ${detail.nom} » (${qte(detail)}) vu dans ton stock Sewing Companion.`
                try {
                  if (estNatif()) await Share.share({ text: texte, dialogTitle: `Écrire à ${pseudo}` })
                  else {
                    await navigator.clipboard.writeText(texte)
                    nav.toast('Message copié')
                  }
                } catch {
                  /* annulé */
                }
              }}
            >
              Lui envoyer un message à propos de cet article
            </button>
          </div>
        </Feuille>
      )}
    </div>
  )
}
