import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import StatutBadge from "../components/StatutBadge";
import { COLORS, FONTS } from "../components/theme";
import { Mariage, Stats, mariagesRecents, statsRegistre } from "../lib/registre";
import { formaterDate } from "../utils/dates";
import type { Vue } from "./HomeScreen";

export default function DashboardScreen({ onNaviguer }: { onNaviguer: (v: Vue) => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recents, setRecents] = useState<Mariage[]>([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, r] = await Promise.all([statsRegistre(), mariagesRecents(5)]);
        setStats(s);
        setRecents(r);
      } catch (e: any) {
        setErreur(e.message ?? "Erreur de chargement.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cartes = stats
    ? [
        { label: "Mariages enregistrés", value: stats.mariages, color: COLORS.text },
        { label: "Unions actives", value: stats.actifs, color: COLORS.badgeMarieText },
        { label: "Divorces enregistrés", value: stats.divorces, color: COLORS.badgeDivorceText },
        { label: "Mosquées partenaires", value: stats.mosquees, color: COLORS.text },
      ]
    : [];

  return (
    <View>
      <Text style={styles.h1}>Tableau de bord</Text>
      <Text style={styles.sousTitre}>Vue d'ensemble du registre des mariages religieux.</Text>

      {erreur && <Text style={styles.erreur}>{erreur}</Text>}
      {loading && <ActivityIndicator color={COLORS.accent} style={{ marginTop: 24 }} />}

      {stats && (
        <View style={styles.grilleStats}>
          {cartes.map((c) => (
            <View key={c.label} style={styles.carteStat}>
              <Text style={styles.statLabel}>{c.label}</Text>
              <Text style={[styles.statValeur, { color: c.color }]}>{c.value}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.btnPrimaire, pressed && { opacity: 0.88 }]}
          onPress={() => onNaviguer("nouveau-mariage")}
        >
          <Text style={styles.btnPrimaireTexte}>+ Nouveau mariage</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.btnSecondaire, pressed && { opacity: 0.88 }]}
          onPress={() => onNaviguer("recherche")}
        >
          <Text style={styles.btnSecondaireTexte}>Vérifier une personne</Text>
        </Pressable>
      </View>

      <Text style={styles.h2}>Mariages récents</Text>
      <View style={styles.carteListe}>
        {!loading && recents.length === 0 && (
          <Text style={styles.vide}>Aucun mariage enregistré pour l'instant.</Text>
        )}
        {recents.map((m, i) => {
          const kind = m.statut === "actif" ? "actif" : m.statut === "veuvage" ? "veuf" : "divorce";
          const label = m.statut === "actif" ? "Marié(e)" : m.statut === "veuvage" ? "Veuf(ve)" : "Divorcé(e)";
          return (
            <View
              key={m.id}
              style={[styles.ligne, i < recents.length - 1 && styles.ligneBordure]}
            >
              <View style={{ flex: 1, minWidth: 200 }}>
                <Text style={styles.ligneNoms}>
                  {m.epoux.prenom} {m.epoux.nom} & {m.epouse.prenom} {m.epouse.nom}
                </Text>
                <Text style={styles.ligneMeta}>
                  {formaterDate(m.date_mariage)}
                  {m.lieu ? ` · ${m.lieu}` : ""}
                  {m.imam ? ` · Imam ${m.imam}` : ""}
                </Text>
              </View>
              <StatutBadge kind={kind} label={label} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: FONTS.serif, fontSize: 32, color: COLORS.text, marginBottom: 6 },
  sousTitre: { fontSize: 15, color: COLORS.textMuted, fontFamily: FONTS.regular, marginBottom: 32 },
  erreur: { color: COLORS.red, fontFamily: FONTS.medium, fontSize: 13, marginTop: 10 },

  grilleStats: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 36 },
  carteStat: {
    flexGrow: 1,
    flexBasis: 180,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 22,
  },
  statLabel: { fontSize: 13, color: COLORS.textMuted, fontFamily: FONTS.regular, marginBottom: 8 },
  statValeur: { fontFamily: FONTS.serif, fontSize: 30 },

  actions: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginBottom: 40 },
  btnPrimaire: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 6,
  },
  btnPrimaireTexte: { color: COLORS.onAccent, fontSize: 14, fontFamily: FONTS.semibold },
  btnSecondaire: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 6,
  },
  btnSecondaireTexte: { color: COLORS.text, fontSize: 14, fontFamily: FONTS.semibold },

  h2: { fontFamily: FONTS.serif, fontSize: 19, color: COLORS.text, marginBottom: 16 },
  carteListe: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: "hidden",
  },
  vide: { padding: 24, paddingHorizontal: 22, fontSize: 14, color: COLORS.textMuted, fontFamily: FONTS.regular },
  ligne: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 22,
  },
  ligneBordure: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  ligneNoms: { fontSize: 15, color: COLORS.text, fontFamily: FONTS.medium },
  ligneMeta: { fontSize: 13, color: COLORS.textMuted, fontFamily: FONTS.regular, marginTop: 3 },
});
