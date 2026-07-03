// Les dates sont saisies et stockées au format ISO AAAA-MM-JJ.
export function estDateValide(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const d = new Date(iso);
  return !Number.isNaN(d.getTime()) && iso === d.toISOString().slice(0, 10);
}

const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

// Format long du prototype : « 14 juin 2015 »
export function formaterDate(iso: string | null): string {
  if (!iso) return "—";
  const [annee, mois, jour] = iso.split("-").map(Number);
  if (!annee || !mois || !jour) return iso;
  return `${jour} ${MOIS[mois - 1]} ${annee}`;
}
