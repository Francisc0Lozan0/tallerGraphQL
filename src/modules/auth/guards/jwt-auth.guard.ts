import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	getRequest(context: ExecutionContext) {
		if (context.getType<'graphql' | 'http'>() === 'graphql') {
			const gqlContext = GqlExecutionContext.create(context);
			return gqlContext.getContext().req;
		}

		return context.switchToHttp().getRequest();
	}
}
