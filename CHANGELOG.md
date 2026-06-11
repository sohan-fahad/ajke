# Changelog

All notable changes to `wilt` are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). This project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] — 2026-05-15

### Added

- **Module system** — `@Module`, `@Global`, `@Controller`, `@Injectable`, `@Inject`, `@Optional` decorators
- **HTTP decorators** — `@Get`, `@Post`, `@Put`, `@Delete`, `@Patch`, `@HttpCode`, `@Header`, `@Redirect`
- **Parameter decorators** — `@Body`, `@Param`, `@Query`, `@Headers`, `@Ip`, `@Req` with auto-JSON serialization
- **Guards** — `@UseGuards`, `CanActivate`, `ExecutionContext`, `ArgumentsHost`
- **Interceptors** — `@UseInterceptors`, `NestInterceptor`, `CallHandler`
- **Exception filters** — `@UseFilters`, `@Catch`, `ExceptionFilter`
- **Metadata** — `@SetMetadata`, `Reflector`
- **Validation pipes** — `@ZodBody`, `@ZodQuery`, `@Validate`
- **Exceptions** — `HttpException`, `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `NotFoundException`, `ConflictException`, `UnprocessableEntityException`, `TooManyRequestsException`, `InternalServerErrorException`
- **Lifecycle hooks** — `OnModuleInit`, `OnModuleDestroy`
- **Utilities** — `ResponseUtil`, `Logger`, `forwardRef`, `applyDecorators`
- **Middleware** — `requestLogger`, `errorHandler` (exported from `wilt/middleware`)
- **CLI** — `wilt new`, `wilt generate` (module / service / controller), `wilt add` (d1, r2, kv, queue, ai, durable-object, vectorize, browser, hyperdrive)
- Published as `wilt`
