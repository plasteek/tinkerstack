<center>
<img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.icon-icons.com%2Ficons2%2F2699%2FPNG%2F512%2Fgraphql_logo_icon_171045.png&f=1&nofb=1&ipt=e40678a4804af7f493102aa8bcc97bacbfdfee9dac86e14c75ab7afb00a237b5" height="150px">
  <h1>GraphQL Annotation</h1>
  <p>A set of tools for extending GraphQL stitching capabilities through annotations</p>
</center>

---

## Who is this intended for?
  
This library is designed to solve a specific scenario in mind:

1. There's a primary `Gateway` and separately developed `SubGateway`s, both of each uses `graphql`.
2. Front-end or external non-backend consumers interact with `SubGateway` resolvers stitched through `Gateway`
3. Resolvers at `SubGateway` requires additional resource/guard/processing from `Gateway`.
4. `SubGateway` team does not have access to `Gateway` nor can they run a local instance.
5. `SubGateway` team **does not require** `Gateway` features during development, only during deployment.

Available solutions often utilize `Remote-Produce-Calls (RPCs)` libraries to let `SubGateway` invoke `Gateway` methods through HTTP transport, which unfortunately fails point 4 and 5, of which this library answers through `annotations`.

**However**, if `SubGateway` needs to make additional calls to `Gateway` for mutation or other purposes, then this library should only be considered as a mean of optimization and you are better off just running an `RPC` library at the small of performance and back-and-forth.

**TL;DR:** Only use this library if you HAVE TO achieve complete isolation between `Gateway` and `SubGateway` development cycle.

## Usage

You can find examples in `src/examples` for more details. Note that `graphql-annotation` should be replaced with workspace name in internal projects.

```ts
// gateway

import {
  GraphQLAnnotationModule, 
  GraphQLAnnotationSchemaLoader
} from "graphql-annotation";

@Module({
  imports: [
    GraphQLAnnotationModule.forRoot(),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (loader: GraphQLAnnotatedSchemaLoader) => ({
        async transformSchema(schema) {
          return stitchSchemas({
            subschemas: [
              { schema },
              {
                // Load external annotated schemas
                schema: await loader.load({
                  example: "http://localhost:3031/graphql",
                }),
              },
            ],
          });
        },
      }),
      inject: [GraphQLAnnotatedSchemaLoader],
    }),
  ],
})
export class GatewayAppModule {}


// It is recommended that you wrap the `Annotate` decorator in a function and in the gateway to ensure `gateway` team knows that's implemented. `sub-gateway` team could reference this through github submodule.

export type RoleGroups = ("user" | "admin" | "super-admin")[];
export const ProtectedResolver = (roles: RoleGroups) =>
  Annotate("protected", { data: { roles } });

export const InjectableArg = (argName: string, resourceType: string) =>
  Annotate("resource", { data: { resourceType }, parameter: argName });

@Injectable()
export class ExampleGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    // Do something with your execution context
    return true;
  }
}

@Resolver()
export class SubgatewayResolver {
  // NOTE: You can use normal nest and graphql decorators.
  // Just note that `ResolveAnnotation` must be in a `Resolver`

  @UseGuards(ExampleGuard)
  @ResolveAnnotation("protected") 
  verifyUser(context: ExecutionContext, next: () => void) {}

  // If empty would use function name as annotation tag
  @ResolveAnnotation()
  resource(
    // WARN: this is NOT validated like in graphql though
    @Args("resourceType") resourceType: string,
    @Context() context: GraphQLExecutionContext,
  ) {
    return "this-is-gateway-provided-username";
  }
}

// ---------------------------------------------

// sub-gateway
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      /* Put your graphql config here*/
    }),
    GraphQLAnnotationModule.forRoot({
      serveAnnotations: true,
      // Name is only for identification at the time of writing, which does not support annotation filtering.
      serveConfig: { name: "<subgateway-a>" },
    }),
    ExampleProducerModule,
  ],
})
export class SubGatewayAppModule {}

@Resolver()
export class ExampleProducerResolver {
  @Query(() => [String])
  @ProtectedResolver(["admin"])
  testProtectedQuery() {
    return ["This resolver should only be available to if guard check passed"];
  }
  @Query(() => [String])
  testQueryWithParam(
    @InjectableArg("username", "session:username")
    username: string
  ) {
    return [`Received params: ${username}`];
  }
  @Query(() => [String])
  testPublicQuery() {
    return ["This resolver should be available to everyone"];
  }
}
```
