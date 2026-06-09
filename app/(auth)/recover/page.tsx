import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { Field, TextInput } from "@/components/Form";

export default function RecoverPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl bg-card px-8 py-12 shadow-[0_8px_40px_rgba(20,20,43,0.06)]">
        <div className="flex flex-col items-center">
          <LogoMark size={64} />
          <h1 className="mt-6 text-xl font-semibold text-ink">Recover</h1>
        </div>

        <form className="mt-8 space-y-5">
          <Field label="Email Address">
            <TextInput type="email" placeholder="example@gmail.com" />
          </Field>
          <Link
            href="/login"
            className="block rounded-xl bg-primary py-3 text-center text-sm font-medium text-white transition hover:bg-primary-dark"
          >
            Reset Your Password
          </Link>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-primary">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
