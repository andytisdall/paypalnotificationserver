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
    | null;
  operator?: string;
};

export type FilterGroup<T> = {
  AND?: (QueryFilter<T> | FilterGroup<T>)[];
  OR?: (QueryFilter<T> | FilterGroup<T>)[];
};

function renderFilter<T>({ field, value, operator }: QueryFilter<T>) {
  return (
    field.toString() +
    (!operator ? " = " : ` ${operator} `) +
    (typeof value === "string"
      ? `'${value}'`
      : typeof value === "boolean" || value === null
      ? `${value}`.toUpperCase()
      : typeof value === "object"
      ? value.type === "datetime"
        ? formatISO(value.date)
        : format(value.date, "yyyy-MM-dd")
      : value)
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
