import React from "react";

export type SelectAllOption<T extends string> = {
  value: T;
  label: React.ReactNode;
};

export interface SelectAllCheckboxPopupProps<T extends string> {
  trigger: React.ReactNode;
  widthClassName?: string;

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
  selectAllLabel = "Select All",
  selectAllChecked,
  onToggleSelectAll,
  options,
  getOptionChecked,
  onToggleOption,
}: SelectAllCheckboxPopupProps<T>) => {
  return (
    <div className="dropdown dropdown-end dropdown-bottom">
      {trigger}
      <div
        tabIndex={0}
        className={`dropdown-content z-[60] bg-base-100 rounded-box shadow-xl border border-base-300 p-3 max-h-[70vh] overflow-y-auto ${widthClassName}`}
      >
        <label className="flex items-center gap-2 cursor-pointer hover:bg-base-200 rounded px-1 py-1">
          <input
            type="checkbox"
            className="checkbox checkbox-sm checkbox-primary"
            checked={selectAllChecked}
            onChange={(event) => onToggleSelectAll(Boolean((event as any).target?.checked))}
          />
          <span className="text-sm">{selectAllLabel}</span>
        </label>

        <div className="divider my-1" />

        <div className="max-h-56 sm:max-h-64 overflow-y-auto pr-1 space-y-2">
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
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectAllCheckboxPopup;

