import { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { useForm } from "react-hook-form";
import { CreateMarketSchema, type CreateMarketInput } from "@repo/types/market";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useMutationState,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { cn, createMarket } from "@/lib/utils";
import { CategoryCombobox } from "./categoryCombobox";
import { authClient } from "@/lib/auth-client";

// Current local time formatted for a datetime-local input (YYYY-MM-DDTHH:mm)
const nowAsDatetimeLocal = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
};

interface CreateMarketDialogProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  triggerClassName?: string;
}

export const CreateMarketDialog = ({ ...props }: CreateMarketDialogProps) => {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateMarketInput>({
    resolver: zodResolver(CreateMarketSchema),
    defaultValues: { categoryIds: [] },
  });

  const { mutate: createMarketMutation, isPending } = useMutation({
    mutationFn: createMarket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["markets"] });
      toast.success("Market created!");
      reset();
      setOpen(false);
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to create market. Please try again.");
    },
  });

  const handleCategoriesChange = useCallback(
    (ids: string[]) => setValue("categoryIds", ids, { shouldValidate: true }),
    [setValue],
  );

  // Block submit while a new category is still being created on the server,
  // so the form never submits a placeholder id
  const isCreatingCategory =
    useMutationState({
      filters: { mutationKey: ["create-category"], status: "pending" },
    }).length > 0;

  if (session?.user.role !== "ADMIN") {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className={cn(props.triggerClassName, "mint-btn p-5")}>
            Create Market
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Market</DialogTitle>
          <DialogDescription>Set up a new prediction market.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => createMarketMutation(data))}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                placeholder="Will BTC cross $150k by Dec 31?"
                {...register("title")}
                className="w-full"
              />
              <FieldError errors={[errors.title]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                placeholder="Optional details and resolution criteria..."
                {...register("description")}
                className="w-full"
              />
              <FieldError errors={[errors.description]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="sourceOfTruth">Source of truth</FieldLabel>
              <Input
                id="sourceOfTruth"
                type="url"
                placeholder="https://..."
                {...register("sourceOfTruth")}
                className="w-full"
              />
              <FieldError errors={[errors.sourceOfTruth]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="endsAt">Ends at</FieldLabel>
              <Input
                id="endsAt"
                type="datetime-local"
                min={nowAsDatetimeLocal()}
                {...register("endsAt")}
                className="w-full"
              />
              <FieldError errors={[errors.endsAt]} />
            </Field>
            <Field>
              <FieldLabel>Categories</FieldLabel>
              <CategoryCombobox onSelectionChange={handleCategoriesChange} />
              <FieldError errors={[errors.categoryIds]} />
            </Field>
            <Button
              type="submit"
              className="mint-btn"
              disabled={isPending || isCreatingCategory}
            >
              {isPending || isCreatingCategory
                ? "Creating..."
                : "Create Market"}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};
