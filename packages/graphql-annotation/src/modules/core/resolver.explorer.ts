import { Injectable } from "@nestjs/common";
import { DiscoveryService } from "@nestjs/core";
import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
import { RESOLVER_TYPE_METADATA } from "@nestjs/graphql";

@Injectable()
export class ResolverDiscoveryService {
  constructor(
    // NOTE: use `ModulesContainer` if robust module exclusion is needed
    private readonly discoveryService: DiscoveryService,
  ) {}

  public explore() {
    // Discovery logic is derived from https://github.com/nestjs/graphql/blob/51d3e1cbc827124a8b0e79370e26abfc5d9bd154/packages/graphql/lib/services/resolvers-explorer.service.ts#L47
    const wrappedProviders = this.discoveryService.getProviders();
    return wrappedProviders.flatMap((wrapped) => {
      const { instance } = wrapped;
      if (!instance) return []; // Otherwise will error on `getMetadata` due to `undefined`

      // Don't get because the name can be `undefined`
      // Not sure how on their lib still function even in case of `undefined`, probably in filtering
      const isResolver = Reflect.hasMetadata(
        RESOLVER_TYPE_METADATA,
        instance.constructor,
      );
      if (!isResolver) return []; // Skip non-resolvers

      return wrapped;
    }) as InstanceWrapper[];
  }
}
