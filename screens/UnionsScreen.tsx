import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import StatutBadge from "../components/StatutBadge";
import { COLORS, FONTS } from "../components/theme";
import { Union, cloturerUnion, listerUnions } from "../lib/registre";
import { estDateValide, formaterDate, libelleStatutUnion } from "../utils/dates";

type Cloture = { id: string; type: "divorce" | "veuvage"; date: string };

export default function UnionsScreen() {
  const [unions, setUnions] = useState<Union[]>([]);
  const [chargement, setChargement] = useState(true);
  const [cloture, setCloture] = useState<Cloture | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setErreur(null);
    try {
      setUnions(await listerUnions());
    } catch (e: any) {
      setErreur(e.message ?? "Erreur de chargement.");
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  const confirmerCloture = async () => {
    if (!cloture) return;
    setErreur(null);
    if (!estDateValide(cloture.date)) {
      setErreur("Date invalide (format AAAA-MM-JJ).");
      return;
    }
    try {
      await cloturerUnion(cloture.id, cloture.type, cloture.date);
      setCloture(null);
      await charger();
    } catch (e: any) {
      setErreur(e.message ?? "Une erreur est survenue.");
    }
  };

  return (
    <View>
      <Text style={styles.titre}>Le registre</Text>
      <Text style={styles.sousTitre}>
        {unions.length} union{unions.length > 1 ? "s" : ""} inscrite{unions.length > 1 ? "s" : ""}, de la plus récente à la plus ancienne.
      </Text>

      {erreur && <Text style={styles.erreur}>{erreur}</Text>}
      {chargement && <ActivityIndicator color={COLORS.accent} />}
      {!chargement && unions.length === 0 && !erreur && (
        <Text style={styles.indication}>Aucune union pour l'instant — la première s'inscrit en une minute.</Text>
      )}

      <View style={{ gap: 10 }}>
        {unions.map((u) => {
          const kind = u.statut === "actif" ? "actif" : u.statut === "veuvage" ? "veuf" : "divorce";
          return (
            <View key={u.id} style={styles.carte}>
              <View style={styles.carteHaut}>
                <Text style={styles.couple}>
                  {u.epoux.prenom} {u.epoux.nom} & {u.epouse.prenom} {u.epouse.nom}
                </Text>
                <StatutBadge kind={kind} label={libelleStatutUnion(u.statut, u.date_fin)} />
              </View>
              <Text style={styles.meta}>
                {formaterDate(u.date_mariage)}
                {u.lieu ? ` · ${u.lieu}` : ""}
                {u.imam ? ` · Témoin : ${u.imam}` : ""}
              </Text>

              {u.statut === "actif" && cloture?.id !== u.id && (
                <Pressable
                  style={({ pressed }) => [styles.btnCloture, pressed && { opacity: 0.8 }]}
                  onPress={() => setCloture({ id: u.id, type: "divorce", date: "" })}
                >
                  <Text style={styles.btnClotureTexte}>Clôturer cette union…</Text>
                </Pressable>
              )}

              {cloture?.id === u.id && (
                <View style={styles.clotureBloc}>
                  <View style={styles.toggles}>
                    <Pressable
                      style={[styles.toggle, cloture.type === "divorce" && styles.toggleActif]}
                      onPress={() => setCloture({ ...cloture, type: "divorce" })}
                    >
                      <Text style={[styles.toggleTexte, cloture.type === "divorce" && styles.toggleTexteActif]}>
                        Divorce
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.toggle, cloture.type === "veuvage" && styles.toggleActif]}
                      onPress={() => setCloture({ ...cloture, type: "veuvage" })}
                    >
                      <Text style={[styles.toggleTexte, cloture.type === "veuvage" && styles.toggleTexteActif]}>
                        Veuvage
                      </Text>
                    </Pressable>
                  </View>
                  <View style={styles.rangee}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="Date — AAAA-MM-JJ"
                      placeholderTextColor={COLORS.soft}
                      value={cloture.date}
                      onChangeText={(t) => setCloture({ ...cloture, date: t })}
                      autoCorrect={false}
                    />
                    <Pressable
                      style={({ pressed }) => [styles.btnConfirmer, !cloture.date && { opacity: 0.4 }, pressed && { opacity: 0.85 }]}
                      onPress={confirmerCloture}
                      disabled={!cloture.date}
                    >
                      <Text style={styles.btnConfirmerTexte}>Confirmer</Text>
                    </Pressable>
                    <Pressable style={styles.btnAnnuler} onPress={() => setCloture(null)}>
                      <Text style={styles.btnAnnulerTexte}>✕</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titre: { fontFamily: FONTS.display, fontSize: 26, color: COLORS.accentDark, marginBottom: 4, lineHeight: 36 },
  sousTitre: { fontFamily: FONTS.regular, fontSize: 14.5, color: COLORS.muted, marginBottom: 20 },
  indication: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.muted, paddingVertical: 6 },
  erreur: { color: COLORS.danger, fontFamily: FONTS.semibold, fontSize: 13, marginBottom: 10, textAlign: "center" },

  carte: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  carteHaut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
  },
  couple: { fontFamily: FONTS.bold, fontSize: 15.5, color: COLORS.text, flexShrink: 1 },
  meta: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.muted },

  btnCloture: { alignSelf: "flex-start", paddingVertical: 4 },
  btnClotureTexte: { fontFamily: FONTS.semibold, fontSize: 13, color: COLORS.accent, textDecorationLine: "underline" },

  clotureBloc: { gap: 10, marginTop: 4 },
  toggles: { flexDirection: "row", gap: 8 },
  toggle: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.inputBg,
    alignItems: "center",
  },
  toggleActif: { backgroundColor: COLORS.accent },
  toggleTexte: { fontFamily: FONTS.semibold, fontSize: 13.5, color: COLORS.muted },
  toggleTexteActif: { color: COLORS.onAccent },
  rangee: { flexDirection: "row", gap: 8, alignItems: "center" },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 46,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  btnConfirmer: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingHorizontal: 14,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  btnConfirmerTexte: { color: COLORS.onAccent, fontFamily: FONTS.bold, fontSize: 13.5 },
  btnAnnuler: { padding: 10 },
  btnAnnulerTexte: { color: COLORS.muted, fontSize: 16 },
});
