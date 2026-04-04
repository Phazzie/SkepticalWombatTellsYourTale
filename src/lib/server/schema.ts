import { badRequest } from '@/lib/server/errors';

export type Schema<T> = {
  parse: (value: unknown, path?: string) => T;
};

export function validateSchema<T>(value: unknown, schema: Schema<T>, name = 'payload') {
  return schema.parse(value, name);
}

function fail(path: string, message: string): never {
  throw badRequest(`${path} ${message}`.trim());
}

export function stringSchema(opts?: { min?: number; max?: number; trim?: boolean }): Schema<string> {
  return {
    parse(value, path = 'value') {
      if (typeof value !== 'string') fail(path, 'must be a string');
      const trim = opts?.trim ?? true;
      const out = trim ? value.trim() : value;
      if (opts?.min !== undefined && out.length < opts.min) fail(path, `must be at least ${opts.min} characters`);
      if (opts?.max !== undefined && out.length > opts.max) fail(path, `must be at most ${opts.max} characters`);
      return out;
    },
  };
}

export function booleanSchema(): Schema<boolean> {
  return {
    parse(value, path = 'value') {
      if (typeof value !== 'boolean') fail(path, 'must be a boolean');
      return value;
    },
  };
}

export function literalUnionSchema<T extends string>(values: readonly T[]): Schema<T> {
  return {
    parse(value, path = 'value') {
      if (typeof value !== 'string' || !values.includes(value as T)) {
        fail(path, `must be one of: ${values.join(', ')}`);
      }
      return value as T;
    },
  };
}

export function optionalSchema<T>(schema: Schema<T>): Schema<T | undefined> {
  return {
    parse(value, path = 'value') {
      if (value === undefined) return undefined;
      return schema.parse(value, path);
    },
  };
}

export function nullableSchema<T>(schema: Schema<T>): Schema<T | null> {
  return {
    parse(value, path = 'value') {
      if (value === null || value === undefined) return null;
      return schema.parse(value, path);
    },
  };
}

export function arraySchema<T>(schema: Schema<T>): Schema<T[]> {
  return {
    parse(value, path = 'value') {
      if (!Array.isArray(value)) fail(path, 'must be an array');
      return value.map((entry, index) => schema.parse(entry, `${path}[${index}]`));
    },
  };
}

type ObjectShape = Record<string, Schema<unknown>>;

type InferShape<TShape extends ObjectShape> = {
  [K in keyof TShape]: TShape[K] extends Schema<infer TValue> ? TValue : never;
};

export function objectSchema<TShape extends ObjectShape>(shape: TShape): Schema<InferShape<TShape>> {
  return {
    parse(value, path = 'value') {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        fail(path, 'must be an object');
      }
      const obj = value as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const key of Object.keys(shape)) {
        out[key] = shape[key].parse(obj[key], `${path}.${key}`);
      }
      return out as InferShape<TShape>;
    },
  };
}
