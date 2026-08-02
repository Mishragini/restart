import React, { useMemo, useState } from "react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";
import { createCategory, fetchCategories } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  // Absent on "Create" options that don't exist in the DB yet
  createdAt?: string;
}

interface CategoryComboboxProps {
  onSelectionChange?: (ids: string[]) => void;
}

export const CategoryCombobox = ({
  onSelectionChange,
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

  return (
    <Combobox
      multiple
      autoHighlight
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
      <ComboboxChips ref={anchor} className="w-full max-w-xs">
        <ComboboxValue>
          {(values: Category[]) => (
            <React.Fragment>
              {values.map((value) => (
                <ComboboxChip key={value.id}>{value.name}</ComboboxChip>
              ))}
              <ComboboxChipsInput
                placeholder={
                  values.length === 0 ? "Search or create a category..." : ""
                }
              />
            </React.Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>
          {isPending
            ? "Loading categories"
            : isError
              ? "Failed to load categories"
              : "No categories found"}
        </ComboboxEmpty>
        <ComboboxList>
          <ComboboxCollection>
            {(item: Category) => (
              <ComboboxItem key={item.id} value={item}>
                {item.name}
              </ComboboxItem>
            )}
          </ComboboxCollection>
          {search && !exists && (
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
      </ComboboxContent>
    </Combobox>
  );
};
