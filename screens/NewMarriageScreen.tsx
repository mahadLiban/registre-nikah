import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Select from "../components/Select";
import { COLORS, FONTS } from "../components/theme";
import {
  Mariage,
  Mosquee,
  conflitActif,
  enregistrerMariage,
  listerMosquees,
} from "../lib/registre";
import { estDateValide, formaterDate } from "../utils/dates";

type ChampsPersonne = { prenom: string; nom: string; naissance: string };

const PERSONNE_VIDE: ChampsPersonne = { prenom: "", nom: "", naissance: "" };

function Champ({
  label,
  valeur,
  onChange,
  placeholder,
  demi,
}: {
  label: string;
  valeur: string;
  onChange: (t: string) => void;
  placeholder?: string;
  demi?: boolean;
}) {
  return (
    <View style={[demi && { flexGrow: 1, flexBasis: 140 }]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={valeur}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSoft}
        autoCorrect={false}
      />
    </View>
  );
}

// Vérification de conflit en temps réel : dès que prénom + nom correspondent
// à une union active existante, une bannière d'avertissement apparaît
// (informatif — n'empêche pas l'enregistrement, l'imam reste décisionnaire).
function useConflit(prenom: string, nom: string): Mariage | null {
  const [conflit, setConflit] = useState<Mariage | null>(null);
  useEffect(() => {
    if (!prenom.trim() || !nom.trim()) {
      setConflit(null);
      return;
    }
    const minuteur = setTimeout(() => {
      conflitActif(prenom, nom).then(setConflit).catch(() => setConflit(null));
    }, 350);
    return () => clearTimeout(minuteur);
  }, [prenom, nom]);
  return conflit;
}

