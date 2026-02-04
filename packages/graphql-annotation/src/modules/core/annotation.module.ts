import { DynamicModule, Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { GraphQLAnnotationResolver } from "./annotation.resolver";
import { GraphQLAnnotatedSchemaLoader } from "./annotation.loader";
import { ResolverDiscoveryService } from "./resolver.explorer";
import {
  ANNOTATION_RESOLVER_METADATA,
  GraphQLAnnotationResolverMetadata,
} from "./annotation.constants";

@Module({})
export class GraphQLAnnotationModule {
  static forRoot(opts?: { serveAnnotations?: false }): DynamicModule;
  static forRoot(opts: {
    serveAnnotations: true;
    serveConfig: GraphQLAnnotationResolverMetadata;
  }): DynamicModule;
  static forRoot(opts?: {
    serveAnnotations?: boolean;
    serveConfig?: GraphQLAnnotationResolverMetadata;
  }): DynamicModule {
    if (opts?.serveAnnotations)
      return {
        global: true,
        module: GraphQLAnnotationModule,
        imports: [DiscoveryModule],
        providers: [
          ResolverDiscoveryService,
          GraphQLAnnotatedSchemaLoader,
          {
            provide: ANNOTATION_RESOLVER_METADATA,
            useValue: opts.serveConfig!,
          },
          GraphQLAnnotationResolver,
        ],
        exports: [GraphQLAnnotatedSchemaLoader],
      };

    return {
      global: true,
      module: GraphQLAnnotationModule,
      imports: [DiscoveryModule],
      providers: [ResolverDiscoveryService, GraphQLAnnotatedSchemaLoader],
      exports: [GraphQLAnnotatedSchemaLoader],
    };
  }
}
