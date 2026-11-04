import { useState } from 'react'
import { Feuille, Icone } from '../ui'
import { ignorerVersion, installer, type MiseAJour } from '../maj'

export default function FeuilleMiseAJour({ maj, onFermer }: { maj: MiseAJour; onFermer: () => void }) {
  const [pct, setPct] = useState<number | null>(null)
  const [erreur, setErreur] = useState<string>()
  const enCours = pct !== null && pct < 100 && !erreur

  const lancer = async () => {
    setErreur(undefined)
    setPct(0)
    try {
      await installer(maj, setPct)
      setPct(100)
    } catch (e) {
      setErreur((e as Error).message + ' — le téléchargement a été ouvert dans le navigateur.')
    }
  }

  return (
    <Feuille titre="Nouvelle version disponible" onFermer={enCours ? () => {} : onFermer}>
      <p>
        <b>Sewing Companion {maj.version}</b> · {(maj.taille / 1e6).toFixed(1).replace('.', ',')} Mo
      </p>
      <p className="note-discrete">
        La mise à jour s’installe par-dessus la version actuelle : tes projets et patrons sont conservés. Android te demandera de
        confirmer l’installation (et, la première fois, d’autoriser Sewing Companion à installer des applications).
      </p>
      {pct !== null && (
        <div className="jauge" style={{ margin: '14px 0' }}>
          <div className="jauge-texte">{pct >= 100 ? 'Téléchargé : confirme l’installation' : `Téléchargement… ${pct} %`}</div>
          <div className="progression grande">
            <span style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
      {erreur && <p className="message erreur">{erreur}</p>}
      <div className="actions-colonne" style={{ marginTop: 12 }}>
        <button className="btn primaire large" disabled={enCours} onClick={lancer}>
          <Icone n="check" petite /> {pct !== null && pct >= 100 ? 'Relancer l’installation' : 'Mettre à jour maintenant'}
        </button>
        {!enCours && (
          <button
            className="btn lien"
            onClick={() => {
              ignorerVersion(maj.version)
              onFermer()
            }}
          >
            Plus tard
          </button>
        )}
      </div>
    </Feuille>
  )
}
