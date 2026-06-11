import { injectable, inject as tsyringeInject } from "tsyringe";
import { isForwardRef } from "../../utils/forward-ref.util";

export const INJECT_CUSTOM_TOKENS_KEY = "wilt:inject:custom:tokens";

export function Injectable() {
	return (target: any) => {
		injectable()(target);
	};
}

export function Inject(token?: any) {
	return (
		target: any,
		propertyKey: string | symbol | undefined,
		parameterIndex: number
	) => {
		if (isForwardRef(token)) {
			const existing: Record<number, any> =
				Reflect.getMetadata(INJECT_CUSTOM_TOKENS_KEY, target) || {};
			existing[parameterIndex] = token;
			Reflect.defineMetadata(INJECT_CUSTOM_TOKENS_KEY, existing, target);
			return;
		}

		if (!token) {
			const paramTypes = Reflect.getMetadata("design:paramtypes", target) || [];
			const paramType = paramTypes[parameterIndex];
			if (paramType) {
				return tsyringeInject(paramType)(target, propertyKey, parameterIndex);
			}
			return;
		}

		const existing: Record<number, any> =
			Reflect.getMetadata(INJECT_CUSTOM_TOKENS_KEY, target) || {};
		existing[parameterIndex] = token;
		Reflect.defineMetadata(INJECT_CUSTOM_TOKENS_KEY, existing, target);
		return tsyringeInject(token)(target, propertyKey, parameterIndex);
	};
}
