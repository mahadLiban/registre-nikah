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
import { COLORS, CONTENT_MAX_WIDTH, FONTS } from "../components/theme";
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
    <View style={[styles.root, { paddingTop: insets.top + 16 }]}>
      <View style={styles.contenu}>
        <Pressable style={styles.backBtn} onPress={onBack} hitSlop={10}>
          <Text style={styles.backBtnText}>‹</Text>
        </Pressable>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>
              Utilisez les identifiants qui vous ont été remis par l'administrateur du registre.
            </Text>

            <View style={styles.form}>
              <View>
                <Text style={styles.label}>Nom de compte</Text>
                <TextInput
                  style={styles.input}
                  placeholder="imam1"
                  placeholderTextColor={COLORS.soft}
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
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.soft}
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

            <Text style={styles.aide}>
              Pas de compte ? L'accès au registre est attribué par l'administrateur.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, alignItems: "center" },
  contenu: { flex: 1, width: "100%", maxWidth: CONTENT_MAX_WIDTH, paddingHorizontal: 24 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  backBtnText: { fontSize: 22, color: COLORS.text, fontFamily: FONTS.bold, marginTop: -2 },

  scroll: { paddingTop: 20, paddingBottom: 40 },
  title: { fontFamily: FONTS.display, fontSize: 28, color: COLORS.accentDark, marginBottom: 6, lineHeight: 40 },
  subtitle: { fontFamily: FONTS.regular, fontSize: 15, color: COLORS.muted, marginBottom: 26, lineHeight: 22 },

  form: { gap: 16 },
  label: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.text, marginBottom: 7 },
  input: {
    backgroundColor: COLORS.inputBg,
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
    minHeight: 56,
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
    marginTop: 24,
    lineHeight: 19,
  },
});
