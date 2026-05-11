import { formatISO, format } from "date-fns";

import fetcher from "../fetcher";
import urls from "../urls";

type ValueType =
  | number
  | string
  | boolean
  | { date: Date; type: "date" | "datetime" }
  | { date: string; type: "datestring" }
  | null
  | string[];

export type QueryFilter<T> = {
  field: keyof T;
  value: ValueType;
  operator?: string;
};

export type FilterGroup<T> = {
  AND?: (QueryFilter<T> | FilterGroup<T>)[];
  OR?: (QueryFilter<T> | FilterGroup<T>)[];
};

const renderValue = (value: ValueType): string => {
  switch (typeof value) {
    case "string":
      return `'${value}'`;
    case "boolean":
      return `${value}`.toUpperCase();
    case "undefined":
      return `${value}`.toUpperCase();
    case "object":
      if (Array.isArray(value)) {
        return `('${value.join("','")}')`;
      }
      if (value?.date) {
        if (value.type === "datetime") {
          return formatISO(value.date);
        } else if (value.type === "date") {
          return format(value.date, "yyyy-MM-dd");
        } else if (value.type === "datestring") {
          return value.date;
        }
      }
    case "number":
      return `${value}`;
    default:
      return value;
  }
};

function renderFilter<T>({ field, value, operator }: QueryFilter<T>) {
  return (
    field.toString() +
    (!operator ? " = " : ` ${operator} `) +
    renderValue(value)
  );
}

function parseFilter<T>(filterGroup: FilterGroup<T>) {
  const andStatement: string =
    "(" +
    filterGroup.AND?.map((child) =>
      // @ts-expect-error

      child.hasOwnProperty("field") ? renderFilter(child) : parseFilter(child),
    ).join(" AND ") +
    ")";

  const orStatement: string =
    "(" +
    filterGroup.OR?.map((child) =>
      // @ts-expect-error

      child.hasOwnProperty("field") ? renderFilter(child) : parseFilter(child),
    ).join(" OR ") +
    ")";

  return filterGroup.AND ? andStatement : orStatement;
}

async function createQuery<T, K extends keyof T>({
  fields,
  filters,
  obj,
  join,
}: {
  obj: string;
  fields: ReadonlyArray<K>;
  filters?: FilterGroup<T>;
  join?: Partial<Record<keyof T, string[]>>;
}) {
  await fetcher.setService("salesforce");

  let formattedFields = fields.join(", ");
  if (join) {
    const joinObjs = Object.keys(join) as K[];
    joinObjs.forEach((objName: keyof typeof join) => {
      formattedFields +=
        ", " + join[objName]!.map((f) => `${objName.toString()}.${f}`);
    });
  }

  let query =
    "SELECT " +
    (fields.length ? formattedFields : "FIELDS(ALL)") +
    " FROM " +
    obj;

  if (filters) {
    query += " WHERE " + parseFilter(filters);
  }

  if (!fields.length) {
    query += " LIMIT 200";
  }

  const queryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const res: {
    data: {
      records:
        | (Pick<T, (typeof fields)[number]> &
            Partial<Record<keyof T, Record<string, any>>>)[]
        | undefined;
    };
  } = await fetcher.get(queryUri);
  if (!res.data.records) {
    throw Error("Query Failed: " + obj);
  }

  return res.data.records;
}

export default createQuery;
