import { NestFactory } from "@nestjs/core";

import { FastifyAdapter } from "@nestjs/platform-fastify";
import { ExampleProducerApp } from "./producer/producer.app";
import { ConsoleLogger, Type } from "@nestjs/common";
import { ExampleConsumerApp } from "./consumer/consumer.app";

export async function bootstrap(name: string, module: Type, port: number) {
  const app = await NestFactory.create(module, new FastifyAdapter(), {
    logger: new ConsoleLogger({ prefix: name }),
  });
  await app.listen(port);

  console.log(
    `Listening on localhost:${port}. Playground: http://localhost:${port}/graphql`
  );
}

async function main() {
  await bootstrap("example-producer", ExampleProducerApp, 3031);
  await bootstrap("example-consumer", ExampleConsumerApp, 3030);
}
void main();
