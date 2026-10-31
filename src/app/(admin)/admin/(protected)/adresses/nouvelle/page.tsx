import { requireAdmin } from "@/lib/auth";
import { parisDay } from "@/lib/opening-hours";
import { PlaceForm } from "../place-form";

export const metadata = { title: "Nouvelle adresse" };

export default async function NewPlacePage() {
  await requireAdmin();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[28px]">Nouvelle adresse</h1>
      <PlaceForm hours={[]} closures={[]} today={parisDay(new Date()).date} />
    </div>
  );
}
