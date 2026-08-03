import React, { useMemo, useState } from "react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";
import { cn, createCategory, fetchCategories } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  // Absent on "Create" options that don't exist in the DB yet
  createdAt?: string;
}

interface CategoryComboboxProps {
  onSelectionChange?: (ids: string[]) => void;
  // When false, hides the "Create ..." option (e.g. when used as a filter)
  allowCreate?: boolean;
  placeholder?: string;
  className?: string;
  // Renders the input + list in place (no chips, no floating popup),
  // for embedding inside an existing popup like the filters popover
  inline?: boolean;
}

export const CategoryCombobox = ({
  onSelectionChange,
  allowCreate = true,
  placeholder = "Search or create a category...",
  className,
  inline = false,
}: CategoryComboboxProps) => {
  const queryClient = useQueryClient();
  const anchor = useComboboxAnchor();
  const [search, setSearch] = useState("");
  const [value, setValue] = useState<Category[]>([]);

  const updateSelection = (next: Category[]) => {
    setValue(next);
    onSelectionChange?.(next.map((c) => c.id));
  };
  const {
    data: categories,
    isPending,
    isError,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { mutate: createCategoryMutation } = useMutation({
    mutationKey: ["create-category"],
    mutationFn: (name: string) => createCategory(name),
    onMutate: (name) => {
      toast.loading(`Creating category "${name}"...`, { id: name });
    },
    onSuccess: ({ data }, name) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      // Swap the placeholder for the real DB record (with its uuid)
      updateSelection(
        value.map((item) => (item.name === name ? data.data : item)),
      );
      toast.success(`Category "${name}" created!`, { id: name });
    },
    onError: (err, name) => {
      console.error(err);
      updateSelection(value.filter((item) => item.name !== name));
      toast.error(`Failed to create "${name}". Please try again.`, {
        id: name,
      });
    },
  });

  const exists = useMemo(
    () =>
      categories?.some(
        (item) => item.name.toLowerCase() === search.toLowerCase(),
      ) ?? false,
    [categories, search],
  );

  const createOption = useMemo<Category>(
    () => ({ id: search, name: search }),
    [search],
  );

  const list = (
    <>
      {/* The default empty styles rely on the floating popup wrapper, so force display when inline */}
      <ComboboxEmpty className={cn(inline && "flex")}>
        {isPending
          ? "Loading categories"
          : isError
            ? "Failed to load categories"
            : "No categories found"}
      </ComboboxEmpty>
      <ComboboxList className={cn(inline && "max-h-40")}>
        <ComboboxCollection>
          {(item: Category) => (
            <ComboboxItem key={item.id} value={item}>
              {item.name}
            </ComboboxItem>
          )}
        </ComboboxCollection>
        {allowCreate && search && !exists && (
          <ComboboxItem
            value={createOption}
            className="bg-card cursor-pointer text-primary data-highlighted:text-primary [&_svg]:text-primary border-t"
          >
            <PlusIcon className="size-4" />
            <span>
              Create "<span className="font-semibold">{search}</span>"
            </span>
          </ComboboxItem>
        )}
      </ComboboxList>
    </>
  );

  return (
    <Combobox
      multiple
      autoHighlight
      // Base UI requires `open` to be pinned when rendering the list inline
      inline={inline}
      open={inline ? true : undefined}
      items={categories ?? []}
      value={value}
      inputValue={search}
      onInputValueChange={setSearch}
      itemToStringLabel={(item: Category) => item.name}
      isItemEqualToValue={(item: Category, value: Category) =>
        item.name === value.name
      }
      onValueChange={(value) => {
        updateSelection(value);
        const create = value.find((item) => item.createdAt === undefined);
        if (!create) return;
        createCategoryMutation(create.name);
      }}
    >
      {inline ? (
        <>
          <ComboboxInput
            showTrigger={false}
            placeholder={placeholder}
            className={cn(
              "m-1 h-8 w-[calc(100%-(--spacing(2)))] border-input/30 bg-input/30 shadow-none",
              className,
            )}
          />
          {list}
        </>
      ) : (
        <>
          <ComboboxChips ref={anchor} className={cn("w-full", className)}>
            <ComboboxValue>
              {(values: Category[]) => (
                <React.Fragment>
                  {values.map((value) => (
                    <ComboboxChip key={value.id} className="shrink-0">
                      {value.name}
                    </ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    placeholder={values.length === 0 ? placeholder : ""}
                  />
                </React.Fragment>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <ComboboxContent anchor={anchor}>{list}</ComboboxContent>
        </>
      )}
    </Combobox>
  );
};
