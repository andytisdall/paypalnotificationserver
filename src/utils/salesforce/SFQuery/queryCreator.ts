import urls from "../../urls";
import fetcher from "../../fetcher";

// interface QueryOptions<T> {
//   fields: keyof T[];
//   object: string;
//   filters: string[];
//   sort?: string;
// }

// export async function queryCreator<T>({
//   fields,
//   object,
//   filters,
//   sort,
// }: QueryOptions<T>): Promise<T[]> {
//   const fieldsText = fields.reduce((text, field, i, { length }) =>
//     text + field + (i !== length - 1) ? "," : ""
//   );

//   const query = `SELECT ${fieldsText} from ${object}`;

//   filters.forEach((filter, i) => {
//     if (i === 0) {
//       query.concat(" WHERE ");
//     } else {
//       query.concat(" AND ");
//     }
//     query.concat(filter);
//   });

//   if (sort) {
//     query.concat(` ORDER BY ${sort}`);
//   }

//   const uri = urls.SFQueryPrefix + encodeURIComponent(query);

//   const { data }: { data: { records: Pick<T, fields>[] } } = await fetcher.get(
//     uri
//   );
//   return data.records;
// }
