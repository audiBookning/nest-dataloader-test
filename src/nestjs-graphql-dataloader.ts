import {
  CallHandler,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { APP_INTERCEPTOR, ContextIdFactory, ModuleRef } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as DataLoader from 'dataloader';
import { Observable } from 'rxjs';

/**
 * This interface will be used to generate the initial data loader.
 * The concrete implementation should be added as a provider to your module.
 */
export interface NestDataLoader<ID, Type> {
  /**
   * Should return a new instance of dataloader each time
   */
  generateDataLoader(): DataLoader<ID, Type>;
}

/**
 * Context key where get loader function will be stored.
 * This class should be added to your module providers like so:
 * {
 *     provide: APP_INTERCEPTOR,
 *     useClass: DataLoaderInterceptor,
 * },
 */
const NEST_LOADER_CONTEXT_KEY = 'NEST_LOADER_CONTEXT_KEY';

@Injectable()
export class DataLoaderInterceptor implements NestInterceptor {
  constructor(private readonly moduleRef: ModuleRef) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const ctx = GqlExecutionContext.create(context).getContext();

    if (ctx[NEST_LOADER_CONTEXT_KEY] === undefined) {
      ctx[NEST_LOADER_CONTEXT_KEY] = {
        contextId: ContextIdFactory.create(),
        getLoader: <T, V>(type: string): Promise<NestDataLoader<T, V>> => {
          if (ctx[type] === undefined) {
            try {
              ctx[type] = (async () => {
                return (
                  await this.moduleRef.resolve<NestDataLoader<T, V>>(
                    type,
                    ctx[NEST_LOADER_CONTEXT_KEY].contextId,
                    { strict: false },
                  )
                ).generateDataLoader();
              })();
            } catch (e) {
              throw new InternalServerErrorException(
                `The loader ${type} is not provided` + e,
              );
            }
          }
          return ctx[type];
        },
      };
    }
    return next.handle();
  }
}

/**
 * The decorator to be used within your graphql method.
 */
export const Loader = createParamDecorator(
  (data: string | Function, context: ExecutionContext) => {
    // console.log('Loader data: ', (data as any).name);
    const name = typeof data === 'string' ? data : data?.name;
    if (!name) {
      throw new InternalServerErrorException(
        `Invalid name provider to @Loader ('${name}')`,
      );
    }

    const ctx = GqlExecutionContext.create(context).getContext();
    // console.log('Loader ctx: ', ctx[NEST_LOADER_CONTEXT_KEY]);
    if (!ctx[NEST_LOADER_CONTEXT_KEY]) {
      throw new InternalServerErrorException(
        `You should provide interceptor ${DataLoaderInterceptor.name} globally with ${APP_INTERCEPTOR}`,
      );
    }

    return ctx[NEST_LOADER_CONTEXT_KEY].getLoader(name);
  },
);

interface IOrderedNestDataLoaderOptions<ID, Type> {
  propertyKey?: string;
  query: (keys: readonly ID[]) => Promise<Type[]>;
  typeName?: string;
}

interface IEnsureOrderOptions<ID, Type> {
  docs: Type[];
  keys: readonly ID[];
  prop: string;
  error: (key) => string;
}

// tslint:disable-next-line: max-classes-per-file
export abstract class OrderedArrayOfObjectDataLoader<ID, Type>
  implements NestDataLoader<ID, Type> {
  protected abstract getOptions: () => IOrderedNestDataLoaderOptions<ID, Type>;

  public generateDataLoader() {
    return this.createLoader(this.getOptions());
  }

  protected createLoader(
    options: IOrderedNestDataLoaderOptions<ID, Type>,
  ): DataLoader<ID, Type> {
    const defaultTypeName = this.constructor.name.replace('Loader', '');
    return new DataLoader<ID, Type>(async keys => {
      return this.ensureOrder({
        docs: await options.query(keys),
        keys,
        prop: options.propertyKey || 'id',
        error: keyValue =>
          `${options.typeName || defaultTypeName} does not exist (${keyValue})`,
      });
    });
  }

  protected ensureOrder(options: IEnsureOrderOptions<ID, Type>) {
    const {
      docs,
      keys,
      prop,
      error = key => `Document does not exist (${key})`,
    } = options;
    // Put documents (docs) into a map where key is a document's ID or some
    // property (prop) of a document and value is a document.
    const docsMap = new Map();
    docs.forEach(doc => docsMap.set(doc[prop], doc));
    // Loop through the keys and for each one retrieve proper document. For not
    // existing documents generate an error.
    return keys.map(key => {
      return (
        docsMap.get(key) ||
        new Error(typeof error === 'function' ? error(key) : error)
      );
    });
  }
}

export abstract class OrderedArrayOfArrayDataLoader<ID, Type>
  implements NestDataLoader<ID, Type> {
  protected abstract getOptions: () => IOrderedNestDataLoaderOptions<ID, Type>;
  /* protected abstract loadObject: () => any;
  protected abstract loadArray: () => any; */

  public generateDataLoader() {
    return this.createLoader(this.getOptions());
  }

  protected createLoader(
    options: IOrderedNestDataLoaderOptions<ID, Type>,
  ): DataLoader<ID, Type> {
    const defaultTypeName = this.constructor.name.replace('Loader', '');
    return new DataLoader<ID, Type>(async keys => {
      return this.ensureOrder({
        docs: await options.query(keys),
        keys,
        prop: options.propertyKey || 'id',
        error: keyValue =>
          `${options.typeName || defaultTypeName} does not exist (${keyValue})`,
      });
    });
  }

  // https://github.com/graphql/dataloader/issues/66#issuecomment-386252044
  protected ensureOrder(options: IEnsureOrderOptions<ID, Type>) {
    const {
      docs,
      keys,
      prop,
      // TODO: implement error handling
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      error = key => `Document does not exist (${key})`,
    } = options;

    // INFO: This code comes from Rambda. It has a similar speed to Ramda
    // REF: https://github.com/selfrefactor/rambda/blob/master/src/groupBy.js
    // INFO: Another alternative. Not the best choice for performance,
    // REF: https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_groupby
    // INFO: There are other algorithms, but probably not much urgency to change yet
    // Underscore and Lodash are many times better, followed farter away by Ramda
    // REF: https://www.measurethat.net/Benchmarks/Show/7929/2/groupby-100k-ramda-underscore-arrayreduce
    const groupBy = (fn, list) => {
      // TODO: arguments.length buggy...
      // if (arguments.length === 1) return _list => groupBy(fn, _list);
      const result: any = {};
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const key = fn(item);
        if (!result[key]) {
          result[key] = [];
        }
        result[key].push(item);
      }
      return result;
    };

    const groupedById = groupBy(doc => doc[prop], docs);
    const ttt = keys.map(key => groupedById[key] || []);
    return ttt;
  }
}
