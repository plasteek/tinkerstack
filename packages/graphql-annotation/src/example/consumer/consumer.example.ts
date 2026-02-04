import { Annotate, ResolveAnnotation } from "@/modules/core";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Module,
  UseGuards,
} from "@nestjs/common";
import {
  Args,
  Context,
  GraphQLExecutionContext,
  Query,
  Resolver,
} from "@nestjs/graphql";

// Export for external
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
export class ExampleConsumerResolver {
  @Query(() => [String])
  exampleOut() {
    return ["this is from consumer"];
  }

  @UseGuards(ExampleGuard)
  @ResolveAnnotation("protected")
  verifyUser(context: ExecutionContext, next: () => void) {
    console.log("I AM HERE");
  }

  // Should use the name
  @ResolveAnnotation("resource")
  resolveResource(
    @Args("resourceType") resourceType: string,
    @Context() context: GraphQLExecutionContext,
  ) {
    console.log(resourceType);
    return "this-is-gateway-provided-username";
  }
}

@Module({ providers: [ExampleConsumerResolver] })
export class ExampleConsumerModule {}
