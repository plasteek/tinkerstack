export const ANNOTATION_METADATA = "graphql-annotation"; // Should not conflict
export interface MethodInfo {
  type: "method";
  name: string;
}
export interface ParameterInfo {
  type: "parameter";
  paramIndex: number;
  paramName: string;
}
export type AnnotationTarget = MethodInfo | ParameterInfo;
export interface AnnotationInfo<T = unknown> {
  annotation: string;
  target: AnnotationTarget;
  data: T;
}

export const ANNOTATION_RESOLVER_METADATA = "graphql-annotation-resolver";
export interface AnnotationResolverMetadata {
  annotation: string;
}

type SourceName = string;
type RemoteURL = string;
export type AnnotationSchemaSources = Record<SourceName, RemoteURL>;

export type ResolverName = string;
export type GraphQLResolversAnnotations = Record<
  ResolverName,
  AnnotationInfo[]
>;

export const GRAPHQL_ANNOTATION_RESOLVER_METADATA =
  "graphql-annotation-provider";
export type GraphQLAnnotationResolverMetadata = {
  name: string;
};
