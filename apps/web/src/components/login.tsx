import { Link, useNavigate } from "react-router";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Field, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { googleAuth, signIn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { signin, signInSchema } from "@repo/types/signin";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuthErrorFromSearchParams } from "@/hooks/useAuthErrorFromSearchParams";

export const Login = () => {
  const navigate = useNavigate();
  useAuthErrorFromSearchParams();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<signin>({
    resolver: zodResolver(signInSchema),
  });
  const signinMutation = useMutation({
    mutationFn: (data: signin) => signIn(data),
    onSuccess: ({ error }) => {
      if (error) {
        console.error(error);
        toast.error(error.message);
        return;
      }
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message);
      return;
    },
  });
  return (
    <div className="auth">
      <Card className="min-w-md sm:min-w-lg md:min-w-xl gap-24 p-16">
        <CardHeader className="w-full flex flex-col items-center justify-center">
          <CardTitle className="text-2xl font-heading">Welcome back</CardTitle>
          <CardDescription className="text-sm font-light">
            Login to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-full h-12"
            onClick={async () => {
              await googleAuth();
            }}
          >
            Login with Google
          </Button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <hr className="flex-1 border-t" />
            or
            <hr className="flex-1 border-t" />
          </div>
          <form
            onSubmit={handleSubmit((data) => signinMutation.mutate(data))}
            className="flex flex-col gap-4"
          >
            <Field>
              <FieldLabel htmlFor="input-field-email">Email</FieldLabel>
              <Input
                {...register("email", { required: true })}
                id="input-field-email"
                type="email"
                placeholder="johndoe@example.com"
                required
              />
              {errors.email?.message && (
                <p className="text-red-500">{errors.email.message}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="input-field-password">Password</FieldLabel>
              <Input
                {...register("password", { required: true })}
                id="input-field-password"
                type="password"
                required
              />
              {errors.password?.message && (
                <p className="text-red-500">{errors.password.message}</p>
              )}
            </Field>
            <Button
              type="submit"
              className="w-full h-12"
              disabled={signinMutation.isPending}
            >
              {signinMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center gap-1 text-sm bg-transparent border-0">
          <span>Don't have an account?</span>
          <Link to="/signup" className="underline">
            Signup
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};
