import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link } from "react-router-dom";
import { ApiError } from "../api/client";
import AuthLayout from "../components/AuthLayout";
import Button from "../components/Button";
import PasswordRules from "../components/PasswordRules";
import TextField from "../components/TextField";
import { useAuth } from "../features/auth/auth-context";
import { signUpSchema, type SignUpValues } from "../features/auth/schemas";

export default function SignUpPage() {
  const { signUp } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
  });

  const password = useWatch({ control, name: "password" }) ?? "";

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await signUp(values);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setError("email", { message: error.message });
      } else {
        setFormError(
          error instanceof Error ? error.message : "Something went wrong.",
        );
      }
    }
  });

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It only takes a minute."
      footer={
        <>
          Already registered? <Link to="/signin">Sign in</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <TextField
          label="Name"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordRules value={password} />

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" loading={isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
