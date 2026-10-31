import { HostForm } from "../host-form";

export const metadata = { title: "Nouvel hébergeur" };

export default function NewHostPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[28px]">Nouvel hébergeur</h1>
      <HostForm />
    </div>
  );
}
