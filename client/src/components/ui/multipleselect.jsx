"use client";

import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { X } from "lucide-react";
import * as React from "react";
import { forwardRef, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

// Show when no options match
const CommandEmpty = forwardRef(({ className, ...props }, ref) => {
  const show = useCommandState((state) => state.filtered.count === 0);
  if (!show) return null;
  return (
    <div
      ref={ref}
      className={cn("py-6 text-center text-sm", className)}
      cmdk-empty=""
      role="presentation"
      {...props}
    />
  );
});
CommandEmpty.displayName = "CommandEmpty";

// Main multiple select component
const MultipleSelector = React.forwardRef(
  (
    {
      value,
      onChange,
      placeholder,
      defaultOptions = [],
      options: arrayOptions,
      delay,
      onSearch,
      loadingIndicator,
      emptyIndicator,
      maxSelected = Number.MAX_SAFE_INTEGER,
      onMaxSelected,
      hidePlaceholderWhenSelected,
      disabled,
      groupBy,
      className,
      badgeClassName,
      selectFirstItem = true,
      creatable = false,
      triggerSearchOnFocus = false,
      commandProps,
      inputProps,
      hideClearAllButton = false,
    },
    ref
  ) => {
    const inputRef = React.useRef(null);
    const [open, setOpen] = React.useState(false);
    const mouseOn = React.useRef(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const [selected, setSelected] = React.useState(value || []);
    const [options, setOptions] = React.useState(
      transToGroupOption(defaultOptions, groupBy)
    );
    const [inputValue, setInputValue] = React.useState("");
    const debouncedSearchTerm = useDebounce(inputValue, delay || 500);

    // Expose selected values and input to parent via ref
    React.useImperativeHandle(
      ref,
      () => ({
        selectedValue: [...selected],
        input: inputRef.current,
        focus: () => inputRef.current?.focus(),
      }),
      [selected]
    );

    // Unselect an item
    const handleUnselect = React.useCallback(
      (option) => {
        const newOptions = selected.filter((s) => s.value !== option.value);
        setSelected(newOptions);
        onChange?.(newOptions);
      },
      [onChange, selected]
    );

    // Handle delete/backspace and escape key
    const handleKeyDown = React.useCallback(
      (e) => {
        if (inputRef.current) {
          if ((e.key === "Delete" || e.key === "Backspace") && !inputRef.current.value && selected.length > 0) {
            const last = selected[selected.length - 1];
            if (!last.fixed) handleUnselect(last);
          }
          if (e.key === "Escape") inputRef.current.blur();
        }
      },
      [handleUnselect, selected]
    );

    // Sync selected when value prop changes
    useEffect(() => {
      if (value) setSelected(value);
    }, [value]);

    // Update local options if onSearch is not provided
    useEffect(() => {
      if (!arrayOptions || onSearch) return;
      const newOptions = transToGroupOption(arrayOptions, groupBy);
      if (JSON.stringify(newOptions) !== JSON.stringify(options)) {
        setOptions(newOptions);
      }
    }, [arrayOptions, groupBy, onSearch, options]);

    // Async search logic
    useEffect(() => {
      const doSearch = async () => {
        setIsLoading(true);
        const result = await onSearch?.(debouncedSearchTerm);
        setOptions(transToGroupOption(result || [], groupBy));
        setIsLoading(false);
      };
      if (!onSearch || !open) return;
      if (triggerSearchOnFocus || debouncedSearchTerm) doSearch();
    }, [debouncedSearchTerm, groupBy, open, onSearch, triggerSearchOnFocus]);

    // Render creatable item (when not already selected)
    const CreatableItem = () => {
      if (!creatable || !inputValue) return undefined;
      if (isOptionsExist(options, [{ value: inputValue, label: inputValue }]) || selected.find((s) => s.value === inputValue)) {
        return undefined;
      }
      const create = (
        <CommandItem
          value={inputValue}
          className="cursor-pointer"
          onMouseDown={(e) => e.preventDefault()}
          onSelect={(val) => {
            if (selected.length >= maxSelected) {
              onMaxSelected?.(selected.length);
              return;
            }
            setInputValue("");
            const newOptions = [...selected, { value: val, label: val }];
            setSelected(newOptions);
            onChange?.(newOptions);
          }}
        >
          {`Create "${inputValue}"`}
        </CommandItem>
      );
      return (!onSearch || (!isLoading && debouncedSearchTerm)) ? create : undefined;
    };

    // Render empty state item
    const EmptyItem = React.useCallback(() => {
      if (!emptyIndicator) return undefined;
      if (onSearch && !creatable && Object.keys(options).length === 0) {
        return <CommandItem value="-" disabled>{emptyIndicator}</CommandItem>;
      }
      return <CommandEmpty>{emptyIndicator}</CommandEmpty>;
    }, [creatable, emptyIndicator, onSearch, options]);

    // Filter out selected options from list
    const selectables = React.useMemo(
      () => removePickedOption(options, selected),
      [options, selected]
    );

    // Custom filter function for creatable mode
    const commandFilter = React.useCallback(() => {
      if (commandProps?.filter) return commandProps.filter;
      if (creatable) {
        return (value, search) =>
          value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1;
      }
      return undefined;
    }, [creatable, commandProps]);

    return (
      <Command
        {...commandProps}
        className={cn("h-auto overflow-visible bg-transparent", commandProps?.className)}
        filter={commandFilter()}
        shouldFilter={commandProps?.shouldFilter ?? !onSearch}
        onKeyDown={(e) => {
          handleKeyDown(e);
          commandProps?.onKeyDown?.(e);
        }}
      >
        {/* Selected items container */}
        <div
          className={cn(
            "min-h-10 rounded-md border border-input text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            {
              "px-3 py-2": selected.length !== 0,
              "cursor-text": !disabled && selected.length !== 0,
            },
            className
          )}
          onClick={() => {
            if (!disabled) inputRef.current?.focus();
          }}
        >
          {/* Render selected badges and input */}
          <div className="flex flex-wrap gap-3">
            {selected.map((option) => (
              <Badge
                key={option.value}
                className={cn(
                  "bg-purple-500 p-2 text-white",
                  badgeClassName,
                  option.fixed && "data-[fixed]:bg-muted-foreground",
                  disabled && "data-[disabled]:text-muted"
                )}
              >
                {option.label}
                <button
                  onClick={() => handleUnselect(option)}
                  onKeyDown={(e) => e.key === "Enter" && handleUnselect(option)}
                  onMouseDown={(e) => e.preventDefault()}
                  className={cn("ml-1", (disabled || option.fixed) && "hidden")}
                >
                  <X className="h-4 w-4 hover:text-teal-400" />
                </button>
              </Badge>
            ))}
            {/* Input box */}
            <CommandPrimitive.Input
              {...inputProps}
              ref={inputRef}
              disabled={disabled}
              value={inputValue}
              onValueChange={(val) => {
                setInputValue(val);
                inputProps?.onValueChange?.(val);
              }}
              onFocus={(e) => {
                setOpen(true);
                triggerSearchOnFocus && onSearch?.(debouncedSearchTerm);
                inputProps?.onFocus?.(e);
              }}
              onBlur={(e) => {
                if (!mouseOn.current) setOpen(false);
                inputProps?.onBlur?.(e);
              }}
              placeholder={
                hidePlaceholderWhenSelected && selected.length > 0 ? "" : placeholder
              }
              className={cn("bg-transparent outline-none placeholder:text-muted-foreground", {
                "w-full": hidePlaceholderWhenSelected,
                "px-3 py-2": selected.length === 0,
                "ml-1": selected.length > 0,
              })}
            />
            {/* Clear all button */}
            <button
              type="button"
              onClick={() => setSelected(selected.filter((s) => s.fixed))}
              className={cn(
                (hideClearAllButton || disabled || selected.length === 0 ||
                  selected.every((s) => s.fixed)) && "hidden"
              )}
            >
              <X />
            </button>
          </div>
        </div>

        {/* Dropdown options */}
        <div className="relative">
          {open && (
            <CommandList
              className="absolute top-1 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in"
              onMouseEnter={() => (mouseOn.current = true)}
              onMouseLeave={() => (mouseOn.current = false)}
              onMouseUp={() => inputRef.current?.focus()}
            >
              {isLoading ? (
                loadingIndicator
              ) : (
                <>
                  {EmptyItem()}
                  {CreatableItem()}
                  {!selectFirstItem && <CommandItem value="-" className="hidden" />}
                  {Object.entries(selectables).map(([key, items]) => (
                    <CommandGroup key={key} heading={key}>
                      {items.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          disabled={option.disable}
                          onMouseDown={(e) => e.preventDefault()}
                          onSelect={() => {
                            if (selected.length >= maxSelected) {
                              onMaxSelected?.(selected.length);
                              return;
                            }
                            setInputValue("");
                            const newItems = [...selected, option];
                            setSelected(newItems);
                            onChange?.(newItems);
                          }}
                          className={option.disable ? "text-muted-foreground cursor-default" : "cursor-pointer"}
                        >
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </>
              )}
            </CommandList>
          )}
        </div>
      </Command>
    );
  }
);

MultipleSelector.displayName = "MultipleSelector";
export default MultipleSelector;

// Debounce hook to delay search input
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// Group options by key (if groupBy is provided)
function transToGroupOption(options, groupBy) {
  if (options.length === 0) return {};
  if (!groupBy) return { "": options };
  const grouped = {};
  options.forEach((opt) => {
    const key = opt[groupBy] || "";
    grouped[key] = [...(grouped[key] || []), opt];
  });
  return grouped;
}

// Remove already selected options from available list
function removePickedOption(groupOption, picked) {
  const clone = JSON.parse(JSON.stringify(groupOption));
  for (const [key, values] of Object.entries(clone)) {
    clone[key] = values.filter((val) => !picked.find((p) => p.value === val.value));
  }
  return clone;
}

// Check if options already exist
function isOptionsExist(groupOption, targetOption) {
  for (const [, values] of Object.entries(groupOption)) {
    if (values.some((opt) => targetOption.find((p) => p.value === opt.value))) {
      return true;
    }
  }
  return false;
}
