import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { Session } from "../App";
import { COLORS, FONTS } from "../components/theme";
import { Union, enregistrerUnion, unionActiveDe } from "../lib/registre";
import { estDateValide, formaterDate } from "../utils/dates";

type ChampsPersonne = { prenom: string; nom: string; naissance: string };

const PERSONNE_VIDE: ChampsPersonne = { prenom: "", nom: "", naissance: "" };

// Alerte en temps réel : si prénom + nom correspondent à une union en cours,
// une bannière apparaît. Informative — le témoin reste décisionnaire.
function useAlerteUnion(prenom: string, nom: string): Union | null {
  const [alerte, setAlerte] = useState<Union | null>(null);
  useEffect(() => {
    if (!prenom.trim() || !nom.trim()) {
      setAlerte(null);
      return;
    }
    const minuteur = setTimeout(() => {
      unionActiveDe(prenom, nom).then(setAlerte).catch(() => setAlerte(null));
    }, 350);
    return () => clearTimeout(minuteur);
  }, [prenom, nom]);
  return alerte;
}

function BlocPersonne({
  titre,
  valeur,
  onChange,
  alerte,
}: {
  titre: string;
  valeur: ChampsPersonne;
  onChange: (v: ChampsPersonne) => void;
  alerte: Union | null;
}) {
  return (
    <View style={styles.bloc}>
      <Text style={styles.blocTitre}>{titre}</Text>
      <View style={styles.rangee}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Prénom"
          placeholderTextColor={COLORS.soft}
          value={valeur.prenom}
          onChangeText={(t) => onChange({ ...valeur, prenom: t })}
          autoCorrect={false}
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Nom"
          placeholderTextColor={COLORS.soft}
          value={valeur.nom}
          onChangeText={(t) => onChange({ ...valeur, nom: t })}
          autoCorrect={false}
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Date de naissance — AAAA-MM-JJ"
        placeholderTextColor={COLORS.soft}
        value={valeur.naissance}
        onChangeText={(t) => onChange({ ...valeur, naissance: t })}
        autoCorrect={false}
      />
      {alerte && (
        <View style={styles.alerte}>
          <Text style={styles.alerteTexte}>
            ⚠ {valeur.prenom.trim()} {valeur.nom.trim()} a déjà une union en cours
            (depuis le {formaterDate(alerte.date_mariage)}).
          </Text>
        </View>
      )}
    </View>
  );
}

type Props = { session: Session; onVoirUnions: () => void };

