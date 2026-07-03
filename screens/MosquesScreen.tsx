import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { COLORS, FONTS } from "../components/theme";
import { Mosquee, ajouterMosquee, listerMosquees } from "../lib/registre";

type MosqueeAvecCompte = Mosquee & { nb_mariages: number };

export default function MosquesScreen() {
  const [mosquees, setMosquees] = useState<MosqueeAvecCompte[]>([]);
  const [chargement, setChargement] = useState(true);
  const [nom, setNom] = useState("");
  const [ville, setVille] = useState("");
  const [imam, setImam] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = async () => {
    try {
      setMosquees(await listerMosquees());
    } catch (e: any) {
      setErreur(e.message ?? "Erreur de chargement.");
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    charger();
  }, []);

  const incomplet = !nom.trim() || !ville.trim() || !imam.trim();

  const soumettre = async () => {
    setErreur(null);
    if (incomplet) return;
    setLoading(true);
    try {
      await ajouterMosquee({ nom, ville, imam });
      setNom("");
      setVille("");
      setImam("");
      await charger();
    } catch (e: any) {
      setErreur(e.message ?? "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text style={styles.h1}>Mosquées & imams</Text>
      <Text style={styles.sousTitre}>
        Les établissements habilités à célébrer des mariages dans ce registre.
      </Text>

      {erreur && <Text style={styles.erreur}>{erreur}</Text>}
      {chargement && <ActivityIndicator color={COLORS.accent} />}

      <View style={styles.grille}>
        {mosquees.map((mq) => (
          <View key={mq.id} style={styles.carte}>
            <Text style={styles.carteNom}>{mq.nom}</Text>
            <Text style={styles.carteVille}>{mq.ville}</Text>
            <Text style={styles.carteImam}>Imam {mq.imam}</Text>
            <Text style={styles.carteCompte}>{mq.nb_mariages} mariage(s) enregistré(s)</Text>
          </View>
        ))}
      </View>
      {!chargement && mosquees.length === 0 && (
        <Text style={styles.indication}>
          Aucune mosquée pour l'instant — ajoutez la première ci-dessous.
        </Text>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitre}>AJOUTER UNE MOSQUÉE</Text>
        <Text style={styles.label}>Nom</Text>
        <TextInput style={styles.input} value={nom} onChangeText={setNom} autoCorrect={false} />
        <Text style={[styles.label, { marginTop: 14 }]}>Ville</Text>
        <TextInput style={styles.input} value={ville} onChangeText={setVille} autoCorrect={false} />
        <Text style={[styles.label, { marginTop: 14 }]}>Imam</Text>
        <TextInput style={styles.input} value={imam} onChangeText={setImam} autoCorrect={false} />
        <Pressable
          style={({ pressed }) => [
            styles.btnSecondaire,
            (incomplet || loading) && { opacity: 0.45 },
            pressed && !incomplet && { opacity: 0.88 },
          ]}
          onPress={soumettre}
          disabled={incomplet || loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.text} />
          ) : (
            <Text style={styles.btnSecondaireTexte}>Ajouter</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: FONTS.serif, fontSize: 32, color: COLORS.text, marginBottom: 6 },
  sousTitre: { fontSize: 15, color: COLORS.textMuted, fontFamily: FONTS.regular, marginBottom: 28 },
  erreur: { color: COLORS.red, fontFamily: FONTS.medium, fontSize: 13, marginBottom: 10 },
  indication: { fontSize: 14, color: COLORS.textMuted, fontFamily: FONTS.regular, marginBottom: 24 },

  grille: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 36 },
  carte: {
    flexGrow: 1,
    flexBasis: 240,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 22,
  },
  carteNom: { fontFamily: FONTS.serif, fontSize: 17, color: COLORS.text, marginBottom: 4 },
  carteVille: { fontSize: 13, color: COLORS.textMuted, fontFamily: FONTS.regular, marginBottom: 10 },
  carteImam: { fontSize: 13, color: COLORS.textDark, fontFamily: FONTS.regular },
  carteCompte: { fontSize: 12, color: COLORS.textSoft, fontFamily: FONTS.regular, marginTop: 8 },

  section: {
    maxWidth: 480,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 22,
    paddingHorizontal: 24,
  },
  sectionTitre: {
    fontSize: 13,
    letterSpacing: 0.8,
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    marginBottom: 14,
  },
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

  btnSecondaire: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 6,
    marginTop: 18,
  },
  btnSecondaireTexte: { color: COLORS.text, fontSize: 14, fontFamily: FONTS.semibold },
});
