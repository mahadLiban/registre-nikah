import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { Session } from "../App";
import StatutBadge from "../components/StatutBadge";
import { COLORS, FONTS } from "../components/theme";
import {
  Union,
  cloturerUnion,
  corrigerPersonne,
  corrigerUnion,
  listerUnions,
  rouvrirUnion,
  supprimerUnion,
} from "../lib/registre";
import { estDateValide, formaterDate, libelleStatutUnion } from "../utils/dates";

type Cloture = { id: string; type: "divorce" | "veuvage"; date: string };

type Edition = {
  id: string;
  epouxId: string;
  epouseId: string;
  epouxPrenom: string;
  epouxNom: string;
  epousePrenom: string;
  epouseNom: string;
  date: string;
  lieu: string;
  confirmerSuppression: boolean;
};

export default function UnionsScreen({ session }: { session: Session }) {
  const estAdmin = session.role === "admin";
  const [unions, setUnions] = useState<Union[]>([]);
  const [chargement, setChargement] = useState(true);
  const [cloture, setCloture] = useState<Cloture | null>(null);
  const [edition, setEdition] = useState<Edition | null>(null);
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
      await cloturerUnion(cloture.id, cloture.type, cloture.date, session.nom);
      setCloture(null);
      await charger();
    } catch (e: any) {
      setErreur(e.message ?? "Une erreur est survenue.");
    }
  };

  const ouvrirEdition = (u: Union) =>
    setEdition({
      id: u.id,
      epouxId: u.epoux_id,
      epouseId: u.epouse_id,
      epouxPrenom: u.epoux.prenom,
      epouxNom: u.epoux.nom,
      epousePrenom: u.epouse.prenom,
      epouseNom: u.epouse.nom,
      date: u.date_mariage,
      lieu: u.lieu ?? "",
      confirmerSuppression: false,
    });

  const enregistrerCorrections = async () => {
    if (!edition) return;
    setErreur(null);
    if (!edition.epouxPrenom.trim() || !edition.epouxNom.trim() || !edition.epousePrenom.trim() || !edition.epouseNom.trim()) {
      setErreur("Les prénoms et noms ne peuvent pas être vides.");
      return;
    }
    if (!estDateValide(edition.date)) {
      setErreur("Date invalide (format AAAA-MM-JJ).");
      return;
    }
    try {
      await corrigerPersonne(edition.epouxId, { prenom: edition.epouxPrenom, nom: edition.epouxNom });
      await corrigerPersonne(edition.epouseId, { prenom: edition.epousePrenom, nom: edition.epouseNom });
      await corrigerUnion(edition.id, { date_mariage: edition.date, lieu: edition.lieu });
      setEdition(null);
      await charger();
    } catch (e: any) {
      setErreur(e.message ?? "Une erreur est survenue.");
    }
  };

  const supprimer = async () => {
    if (!edition) return;
    setErreur(null);
    try {
      await supprimerUnion(edition.id);
      setEdition(null);
      await charger();
    } catch (e: any) {
      setErreur(e.message ?? "La suppression a échoué (réservée au compte admin).");
    }
  };

  const rouvrir = async (u: Union) => {
    setErreur(null);
    try {
      await rouvrirUnion(u.id);
      await charger();
    } catch (e: any) {
      setErreur(e.message ?? "Une erreur est survenue.");
    }
  };

  return (
    <View>
      <Text style={styles.titre}>Le registre</Text>
      <Text style={styles.sousTitre}>
        {unions.length} fiançailles inscrites, des plus récentes aux plus anciennes.
        {estAdmin ? " Vous êtes administrateur : vous pouvez corriger chaque entrée." : ""}
      </Text>

      {erreur && <Text style={styles.erreur}>{erreur}</Text>}
      {chargement && <ActivityIndicator color={COLORS.accent} />}
      {!chargement && unions.length === 0 && !erreur && (
        <Text style={styles.indication}>Aucunes fiançailles pour l'instant — les premières s'inscrivent en une minute.</Text>
      )}

      <View style={{ gap: 10 }}>
        {unions.map((u) => {
          const kind = u.statut === "actif" ? "actif" : u.statut === "veuvage" ? "veuf" : "divorce";
          const enEdition = edition?.id === u.id;
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
              </Text>
              <Text style={styles.audit}>
                Ajouté par {u.imam ?? "—"}
                {u.cloture_par ? ` · Clôturé par ${u.cloture_par}` : ""}
              </Text>

              <View style={styles.actionsLigne}>
                {u.statut === "actif" && cloture?.id !== u.id && !enEdition && (
                  <Pressable
                    style={({ pressed }) => [pressed && { opacity: 0.8 }]}
                    onPress={() => { setEdition(null); setCloture({ id: u.id, type: "divorce", date: "" }); }}
                  >
                    <Text style={styles.lienAction}>Clôturer…</Text>
                  </Pressable>
                )}
                {estAdmin && !enEdition && (
                  <Pressable
                    style={({ pressed }) => [pressed && { opacity: 0.8 }]}
                    onPress={() => { setCloture(null); ouvrirEdition(u); }}
                  >
                    <Text style={styles.lienAction}>Corriger…</Text>
                  </Pressable>
                )}
                {estAdmin && u.statut !== "actif" && !enEdition && (
                  <Pressable style={({ pressed }) => [pressed && { opacity: 0.8 }]} onPress={() => rouvrir(u)}>
                    <Text style={styles.lienAction}>Rouvrir</Text>
                  </Pressable>
                )}
              </View>

              {cloture?.id === u.id && (
                <View style={styles.bloc}>
                  <View style={styles.toggles}>
                    <Pressable
                      style={[styles.toggle, cloture.type === "divorce" && styles.toggleActif]}
                      onPress={() => setCloture({ ...cloture, type: "divorce" })}
                    >
                      <Text style={[styles.toggleTexte, cloture.type === "divorce" && styles.toggleTexteActif]}>
                        Rupture
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.toggle, cloture.type === "veuvage" && styles.toggleActif]}
                      onPress={() => setCloture({ ...cloture, type: "veuvage" })}
                    >
                      <Text style={[styles.toggleTexte, cloture.type === "veuvage" && styles.toggleTexteActif]}>
                        Décès
                      </Text>
                    </Pressable>
                  </View>
                  <View style={styles.rangee}>
                    <TextInput
                      style={[styles.input, { flexGrow: 1, flexBasis: 150 }]}
                      placeholder="Date — AAAA-MM-JJ"
                      placeholderTextColor={COLORS.soft}
                      value={cloture.date}
                      onChangeText={(t) => setCloture({ ...cloture, date: t })}
                      autoCorrect={false}
                    />
                    <Pressable
                      style={({ pressed }) => [styles.btnPlein, !cloture.date && { opacity: 0.4 }, pressed && { opacity: 0.85 }]}
                      onPress={confirmerCloture}
                      disabled={!cloture.date}
                    >
                      <Text style={styles.btnPleinTexte}>Confirmer</Text>
                    </Pressable>
                    <Pressable style={styles.btnFermer} onPress={() => setCloture(null)}>
                      <Text style={styles.btnFermerTexte}>✕</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {enEdition && edition && (
                <View style={styles.bloc}>
                  <Text style={styles.blocTitre}>CORRECTION (ADMIN)</Text>
                  <View style={styles.rangee}>
                    <TextInput
                      style={[styles.input, styles.demi]}
                      value={edition.epouxPrenom}
                      onChangeText={(t) => setEdition({ ...edition, epouxPrenom: t })}
                      placeholder="Prénom (lui)"
                      placeholderTextColor={COLORS.soft}
                    />
                    <TextInput
                      style={[styles.input, styles.demi]}
                      value={edition.epouxNom}
                      onChangeText={(t) => setEdition({ ...edition, epouxNom: t })}
                      placeholder="Nom (lui)"
                      placeholderTextColor={COLORS.soft}
                    />
                  </View>
                  <View style={styles.rangee}>
                    <TextInput
                      style={[styles.input, styles.demi]}
                      value={edition.epousePrenom}
                      onChangeText={(t) => setEdition({ ...edition, epousePrenom: t })}
                      placeholder="Prénom (elle)"
                      placeholderTextColor={COLORS.soft}
                    />
                    <TextInput
                      style={[styles.input, styles.demi]}
                      value={edition.epouseNom}
                      onChangeText={(t) => setEdition({ ...edition, epouseNom: t })}
                      placeholder="Nom (elle)"
                      placeholderTextColor={COLORS.soft}
                    />
                  </View>
                  <View style={styles.rangee}>
                    <TextInput
                      style={[styles.input, styles.demi]}
                      value={edition.date}
                      onChangeText={(t) => setEdition({ ...edition, date: t })}
                      placeholder="Date — AAAA-MM-JJ"
                      placeholderTextColor={COLORS.soft}
                    />
                    <TextInput
                      style={[styles.input, styles.demi]}
                      value={edition.lieu}
                      onChangeText={(t) => setEdition({ ...edition, lieu: t })}
                      placeholder="Lieu"
                      placeholderTextColor={COLORS.soft}
                    />
                  </View>
                  <View style={styles.rangee}>
                    <Pressable style={({ pressed }) => [styles.btnPlein, pressed && { opacity: 0.85 }]} onPress={enregistrerCorrections}>
                      <Text style={styles.btnPleinTexte}>Enregistrer</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [styles.btnDanger, pressed && { opacity: 0.85 }]}
                      onPress={() =>
                        edition.confirmerSuppression
                          ? supprimer()
                          : setEdition({ ...edition, confirmerSuppression: true })
                      }
                    >
                      <Text style={styles.btnDangerTexte}>
                        {edition.confirmerSuppression ? "Confirmer la suppression ?" : "Supprimer"}
                      </Text>
                    </Pressable>
                    <Pressable style={styles.btnFermer} onPress={() => setEdition(null)}>
                      <Text style={styles.btnFermerTexte}>✕</Text>
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
  sousTitre: { fontFamily: FONTS.regular, fontSize: 14.5, color: COLORS.muted, marginBottom: 20, lineHeight: 21 },
  indication: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.muted, paddingVertical: 6 },
  erreur: { color: COLORS.danger, fontFamily: FONTS.semibold, fontSize: 13, marginBottom: 10, textAlign: "center" },

  carte: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    gap: 7,
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
  audit: { fontFamily: FONTS.semibold, fontSize: 12, color: COLORS.soft },

  actionsLigne: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  lienAction: { fontFamily: FONTS.semibold, fontSize: 13, color: COLORS.accent, textDecorationLine: "underline" },

  bloc: { gap: 10, marginTop: 6 },
  blocTitre: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.orFonce, letterSpacing: 0.6 },
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

  rangee: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
  demi: { flexGrow: 1, flexBasis: 130 },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 46,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },

  btnPlein: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingHorizontal: 14,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPleinTexte: { color: COLORS.onAccent, fontFamily: FONTS.bold, fontSize: 13.5 },
  btnDanger: {
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    paddingHorizontal: 14,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDangerTexte: { color: "#fff", fontFamily: FONTS.bold, fontSize: 13.5 },
  btnFermer: { padding: 10 },
  btnFermerTexte: { color: COLORS.muted, fontSize: 16 },
});
