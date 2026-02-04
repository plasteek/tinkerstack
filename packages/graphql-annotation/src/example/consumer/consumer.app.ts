import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";

import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ExampleConsumerModule } from "./consumer.example";
import { GraphQLAnnotatedSchemaLoader } from "@/modules/core/annotation.loader";
import { GraphQLAnnotationModule } from "@/modules/core/annotation.module";
import { stitchSchemas } from "@graphql-tools/stitch";

@Module({
  imports: [
    ExampleConsumerModule,
    GraphQLAnnotationModule.forRoot(),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (loader: GraphQLAnnotatedSchemaLoader) => ({
        graphiql: true,
        playground: true,
        autoSchemaFile: "./src/example/consumer/consumer.schema.gql",
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
export class ExampleConsumerApp {}
