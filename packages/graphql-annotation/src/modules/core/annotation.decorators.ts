import { SetMetadata } from "@nestjs/common";
import { Args, ArgsOptions } from "@nestjs/graphql";
import "reflect-metadata";
import {
  ANNOTATION_METADATA,
  ANNOTATION_RESOLVER_METADATA,
  AnnotationInfo,
  AnnotationResolverMetadata,
} from "./annotation.constants";

/**
 * Applies an annotation to a Query or Mutation handler or parameter for
 * external stitching party to interpret.
 *
 * For parameter decorator, you must specify `parameter` option for external providers.
 *
 * @publicApi
 */
export function Annotate(
  name: string,
  opts?: { data?: Record<string, any>; parameter?: undefined },
): MethodDecorator;
/**
 * Applies an annotation to a Query or Mutation handler or parameter for
 * external stitching party to interpret.
 *
 * For parameter decorator, you must specify `parameter` option for external providers.
 *
 * @publicApi
 */
export function Annotate(
  name: string,
  opts: { data?: Record<string, any>; parameter: string },
): ParameterDecorator & MethodDecorator;
/**
 * Applies an annotation to a Query or Mutation handler or parameter for
 * external stitching party to interpret.
 *
 * For parameter decorator, you must specify `parameter` option for external providers.
 *
 * @publicApi
 */
export function Annotate(
  name: string,
  opts?: {
    data?: Record<string, any>;
    parameter?: string;
    description?: string;
    type?: () => any;
  },
): MethodDecorator & ParameterDecorator {
  const annotationName = name;
  const annotationData = opts?.data;

  return (
    target: Object,
    propertyKey: string,
    descriptorOrParameterIndex: number | TypedPropertyDescriptor<unknown>,
  ) => {
    switch (typeof descriptorOrParameterIndex) {
      // Method
      case "object": {
        const descriptor = descriptorOrParameterIndex;
        _updateAnnotation(descriptor.value ?? target, (meta) => ({
          ...meta,
          [annotationName]: {
            annotation: annotationName,
            data: annotationData,
            target: {
              type: "method",
              name: propertyKey,
            },
          },
        }));
        break;
      }
      // Parameter
      case "number": {
        const paramIndex = descriptorOrParameterIndex;
        const paramName = opts?.parameter;

        if (!paramName)
          throw new Error(
            `Unable to apply annotation "${annotationName}". Parameter name not specified.`,
          );

        Args({
          name: paramName,
          type: opts?.type,
          description: opts?.description,
        })(target, propertyKey, paramIndex);
        _updateAnnotation(
          target.constructor,
          (meta) => ({
            ...meta,
            [`${annotationName}@${paramIndex}`]: {
              annotation: annotationName,
              data: annotationData,
              target: {
                type: "parameter",
                paramIndex,
                paramName,
              },
            },
          }),
          propertyKey,
        );

        break;
      }
      default:
        throw new Error(
          `Unable to attach annotation "${name}". Unsupported target.`,
        );
    }
  };
}
type AnnotationList = Record<string, AnnotationInfo>;
function _updateAnnotation(
  target: any,
  updateFn: (old: AnnotationList) => AnnotationList,
  propertyKey?: string | symbol,
) {
  const meta = Reflect.getMetadata(ANNOTATION_METADATA, target) ?? {};

  if (propertyKey)
    Reflect.defineMetadata(
      ANNOTATION_METADATA,
      updateFn(meta),
      target,
      propertyKey,
    );
  else Reflect.defineMetadata(ANNOTATION_METADATA, updateFn(meta), target);
}

/**
 * Declare `Resolver` method for resolving annotations
 * @publicApi
 */
export function ResolveAnnotation(): MethodDecorator;
/**
 * Declare `Resolver` method for resolving annotations
 * @publicApi
 */
export function ResolveAnnotation(annotation: string): MethodDecorator;
/**
 * Declare `Resolver` method for resolving annotations
 * @publicApi
 */
export function ResolveAnnotation(name?: string): MethodDecorator {
  return (target, property, descriptor) => {
    SetMetadata(ANNOTATION_RESOLVER_METADATA, {
      annotation: name ?? (property as string),
    } satisfies AnnotationResolverMetadata)(target, property, descriptor);
  };
}
