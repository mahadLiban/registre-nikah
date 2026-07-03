// Design tokens du handoff « Registre des Mariages Religieux »
// (couleurs OKLCH du prototype converties en hexadécimal).
export const COLORS = {
  // Surfaces
  bg: "#FAF8F3", // oklch(98% 0.006 90) — blanc cassé chaud
  card: "#FFFFFF", // oklch(100% 0.002 90)
  border: "#DEDBD3", // oklch(88% 0.006 90)
  borderLight: "#EAE7E0", // oklch(92% 0.006 90)
  inputBg: "#FDFCFA", // oklch(99% 0.002 90)
  inputBorder: "#CFCCC4", // oklch(82% 0.006 90)

  // Texte
  text: "#252420", // oklch(20% 0.01 90)
  textMuted: "#6E6C64", // oklch(48% 0.01 90)
  textSoft: "#807E76", // oklch(55% 0.01 90)
  textDark: "#454440", // oklch(30% 0.01 90)

  // Barre latérale
  sidebarBg: "#242C3B", // oklch(24% 0.025 250)
  sidebarText: "#E1E5EC", // oklch(92% 0.01 250)
  sidebarTitle: "#F2F4F8", // oklch(97% 0.01 250)
  sidebarMuted: "#949DAF", // oklch(65% 0.02 250)
  sidebarFooter: "#7A8494", // oklch(55% 0.02 250)
  sidebarNavIdle: "#CDD2DB", // oklch(85% 0.01 250)

  // Accent primaire (boutons, nav actif) — oklch(38% 0.07 200)
  accent: "#155E6D",
  onAccent: "#F7F9FC", // oklch(98% 0.01 250)

  // Badges de statut
  badgeMarieBg: "#DBF0E0", // oklch(94% 0.03 150)
  badgeMarieText: "#1A5C36", // oklch(32% 0.09 150)
  badgeDivorceBg: "#FBE9E1", // oklch(94% 0.03 30)
  badgeDivorceText: "#82412A", // oklch(38% 0.09 30)
  badgeVeufBg: "#E4E7EF", // oklch(93% 0.01 260)
  badgeVeufText: "#4B5470", // oklch(40% 0.03 260)
  badgeCelibBg: "#EAE8E1", // oklch(93% 0.006 90)
  badgeCelibText: "#6E6C64", // oklch(48% 0.01 90)

  // Bannières
  warningBg: "#FAEDD5", // oklch(95% 0.04 60)
  warningBorder: "#D7B36E", // oklch(78% 0.08 60)
  warningText: "#7B4A1E", // oklch(35% 0.09 50)
  successBg: "#DBF0E0",
  successBorder: "#9CCBAA", // oklch(80% 0.06 150)
  successText: "#1C5433", // oklch(30% 0.08 150)
  endBg: "#FBE9E1",
  endBorder: "#DBA893", // oklch(80% 0.06 30)
  endText: "#6F3A24", // oklch(32% 0.08 30)

  red: "#B3362B",
};

export const FONTS = {
  serif: "SourceSerif4_600SemiBold",
  serifBold: "SourceSerif4_700Bold",
  regular: "IBMPlexSans_400Regular",
  medium: "IBMPlexSans_500Medium",
  semibold: "IBMPlexSans_600SemiBold",
};

// En dessous de cette largeur, la barre latérale devient une barre horizontale en haut.
export const MOBILE_BREAKPOINT = 860;
