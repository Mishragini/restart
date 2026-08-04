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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn, googleAuth, signUp, uploadToS3 } from "@/lib/utils";
import { Controller, useForm } from "react-hook-form";
import { signup, signupSchema } from "@repo/types/signup";
import { ChangeEvent, useCallback, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheckBig, Loader2, TriangleAlert } from "lucide-react";
import { useAuthErrorFromSearchParams } from "@/hooks/useAuthErrorFromSearchParams";
import { Role } from "@repo/types/user";

export const Signup = () => {
  let navigate = useNavigate();
  useAuthErrorFromSearchParams();
  const [preview, setPreview] = useState<null | string>(null);

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    control,
  } = useForm<signup>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: Role.USER },
  });

  const signupMutation = useMutation({
    mutationFn: (data: signup) => signUp(data),
    onSuccess: ({ error }) => {
      if (error) {
        console.error(error);
        toast.error(error.message);
        return;
      }
      toast.success("Signed up successfully!");
      navigate("/dashboard");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to signup! Please try again.");
    },
  });

  const pfpMutation = useMutation({
    mutationFn: (file: File) => uploadToS3(file),
    onSuccess: (publicUrl) => setValue("image", publicUrl),
    onError: (err) => {
      console.error(err);
      toast.error("Failed to upload pfp! Retry.");
    },
  });

  const handleImageUpload = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Must be an image.");
        return;
      }

      setPreview(URL.createObjectURL(file));
      pfpMutation.mutate(file);
    },
    [pfpMutation],
  );

  return (
    <div className="auth">
      <Card className="min-w-md sm:min-w-lg md:min-w-xl gap-24 p-12">
        <CardHeader className="w-full flex flex-col items-center justify-center">
          <CardTitle className="text-2xl font-heading">Welcome</CardTitle>
          <CardDescription className="text-sm font-light">
            Create an account
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            onClick={async () => {
              await googleAuth();
            }}
            variant="outline"
            className="w-full h-12"
          >
            Sign up with Google
          </Button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <hr className="flex-1 border-t" />
            or
            <hr className="flex-1 border-t" />
          </div>

          <form
            onSubmit={handleSubmit((data) => signupMutation.mutate(data))}
            className="flex flex-col gap-4"
          >
            <Field>
              <FieldLabel>Profile Photo(optional)</FieldLabel>
              <label htmlFor="input-field-image" className="cursor-pointer">
                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="preview"
                      className={cn([
                        "h-20 w-20 rounded-full object-cover",
                        pfpMutation.isPending && "opacity-50",
                      ])}
                    />
                    {pfpMutation.isPending && (
                      <Loader2 className="h-5 w-5 text-white animate-spin absolute left-0 bottom-0" />
                    )}
                    {pfpMutation.isError && (
                      <TriangleAlert className="h-5 w-5 text-red-500 absolute left-0 bottom-0" />
                    )}
                    {pfpMutation.isSuccess && (
                      <CircleCheckBig className="h-5 w-5 text-green-500 absolute left-0 bottom-0" />
                    )}
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-full border flex items-center justify-center">
                    +
                  </div>
                )}
              </label>
              <Input
                onChange={handleImageUpload}
                id="input-field-image"
                accept="image/*"
                type="file"
                hidden
                cursor-pointer
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="input-field-username">Username</FieldLabel>
              <Input
                {...register("name", { required: true })}
                id="input-field-username"
                type="text"
                placeholder="johnDoe"
                required
              />
              {errors.name?.message && (
                <p className="text-red-500">{errors.name.message}</p>
              )}
            </Field>

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
              <FieldLabel htmlFor="input-field-role">Role</FieldLabel>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger
                      id="input-field-role"
                      className="w-full"
                      aria-invalid={!!errors.role}
                    >
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Role.USER}>User</SelectItem>
                      <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role?.message && (
                <p className="text-red-500">{errors.role.message}</p>
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
              disabled={pfpMutation.isPending || signupMutation.isPending}
            >
              {signupMutation.isPending ? "Signing up..." : "Sign up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center gap-1 text-sm bg-transparent border-0">
          <span>Already have an account?</span>
          <Link to="/login" className="underline">
            Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};
