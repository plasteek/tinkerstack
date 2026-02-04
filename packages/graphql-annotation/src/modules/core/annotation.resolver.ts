import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { MetadataScanner } from "@nestjs/core";
import { Field, ObjectType, Query, Resolver } from "@nestjs/graphql";
import { GraphQLJSONObject } from "graphql-scalars";
import "reflect-metadata";
import type {
  AnnotationInfo,
  GraphQLAnnotationResolverMetadata,
  GraphQLResolversAnnotations,
} from "./annotation.constants";
import {
  ANNOTATION_METADATA,
  ANNOTATION_RESOLVER_METADATA,
} from "./annotation.constants";
import { ResolverDiscoveryService } from "./resolver.explorer";

@ObjectType()
export class GraphQLAnnotationMeta {
  @Field(() => String)
  name: string;

  @Field(() => GraphQLJSONObject, { name: "resolvers" })
  resolvers: GraphQLResolversAnnotations;
}

export const ANNOTATION_QUERY_NAME = "_annotations";

@Resolver()
@Injectable()
export class GraphQLAnnotationResolver implements OnModuleInit {
  private _logger = new Logger("GraphQLAnnotationModule");

  constructor(
    private readonly metadataScanner: MetadataScanner,
    private readonly resolverDiscoveryService: ResolverDiscoveryService,
    @Inject(ANNOTATION_RESOLVER_METADATA)
    private readonly meta: GraphQLAnnotationResolverMetadata,
  ) {}

  @Query(() => GraphQLAnnotationMeta, {
    name: ANNOTATION_QUERY_NAME,
  })
  async getGraphQLAnnotations() {
    return {
      ...this.meta,
      resolvers: this.resolverAnnotations,
    } satisfies GraphQLAnnotationMeta;
  }

  private resolverAnnotations = {} as GraphQLResolversAnnotations;
  async onModuleInit() {
    this.resolverAnnotations = this.compileResolversAnnotations();
  }

  private compileResolversAnnotations() {
    const instances = this.resolverDiscoveryService.explore();
    const resolversAnnotations = {} as GraphQLResolversAnnotations;

    for (const { instance } of instances)
      for (const methodName of this.metadataScanner.getAllMethodNames(
        Object.getPrototypeOf(instance),
      )) {
        const annotations = [
          ...Object.values(
            Reflect.getMetadata(ANNOTATION_METADATA, instance[methodName]) ??
              {},
          ),
          ...Object.values(
            Reflect.getMetadata(
              ANNOTATION_METADATA,
              instance.constructor,
              methodName,
            ) ?? {},
          ),
        ] as AnnotationInfo[];

        if (annotations.length <= 0) continue;

        resolversAnnotations[methodName] = annotations;
        this._logger.log(
          `Discovered annotated resolver "${instance.constructor.name}.${methodName}" with ${annotations.length} annotation(s)`,
        );
      }

    return resolversAnnotations;
  }
}
