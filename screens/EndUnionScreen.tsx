import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Select from "../components/Select";
import { COLORS, FONTS } from "../components/theme";
import { Mariage, finUnion, unionsActives } from "../lib/registre";
import { estDateValide, formaterDate } from "../utils/dates";

export default function EndUnionScreen() {
  const [actives, setActives] = useState<Mariage[]>([]);
  const [chargement, setChargement] = useState(true);
  const [selectionId, setSelectionId] = useState("");
  const [type, setType] = useState<"divorce" | "veuvage">("divorce");
  const [date, setDate] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = async () => {
    try {
      setActives(await unionsActives());
    } catch (e: any) {
      setErreur(e.message ?? "Erreur de chargement.");
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    charger();
  }, []);

  const incomplet = !selectionId || !date;

  const soumettre = async () => {
    setErreur(null);
    if (incomplet) return;
    if (!estDateValide(date)) {
      setErreur("Date invalide (format AAAA-MM-JJ).");
      return;
    }
    setLoading(true);
    try {
      await finUnion(selectionId, type, date);
      setEnvoye(true);
      await charger();
    } catch (e: any) {
      setErreur(e.message ?? "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const reinitialiser = () => {
    setSelectionId("");
    setDate("");
    setType("divorce");
    setEnvoye(false);
    setErreur(null);
  };

  return (
    <View style={{ maxWidth: 640 }}>
      <Text style={styles.h1}>Fin d'union</Text>
      <Text style={styles.sousTitre}>Enregistrer un divorce ou un veuvage religieux.</Text>

      {envoye && (
        <View style={styles.bandeauFin}>
          <Text style={styles.bandeauFinTexte}>Fin d'union enregistrée.</Text>
          <Pressable onPress={reinitialiser}>
            <Text style={styles.lien}>Enregistrer une autre</Text>
          </Pressable>
        </View>
      )}

      {erreur && <Text style={styles.erreur}>{erreur}</Text>}
      {chargement && <ActivityIndicator color={COLORS.accent} />}

      {!chargement && actives.length === 0 && !envoye && (
        <Text style={styles.indication}>Aucun mariage actif à clôturer pour le moment.</Text>
      )}

      {actives.length > 0 && (
        <>
          <View style={styles.section}>
            <Text style={styles.label}>Union concernée</Text>
            <Select
              placeholder="Sélectionner un mariage…"
              value={selectionId}
              options={actives.map((m) => ({
                value: m.id,
                label: `${m.epoux.prenom} ${m.epoux.nom} & ${m.epouse.prenom} ${m.epouse.nom} — ${formaterDate(m.date_mariage)}${m.mosquee ? ` (${m.mosquee.nom})` : ""}`,
              }))}
              onChange={setSelectionId}
            />

            <Text style={[styles.label, { marginTop: 16 }]}>Type</Text>
            <View style={styles.toggles}>
              <Pressable
                style={[styles.toggle, type === "divorce" && styles.toggleActif]}
                onPress={() => setType("divorce")}
              >
                <Text style={[styles.toggleTexte, type === "divorce" && styles.toggleTexteActif]}>
                  Divorce
                </Text>
              </Pressable>
              <Pressable
                style={[styles.toggle, type === "veuvage" && styles.toggleActif]}
                onPress={() => setType("veuvage")}
              >
                <Text style={[styles.toggleTexte, type === "veuvage" && styles.toggleTexteActif]}>
                  Veuvage
                </Text>
              </Pressable>
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>Date</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="AAAA-MM-JJ"
              placeholderTextColor={COLORS.textSoft}
              autoCorrect={false}
            />
          </View>

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
              <Text style={styles.btnPrimaireTexte}>Enregistrer</Text>
            )}
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: FONTS.serif, fontSize: 32, color: COLORS.text, marginBottom: 6 },
  sousTitre: { fontSize: 15, color: COLORS.textMuted, fontFamily: FONTS.regular, marginBottom: 28 },

  bandeauFin: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    backgroundColor: COLORS.endBg,
    borderWidth: 1,
    borderColor: COLORS.endBorder,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  bandeauFinTexte: { color: COLORS.endText, fontSize: 14, fontFamily: FONTS.regular, flexShrink: 1 },
  lien: { color: COLORS.endText, fontSize: 13, fontFamily: FONTS.semibold, textDecorationLine: "underline" },

  indication: { fontSize: 14, color: COLORS.textMuted, fontFamily: FONTS.regular, paddingVertical: 8 },
  erreur: { color: COLORS.red, fontFamily: FONTS.medium, fontSize: 13, marginBottom: 10 },

  section: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 22,
    paddingHorizontal: 24,
    marginBottom: 18,
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

  toggles: { flexDirection: "row", gap: 10 },
  toggle: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.card,
    alignItems: "center",
  },
  toggleActif: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  toggleTexte: { fontSize: 14, fontFamily: FONTS.semibold, color: COLORS.textDark },
  toggleTexteActif: { color: COLORS.onAccent },

  btnPrimaire: {
    backgroundColor: COLORS.accent,
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  btnPrimaireTexte: { color: COLORS.onAccent, fontSize: 15, fontFamily: FONTS.semibold },
});
