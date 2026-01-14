import { formatISO, format } from "date-fns";

import fetcher from "../../fetcher";
import urls from "../../urls";

export type QueryFilter<T> = {
  field: keyof T;
  value:
    | number
    | string
    | boolean
    | { date: Date; type: "date" | "datetime" }
    | null
    | string[];

  operator?: string;
};

export type FilterGroup<T> = {
  AND?: (QueryFilter<T> | FilterGroup<T>)[];
  OR?: (QueryFilter<T> | FilterGroup<T>)[];
};

const renderValue = (
  value:
    | number
    | string
    | boolean
    | { date: Date; type: "date" | "datetime" }
    | null
    | string[]
) => {
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
        } else {
          return format(value.date, "yyyy-MM-dd");
        }
      }
    case "number":
      return value;
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

      child.hasOwnProperty("field") ? renderFilter(child) : parseFilter(child)
    ).join(" AND ") +
    ")";

  const orStatement: string =
    "(" +
    filterGroup.OR?.map((child) =>
      // @ts-expect-error

      child.hasOwnProperty("field") ? renderFilter(child) : parseFilter(child)
    ).join(" OR ") +
    ")";

  return filterGroup.AND ? andStatement : orStatement;
}

async function createQuery<T, K extends keyof T>({
  fields,
  filters,
  obj,
}: {
  obj: string;
  fields: ReadonlyArray<K>;
  filters: FilterGroup<T>;
}) {
  await fetcher.setService("salesforce");

  const query =
    "SELECT " +
    fields.join(", ") +
    " FROM " +
    obj +
    " WHERE " +
    parseFilter(filters);

  const queryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const res: {
    data: {
      records: Pick<T, (typeof fields)[number]>[] | undefined;
    };
  } = await fetcher.get(queryUri);
  if (!res.data.records) {
    throw Error("Query Failed: " + obj);
  }

  return res.data.records;
}

export default createQuery;
