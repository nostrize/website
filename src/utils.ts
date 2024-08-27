export const not = (b: boolean) => !b;

export type Left<L> = {
  type: typeof Either._leftSymbol;
  error: L;
};

export type Right<R> = {
  type: typeof Either._rightSymbol;
  value: R;
};

export type Either<L, R> = Left<L> | Right<R>;

// eslint-disable-next-line no-redeclare
export const Either = {
  _leftSymbol: Symbol("nostrize either left"),
  _rightSymbol: Symbol("nostrize either right"),

  left: <L>(error: L): Left<L> => ({
    type: Either._leftSymbol,
    error,
  }),
  right: <R>(value: R): Right<R> => ({ type: Either._rightSymbol, value }),

  isLeft: <L, R>(either: Either<L, R>): either is Left<L> =>
    either.type === Either._leftSymbol,
  isRight: <L, R>(either: Either<L, R>): either is Right<R> =>
    either.type === Either._rightSymbol,

  toObject: <L, R>(either: Either<L, R>) => ({
    type: either.type.toString(),
    error: Either.isLeft(either) ? either.error : undefined,
    value: Either.isRight(either) ? either.value : undefined,
  }),

  fromObject: <L extends string, R>({
    type,
    error,
    value,
  }: {
    type: string;
    error: L;
    value: R;
  }): Either<L, R> =>
    type === Either._leftSymbol.toString()
      ? Either.left<L>(error)
      : Either.right<R>(value),

  getLeft: <L>(either: Left<L>) => {
    if (Either.isLeft(either)) {
      return either.error;
    }

    throw new Error("Tried to getLeft from a Right");
  },

  getRight: <L, R>(either: Either<L, R>): R => {
    if (Either.isRight(either)) {
      return either.value;
    }
    throw new Error("Tried to getRight from a Left");
  },

  getOrElseThrow: async <L, R>({
    eitherFn,
  }: {
    eitherFn: () => Promise<Either<L, R>>;
  }): Promise<R> => {
    const either = await eitherFn();

    if (Either.isLeft(either)) {
      const left = Either.getLeft(either);

      if (typeof left === "string") {
        throw new Error(left);
      }

      throw Either.getLeft(either);
    }

    return Either.getRight(either);
  },

  getOrElseReject: <L, R>(either: Either<L, R>): Promise<R> => {
    return new Promise((resolve, reject) => {
      if (Either.isLeft(either)) {
        return reject(Either.getLeft(either));
      }

      return resolve(Either.getRight(either));
    });
  },
};
