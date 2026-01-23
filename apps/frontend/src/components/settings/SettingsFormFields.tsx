import { Input } from '@/components/ui/input';

type FormFieldProps = {
  label: string;
  description?: string;
  children: React.ReactNode;
};

export function FormField({ label, description, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium">{label}</label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

type ColorInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ColorInput({ value, onChange }: ColorInputProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded border cursor-pointer"
      />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 font-mono text-sm"
        placeholder="#000000"
      />
    </div>
  );
}

type NumberInputProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
};

export function NumberInput({ value, onChange, min, max, step = 1, unit }: NumberInputProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="flex-1"
      />
      {unit && <span className="text-sm text-muted-foreground w-8">{unit}</span>}
    </div>
  );
}

type SelectInputProps = {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
};

export function SelectInput({ value, onChange, options }: SelectInputProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 px-3 rounded-md border bg-background text-sm"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

