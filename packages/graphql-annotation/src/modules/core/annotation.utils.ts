import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { schemaFromExecutor } from "@graphql-tools/wrap";
import type { SubschemaConfig } from "@graphql-tools/delegate";

export async function loadGraphQLSchema(url: string) {
  const executor = buildHTTPExecutor({
    endpoint: url,
  });
  return {
    schema: await schemaFromExecutor(executor),
    executor, // Has to be included.
  } as SubschemaConfig;
}

export function split<TItem, TFilteredItem extends TItem = TItem>(
  array: Array<TItem>,
  predicate: (item: TItem) => item is TFilteredItem,
) {
  const match = [] as TItem[];
  const rest = [] as TItem[];
  array.forEach((item) => {
    const matchedPredicate = predicate(item);
    const target = matchedPredicate ? match : rest;
    target.push(item);
  });

  return [
    match as TFilteredItem[],
    rest as Exclude<TItem, TFilteredItem>[],
  ] as const;
}

export function shallowMerge<TObj extends Record<string, any>[]>(
  objects: [...TObj],
) {
  type MergeObjectTuples<T> = T extends [infer THead, ...infer TRest]
    ? THead & MergeObjectTuples<TRest>
    : unknown;

  const res = {} as TObj;
  objects.forEach((o) => Object.assign(res, o));
  return res as MergeObjectTuples<TObj>;
}

export function isPlainObject(obj: any): obj is Record<PropertyKey, any> {
  const prototype = Object.getPrototypeOf(obj);
  return prototype === Object.getPrototypeOf({}) || prototype === null;
}
