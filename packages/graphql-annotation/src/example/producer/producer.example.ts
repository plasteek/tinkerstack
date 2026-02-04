import { Module } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";
import { InjectableArg, ProtectedResolver } from "../consumer/consumer.example";

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

@Module({
  providers: [ExampleProducerResolver],
})
export class ExampleProducerModule {}
