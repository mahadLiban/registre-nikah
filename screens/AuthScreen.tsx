import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Role, Session } from "../App";
import { COLORS, FONTS } from "../components/theme";
import { supabase } from "../lib/supabase";

type Props = {
  onAuthenticated: (session: Session) => void;
  onBack: () => void;
};

// Les comptes sont fournis par l'administrateur (pas d'inscription libre).
// Le « nom de compte » est converti en interne en adresse du registre.
const DOMAINE = "@registre-nikah.app";

export default function AuthScreen({ onAuthenticated, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const [compte, setCompte] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    if (!compte.trim() || !password) {
      setError("Entrez votre nom de compte et votre mot de passe.");
      return;
    }
    const email = compte.includes("@")
      ? compte.trim().toLowerCase()
      : compte.trim().toLowerCase().replace(/\s+/g, "") + DOMAINE;
    setLoading(true);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !data.user) {
      setLoading(false);
      setError(
        signInError?.message === "Invalid login credentials"
          ? "Nom de compte ou mot de passe incorrect."
          : signInError?.message ?? "Connexion impossible."
      );
      return;
    }
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();
    setLoading(false);
    if (profileError || !profile) {
      setError("Profil introuvable pour ce compte.");
      return;
    }
    onAuthenticated({
      nom: profile.nom,
      communaute: profile.mosquee,
      email,
      role: (profile.role as Role) ?? "imam",
    });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16, paddingBottom: insets.bottom }]}>
      <Pressable style={styles.backBtn} onPress={onBack} hitSlop={10}>
        <Text style={styles.backBtnText}>‹</Text>
      </Pressable>

      <KeyboardAvoidingView style={{ flex: 1, alignSelf: "stretch" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.carte}>
            <Text style={styles.embleme}>۞</Text>
            <Text style={styles.marque}>Le Registre</Text>
            <View style={styles.filet}>
              <View style={styles.filetLigne} />
              <Text style={styles.filetEtoile}>✦</Text>
              <View style={styles.filetLigne} />
            </View>
            <Text style={styles.subtitle}>
              Connectez-vous avec les identifiants remis par l'administrateur.
            </Text>

            <View style={styles.form}>
              <View>
                <Text style={styles.label}>Nom de compte</Text>
                <TextInput
                  style={styles.input}
                  value={compte}
                  onChangeText={setCompte}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View>
                <Text style={styles.label}>Mot de passe</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {error && <Text style={styles.error}>{error}</Text>}

              <Pressable
                style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.9 }]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.onAccent} />
                ) : (
                  <Text style={styles.submitText}>Se connecter</Text>
                )}
              </Pressable>
            </View>
          </View>

          <Text style={styles.aide}>
            Pas de compte ? L'accès au registre est attribué par l'administrateur.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, alignItems: "center", paddingHorizontal: 20 },
  backBtn: {
    alignSelf: "flex-start",
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: { fontSize: 22, color: COLORS.text, fontFamily: FONTS.bold, marginTop: -2 },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
  },
  carte: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 26,
    alignItems: "center",
  },
  embleme: { fontSize: 34, color: COLORS.or, marginBottom: 4 },
  marque: { fontFamily: FONTS.display, fontSize: 30, color: COLORS.accentDark, lineHeight: 40 },
  filet: { flexDirection: "row", alignItems: "center", gap: 10, alignSelf: "stretch", marginVertical: 12 },
  filetLigne: { flex: 1, height: 1, backgroundColor: COLORS.orPale },
  filetEtoile: { color: COLORS.or, fontSize: 12 },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 20,
  },

  form: { gap: 14, alignSelf: "stretch" },
  label: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.text, marginBottom: 7 },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 52,
    fontSize: 15.5,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  error: { color: COLORS.danger, fontFamily: FONTS.semibold, fontSize: 13, textAlign: "center" },
  submitBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitText: { color: COLORS.onAccent, fontFamily: FONTS.bold, fontSize: 16 },
  aide: {
    color: COLORS.soft,
    fontFamily: FONTS.semibold,
    fontSize: 13,
    textAlign: "center",
    marginTop: 18,
    lineHeight: 19,
    maxWidth: 420,
  },
});
