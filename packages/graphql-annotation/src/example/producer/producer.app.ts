import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ExampleProducerModule } from "./producer.example";

import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { GraphQLAnnotationModule } from "@/modules/core/annotation.module";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      graphiql: true,
      autoSchemaFile: "./src/example/producer/producer.schema.gql",
    }),
    GraphQLAnnotationModule.forRoot({
      serveAnnotations: true,
      serveConfig: { name: "producer-example" },
    }),
    ExampleProducerModule,
  ],
})
export class ExampleProducerApp {}