export default function NewMarriageScreen() {
  const [mosquees, setMosquees] = useState<Mosquee[]>([]);
  const [mari, setMari] = useState(PERSONNE_VIDE);
  const [epouse, setEpouse] = useState(PERSONNE_VIDE);
  const [date, setDate] = useState("");
  const [lieu, setLieu] = useState("");
  const [mosqueeId, setMosqueeId] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    listerMosquees().then(setMosquees).catch(() => setMosquees([]));
  }, []);

  const conflitMari = useConflit(mari.prenom, mari.nom);
  const conflitEpouse = useConflit(epouse.prenom, epouse.nom);

  const mosqueeChoisie = mosquees.find((m) => m.id === mosqueeId) ?? null;
  const incomplet =
    !mari.prenom.trim() || !mari.nom.trim() || !epouse.prenom.trim() || !epouse.nom.trim() ||
    !date || !mosqueeId;

  const soumettre = async () => {
    setErreur(null);
    if (incomplet || !mosqueeChoisie) return;
    for (const [role, p] of [["l'époux", mari], ["l'épouse", epouse]] as const) {
      if (!estDateValide(p.naissance)) {
        setErreur(`Date de naissance invalide pour ${role} (format AAAA-MM-JJ).`);
        return;
      }
    }
    if (!estDateValide(date)) {
      setErreur("Date du mariage invalide (format AAAA-MM-JJ).");
      return;
    }
    setLoading(true);
    try {
      await enregistrerMariage({
        epoux: { prenom: mari.prenom, nom: mari.nom, date_naissance: mari.naissance },
        epouse: { prenom: epouse.prenom, nom: epouse.nom, date_naissance: epouse.naissance },
        date_mariage: date,
        lieu,
        mosquee: mosqueeChoisie,
      });
      setEnvoye(true);
    } catch (e: any) {
      setErreur(e.message ?? "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const reinitialiser = () => {
    setMari(PERSONNE_VIDE);
    setEpouse(PERSONNE_VIDE);
    setDate("");
    setLieu("");
    setMosqueeId("");
    setEnvoye(false);
    setErreur(null);
  };

  return (
    <View style={{ maxWidth: 640 }}>
      <Text style={styles.h1}>Nouveau mariage religieux</Text>
      <Text style={styles.sousTitre}>Enregistrer une union célébrée par un imam.</Text>

      {envoye && (
        <View style={styles.bandeauSucces}>
          <Text style={styles.bandeauSuccesTexte}>Mariage enregistré avec succès.</Text>
          <Pressable onPress={reinitialiser}>
            <Text style={styles.lien}>Enregistrer un autre</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitre}>L'ÉPOUX</Text>
        <View style={styles.rangee}>
          <Champ demi label="Prénom" valeur={mari.prenom} onChange={(t) => setMari({ ...mari, prenom: t })} />
          <Champ demi label="Nom" valeur={mari.nom} onChange={(t) => setMari({ ...mari, nom: t })} />
        </View>
        <Champ
          label="Date de naissance"
          valeur={mari.naissance}
          onChange={(t) => setMari({ ...mari, naissance: t })}
          placeholder="AAAA-MM-JJ"
        />
        {conflitMari && (
          <View style={styles.avertissement}>
            <Text style={styles.avertissementTexte}>
              ⚠ {mari.prenom.trim()} {mari.nom.trim()} est déjà enregistré(e) comme marié(e)
              (depuis le {formaterDate(conflitMari.date_mariage)}).
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitre}>L'ÉPOUSE</Text>
        <View style={styles.rangee}>
          <Champ demi label="Prénom" valeur={epouse.prenom} onChange={(t) => setEpouse({ ...epouse, prenom: t })} />
          <Champ demi label="Nom" valeur={epouse.nom} onChange={(t) => setEpouse({ ...epouse, nom: t })} />
        </View>
        <Champ
          label="Date de naissance"
          valeur={epouse.naissance}
          onChange={(t) => setEpouse({ ...epouse, naissance: t })}
          placeholder="AAAA-MM-JJ"
        />
        {conflitEpouse && (
          <View style={styles.avertissement}>
            <Text style={styles.avertissementTexte}>
              ⚠ {epouse.prenom.trim()} {epouse.nom.trim()} est déjà enregistrée comme mariée
              (depuis le {formaterDate(conflitEpouse.date_mariage)}).
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitre}>LA CÉRÉMONIE</Text>
        <View style={styles.rangee}>
          <Champ demi label="Date du mariage" valeur={date} onChange={setDate} placeholder="AAAA-MM-JJ" />
          <Champ demi label="Lieu" valeur={lieu} onChange={setLieu} placeholder="Ville" />
        </View>
        <Text style={styles.label}>Mosquée officiante</Text>
        <Select
          placeholder="Sélectionner une mosquée…"
          value={mosqueeId}
          options={mosquees.map((m) => ({ value: m.id, label: `${m.nom} — ${m.ville}` }))}
          onChange={setMosqueeId}
        />
        <Text style={styles.imamInfo}>
          Imam officiant : {mosqueeChoisie ? mosqueeChoisie.imam : "—"}
        </Text>
        {mosquees.length === 0 && (
          <Text style={styles.imamInfo}>
            Aucune mosquée enregistrée — ajoutez-en une dans « Mosquées & imams ».
          </Text>
        )}
      </View>

      {erreur && <Text style={styles.erreur}>{erreur}</Text>}

      <Pressable
        style={({ pressed }) => [
          styles.btnPrimaire,
          (incomplet || loading) && { opacity: 0.45 },
          pressed && !incomplet && { opacity: 0.88 },
        ]}
        onPress={soumettre}
        disabled={incomplet || loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.onAccent} />
        ) : (
          <Text style={styles.btnPrimaireTexte}>Enregistrer le mariage</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: FONTS.serif, fontSize: 32, color: COLORS.text, marginBottom: 6 },
  sousTitre: { fontSize: 15, color: COLORS.textMuted, fontFamily: FONTS.regular, marginBottom: 28 },

  bandeauSucces: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    backgroundColor: COLORS.successBg,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  bandeauSuccesTexte: { color: COLORS.successText, fontSize: 14, fontFamily: FONTS.regular, flexShrink: 1 },
  lien: {
    color: COLORS.successText,
    fontSize: 13,
    fontFamily: FONTS.semibold,
    textDecorationLine: "underline",
  },

  section: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 22,
    paddingHorizontal: 24,
    marginBottom: 18,
  },
  sectionTitre: {
    fontSize: 13,
    letterSpacing: 0.8,
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    marginBottom: 14,
  },
  rangee: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginBottom: 14 },

  label: { fontSize: 12, color: COLORS.textMuted, fontFamily: FONTS.regular, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },

  avertissement: {
    marginTop: 12,
    backgroundColor: COLORS.warningBg,
    borderWidth: 1,
    borderColor: COLORS.warningBorder,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  avertissementTexte: { fontSize: 13, lineHeight: 19, color: COLORS.warningText, fontFamily: FONTS.regular },

  imamInfo: { fontSize: 13, color: COLORS.textMuted, fontFamily: FONTS.regular, marginTop: 10 },
  erreur: { color: COLORS.red, fontFamily: FONTS.medium, fontSize: 13, marginBottom: 10 },

  btnPrimaire: {
    backgroundColor: COLORS.accent,
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  btnPrimaireTexte: { color: COLORS.onAccent, fontSize: 15, fontFamily: FONTS.semibold },
});
