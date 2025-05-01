import React from 'react';

interface FilterSelectProps<Option> {
  options: Option[];
  getKey: (o: Option) => string;
  getLabel: (o: Option) => string;
  selectedKeys: string[];
  onChange: (keys: string[]) => void;
}

export function FilterSelect<Option>({
  options,
  getKey,
  getLabel,
  selectedKeys,
  onChange,
}: FilterSelectProps<Option>) {
  const toggle = (key: string) =>
    selectedKeys.includes(key)
      ? onChange(selectedKeys.filter(k => k !== key))
      : onChange([...selectedKeys, key]);

  return (
    <div className="mb-4 space-y-2">
      <input
        type="text"
        placeholder="Search metrics…"
        className="w-full p-2 border rounded"
        onChange={e =>
          onChange(
            options
              .filter(o =>
                getLabel(o).toLowerCase().includes(e.target.value.toLowerCase())
              )
              .map(getKey)
          )
        }
      />
      <div className="grid grid-cols-3 gap-2">
        {options.map(o => {
          const key = getKey(o);
          return (
            <label key={key} className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedKeys.includes(key)}
                onChange={() => toggle(key)}
              />
              <span>{getLabel(o)}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
