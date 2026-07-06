import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import StatutBadge from "../components/StatutBadge";
import { COLORS, FONTS } from "../components/theme";
import { ResultatRecherche, conjointDe, rechercherStatuts } from "../lib/registre";
import { formaterDate } from "../utils/dates";

function detailPour(r: ResultatRecherche): string {
  const { statut, personne } = r;
  if (statut.kind === "actif" && statut.union) {
    const u = statut.union;
    const conjoint = conjointDe(u, personne.id);
    const lieu = u.lieu ? `, à ${u.lieu}` : "";
    return `En union avec ${conjoint.prenom} ${conjoint.nom} depuis le ${formaterDate(u.date_mariage)}${lieu}.`;
  }
  if ((statut.kind === "divorce" || statut.kind === "veuf") && statut.union) {
    const u = statut.union;
    const conjoint = conjointDe(u, personne.id);
    const motif = statut.kind === "veuf" ? "veuvage" : "divorce";
    return `Union avec ${conjoint.prenom} ${conjoint.nom} terminée le ${formaterDate(u.date_fin)} (${motif}).`;
  }
  return "Aucune union inscrite au registre.";
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
      <Text style={styles.titre}>Vérifier une personne</Text>
      <Text style={styles.sousTitre}>
        Avant une cérémonie, vérifiez si la personne a déjà une union en cours.
      </Text>

      <TextInput
        style={styles.champ}
        placeholder="Prénom ou nom…"
        placeholderTextColor={COLORS.soft}
        value={q}
        onChangeText={setQ}
        autoCorrect={false}
        autoFocus
      />

      <View style={{ marginTop: 20, gap: 10 }}>
        {loading && <ActivityIndicator color={COLORS.accent} />}
        {erreur && <Text style={styles.erreur}>{erreur}</Text>}
        {q.trim().length >= 2 && !loading && !erreur && resultats.length === 0 && (
          <Text style={styles.indication}>
            Aucune personne trouvée pour « {q.trim()} » — elle n'a donc aucune union inscrite ici.
          </Text>
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
  titre: { fontFamily: FONTS.extrabold, fontSize: 24, color: COLORS.text, marginBottom: 4 },
  sousTitre: { fontFamily: FONTS.regular, fontSize: 14.5, color: COLORS.muted, marginBottom: 20 },

  champ: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    minHeight: 54,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },

  indication: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.muted, lineHeight: 21, paddingVertical: 6 },
  erreur: { color: COLORS.danger, fontFamily: FONTS.semibold, fontSize: 13, textAlign: "center" },

  carte: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
  },
  carteHaut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
  },
  nom: { fontFamily: FONTS.extrabold, fontSize: 17, color: COLORS.text },
  detail: { fontFamily: FONTS.regular, fontSize: 13.5, color: COLORS.muted, marginTop: 8, lineHeight: 20 },
});