export default function RegisterUnionScreen({ session, onVoirUnions }: Props) {
  const [epoux, setEpoux] = useState(PERSONNE_VIDE);
  const [epouse, setEpouse] = useState(PERSONNE_VIDE);
  const [date, setDate] = useState("");
  const [lieu, setLieu] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const alerteEpoux = useAlerteUnion(epoux.prenom, epoux.nom);
  const alerteEpouse = useAlerteUnion(epouse.prenom, epouse.nom);

  const incomplet =
    !epoux.prenom.trim() || !epoux.nom.trim() || !epoux.naissance ||
    !epouse.prenom.trim() || !epouse.nom.trim() || !epouse.naissance || !date;

  const soumettre = async () => {
    setErreur(null);
    if (incomplet) return;
    for (const [role, p] of [["lui", epoux], ["elle", epouse]] as const) {
      if (!estDateValide(p.naissance)) {
        setErreur(`Date de naissance invalide pour « ${role} » (format AAAA-MM-JJ).`);
        return;
      }
    }
    if (!estDateValide(date)) {
      setErreur("Date de la cérémonie invalide (format AAAA-MM-JJ).");
      return;
    }
    setLoading(true);
    try {
      await enregistrerUnion({
        epoux: { prenom: epoux.prenom, nom: epoux.nom, date_naissance: epoux.naissance },
        epouse: { prenom: epouse.prenom, nom: epouse.nom, date_naissance: epouse.naissance },
        date_mariage: date,
        lieu,
        temoin: session.nom,
      });
      setEnvoye(true);
    } catch (e: any) {
      setErreur(e.message ?? "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const recommencer = () => {
    setEpoux(PERSONNE_VIDE);
    setEpouse(PERSONNE_VIDE);
    setDate("");
    setLieu("");
    setEnvoye(false);
    setErreur(null);
  };

  if (envoye) {
    return (
      <View style={styles.succes}>
        <View style={styles.succesRond}>
          <Text style={styles.succesCoche}>✓</Text>
        </View>
        <Text style={styles.succesTitre}>Union enregistrée</Text>
        <Text style={styles.succesTexte}>
          {epoux.prenom} {epoux.nom} & {epouse.prenom} {epouse.nom} — c'est inscrit au registre.
        </Text>
        <Pressable style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]} onPress={recommencer}>
          <Text style={styles.ctaTexte}>Enregistrer une autre union</Text>
        </Pressable>
        <Pressable onPress={onVoirUnions}>
          <Text style={styles.lien}>Voir le registre</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.titre}>Enregistrer une union</Text>
      <Text style={styles.sousTitre}>
        Trois informations par personne, la date, et c'est inscrit.
      </Text>

      <BlocPersonne titre="Lui" valeur={epoux} onChange={setEpoux} alerte={alerteEpoux} />
      <BlocPersonne titre="Elle" valeur={epouse} onChange={setEpouse} alerte={alerteEpouse} />

      <View style={styles.bloc}>
        <Text style={styles.blocTitre}>La cérémonie</Text>
        <View style={styles.rangee}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Date — AAAA-MM-JJ"
            placeholderTextColor={COLORS.soft}
            value={date}
            onChangeText={setDate}
            autoCorrect={false}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Lieu (optionnel)"
            placeholderTextColor={COLORS.soft}
            value={lieu}
            onChangeText={setLieu}
            autoCorrect={false}
          />
        </View>
        <Text style={styles.temoin}>Témoin : {session.nom}</Text>
      </View>

      {erreur && <Text style={styles.erreur}>{erreur}</Text>}

      <Pressable
        style={({ pressed }) => [
          styles.cta,
          (incomplet || loading) && { opacity: 0.4 },
          pressed && !incomplet && { opacity: 0.9 },
        ]}
        onPress={soumettre}
        disabled={incomplet || loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.onAccent} />
        ) : (
          <Text style={styles.ctaTexte}>Inscrire au registre</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  titre: { fontFamily: FONTS.extrabold, fontSize: 24, color: COLORS.text, marginBottom: 4 },
  sousTitre: { fontFamily: FONTS.regular, fontSize: 14.5, color: COLORS.muted, marginBottom: 20 },

  bloc: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    gap: 10,
  },
  blocTitre: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 0.6 },
  rangee: { flexDirection: "row", gap: 10 },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 50,
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  temoin: { fontFamily: FONTS.semibold, fontSize: 13, color: COLORS.muted },

  alerte: { backgroundColor: COLORS.warningBg, borderRadius: 10, padding: 12 },
  alerteTexte: { color: COLORS.warningText, fontFamily: FONTS.semibold, fontSize: 13, lineHeight: 19 },

  erreur: { color: COLORS.danger, fontFamily: FONTS.semibold, fontSize: 13, marginBottom: 10, textAlign: "center" },

  cta: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  ctaTexte: { color: COLORS.onAccent, fontFamily: FONTS.bold, fontSize: 16 },
  lien: { color: COLORS.muted, fontFamily: FONTS.semibold, fontSize: 14, textDecorationLine: "underline", marginTop: 18, textAlign: "center" },

  succes: { alignItems: "center", paddingTop: 40, gap: 8 },
  succesRond: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  succesCoche: { fontSize: 34, color: COLORS.accent, fontFamily: FONTS.extrabold },
  succesTitre: { fontFamily: FONTS.extrabold, fontSize: 22, color: COLORS.text },
  succesTexte: { fontFamily: FONTS.regular, fontSize: 15, color: COLORS.muted, textAlign: "center", marginBottom: 18, lineHeight: 22 },
});
