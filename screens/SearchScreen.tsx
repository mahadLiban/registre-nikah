import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import StatutBadge from "../components/StatutBadge";
import { COLORS, FONTS } from "../components/theme";
import { ResultatRecherche, conjointDe, rechercherStatuts } from "../lib/registre";
import { formaterDate } from "../utils/dates";

function detailPour(r: ResultatRecherche): string {
  const { statut, personne } = r;
  if (statut.kind === "actif" && statut.mariage) {
    const m = statut.mariage;
    const conjoint = conjointDe(m, personne.id);
    const lieu = m.lieu ? `, à ${m.lieu}` : "";
    const mosquee = m.mosquee ? ` (${m.mosquee.nom}${m.imam ? `, Imam ${m.imam}` : ""})` : "";
    return `Marié(e) à ${conjoint.prenom} ${conjoint.nom} depuis le ${formaterDate(m.date_mariage)}${lieu}${mosquee}.`;
  }
  if ((statut.kind === "divorce" || statut.kind === "veuf") && statut.mariage) {
    const m = statut.mariage;
    const conjoint = conjointDe(m, personne.id);
    const verbe = statut.kind === "veuf" ? "Veuf/veuve de" : "Divorcé(e) de";
    return `${verbe} ${conjoint.prenom} ${conjoint.nom} (marié(e) le ${formaterDate(m.date_mariage)}, union terminée le ${formaterDate(m.date_fin)}).`;
  }
  return "Aucun mariage enregistré dans ce registre.";
}

export default function SearchScreen() {
  const [q, setQ] = useState("");
  const [resultats, setResultats] = useState<ResultatRecherche[]>([]);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResultats([]);
      setErreur(null);
      return;
    }
    const minuteur = setTimeout(async () => {
      setLoading(true);
      setErreur(null);
      try {
        setResultats(await rechercherStatuts(q));
      } catch (e: any) {
        setErreur(e.message ?? "Erreur de recherche.");
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(minuteur);
  }, [q]);

  return (
    <View>
      <Text style={styles.h1}>Vérifier une personne</Text>
      <Text style={styles.sousTitre}>
        Recherchez un nom pour connaître son statut matrimonial religieux actuel.
      </Text>

      <TextInput
        style={styles.champRecherche}
        placeholder="Prénom et/ou nom…"
        placeholderTextColor={COLORS.textSoft}
        value={q}
        onChangeText={setQ}
        autoCorrect={false}
      />

      <View style={{ marginTop: 28, gap: 12 }}>
        {q.trim().length < 2 && (
          <Text style={styles.indication}>Tapez au moins 2 lettres pour lancer la recherche.</Text>
        )}
        {loading && <ActivityIndicator color={COLORS.accent} />}
        {erreur && <Text style={styles.erreur}>{erreur}</Text>}
        {q.trim().length >= 2 && !loading && !erreur && resultats.length === 0 && (
          <Text style={styles.indication}>Aucune personne trouvée pour « {q.trim()} ».</Text>
        )}

        {resultats.map((r) => (
          <View key={r.personne.id} style={styles.carte}>
            <View style={styles.carteHaut}>
              <Text style={styles.nom}>
                {r.personne.prenom} {r.personne.nom}
              </Text>
              <StatutBadge kind={r.statut.kind} label={r.statut.label} />
            </View>
            <Text style={styles.detail}>
              {detailPour(r)} Né(e) le {formaterDate(r.personne.date_naissance)}.
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: FONTS.serif, fontSize: 32, color: COLORS.text, marginBottom: 6 },
  sousTitre: { fontSize: 15, color: COLORS.textMuted, fontFamily: FONTS.regular, marginBottom: 28 },

  champRecherche: {
    maxWidth: 420,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },

  indication: { fontSize: 14, color: COLORS.textSoft, fontFamily: FONTS.regular, paddingVertical: 8 },
  erreur: { color: COLORS.red, fontFamily: FONTS.medium, fontSize: 13 },

  carte: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 22,
  },
  carteHaut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
  },
  nom: { fontFamily: FONTS.serif, fontSize: 19, color: COLORS.text },
  detail: { fontSize: 13, color: COLORS.textMuted, fontFamily: FONTS.regular, marginTop: 10, lineHeight: 21 },
});
