import { z } from "zod";

const emailSchema = z.email("Podaj poprawny adres e-mail.").max(254);
const signInPasswordSchema = z
  .string()
  .min(8, "Hasło musi mieć co najmniej 8 znaków.")
  .max(72, "Hasło może mieć maksymalnie 72 znaki.");
const newPasswordSchema = signInPasswordSchema
  .regex(/[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/, "Hasło musi zawierać co najmniej jedną literę.")
  .regex(/\d/, "Hasło musi zawierać co najmniej jedną cyfrę.");

const signInSchema = z.object({
  email: emailSchema,
  password: signInPasswordSchema,
  remember: z.boolean(),
});

const registrationSchema = z
  .object({
    companyName: z
      .string()
      .min(2, "Podaj nazwę firmy.")
      .max(120, "Nazwa firmy może mieć maksymalnie 120 znaków."),
    confirmPassword: z.string(),
    email: emailSchema,
    fullName: z
      .string()
      .min(2, "Podaj imię i nazwisko.")
      .max(120, "Imię i nazwisko może mieć maksymalnie 120 znaków."),
    password: newPasswordSchema,
    termsAccepted: z.literal(true, {
      error: "Zaakceptuj Regulamin i Politykę prywatności.",
    }),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Hasła muszą być identyczne.",
    path: ["confirmPassword"],
  });

const organizationCompletionSchema = z.object({
  companyName: z
    .string()
    .min(2, "Podaj nazwę firmy.")
    .max(120, "Nazwa firmy może mieć maksymalnie 120 znaków."),
  termsAccepted: z.literal(true, {
    error: "Zaakceptuj Regulamin i Politykę prywatności.",
  }),
});

const resetPasswordSchema = z
  .object({
    confirmPassword: z.string(),
    password: newPasswordSchema,
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Hasła muszą być identyczne.",
    path: ["confirmPassword"],
  });

const recoveryEmailSchema = z.object({
  email: emailSchema,
});

export type AuthFieldErrors = Readonly<Record<string, string | undefined>>;

type ValidationResult<T> =
  Readonly<{ data: T; success: true }> | Readonly<{ errors: AuthFieldErrors; success: false }>;

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function toFieldErrors(error: z.ZodError): AuthFieldErrors {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

function parse<T>(result: z.ZodSafeParseResult<T>): ValidationResult<T> {
  return result.success
    ? { data: result.data, success: true }
    : { errors: toFieldErrors(result.error), success: false };
}

export function validateSignIn(formData: FormData) {
  return parse(
    signInSchema.safeParse({
      email: readText(formData, "email").toLowerCase(),
      password: readText(formData, "password"),
      remember: formData.get("remember") === "on",
    }),
  );
}

export function validateRegistration(formData: FormData) {
  return parse(
    registrationSchema.safeParse({
      companyName: readText(formData, "companyName"),
      confirmPassword: readText(formData, "confirmPassword"),
      email: readText(formData, "email").toLowerCase(),
      fullName: readText(formData, "fullName"),
      password: readText(formData, "password"),
      termsAccepted: formData.get("terms") === "on",
    }),
  );
}

export function validateOrganizationCompletion(formData: FormData) {
  return parse(
    organizationCompletionSchema.safeParse({
      companyName: readText(formData, "companyName"),
      termsAccepted: formData.get("terms") === "on",
    }),
  );
}

export function validateResetPassword(formData: FormData) {
  return parse(
    resetPasswordSchema.safeParse({
      confirmPassword: readText(formData, "confirmPassword"),
      password: readText(formData, "password"),
    }),
  );
}

export function validateRecoveryEmail(formData: FormData) {
  return parse(
    recoveryEmailSchema.safeParse({
      email: readText(formData, "email").toLowerCase(),
    }),
  );
}

export function createOrganizationSlug(name: string, suffix: string): string {
  const base = name
    .toLocaleLowerCase("pl")
    .replaceAll("ł", "l")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64)
    .replace(/-$/g, "");
  return `${base || "firma"}-${suffix
    .toLowerCase()
    .replace(/[^a-f0-9]/g, "")
    .slice(0, 8)}`;
}
