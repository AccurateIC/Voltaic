import React from "react";

export type SelectAllOption<T extends string> = {
  value: T;
  label: React.ReactNode;
};

export interface SelectAllCheckboxPopupProps<T extends string> {
  trigger: React.ReactNode;
  widthClassName?: string;
  dropdownEnd?: boolean;

  selectAllLabel?: string;
  selectAllChecked: boolean;
  onToggleSelectAll: (checked: boolean) => void;

  options: SelectAllOption<T>[];
  getOptionChecked: (value: T) => boolean;
  onToggleOption: (value: T, checked: boolean) => void;
}

const SelectAllCheckboxPopup = <T extends string,>({
  trigger,
  widthClassName = "w-auto",
  dropdownEnd = false,
  selectAllLabel = "Select All",
  selectAllChecked,
  onToggleSelectAll,
  options,
  getOptionChecked,
  onToggleOption,
}: SelectAllCheckboxPopupProps<T>) => {
  return (
   <div className={`dropdown dropdown-bottom ${dropdownEnd ? " dropdown-end" : "dropdown-end"}`}>
      {trigger}
      <div
        tabIndex={0}
      className={`dropdown-content z-[999] bg-base-100 rounded-box shadow-xl border border-base-300 p-3 max-h-[70vh] overflow-y-auto overflow-x-hidden w-64 ${widthClassName}`}
      >
        <label     className="flex items-center gap-2 w-full cursor-pointer hover:bg-base-200 rounded px-1 py-1">
          <input
            type="checkbox"
            className="checkbox checkbox-sm checkbox-primary"
            checked={selectAllChecked}
            onChange={(event) => onToggleSelectAll(Boolean((event as any).target?.checked))}
          />
          <span className="text-sm">{selectAllLabel}</span>
        </label>

        <div className="divider my-1" />

       <div className="max-h-56 overflow-y-auto overflow-x-hidden pr-1 space-y-2">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer hover:bg-base-200 rounded px-1 py-1"
            >
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-primary"
                checked={getOptionChecked(option.value)}
                onChange={(event) => onToggleOption(option.value, Boolean((event as any).target?.checked))}
              />
             <span className="text-sm truncate">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectAllCheckboxPopup;

